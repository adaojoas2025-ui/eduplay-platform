import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

function OrderPending() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestIsNew, setGuestIsNew] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (err) {
        setError('Erro ao carregar informações do pedido');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    const email = sessionStorage.getItem('guestEmail');
    const isNew = sessionStorage.getItem('guestIsNew') === 'true';
    if (email) {
      setGuestEmail(email);
      setGuestIsNew(isNew);
      sessionStorage.removeItem('guestEmail');
      sessionStorage.removeItem('guestIsNew');
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando informações do pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/marketplace"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Voltar ao Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = order?.status === 'COMPLETED' || order?.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className={`text-6xl mb-4 ${isCompleted ? 'text-green-500' : 'text-yellow-500'}`}>
            {isCompleted ? '✓' : '⏳'}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isCompleted ? 'Pagamento Confirmado!' : 'Pagamento Pendente'}
          </h1>
          <p className="text-gray-600 mb-8">
            {isCompleted ? 'Seu pagamento foi processado com sucesso' : 'Seu pagamento está sendo processado'}
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Detalhes do Pedido
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número do Pedido:</span>
                  <span className="font-semibold text-gray-800 text-sm">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {isCompleted ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-semibold text-gray-800">
                    R$ {order.amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Credentials info for completed guest orders */}
          {isCompleted && guestEmail && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-green-800 font-semibold mb-1">
                {guestIsNew ? '🎉 Sua conta foi criada!' : '✅ Compra realizada!'}
              </p>
              <p className="text-green-700 text-sm mb-2">
                {guestIsNew
                  ? `Uma senha provisória foi enviada para ${guestEmail}. Verifique também a pasta de spam.`
                  : `Confirmação de compra enviada para ${guestEmail}.`}
              </p>
              <p className="text-green-700 text-sm">
                Use seu e-mail e essa senha para fazer login e acessar seus produtos.
              </p>
            </div>
          )}

          {/* Pending explanation — only when not yet completed */}
          {!isCompleted && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">
                  O que isso significa?
                </h3>
                <div className="text-left text-blue-800 text-sm space-y-2">
                  <p>
                    Seu pedido foi registrado com sucesso, mas o pagamento ainda está sendo processado pela operadora.
                  </p>
                  <p className="font-semibold">Isso pode acontecer por:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Pagamento por boleto bancário</li>
                    <li>• Pagamento via PIX aguardando confirmação</li>
                    <li>• Verificação adicional do cartão de crédito</li>
                    <li>• Análise de segurança da operadora</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  📧 Você receberá um e-mail assim que o pagamento for confirmado. O processo pode levar até 48 horas.
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/my-products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              📦 Acessar Meus Produtos
            </Link>
            <Link
              to="/marketplace"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Voltar ao Marketplace
            </Link>
          </div>

          {isCompleted && (
            <div className="mt-4 space-y-2">
              <Link
                to="/login?redirect=/my-products"
                className="block w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold text-sm"
              >
                🔐 Fazer Login e Acessar
              </Link>
              <Link to="/reset-password" className="block text-sm text-gray-500 hover:underline">
                Não recebi o e-mail / Esqueci minha senha
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Precisa de ajuda?{' '}
              <Link to="/contact" className="text-blue-600 hover:underline">
                Entre em contato com o suporte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPending;
