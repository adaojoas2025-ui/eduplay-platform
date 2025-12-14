import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api.config';
import { Link } from 'react-router-dom';

export default function MyProducts() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/purchases`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setPurchases(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Erro ao carregar seus produtos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seus produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meus Produtos</h1>
          <p className="text-gray-600 mt-2">Produtos digitais que você adquiriu</p>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Você ainda não comprou nenhum produto
            </h2>
            <p className="text-gray-600 mb-6">
              Explore o marketplace e adquira produtos digitais incríveis!
            </p>
            <Link
              to="/marketplace"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Explorar Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={purchase.product?.thumbnailUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23ddd" width="400" height="225"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="3.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESem Imagem%3C/text%3E%3C/svg%3E'}
                  alt={purchase.product?.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {purchase.product?.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {purchase.product?.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      Comprado em: {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        purchase.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : purchase.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {purchase.status === 'APPROVED'
                        ? 'Aprovado'
                        : purchase.status === 'PENDING'
                        ? 'Pendente'
                        : purchase.status}
                    </span>
                  </div>

                  {purchase.status === 'APPROVED' && (
                    <div className="space-y-2">
                      {purchase.product?.filesUrl && purchase.product.filesUrl.length > 0 ? (
                        purchase.product.filesUrl.map((fileUrl, index) => (
                          <a
                            key={index}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                          >
                            📥 Baixar Arquivo {purchase.product.filesUrl.length > 1 ? index + 1 : ''}
                          </a>
                        ))
                      ) : (
                        <Link
                          to={`/product/${purchase.product?.id}`}
                          className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                          🔓 Acessar Produto
                        </Link>
                      )}
                    </div>
                  )}

                  {purchase.status === 'PENDING' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      ⏳ Aguardando confirmação do pagamento
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
