import { useState, useEffect } from 'react';
import api from '../services/api';

export default function WithdrawalSection() {
  const [balance, setBalance] = useState(null);
  const [pixConfig, setPixConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, pixRes] = await Promise.all([
        api.get('/users/pix/balance'),
        api.get('/users/pix/config')
      ]);
      setBalance(balanceRes.data.data);
      setPixConfig(pixRes.data.data);
    } catch (err) {
      console.error('Error fetching withdrawal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!balance?.availableBalance || balance.availableBalance <= 0) {
      setError('Nao ha saldo disponivel para saque');
      return;
    }

    if (!pixConfig?.isConfigured) {
      setError('Configure sua chave PIX antes de solicitar saque');
      return;
    }

    const confirmed = window.confirm(
      `Confirma o saque de ${formatCurrency(balance.availableBalance)} para a chave PIX ${maskPixKey(pixConfig.pixKey, pixConfig.pixKeyType)}?`
    );

    if (!confirmed) return;

    try {
      setWithdrawing(true);
      setError(null);
      setSuccess(null);

      const response = await api.post('/users/pix/withdraw');
      const result = response.data.data;

      setSuccess(`Saque de ${formatCurrency(result.totalAmount)} realizado com sucesso! O valor sera transferido para sua conta via PIX.`);

      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar saque');
    } finally {
      setWithdrawing(false);
    }
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
      return key.length > 8 ? `${key.slice(0, 4)}****${key.slice(-4)}` : key;
    }
    return `${key.slice(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  const hasBalance = balance?.availableBalance > 0;
  const isConfigured = pixConfig?.isConfigured;

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Saldo Disponivel para Saque</h3>
            <p className="text-sm text-green-100">
              {balance?.pendingOrders || 0} vendas aguardando saque
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-300/30 rounded-lg text-white text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-white/20 border border-white/30 rounded-lg text-white text-sm">
          {success}
        </div>
      )}

      <div className="mb-6">
        <p className="text-4xl font-bold mb-1">
          {formatCurrency(balance?.availableBalance || 0)}
        </p>
        {isConfigured && (
          <p className="text-sm text-green-100">
            PIX: {maskPixKey(pixConfig.pixKey, pixConfig.pixKeyType)} ({pixConfig.pixAccountHolder})
          </p>
        )}
      </div>

      {!isConfigured ? (
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <p className="text-sm mb-2">
            Configure sua chave PIX para poder solicitar saques
          </p>
          <a
            href="/seller/settings"
            className="inline-flex items-center px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
          >
            Configurar PIX
          </a>
        </div>
      ) : (
        <button
          onClick={handleWithdraw}
          disabled={!hasBalance || withdrawing}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
            hasBalance && !withdrawing
              ? 'bg-white text-green-600 hover:bg-green-50'
              : 'bg-white/30 text-white/70 cursor-not-allowed'
          }`}
        >
          {withdrawing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {hasBalance ? 'Solicitar Saque' : 'Sem saldo disponivel'}
            </>
          )}
        </button>
      )}

      <p className="text-xs text-green-100 mt-4 text-center">
        O valor sera transferido automaticamente via PIX para a chave cadastrada
      </p>
    </div>
  );
}
