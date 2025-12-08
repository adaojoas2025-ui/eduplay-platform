import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, processing, paid, failed
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchCommissions();
  }, [filter, page]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit,
        sortBy: 'createdAt',
        order: 'desc'
      };

      if (filter !== 'all') {
        params.status = filter.toUpperCase();
      }

      const response = await axios.get(
        'http://localhost:3000/api/v1/admin/commissions',
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      setCommissions(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      setError(err.response?.data?.message || 'Erro ao carregar comissões');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (commissionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';

      switch (newStatus) {
        case 'PROCESSING':
          endpoint = `/api/v1/admin/commissions/${commissionId}/process`;
          break;
        case 'PAID':
          endpoint = `/api/v1/admin/commissions/${commissionId}/pay`;
          break;
        case 'FAILED':
          endpoint = `/api/v1/admin/commissions/${commissionId}/fail`;
          break;
        default:
          return;
      }

      await axios.post(
        `http://localhost:3000${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchCommissions();
    } catch (err) {
      console.error('Error updating commission status:', err);
      alert(err.response?.data?.message || 'Erro ao atualizar comissão');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800'
    };

    const labels = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      PAID: 'Pago',
      FAILED: 'Falhou'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando comissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Comissões</h1>
          <p className="text-gray-600 mt-1">Visualize e gerencie pagamentos de comissões</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('processing')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'processing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Processando
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'paid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pagas
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'failed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Falhadas
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Commissions Table */}
        {commissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhuma comissão encontrada
            </h2>
            <p className="text-gray-600">
              Não há comissões {filter !== 'all' ? `com status "${filter}"` : ''} no momento
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Produtor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Pedido
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      Data
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {commission.order?.product?.producer?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {commission.order?.product?.producer?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800 font-mono">
                          #{commission.orderId?.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800">
                          {commission.order?.product?.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-bold text-gray-800">
                          R$ {commission.amount?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {commission.percentage}% de R$ {commission.order?.amount?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(commission.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-800">
                          {new Date(commission.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(commission.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {commission.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(commission.id, 'PROCESSING')}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition text-sm font-semibold"
                            >
                              Processar
                            </button>
                          )}
                          {commission.status === 'PROCESSING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(commission.id, 'PAID')}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition text-sm font-semibold"
                              >
                                Marcar Pago
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(commission.id, 'FAILED')}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition text-sm font-semibold"
                              >
                                Falhou
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= total}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
