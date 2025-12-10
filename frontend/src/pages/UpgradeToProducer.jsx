import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { getUser, saveAuth, getToken } from '../lib/auth';

export default function UpgradeToProducer() {
  const [loading, setLoading] = useState(false);
  const user = getUser();

  const handleUpgrade = async () => {
    setLoading(true);

    try {
      const response = await api.post('/auth/upgrade-to-producer');
      const updatedUser = response.data.data;

      // Atualiza localStorage com novo user
      const token = getToken();
      const refreshToken = localStorage.getItem('refreshToken');
      saveAuth(updatedUser, token, refreshToken);

      toast.success('Conta atualizada para Vendedor com sucesso!');

      // Reload para carregar novo estado
      window.location.href = '/seller/dashboard';
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(error.response?.data?.message || 'Erro ao fazer upgrade');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'PRODUCER') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold mb-4">Você já é um Vendedor!</h1>
          <p className="text-gray-600 mb-8">
            Sua conta já tem permissões de vendedor. Você pode criar e vender produtos digitais.
          </p>
          <button
            onClick={() => navigate('/seller/products/new')}
            className="btn-primary"
          >
            Criar Produto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tornar-se Vendedor</h1>
          <p className="text-xl text-gray-600">
            Comece a vender seus produtos digitais na EDUPLAY
          </p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Benefícios de ser Vendedor</h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📚</div>
              <div>
                <h3 className="font-semibold">Crie Produtos Digitais</h3>
                <p className="text-gray-600">Cursos, ebooks, mentorias e muito mais</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-semibold">Receba Pagamentos</h3>
                <p className="text-gray-600">Integração com Mercado Pago para receber seus ganhos</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-semibold">Acompanhe suas Vendas</h3>
                <p className="text-gray-600">Dashboard completo com estatísticas e relatórios</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold">Alcance Milhares de Alunos</h3>
                <p className="text-gray-600">Marketplace com visibilidade para seus produtos</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">🏆</div>
              <div>
                <h3 className="font-semibold">Sistema de Gamificação</h3>
                <p className="text-gray-600">Ganhe pontos, badges e suba de nível</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200 mb-8">
          <h2 className="text-xl font-bold mb-4">Taxa da Plataforma</h2>
          <p className="text-gray-700 mb-2">
            A EDUPLAY cobra apenas <span className="font-bold text-primary-600">10% sobre cada venda</span>.
          </p>
          <p className="text-sm text-gray-600">
            Você recebe 90% do valor de cada produto vendido diretamente na sua conta.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Atualizando...' : 'Tornar-se Vendedor Agora'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Após a atualização, você precisará fazer login novamente
          </p>
        </div>
      </div>
    </div>
  );
}
