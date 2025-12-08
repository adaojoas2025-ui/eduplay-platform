import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, productAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, Package, TrendingUp, Plus } from 'lucide-react';

export default function ProducerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [salesRes, productsRes] = await Promise.all([
        orderAPI.getMySales(),
        productAPI.getMyProducts(),
      ]);

      setStats(salesRes.data.stats);
      setProducts(productsRes.data.products);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (user?.status === 'PENDING') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card bg-yellow-50 border-yellow-200">
          <h2 className="text-2xl font-bold mb-4">Conta Pendente de Aprovação</h2>
          <p className="text-gray-700">
            Sua conta de produtor está aguardando aprovação. Você poderá criar e vender produtos
            assim que um administrador aprovar sua conta.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard do Produtor</h1>
        <Link to="/producer/products/add" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Novo Produto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Total de Vendas</p>
              <p className="text-3xl font-bold">{stats?.totalSales || 0}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-primary-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-success to-success-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-100 text-sm">Receita Total</p>
              <p className="text-3xl font-bold">R$ {stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
            <DollarSign className="h-12 w-12 text-success-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-secondary to-secondary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-100 text-sm">Produtos</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <Package className="h-12 w-12 text-secondary-200" />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Meus Produtos</h2>
          <Link to="/producer/products" className="text-primary hover:text-primary-700">
            Ver todos
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4">{product.title}</td>
                    <td className="px-4 py-4">R$ {product.price.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'APPROVED' ? 'bg-success-100 text-success-800' :
                        product.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">{product._count?.orders || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            Você ainda não tem produtos. <Link to="/producer/products/add" className="text-primary">Criar primeiro produto</Link>
          </p>
        )}
      </div>
    </div>
  );
}
