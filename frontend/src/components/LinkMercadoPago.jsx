import { useState, useEffect } from 'react';
import api from '../services/api';

export default function LinkMercadoPago() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatus();

    // Check for URL params (after OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    if (params.get('mp_linked') === 'true') {
      setError(null);
      fetchStatus();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('mp_error')) {
      setError('Falha ao vincular conta do Mercado Pago. Tente novamente.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/mercadopago/status');
      setStatus(response.data.data);
    } catch (err) {
      console.error('Error fetching MP status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    try {
      setLinking(true);
      setError(null);
      const response = await api.get('/users/mercadopago/auth-url');
      const { authUrl } = response.data.data;
      // Redirect to Mercado Pago
      window.location.href = authUrl;
    } catch (err) {
      setError('Erro ao gerar link de autorização');
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Tem certeza que deseja desvincular sua conta do Mercado Pago? Você não receberá mais pagamentos automáticos.')) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/users/mercadopago/unlink');
      await fetchStatus();
    } catch (err) {
      setError('Erro ao desvincular conta');
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-40 mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recebimento Automático</h3>
          <p className="text-sm text-gray-500">Vincule sua conta do Mercado Pago</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {status?.isLinked ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Conta vinculada</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ID Mercado Pago:</span>
              <span className="font-medium">{status.mercadopagoUserId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Vinculado em:</span>
              <span className="font-medium">{formatDate(status.linkedAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Token expira em:</span>
              <span className={`font-medium ${status.daysUntilExpiration < 30 ? 'text-yellow-600' : ''}`}>
                {status.daysUntilExpiration > 0 ? `${status.daysUntilExpiration} dias` : 'Expirado'}
              </span>
            </div>
          </div>

          {status.needsReauthorization && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Sua autorização expira em breve. Reautorize para continuar recebendo automaticamente.
              </p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Como funciona:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Quando alguém compra seu produto, você recebe 97% automaticamente</li>
              <li>• O dinheiro vai direto para sua conta Mercado Pago</li>
              <li>• A plataforma retém apenas 3% de taxa</li>
            </ul>
          </div>

          <div className="flex gap-3">
            {status.needsReauthorization && (
              <button
                onClick={handleLink}
                disabled={linking}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {linking ? 'Redirecionando...' : 'Reautorizar'}
              </button>
            )}
            <button
              onClick={handleUnlink}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              Desvincular
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Conta não vinculada</h4>
            <p className="text-sm text-yellow-700">
              Vincule sua conta do Mercado Pago para receber seus pagamentos automaticamente.
              Sem vinculação, os pagamentos serão processados manualmente.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Benefícios:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Receba 97% do valor automaticamente a cada venda</li>
              <li>• Dinheiro disponível imediatamente na sua conta MP</li>
              <li>• Sem necessidade de solicitar saques</li>
              <li>• Reembolsos processados automaticamente</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Requisitos:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Ter uma conta no Mercado Pago (gratuita)</li>
              <li>• Autorizar a plataforma a receber em seu nome</li>
            </ul>
          </div>

          <button
            onClick={handleLink}
            disabled={linking}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#009ee3] text-white rounded-lg hover:bg-[#0087c6] disabled:opacity-50 transition-colors"
          >
            {linking ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Redirecionando...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span>Vincular Mercado Pago</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
