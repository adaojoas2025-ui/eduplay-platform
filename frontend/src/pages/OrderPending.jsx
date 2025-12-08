import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function OrderPending() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:3000/api/v1/orders/${id}`,
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
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pagamento Pendente
          </h1>
          <p className="text-gray-600 mb-8">
            Seu pagamento está sendo processado
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
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    {order.status === 'PENDING' ? 'Pendente' : order.status}
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-800 mb-2">
              O que isso significa?
            </h3>
            <div className="text-left text-blue-800 text-sm space-y-2">
              <p>
                Seu pedido foi registrado com sucesso, mas o pagamento ainda está sendo processado pela operadora.
              </p>
              <p className="font-semibold">
                Isso pode acontecer por:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Pagamento por boleto bancário</li>
                <li>• Pagamento via PIX aguardando confirmação</li>
                <li>• Verificação adicional do cartão de crédito</li>
                <li>• Análise de segurança da operadora</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800 text-sm">
              📧 Você receberá um e-mail assim que o pagamento for confirmado. O processo pode levar até 48 horas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Ver Meus Pedidos
            </Link>
            <Link
              to="/marketplace"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Voltar ao Marketplace
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Precisa de ajuda?{' '}
              <Link to="/support" className="text-blue-600 hover:underline">
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
