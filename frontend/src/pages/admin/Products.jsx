import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { FiCheck, FiX, FiExternalLink } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await adminAPI.getPendingProducts();
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await adminAPI.approveProduct(id);
      fetchProducts();
      alert('Produto aprovado com sucesso!');
    } catch (error) {
      alert('Erro ao aprovar produto');
    }
  }

  async function handleReject(id) {
    const reason = prompt('Motivo da rejeição (opcional):');

    try {
      await adminAPI.rejectProduct(id, reason);
      fetchProducts();
      alert('Produto rejeitado');
    } catch (error) {
      alert('Erro ao rejeitar produto');
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
      <h1 className="text-3xl font-bold mb-8">Produtos Pendentes de Aprovação</h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Thumbnail */}
                <div className="lg:w-48 h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">Sem imagem</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>

                  <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Preço:</span>
                      <span className="ml-2 text-lg font-bold text-primary">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Produtor:</span>
                      <span className="ml-2 font-medium">{product.producer.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Arquivos:</span>
                      <span className="ml-2 font-medium">{product.files.length}</span>
                    </div>
                  </div>

                  {product.files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">Arquivos inclusos:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.files.map((file) => (
                          <a
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center hover:bg-gray-200"
                          >
                            {file.name}
                            <FiExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(product.id)}
                      className="btn btn-success flex items-center"
                    >
                      <FiCheck className="h-5 w-5 mr-2" />
                      Aprovar Produto
                    </button>
                    <button
                      onClick={() => handleReject(product.id)}
                      className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                    >
                      <FiX className="h-5 w-5 mr-2" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">Nenhum produto pendente de aprovação</p>
        </div>
      )}
    </div>
  );
}
