import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await productAPI.getMyProducts();
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await productAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert('Erro ao deletar produto');
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Produtos</h1>
        <Link to="/producer/products/add" className="btn btn-primary flex items-center">
          <FiPlus className="h-5 w-5 mr-2" />
          Novo Produto
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.status === 'APPROVED' ? 'bg-success-100 text-success-800' :
                    product.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    product.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                  <span className="text-sm text-gray-600">{product._count?.orders || 0} vendas</span>
                  <span className="text-sm text-gray-600">{product.files?.length || 0} arquivos</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/producer/products/edit/${product.id}`} className="btn btn-outline flex items-center">
                  <FiEdit className="h-4 w-4 mr-1" />
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                >
                  <FiTrash2 className="h-4 w-4 mr-1" />
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">Você ainda não tem produtos</p>
          <Link to="/producer/products/add" className="btn btn-primary inline-flex items-center">
            <FiPlus className="h-5 w-5 mr-2" />
            Criar Primeiro Produto
          </Link>
        </div>
      )}
    </div>
  );
}
