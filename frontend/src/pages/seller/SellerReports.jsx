import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../config/api.config';
import { FiArrowLeft, FiDownload, FiCalendar, FiTrendingUp, FiDollarSign, FiShoppingBag, FiPercent } from 'react-icons/fi';

export default function SellerReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    period: 'all' // all, today, week, month, year
  });

  useEffect(() => {
    fetchReports();
  }, [page, filters.startDate, filters.endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);

      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(
        `${API_URL}/seller/reports?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData(response.data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        startDate = yearAgo.toISOString().split('T')[0];
        break;
      default:
        startDate = '';
        endDate = '';
    }

    setFilters({ ...filters, period, startDate, endDate });
    setPage(1);
  };

  const exportToCSV = () => {
    if (!data?.orders || data.orders.length === 0) {
      toast.warning('Nenhum dado para exportar');
      return;
    }

    const headers = ['Data', 'Produto', 'Cliente', 'Email', 'Valor', 'Comissao', 'Voce Recebe'];
    const rows = data.orders.map(order => [
      new Date(order.createdAt).toLocaleDateString('pt-BR'),
      order.product?.title || 'N/A',
      order.buyer?.name || 'N/A',
      order.buyer?.email || 'N/A',
      `R$ ${order.amount?.toFixed(2) || '0.00'}`,
      `R$ ${order.platformFee?.toFixed(2) || '0.00'}`,
      `R$ ${order.producerAmount?.toFixed(2) || '0.00'}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Relatório exportado com sucesso!');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Voltar ao Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" />
                Relatórios de Vendas
              </h1>
              <p className="text-gray-600">Analise detalhada do desempenho das suas vendas</p>
            </div>
            <button
              onClick={exportToCSV}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FiDownload />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Rápido
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'today', label: 'Hoje' },
                  { value: 'week', label: '7 dias' },
                  { value: 'month', label: '30 dias' },
                  { value: 'year', label: '1 ano' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodChange(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filters.period === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-1" />
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value, period: 'custom' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-1" />
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value, period: 'custom' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total de Vendas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {data?.summary?.totalSales || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Valor Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(data?.summary?.totalAmount)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Comissao Plataforma</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {formatCurrency(data?.summary?.totalPlatformFee)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <FiPercent className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Voce Recebe</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {formatCurrency(data?.summary?.totalProducerAmount)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales by Day */}
          {data?.chartData && data.chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vendas por Dia</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.chartData.slice(-14).map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-sm text-gray-500">{day.count} venda(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(day.amount)}</p>
                      <p className="text-sm text-green-600">{formatCurrency(day.producerAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales by Product */}
          {data?.salesByProduct && data.salesByProduct.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vendas por Produto</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.salesByProduct.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{product.productTitle}</p>
                        <p className="text-sm text-gray-500">{product.count} venda(s)</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">{formatCurrency(product.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Historico de Vendas</h2>
            <p className="text-sm text-gray-500">
              {data?.pagination?.total || 0} vendas encontradas
            </p>
          </div>

          {data?.orders && data.orders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Comissao
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Voce Recebe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                          <br />
                          <span className="text-gray-500 text-xs">
                            {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <p className="font-medium line-clamp-1">{order.product?.title || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{order.product?.category || ''}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <p className="font-medium">{order.buyer?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{order.buyer?.email || ''}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                          {formatCurrency(order.platformFee)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                          {formatCurrency(order.producerAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination && data.pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Pagina {data.pagination.page} de {data.pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                      disabled={page === data.pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Proxima
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma venda encontrada no periodo selecionado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
