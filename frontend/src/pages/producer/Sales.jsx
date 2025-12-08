import { useEffect, useState } from 'react';
import { orderAPI } from '../../services/api';
import { DollarSign, Package } from 'lucide-react';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      const response = await orderAPI.getMySales();
      setSales(response.data.sales);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold mb-8">Minhas Vendas</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-success to-success-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-100 text-sm">Total de Vendas</p>
              <p className="text-3xl font-bold">{stats?.totalSales || 0}</p>
            </div>
            <Package className="h-12 w-12 text-success-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-primary to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Receita Total</p>
              <p className="text-3xl font-bold">R$ {stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
            <DollarSign className="h-12 w-12 text-primary-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-secondary to-secondary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-100 text-sm">Minha Comissão (90%)</p>
              <p className="text-3xl font-bold">R$ {stats?.totalCommission?.toFixed(2) || '0.00'}</p>
            </div>
            <DollarSign className="h-12 w-12 text-secondary-200" />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Histórico de Vendas</h2>

        {sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comprador</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-4 py-4 text-sm">
                      {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">{sale.product.title}</td>
                    <td className="px-4 py-4">{sale.buyer.name}</td>
                    <td className="px-4 py-4 font-semibold">R$ {sale.amount.toFixed(2)}</td>
                    <td className="px-4 py-4 font-semibold text-success">
                      R$ {sale.commission?.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-800">
                        {sale.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            Você ainda não tem vendas
          </p>
        )}
      </div>
    </div>
  );
}
