import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [revenueByProduct, setRevenueByProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mpStatus, setMpStatus] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Buscar estatísticas do vendedor
      const statsResponse = await axios.get(
        `${API_URL}/seller/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Buscar produtos do vendedor
      const productsResponse = await axios.get(
        `${API_URL}/seller/products`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Buscar vendas recentes
      const salesResponse = await axios.get(
        `${API_URL}/seller/sales?limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStats(statsResponse.data.data);
      setProducts(productsResponse.data.data.items || []);
      setRecentSales(salesResponse.data.data.items || []);

      // Buscar receita por produto (independente - não bloqueia o dashboard)
      try {
        const revenueResponse = await axios.get(
          `${API_URL}/seller/revenue-by-product`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setRevenueByProduct(revenueResponse.data.data || []);
      } catch (revenueErr) {
        console.warn('Revenue by product not available:', revenueErr);
        setRevenueByProduct([]);
      }

      // Buscar status do Mercado Pago (independente)
      try {
        const mpResponse = await axios.get(
          `${API_URL}/users/mercadopago/status`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setMpStatus(mpResponse.data.data);
      } catch (mpErr) {
        console.warn('MP status not available:', mpErr);
        setMpStatus(null);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do dashboard');
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
      <div className="min-h-screen bg-gray-50 py-12">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard do Vendedor</h1>
          <p className="text-gray-600">Gerencie seus produtos e acompanhe suas vendas</p>
        </div>

        {/* Mercado Pago Warning */}
        {mpStatus && !mpStatus.isLinked && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Receba seus pagamentos automaticamente!
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Vincule sua conta do Mercado Pago para receber 97% do valor de cada venda diretamente na sua conta.
                  Sem vinculação, os pagamentos serão processados manualmente.
                </p>
                <div className="mt-3">
                  <Link
                    to="/seller/settings"
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Vincular Mercado Pago
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Expiring Warning */}
        {mpStatus && mpStatus.isLinked && mpStatus.needsReauthorization && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  Sua autorização do Mercado Pago expira em breve
                </h3>
                <p className="mt-1 text-sm text-orange-700">
                  Reautorize sua conta para continuar recebendo pagamentos automaticamente.
                  {mpStatus.daysUntilExpiration > 0 && ` Restam ${mpStatus.daysUntilExpiration} dias.`}
                </p>
                <div className="mt-3">
                  <Link
                    to="/seller/settings"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition"
                  >
                    Reautorizar Agora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Vendas Totais</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              R$ {stats?.totalAmount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.totalSales || 0} vendas realizadas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Comissões Pendentes</h3>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              R$ {stats?.pendingCommissions?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              A pagar para plataforma (3%)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Você Recebe</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              R$ {stats?.totalRevenue?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Valor líquido após comissão
            </p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Produtos Ativos</h3>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats?.totalProducts || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total de produtos
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Vendas este Mês</h3>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats?.salesThisMonth || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              R$ {stats?.revenueThisMonth?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Ticket Médio</h3>
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              R$ {stats?.averageTicket?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Por venda
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Comissões Pagas</h3>
              <span className="text-2xl">💸</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              R$ {stats?.paidCommissions?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Já pagas à plataforma
            </p>
          </div>
        </div>

        {/* Receita por Produto */}
        {revenueByProduct.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Receita por Produto</h2>
              <span className="text-2xl">📊</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Produto</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Vendas</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Valor Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Taxa Plataforma</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Você Recebe</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByProduct.map((product) => (
                    <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-gray-800">{product.productTitle}</p>
                          <p className="text-sm text-gray-500">Preço: R$ {product.productPrice?.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                          {product.totalSales}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                        R$ {product.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-orange-600">
                        R$ {product.platformFee?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        R$ {product.producerAmount?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="font-bold">
                    <td className="py-3 px-4 text-gray-800">Total</td>
                    <td className="py-3 px-4 text-center text-gray-800">
                      {revenueByProduct.reduce((sum, p) => sum + p.totalSales, 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800">
                      R$ {revenueByProduct.reduce((sum, p) => sum + (p.totalAmount || 0), 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-orange-600">
                      R$ {revenueByProduct.reduce((sum, p) => sum + (p.platformFee || 0), 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      R$ {revenueByProduct.reduce((sum, p) => sum + (p.producerAmount || 0), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produtos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Meus Produtos</h2>
              <div className="flex gap-2">
                <Link
                  to="/seller/products"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                >
                  Editar Meus Produtos
                </Link>
                <Link
                  to="/seller/products/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  + Novo Produto
                </Link>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-600 mb-4">Você ainda não tem produtos cadastrados</p>
                <Link
                  to="/seller/products/new"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Criar Primeiro Produto
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{product.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          R$ {product.price?.toFixed(2)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{product.sales || 0} vendas</p>
                      <p className="text-sm text-gray-600">{product.views || 0} visualizações</p>
                    </div>
                  </div>
                ))}

                {products.length > 5 && (
                  <Link
                    to="/seller/products"
                    className="block text-center text-blue-600 hover:underline mt-4"
                  >
                    Ver todos os produtos ({products.length})
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Vendas Recentes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Vendas Recentes</h2>
              <Link
                to="/seller/reports"
                className="text-blue-600 hover:underline text-sm font-semibold"
              >
                Ver todas
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">💳</div>
                <p className="text-gray-600">Nenhuma venda ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {sale.product?.title || 'Produto'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          {sale.buyer?.name || 'Cliente'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sale.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : sale.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sale.status === 'APPROVED' ? 'Aprovado' :
                           sale.status === 'PENDING' ? 'Pendente' : 'Falhou'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        R$ {sale.amount?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/seller/products/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
            >
              <span className="text-3xl">➕</span>
              <div>
                <h3 className="font-semibold text-gray-800">Adicionar Produto</h3>
                <p className="text-sm text-gray-600">Criar novo curso ou infoproduto</p>
              </div>
            </Link>

            <Link
              to="/seller/reports"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
            >
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-800">Ver Relatórios</h3>
                <p className="text-sm text-gray-600">Análise detalhada de vendas</p>
              </div>
            </Link>

            <Link
              to="/seller/settings"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
            >
              <span className="text-3xl">⚙️</span>
              <div>
                <h3 className="font-semibold text-gray-800">Configurações</h3>
                <p className="text-sm text-gray-600">Dados de pagamento e perfil</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
