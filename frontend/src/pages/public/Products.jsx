import { useEffect, useState } from 'react';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { Search } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await productAPI.getAll({ page, limit: 12, search });
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Produtos Disponíveis</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </form>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-outline disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="flex items-center px-4">
                Página {page} de {pagination.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="btn btn-outline disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
