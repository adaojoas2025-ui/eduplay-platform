import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month, year

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
              {stats?.users?.total || 0}
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
              {stats?.orders?.total || 0}
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
                  {stats?.users?.byRole?.CUSTOMER || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Produtores</span>
                <span className="font-bold text-gray-800">
                  {stats?.users?.byRole?.PRODUCER || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admins</span>
                <span className="font-bold text-gray-800">
                  {stats?.users?.byRole?.ADMIN || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Status dos Pedidos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pendentes</span>
                <span className="font-bold text-yellow-600">
                  {stats?.orders?.byStatus?.PENDING || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completos</span>
                <span className="font-bold text-green-600">
                  {stats?.orders?.byStatus?.COMPLETED || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelados</span>
                <span className="font-bold text-red-600">
                  {stats?.orders?.byStatus?.CANCELLED || 0}
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
                  {stats?.commissions?.byStatus?.PENDING || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pagas</span>
                <span className="font-bold text-green-600">
                  {stats?.commissions?.byStatus?.PAID || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processando</span>
                <span className="font-bold text-blue-600">
                  {stats?.commissions?.byStatus?.PROCESSING || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

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
