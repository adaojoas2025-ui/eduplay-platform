import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/api';
import { saveAuth, getToken } from '../../lib/auth';
import { FiSettings, FiBriefcase, FiCreditCard, FiSave, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import LinkMercadoPago from '../../components/LinkMercadoPago';
import ConfigurePixPayment from '../../components/ConfigurePixPayment';

export default function SellerSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDocument: '',
    businessPhone: '',
    businessAddress: '',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
    bankAccountType: 'corrente',
    pixKey: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await userAPI.getProfile();
      console.log('Profile response:', response);
      const user = response.data.data || response.data;
      console.log('User data:', user);

      setFormData({
        businessName: user.businessName || '',
        businessDocument: user.businessDocument || '',
        businessPhone: user.businessPhone || '',
        businessAddress: user.businessAddress || '',
        bankName: user.bankName || '',
        bankAgency: user.bankAgency || '',
        bankAccount: user.bankAccount || '',
        bankAccountType: user.bankAccountType || 'corrente',
        pixKey: user.pixKey || '',
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do perfil');
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('Saving settings:', formData);
      const response = await userAPI.updateProducerSettings(formData);
      console.log('Update response:', response);
      const updatedUser = response.data.data || response.data;

      // Update localStorage with new user data
      const token = getToken();
      const refreshToken = localStorage.getItem('refreshToken');
      saveAuth(updatedUser, token, refreshToken);

      toast.success('Configuracoes atualizadas com sucesso!');
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error(err.response?.data?.message || 'Erro ao atualizar configuracoes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configuracoes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchUserData}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Voltar ao Dashboard
          </button>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FiSettings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuracoes do Vendedor</h1>
              <p className="text-gray-600">Atualize seus dados comerciais e bancarios</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <FiBriefcase className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Dados do Negocio</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Negocio
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome da empresa ou nome profissional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  name="businessDocument"
                  value={formData.businessDocument}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone Comercial
                </label>
                <input
                  type="tel"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="11987654321"
                />
                <p className="mt-1 text-xs text-gray-500">Apenas numeros, 10 ou 11 digitos</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereco Completo
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Rua, numero, bairro, cidade - estado, CEP"
                />
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <FiCreditCard className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Dados Bancarios</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Essas informacoes sao usadas para receber seus pagamentos
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Banco
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Banco do Brasil, Itau, Nubank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agencia
                </label>
                <input
                  type="text"
                  name="bankAgency"
                  value={formData.bankAgency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero da Conta
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="12345-6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <select
                  name="bankAccountType"
                  value={formData.bankAccountType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="corrente">Conta Corrente</option>
                  <option value="poupanca">Conta Poupanca</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave PIX
                </label>
                <input
                  type="text"
                  name="pixKey"
                  value={formData.pixKey}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatoria"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Esta chave sera usada para receber seus pagamentos
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Salvar Alteracoes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Payment Options */}
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Opcoes de Recebimento Automatico</h2>
          <p className="text-gray-600">Escolha como deseja receber seus pagamentos automaticamente. Voce pode usar PIX (qualquer banco) ou vincular sua conta do Mercado Pago.</p>

          {/* PIX Payment - Primary option */}
          <ConfigurePixPayment />

          {/* Mercado Pago - Alternative option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-4 text-sm text-gray-500">ou</span>
            </div>
          </div>

          <LinkMercadoPago />
        </div>
      </div>
    </div>
  );
}
