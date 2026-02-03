import { useState, useEffect } from 'react';
import api from '../services/api';

const PIX_KEY_TYPES = [
  { value: 'CPF', label: 'CPF', placeholder: '000.000.000-00', mask: '###.###.###-##' },
  { value: 'CNPJ', label: 'CNPJ', placeholder: '00.000.000/0000-00', mask: '##.###.###/####-##' },
  { value: 'EMAIL', label: 'E-mail', placeholder: 'seu@email.com', mask: null },
  { value: 'PHONE', label: 'Telefone', placeholder: '+55 (00) 00000-0000', mask: '+## (##) #####-####' },
  { value: 'RANDOM', label: 'Chave Aleatória', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', mask: null },
];

export default function ConfigurePixPayment() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);

  // Form fields
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('CPF');
  const [pixAccountHolder, setPixAccountHolder] = useState('');
  const [pixBankName, setPixBankName] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/pix/config');
      const data = response.data.data;
      setConfig(data);
      if (data.pixKey) {
        setPixKey(data.pixKey);
        setPixKeyType(data.pixKeyType || 'CPF');
        setPixAccountHolder(data.pixAccountHolder || '');
        setPixBankName(data.pixBankName || '');
      }
    } catch (err) {
      console.error('Error fetching PIX config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!pixKey.trim()) {
      setError('Informe sua chave PIX');
      return;
    }
    if (!pixAccountHolder.trim()) {
      setError('Informe o nome do titular da conta');
      return;
    }

    try {
      setSaving(true);
      await api.post('/users/pix/config', {
        pixKey: pixKey.trim(),
        pixKeyType,
        pixAccountHolder: pixAccountHolder.trim(),
        pixBankName: pixBankName.trim() || null,
      });
      setSuccess('Chave PIX configurada com sucesso!');
      setEditing(false);
      await fetchConfig();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar configuração PIX');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutoPayment = async () => {
    setError(null);
    try {
      setLoading(true);
      if (config?.pixAutoPaymentEnabled) {
        await api.post('/users/pix/disable');
      } else {
        await api.post('/users/pix/enable');
      }
      await fetchConfig();
      setSuccess(config?.pixAutoPaymentEnabled ? 'Pagamento automático desabilitado' : 'Pagamento automático habilitado');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar configuração');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Tem certeza que deseja remover sua chave PIX? Você não receberá mais pagamentos automáticos.')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete('/users/pix/config');
      setConfig(null);
      setPixKey('');
      setPixKeyType('CPF');
      setPixAccountHolder('');
      setPixBankName('');
      setSuccess('Chave PIX removida');
    } catch (err) {
      setError('Erro ao remover chave PIX');
    } finally {
      setLoading(false);
    }
  };

  const formatPixKey = (key, type) => {
    if (!key) return '-';
    if (type === 'CPF') {
      const digits = key.replace(/\D/g, '');
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (type === 'CNPJ') {
      const digits = key.replace(/\D/g, '');
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    if (type === 'PHONE') {
      const digits = key.replace(/\D/g, '');
      if (digits.length === 13) {
        return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
      }
    }
    return key;
  };

  const getKeyTypeConfig = (type) => PIX_KEY_TYPES.find(t => t.value === type) || PIX_KEY_TYPES[0];

  if (loading && !config) {
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
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recebimento via PIX</h3>
          <p className="text-sm text-gray-500">Receba em qualquer banco, sem precisar de conta no Mercado Pago</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {config?.isConfigured && !editing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Chave PIX configurada</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium">{getKeyTypeConfig(config.pixKeyType).label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Chave:</span>
              <span className="font-medium font-mono">{formatPixKey(config.pixKey, config.pixKeyType)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Titular:</span>
              <span className="font-medium">{config.pixAccountHolder}</span>
            </div>
            {config.pixBankName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Banco:</span>
                <span className="font-medium">{config.pixBankName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pagamento automático:</span>
              <span className={`font-medium ${config.pixAutoPaymentEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                {config.pixAutoPaymentEnabled ? 'Habilitado' : 'Desabilitado'}
              </span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Como funciona:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Quando alguém compra seu produto, você recebe 97% via PIX</li>
              <li>• O dinheiro vai direto para sua conta em qualquer banco</li>
              <li>• A plataforma retém apenas 3% de taxa</li>
              <li>• Não precisa ter conta no Mercado Pago</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleToggleAutoPayment}
              disabled={loading}
              className={`flex-1 min-w-[140px] px-4 py-2 rounded-lg transition-colors ${
                config.pixAutoPaymentEnabled
                  ? 'border border-orange-300 text-orange-600 hover:bg-orange-50'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {config.pixAutoPaymentEnabled ? 'Desabilitar Auto' : 'Habilitar Auto'}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Editar
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {!config?.isConfigured && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Benefícios do PIX:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Receba 97% do valor automaticamente a cada venda</li>
                <li>• Dinheiro em qualquer conta bancária (PIX)</li>
                <li>• Não precisa ter conta no Mercado Pago</li>
                <li>• Transferência instantânea 24/7</li>
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Chave PIX *
            </label>
            <select
              value={pixKeyType}
              onChange={(e) => setPixKeyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {PIX_KEY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chave PIX *
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder={getKeyTypeConfig(pixKeyType).placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Titular da Conta *
            </label>
            <input
              type="text"
              value={pixAccountHolder}
              onChange={(e) => setPixAccountHolder(e.target.value)}
              placeholder="Nome completo conforme cadastro no banco"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              O nome deve ser exatamente igual ao cadastrado no seu banco
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Banco (opcional)
            </label>
            <input
              type="text"
              value={pixBankName}
              onChange={(e) => setPixBankName(e.target.value)}
              placeholder="Ex: Nubank, Itaú, Bradesco..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Verifique se a chave PIX e o nome do titular estão corretos.
              Dados incorretos podem causar falha na transferência.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar Chave PIX'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  // Reset to original values
                  if (config) {
                    setPixKey(config.pixKey || '');
                    setPixKeyType(config.pixKeyType || 'CPF');
                    setPixAccountHolder(config.pixAccountHolder || '');
                    setPixBankName(config.pixBankName || '');
                  }
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
