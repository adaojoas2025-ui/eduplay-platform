import { useEffect, useState } from 'react';
import { orderAPI } from '../../services/api';
import { Download, Calendar } from 'lucide-react';

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  async function fetchPurchases() {
    try {
      const response = await orderAPI.getMyPurchases();
      setPurchases(response.data.purchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
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
      <h1 className="text-3xl font-bold mb-8">Minhas Compras</h1>

      {purchases.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="card">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{purchase.product.title}</h3>
                  <p className="text-gray-600 mb-4">{purchase.product.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <span className="font-semibold text-primary">
                      R$ {purchase.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Downloads */}
                <div className="lg:w-80">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Downloads Disponíveis
                  </h4>

                  {purchase.product.files && purchase.product.files.length > 0 ? (
                    <div className="space-y-2">
                      {purchase.product.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-gray-50 hover:bg-primary hover:text-white rounded-lg transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{file.name}</span>
                            <Download className="h-4 w-4 flex-shrink-0 ml-2" />
                          </div>
                          <span className="text-xs opacity-75">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Nenhum arquivo disponível</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">Você ainda não fez nenhuma compra</p>
          <a href="/products" className="btn btn-primary inline-block">
            Explorar Produtos
          </a>
        </div>
      )}
    </div>
  );
}
