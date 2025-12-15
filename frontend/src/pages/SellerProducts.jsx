import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

export default function SellerProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, draft

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/seller/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filter !== 'all' ? { status: filter.toUpperCase() } : {}
        }
      );
      setProducts(response.data.data.items || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Erro ao excluir produto');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

      await axios.patch(
        `${API_URL}/products/${productId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchProducts();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Meus Produtos</h1>
            <p className="text-gray-600 mt-1">Gerencie seus cursos e infoprodutos</p>
          </div>
          <Link
            to="/seller/products/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Novo Produto
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'published'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'draft'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rascunhos
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products List */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhum produto encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro produto para vender na plataforma
            </p>
            <Link
              to="/seller/products/new"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Criar Primeiro Produto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <img
                    src={product.thumbnailUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="16" dy="3.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESem Imagem%3C/text%3E%3C/svg%3E'}
                    alt={product.title}
                    className="w-48 h-36 object-cover rounded-lg"
                  />

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <span
                        className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${
                          product.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {product.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Preço</p>
                        <p className="text-lg font-bold text-gray-800">
                          R$ {product.price?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Vendas</p>
                        <p className="text-lg font-bold text-gray-800">
                          {product.sales || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Visualizações</p>
                        <p className="text-lg font-bold text-gray-800">
                          {product.views || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Categoria</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/seller/products/${product.id}/edit`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${
                          product.status === 'PUBLISHED'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {product.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                      </button>
                      <Link
                        to={`/product/${product.id}`}
                        target="_blank"
                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
                      >
                        Ver Página
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
