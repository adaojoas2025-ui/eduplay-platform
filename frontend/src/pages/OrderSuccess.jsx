import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

function OrderSuccess() {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pagamento Aprovado!
          </h1>
          <p className="text-gray-600 mb-8">
            Seu pagamento foi processado com sucesso
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Detalhes do Pedido
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número do Pedido:</span>
                  <span className="font-semibold text-gray-800">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {order.status === 'APPROVED' ? 'Aprovado' : order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Total:</span>
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

          {guestEmail ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-left">
              <p className="text-green-800 font-semibold mb-1">
                {guestIsNew ? '🎉 Sua conta foi criada!' : '✅ Compra realizada!'}
              </p>
              <p className="text-green-700 text-sm mb-2">
                {guestIsNew
                  ? `Uma senha temporária foi enviada para ${guestEmail}. Verifique também a pasta de spam.`
                  : `Confirmação de compra enviada para ${guestEmail}.`}
              </p>
              <p className="text-green-700 text-sm">
                Após a confirmação do pagamento, seu produto estará disponível em <strong>Meus Produtos</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                📧 Você receberá um e-mail com os detalhes do pedido e instruções de acesso ao curso.
              </p>
            </div>
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

          {guestEmail && (
            <p className="mt-4 text-center">
              <Link
                to="/login?redirect=/my-products"
                className="text-sm text-blue-600 hover:underline"
              >
                Já recebi minhas credenciais → Fazer Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
