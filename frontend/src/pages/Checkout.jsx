import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const calculateTotal = () => {
    return cart?.total || 0;
  };

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
          paymentMethod: 'MERCADOPAGO'
        };

        const response = await axios.post(
          'http://localhost:3000/api/v1/orders',
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success && response.data.data.paymentUrl) {
          // Limpar carrinho
          clearCart();

          // Redirecionar para página de pagamento do Mercado Pago
          window.location.href = response.data.data.paymentUrl;
          return;
        }
      }

      setError('Erro ao processar pagamento. Tente novamente.');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Erro ao processar checkout. Tente novamente.');
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumo do Pedido */}
          <div className="lg:col-span-2">
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
                      src={item.product?.thumbnailUrl || 'https://via.placeholder.com/100'}
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

            {/* Informações do Comprador */}
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
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Desconto</span>
                  <span>R$ 0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
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
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processando...
                  </span>
                ) : (
                  'Finalizar Pagamento'
                )}
              </button>

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

        {/* Formas de Pagamento Aceitas */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Formas de Pagamento Aceitas
          </h2>
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-2xl">💳</span>
              <span className="text-sm text-gray-600">Cartão de Crédito</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-2xl">💰</span>
              <span className="text-sm text-gray-600">PIX</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-2xl">🏦</span>
              <span className="text-sm text-gray-600">Boleto Bancário</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Você será redirecionado para o ambiente seguro do Mercado Pago
          </p>
        </div>
      </div>
    </div>
  );
}
