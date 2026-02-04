import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_CONFIG = {
  COMPLETED: { label: 'Concluido', color: 'text-green-600', bg: 'bg-green-100', icon: '✓' },
  PENDING: { label: 'Pendente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⏳' },
  PROCESSING: { label: 'Processando', color: 'text-blue-600', bg: 'bg-blue-100', icon: '↻' },
  FAILED: { label: 'Falhou', color: 'text-red-600', bg: 'bg-red-100', icon: '✗' },
};

export default function TransferHistory({ limit = 5, showViewAll = true }) {
  const [transfers, setTransfers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transfersRes, statsRes] = await Promise.all([
        api.get(`/users/pix/transfers?limit=${limit}`),
        api.get('/users/pix/stats')
      ]);
      // API returns { data: { items: [...], pagination: {...} } }
      const transfersData = transfersRes.data.data;
      setTransfers(Array.isArray(transfersData) ? transfersData : (transfersData?.items || []));
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching transfer history:', err);
      // Don't show error if user just doesn't have PIX configured
      if (err.response?.status !== 403 && err.response?.status !== 400) {
        setError('Erro ao carregar historico');
      }
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const maskPixKey = (key, type) => {
    if (!key) return '-';
    if (type === 'EMAIL') {
      const [local, domain] = key.split('@');
      return `${local.slice(0, 3)}***@${domain}`;
    }
    if (type === 'CPF') {
      return `***.***.${key.slice(-5)}`;
    }
    if (type === 'PHONE') {
      return `****${key.slice(-4)}`;
    }
    return `${key.slice(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything if there's an error or no transfers
  if (error || (transfers.length === 0 && !stats)) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Transferencias Recentes</h3>
        {showViewAll && transfers.length > 0 && (
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Ver todas →
          </button>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (stats.completed > 0 || stats.pending > 0) && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 font-medium">Recebido</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(stats.completedAmount)}</p>
            <p className="text-xs text-green-500">{stats.completed} transferencias</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-600 font-medium">Pendente</p>
            <p className="text-lg font-bold text-yellow-700">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-xs text-yellow-500">{stats.pending} transferencias</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 font-medium">Total</p>
            <p className="text-lg font-bold text-gray-700">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-xs text-gray-500">{stats.total} transferencias</p>
          </div>
        </div>
      )}

      {transfers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>Nenhuma transferencia ainda</p>
          <p className="text-sm mt-1">Suas transferencias PIX aparecerao aqui</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Data</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Produto</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">Valor</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transfers.map((transfer) => {
                const statusConfig = STATUS_CONFIG[transfer.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-600">
                      {formatDate(transfer.processedAt || transfer.createdAt)}
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                        {transfer.orders?.product?.title || 'Produto'}
                      </p>
                      <p className="text-xs text-gray-400">
                        PIX: {maskPixKey(transfer.pixKey, transfer.pixKeyType)}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transfer.amount)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <span>{statusConfig.icon}</span>
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info about PIX */}
      {transfers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Transferencias PIX sao processadas automaticamente apos a aprovacao do pagamento
          </p>
        </div>
      )}
    </div>
  );
}
