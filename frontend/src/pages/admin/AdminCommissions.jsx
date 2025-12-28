import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api.config';

export default function AdminCommissions() {
  const [stats, setStats] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, PAID, PROCESSING, FAILED

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Buscar estatísticas
      const statsResponse = await axios.get(
        `${API_URL}/admin/commissions/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Buscar comissões
      const commissionsResponse = await axios.get(
        `${API_URL}/admin/commissions${filter !== 'ALL' ? `?status=${filter}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats(statsResponse.data.data);
      setCommissions(commissionsResponse.data.data.items || []);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      setError(err.response?.data?.message || 'Erro ao carregar comissões');
    } finally {
      setLoading(false);
    }
  };

  const handlePayCommission = async (commissionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/commissions/${commissionId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData(); // Reload data
      alert('Comissão marcada como paga!');
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao marcar comissão como paga');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💰 Comissões da Plataforma
          </h1>
          <p className="text-gray-600">
            Gerencie as comissões de 3% da EDUPLAY
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-sm font-semibold mb-2 opacity-90">
              💰 Receita da Plataforma
            </div>
            <div className="text-3xl font-bold">
              R$ {(stats?.platformRevenue || 0).toFixed(2)}
            </div>
            <div className="text-xs mt-1 opacity-75">
              3% sobre R$ {(stats?.totalSalesRevenue || 0).toFixed(2)} em vendas
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              Total Vendedores
            </div>
            <div className="text-3xl font-bold text-gray-800">
              R$ {stats?.totalAmount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.totalCount || 0} comissões
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              Pendentes
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              R$ {stats?.pendingAmount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.pendingCount || 0} comissões
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              Pagas
            </div>
            <div className="text-3xl font-bold text-blue-600">
              R$ {stats?.paidAmount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.paidCount || 0} comissões
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              Este Mês
            </div>
            <div className="text-3xl font-bold text-purple-600">
              R$ {stats?.monthlyAmount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.monthlyCount || 0} comissões
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Todas' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Valor Venda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Comissão (3%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Nenhuma comissão encontrada
                    </td>
                  </tr>
                ) : (
                  commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(commission.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {commission.producer?.name || 'N/A'}
                        <div className="text-xs text-gray-500">
                          {commission.producer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {commission.order?.product?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        R$ {commission.order?.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        R$ {commission.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            commission.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : commission.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : commission.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {commission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {commission.status === 'PENDING' && (
                          <button
                            onClick={() => handlePayCommission(commission.id)}
                            className="text-green-600 hover:text-green-800 font-semibold text-sm"
                          >
                            ✓ Marcar como Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
