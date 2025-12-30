import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiPackage, FiTag, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

export default function Marketplace() {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProducts();
    fetchCombos();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=50');
      setProducts(response.data.data.items || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCombos = async () => {
    try {
      const response = await api.get('/combos');
      if (response.data.success) {
        setCombos(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching combos:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      // Se busca estiver vazia, apenas recarrega todos os produtos
      fetchProducts();
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/products?search=${search}`);
      setProducts(response.data.data.items || []);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCombo = async (combo) => {
    if (!user) {
      alert('Você precisa estar logado para comprar');
      navigate('/login');
      return;
    }

    try {
      // Add all combo products to cart via API
      for (const product of combo.productDetails) {
        await api.post('/cart', {
          productId: product.id,
          quantity: 1
        });
      }

      // Refresh cart data
      await fetchCart();

      alert(`Combo "${combo.title}" adicionado ao carrinho!`);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding combo to cart:', error);
      if (error.response?.status === 401) {
        alert('Sua sessão expirou. Faça login novamente.');
        navigate('/login');
      } else {
        alert('Erro ao adicionar combo ao carrinho');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Marketplace</h1>
        <p className="text-gray-600">Explore milhares de produtos digitais</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </div>
      </form>

      {/* Combos Section */}
      {combos.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FiPackage size={28} className="text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">🔥 Combos em Promoção</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {combos.slice(0, 6).map((combo) => (
              <div key={combo.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition border border-purple-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{combo.title}</h3>
                    <div className="bg-green-500 text-white font-bold px-2 py-1 rounded-full text-xs">
                      {combo.discountPercentage}% OFF
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{combo.description}</p>

                  {/* Products Count */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <FiPackage size={16} />
                    <span>{combo.productDetails?.length} produtos inclusos</span>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-purple-200 pt-3 mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">De:</span>
                      <span className="text-sm text-gray-500 line-through">
                        R$ {combo.totalRegularPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Por apenas:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        R$ {combo.discountPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right text-green-600 font-semibold text-sm mt-1">
                      Economize R$ {combo.savings?.toFixed(2)}
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleBuyCombo(combo)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold"
                  >
                    Adicionar ao Carrinho
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Todos os Produtos</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
