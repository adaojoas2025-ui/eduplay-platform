import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiDollarSign, FiStar, FiPackage, FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [user, setUser] = useState(null);

  // Banners promocionais - você pode configurar estes banners no futuro via admin
  const banners = [
    {
      id: 1,
      title: 'Apps & Jogos Educativos',
      subtitle: 'Baixe grátis ou sem propaganda',
      description: 'Descubra centenas de apps educativos de qualidade',
      buttonText: 'Explorar Apps',
      buttonLink: '/apps',
      bgGradient: 'from-blue-600 to-purple-600',
      image: '🎮',
    },
    {
      id: 2,
      title: 'Produtos Digitais Premium',
      subtitle: 'Cursos, ebooks e mentorias',
      description: 'Conteúdo de alta qualidade para seu desenvolvimento',
      buttonText: 'Ver Produtos',
      buttonLink: '/marketplace',
      bgGradient: 'from-green-600 to-teal-600',
      image: '📚',
    },
    {
      id: 3,
      title: 'Comece a Vender Hoje',
      subtitle: 'Transforme seu conhecimento em renda',
      description: 'Publique seus produtos e alcance milhares de alunos',
      buttonText: 'Vender Agora',
      buttonLink: '/seller/products/new',
      bgGradient: 'from-orange-600 to-red-600',
      image: '💰',
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchFeaturedProducts();
    fetchCombos();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    console.log('Banner carousel initialized with', banners.length, 'banners');
    if (isPaused || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?limit=6');
      setFeaturedProducts(response.data.data.items || []);
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

  const handleBuyCombo = async (combo) => {
    if (!user) {
      alert('Você precisa estar logado para comprar');
      navigate('/login');
      return;
    }

    try {
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
    <div>
      {/* Promotional Banner Carousel */}
      <section className="pt-4 pb-6 md:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-6">
            🎯 Destaques da Plataforma
          </h2>
          <div
            className="relative overflow-hidden rounded-2xl shadow-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Banners Container */}
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
            >
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`min-w-full bg-gradient-to-r ${banner.bgGradient} text-white`}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-8 md:py-16">
                    {/* Content */}
                    <div className="flex-1 text-center md:text-left mb-6 md:mb-0">
                      <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-semibold mb-2 md:mb-4">
                        {banner.subtitle}
                      </div>
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
                        {banner.title}
                      </h2>
                      <p className="text-sm md:text-lg lg:text-xl text-white/90 mb-4 md:mb-6 max-w-2xl">
                        {banner.description}
                      </p>
                      <Link
                        to={banner.buttonLink}
                        className="inline-block bg-white text-gray-900 px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-base md:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      >
                        {banner.buttonText} →
                      </Link>
                    </div>

                    {/* Image/Icon */}
                    <div className="flex-shrink-0 mt-4 md:mt-0">
                      <div className="text-6xl md:text-8xl lg:text-9xl animate-bounce-slow">
                        {banner.image}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
              aria-label="Banner anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
              aria-label="Próximo banner"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentBannerIndex
                      ? 'w-8 h-3 bg-white'
                      : 'w-3 h-3 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para banner ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              A Maior Plataforma de<br />Produtos Digitais do Brasil
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Compre e venda cursos, ebooks, mentorias e muito mais
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marketplace" className="bg-white text-primary-500 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-200">
                Explorar Produtos
              </Link>
              <Link to="/seller/products/new" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-500 transition-all duration-200">
                Começar a Vender
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-4xl text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Encontre o Produto</h3>
              <p className="text-gray-600">
                Navegue por milhares de produtos digitais de qualidade
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="text-4xl text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compre com Segurança</h3>
              <p className="text-gray-600">
                Pagamento seguro via Mercado Pago com garantia de 7 dias
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="text-4xl text-primary-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Acesso Imediato</h3>
              <p className="text-gray-600">
                Receba acesso instantâneo após aprovação do pagamento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Combos Section */}
      {combos.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <FiPackage size={32} className="text-purple-600" />
              <h2 className="text-3xl font-bold">🔥 Combos em Promoção</h2>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {combos.slice(0, 4).map((combo) => (
                <div key={combo.id} className="flex-shrink-0 w-[380px] snap-start">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition border border-purple-200 h-full">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{combo.title}</h3>
                        <div className="bg-green-500 text-white font-bold px-3 py-1 rounded-full text-sm flex-shrink-0">
                          {combo.discountPercentage}% OFF
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{combo.description}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <FiPackage size={16} />
                        <span>{combo.productDetails?.length} produtos inclusos</span>
                      </div>

                      <div className="border-t border-purple-200 pt-4 mb-4">
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

                      <button
                        onClick={() => handleBuyCombo(combo)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold"
                      >
                        Adicionar ao Carrinho
                        <FiArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Link to="/marketplace" className="text-purple-600 font-semibold hover:underline">
                Ver todos os combos →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold">Produtos em Destaque</h2>
            <Link to="/marketplace" className="text-primary-500 font-semibold hover:underline">
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {Array.isArray(featuredProducts) && featuredProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[320px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Comece a Vender Seus Produtos Hoje
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Junte-se a milhares de produtores que já faturam na EDUPLAY
          </p>
          <Link to="/seller/products/new" className="bg-white text-primary-500 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-200 inline-block">
            Começar a Vender
          </Link>
        </div>
      </section>
    </div>
  );
}
