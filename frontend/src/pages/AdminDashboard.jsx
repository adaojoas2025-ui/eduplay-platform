import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month, year
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupOrdersLoading, setCleanupOrdersLoading] = useState(false);
  const [cleanupEverythingLoading, setCleanupEverythingLoading] = useState(false);
  const [usersModal, setUsersModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [usersListLoading, setUsersListLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);

  const handleCleanupEverything = async () => {
    if (!window.confirm('Remover TUDO: pedidos, produtos e usuários não-admin? Esta ação não pode ser desfeita.')) return;
    setCleanupEverythingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/cleanup/everything`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`✅ ${response.data.message}`);
      fetchDashboardStats();
    } catch (err) {
      alert('❌ Erro: ' + (err.response?.data?.message || err.message));
    } finally {
      setCleanupEverythingLoading(false);
    }
  };

  const handleCleanupOrders = async () => {
    if (!window.confirm('Remover TODOS os pedidos, comissões e transferências? Esta ação não pode ser desfeita.')) return;
    setCleanupOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/cleanup/all-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`✅ ${response.data.message}`);
      fetchDashboardStats();
    } catch (err) {
      alert('❌ Erro: ' + (err.response?.data?.message || err.message));
    } finally {
      setCleanupOrdersLoading(false);
    }
  };

  const handleOpenUsersModal = async () => {
    setUsersModal(true);
    setUsersListLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/users?limit=100&page=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsers = res.data.items || res.data.data || [];
      setUsersList(allUsers.filter(u => u.role !== 'ADMIN'));
    } catch (err) {
      alert('Erro ao carregar usuários');
      setUsersModal(false);
    } finally {
      setUsersListLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Remover este usuário e todos os seus dados?')) return;
    setRemovingUserId(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/cleanup/non-admin-users`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userIds: [userId] },
      });
      setUsersList(prev => prev.filter(u => u.id !== userId));
      fetchDashboardStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao remover usuário');
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleCleanupUsers = async () => {
    if (!window.confirm('Remover TODOS os usuários não-admin? Esta ação não pode ser desfeita.')) return;
    setCleanupLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/cleanup/non-admin-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`✅ ${response.data.message}`);
      setUsersList([]);
      fetchDashboardStats();
    } catch (err) {
      alert('❌ Erro: ' + (err.response?.data?.message || err.message));
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Calculate date range
      const params = {};
      if (timeRange !== 'all') {
        const endDate = new Date();
        const startDate = new Date();

        switch (timeRange) {
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }

        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }

      const response = await axios.get(
        `${API_URL}/admin/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Visão geral da plataforma</p>
          </div>
          {/* Time Range Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeRange === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              7 dias
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeRange === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              1 ano
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">👥</div>
              <div className="text-xs text-gray-500 font-semibold uppercase">
                Usuários
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stats?.users?.totalUsers || 0}
            </div>
            <div className="text-sm text-gray-600">
              Total de usuários na plataforma
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📦</div>
              <div className="text-xs text-gray-500 font-semibold uppercase">
                Pedidos
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stats?.orders?.totalOrders || 0}
            </div>
            <div className="text-sm text-gray-600">
              Total de pedidos realizados
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">💰</div>
              <div className="text-xs text-gray-500 font-semibold uppercase">
                Receita
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              R$ {(stats?.orders?.totalRevenue || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Receita total da plataforma
            </div>
          </div>

          {/* Commissions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">💳</div>
              <div className="text-xs text-gray-500 font-semibold uppercase">
                Comissões
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              R$ {(stats?.commissions?.totalAmount || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Total em comissões
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Usuários por Tipo
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clientes</span>
                <span className="font-bold text-gray-800">
                  {stats?.users?.byRole?.buyers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Produtores</span>
                <span className="font-bold text-gray-800">
                  {stats?.users?.byRole?.producers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admins</span>
                <span className="font-bold text-gray-800">
                  {stats?.users?.byRole?.admins || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Receita da Plataforma
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Receita Total</span>
                <span className="font-bold text-green-600">
                  R$ {(stats?.orders?.totalRevenue || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxa Plataforma</span>
                <span className="font-bold text-blue-600">
                  R$ {(stats?.orders?.platformRevenue || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pago aos Produtores</span>
                <span className="font-bold text-gray-800">
                  R$ {(stats?.orders?.producerRevenue || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Status das Comissões
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pendentes</span>
                <span className="font-bold text-yellow-600">
                  {stats?.commissions?.byStatus?.PENDING?.count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pagas</span>
                <span className="font-bold text-green-600">
                  {stats?.commissions?.byStatus?.PAID?.count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processando</span>
                <span className="font-bold text-blue-600">
                  {stats?.commissions?.byStatus?.PROCESSING?.count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zona de Testes */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-red-800 mb-3">🧪 Zona de Testes</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCleanupEverything}
              disabled={cleanupEverythingLoading}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold hover:bg-black disabled:opacity-50 transition"
            >
              {cleanupEverythingLoading ? 'Removendo...' : '💣 Limpar TUDO'}
            </button>
            <button
              onClick={handleCleanupOrders}
              disabled={cleanupOrdersLoading}
              className="bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 transition"
            >
              {cleanupOrdersLoading ? 'Removendo...' : '🗑️ Limpar todos os pedidos'}
            </button>
            <button
              onClick={handleOpenUsersModal}
              className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              🗑️ Remover usuários de teste
            </button>
          </div>
        </div>

        {/* Modal de usuários */}
        {usersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-bold text-gray-800">Usuários não-admin</h3>
                <button onClick={() => setUsersModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>

              <div className="overflow-y-auto flex-1 p-4">
                {usersListLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : usersList.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum usuário não-admin encontrado.</p>
                ) : (
                  <div className="space-y-2">
                    {usersList.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 truncate">{u.name}</p>
                          <p className="text-sm text-gray-500 truncate">{u.email}</p>
                          <span className="text-xs text-purple-600 font-medium uppercase">{u.role}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(u.id)}
                          disabled={removingUserId === u.id}
                          className="ml-3 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition flex-shrink-0"
                        >
                          {removingUserId === u.id ? '...' : 'Remover'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t flex justify-between items-center gap-3">
                <span className="text-sm text-gray-500">{usersList.length} usuário{usersList.length !== 1 ? 's' : ''}</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCleanupUsers}
                    disabled={cleanupLoading || usersList.length === 0}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-800 disabled:opacity-50 transition"
                  >
                    {cleanupLoading ? 'Removendo...' : 'Remover todos'}
                  </button>
                  <button onClick={() => setUsersModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition">
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <div className="text-3xl">👥</div>
              <div>
                <div className="font-semibold text-gray-800">Usuários</div>
                <div className="text-sm text-gray-600">Gerenciar usuários</div>
              </div>
            </Link>

            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
            >
              <div className="text-3xl">📚</div>
              <div>
                <div className="font-semibold text-gray-800">Produtos</div>
                <div className="text-sm text-gray-600">Gerenciar produtos</div>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
            >
              <div className="text-3xl">📦</div>
              <div>
                <div className="font-semibold text-gray-800">Pedidos</div>
                <div className="text-sm text-gray-600">Ver todos pedidos</div>
              </div>
            </Link>

            <Link
              to="/admin/commissions"
              className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition"
            >
              <div className="text-3xl">💳</div>
              <div>
                <div className="font-semibold text-gray-800">Comissões</div>
                <div className="text-sm text-gray-600">Gerenciar comissões</div>
              </div>
            </Link>

            <Link
              to="/admin/apps"
              className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              <div className="text-3xl">📱</div>
              <div>
                <div className="font-semibold text-gray-800">Apps & Jogos</div>
                <div className="text-sm text-gray-600">Publicar apps</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Receita por Período
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Gráfico de receita em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
