import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { API_URL } from '../config/api.config';
import OrderBumpSuggestion from '../components/OrderBumpSuggestion';

const MP_CARD_FEE = 0.0499; // 4.99% Mercado Pago card processing fee
const EXTRA_FEE = 1.00;     // R$1.00 fixed service fee

// Mercado Pago installment interest rates
const INSTALLMENT_RATES = {
  1: 0, 2: 0.0459, 3: 0.0597, 4: 0.0733,
  5: 0.0866, 6: 0.0996, 7: 0.1124, 8: 0.1250,
  9: 0.1373, 10: 0.1493, 11: 0.1612, 12: 0.1728
};

/**
 * Calculate card total for a given base price and number of installments
 */
const calculateCardTotal = (basePrice, installments = 1) => {
  const cardFee = basePrice * MP_CARD_FEE;
  const installmentFee = basePrice * (INSTALLMENT_RATES[installments] || 0);
  const total = basePrice + cardFee + installmentFee + EXTRA_FEE;
  return Math.round(total * 100) / 100;
};

/**
 * Generate installment options for a given base price
 */
const getInstallmentOptions = (basePrice) => {
  const options = [];
  for (let i = 1; i <= 12; i++) {
    const total = calculateCardTotal(basePrice, i);
    const perInstallment = Math.round((total / i) * 100) / 100;
    options.push({
      installments: i,
      total,
      perInstallment,
      interestRate: INSTALLMENT_RATES[i],
      noInterest: i === 1,
    });
  }
  return options;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [orderBumps, setOrderBumps] = useState([]);
  const [bumpTotal, setBumpTotal] = useState(0);
  const [paymentType, setPaymentType] = useState('pix');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Handler for Order Bump
  const handleAddBump = (bump, isAdding) => {
    if (isAdding) {
      const finalPrice = bump.discountPercent
        ? bump.product.price * (1 - bump.discountPercent / 100)
        : bump.product.price;

      setOrderBumps(prev => [...prev, { ...bump, finalPrice }]);
      setBumpTotal(prev => prev + finalPrice);
    } else {
      const bumpToRemove = orderBumps.find(b => b.id === bump.id);
      setOrderBumps(prev => prev.filter(b => b.id !== bump.id));
      setBumpTotal(prev => prev - (bumpToRemove?.finalPrice || 0));
    }
  };

  const calculateSubtotal = () => {
    return (cart?.total || 0) + bumpTotal;
  };

  const calculateCardFee = () => {
    const subtotal = calculateSubtotal();
    return Math.round(subtotal * MP_CARD_FEE * 100) / 100;
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    if (paymentType === 'card') {
      return calculateCardTotal(subtotal, 1);
    }
    return subtotal;
  };

  const installmentOptions = getInstallmentOptions(calculateSubtotal());

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      setError('Seu carrinho está vazio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Criar pedido para cada produto no carrinho
      for (const item of cart.items) {
        const orderData = {
          productId: item.productId,
          amount: item.price * item.quantity,
          paymentMethod: paymentType === 'pix' ? 'PIX' : 'CARD',
          paymentType: paymentType,
        };

        const response = await axios.post(
          `${API_URL}/orders`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success && response.data.data.paymentUrl) {
          clearCart();
          window.location.href = response.data.data.paymentUrl;
          return;
        }
      }

      setError('Erro ao processar pagamento. Tente novamente.');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao processar checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Seu carrinho está vazio
            </h1>
            <p className="text-gray-600 mb-8">
              Adicione produtos ao carrinho antes de finalizar a compra
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Ir para o Marketplace
              </Link>
              <Link
                to="/cart"
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Ver Carrinho
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2">
            {/* Itens do Pedido */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Itens do Pedido
              </h2>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <img
                      src={item.product?.thumbnailUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="3.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESem Imagem%3C/text%3E%3C/svg%3E'}
                      alt={item.product?.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product?.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">
                        R$ {(item.price * item.quantity)?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Bump Suggestions */}
            <OrderBumpSuggestion
              cartItems={cart.items}
              onAddBump={handleAddBump}
            />

            {/* Forma de Pagamento */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Escolha a Forma de Pagamento
              </h2>

              <div className="space-y-4">
                {/* PIX Option */}
                <button
                  type="button"
                  onClick={() => setPaymentType('pix')}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    paymentType === 'pix'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentType === 'pix' ? 'border-green-500' : 'border-gray-300'
                      }`}>
                        {paymentType === 'pix' && (
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💰</span>
                          <span className="text-lg font-bold text-gray-800">PIX</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Pagamento instantaneo - aprovacao imediata</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        R$ {subtotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 font-semibold">Melhor preco!</p>
                    </div>
                  </div>
                </button>

                {/* Card Option */}
                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    paymentType === 'card'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentType === 'card' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {paymentType === 'card' && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💳</span>
                          <span className="text-lg font-bold text-gray-800">Cartao de Credito/Debito</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Parcele em ate 12x - inclui taxas de processamento</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {calculateCardTotal(subtotal, 1).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">a vista no cartao</p>
                    </div>
                  </div>
                </button>

                {/* Card Details - Expanded when card is selected */}
                {paymentType === 'card' && (
                  <div className="ml-10 mt-2 space-y-4">
                    {/* Price Breakdown */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Detalhamento do valor:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Produto(s)</span>
                          <span>R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Taxa cartao (4,99%)</span>
                          <span>R$ {calculateCardFee().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Taxa de servico</span>
                          <span>R$ {EXTRA_FEE.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-blue-300 pt-2 mt-2">
                          <div className="flex justify-between font-bold text-gray-800">
                            <span>Total a vista</span>
                            <span>R$ {calculateCardTotal(subtotal, 1).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Installment Table */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Opcoes de parcelamento:</h4>
                      <div className="space-y-1">
                        {installmentOptions.map((option) => (
                          <div
                            key={option.installments}
                            className={`flex justify-between items-center py-2 px-3 rounded text-sm ${
                              option.installments === 1
                                ? 'bg-green-50 font-semibold'
                                : option.installments % 2 === 0
                                ? 'bg-gray-50'
                                : ''
                            }`}
                          >
                            <span className="text-gray-700">
                              {option.installments}x de R$ {option.perInstallment.toFixed(2)}
                              {option.installments === 1 && (
                                <span className="text-green-600 ml-2">(sem juros)</span>
                              )}
                            </span>
                            <span className="text-gray-500">
                              {option.installments > 1
                                ? `Total: R$ ${option.total.toFixed(2)}`
                                : `R$ ${option.total.toFixed(2)}`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        * Valores de parcelas podem ter pequena variacao no Mercado Pago. O numero de parcelas e definido no Mercado Pago.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informacoes do Comprador */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Dados do Comprador
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-mail</p>
                  <p className="font-semibold text-gray-800">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo de Pagamento */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Resumo
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'itens'})</span>
                  <span>R$ {(cart?.total || 0).toFixed(2)}</span>
                </div>
                {bumpTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Order Bump ({orderBumps.length} {orderBumps.length === 1 ? 'item' : 'itens'})</span>
                    <span>+ R$ {bumpTotal.toFixed(2)}</span>
                  </div>
                )}
                {paymentType === 'card' && (
                  <>
                    <div className="flex justify-between text-orange-600 text-sm">
                      <span>Taxa cartao (4,99%)</span>
                      <span>+ R$ {calculateCardFee().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600 text-sm">
                      <span>Taxa de servico</span>
                      <span>+ R$ {EXTRA_FEE.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>R$ {calculateFinalTotal().toFixed(2)}</span>
                  </div>
                  {paymentType === 'pix' && (
                    <p className="text-xs text-green-600 mt-1">Via PIX - melhor preco!</p>
                  )}
                  {paymentType === 'card' && (
                    <p className="text-xs text-gray-500 mt-1">Via cartao (a vista). Parcelas disponiveis no Mercado Pago.</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentType === 'pix'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {paymentType === 'pix' ? (
                      <>
                        <span className="mr-2 text-xl">💰</span>
                        Pagar R$ {calculateFinalTotal().toFixed(2)} com PIX
                      </>
                    ) : (
                      <>
                        <span className="mr-2 text-xl">💳</span>
                        Pagar R$ {calculateFinalTotal().toFixed(2)} com Cartao
                      </>
                    )}
                  </span>
                )}
              </button>

              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800 text-center">
                  <span className="font-semibold">🔒 Pagamento Seguro:</span> Voce sera redirecionado para o Mercado Pago.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Pagamento seguro via Mercado Pago</span>
              </div>

              <Link
                to="/cart"
                className="block text-center text-blue-600 hover:underline mt-4"
              >
                ← Voltar ao carrinho
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
