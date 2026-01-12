import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiTag, FiClock, FiUsers, FiStar, FiPackage, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedCombos, setRelatedCombos] = useState([]);
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchRelatedCombos = async (productId) => {
      try {
        // Get all active combos
        const response = await api.get('/combos');

        if (response.data.success) {
          // Filter combos that include this product
          const combosWithThisProduct = response.data.data.filter(combo =>
            combo.productDetails?.some(p => p.id === productId)
          );

          console.log('Related combos for product:', productId, combosWithThisProduct);
          setRelatedCombos(combosWithThisProduct);
        }
      } catch (error) {
        console.error('Error fetching related combos:', error);
        setRelatedCombos([]);
      }
    };

    const fetchProduct = async () => {
      if (!slug) {
        console.warn('Slug is undefined, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching product with slug:', slug);
        // Increment views on product fetch
        const response = await api.get(`/products/slug/${slug}?incrementViews=true`);
        setProduct(response.data.data);

        // Fetch combos that include this product
        await fetchRelatedCombos(response.data.data.id);

        // Check if user has purchased this product
        if (user) {
          checkIfPurchased(response.data.data.id);
        } else {
          setCheckingPurchase(false);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Produto não encontrado');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  const checkIfPurchased = async (productId) => {
    try {
      setCheckingPurchase(true);
      const response = await api.get('/orders/purchases');

      if (response.data.success) {
        const purchases = response.data.data;
        const purchased = purchases.some(
          purchase =>
            purchase.product?.id === productId &&
            (purchase.status === 'APPROVED' || purchase.status === 'COMPLETED')
        );
        setHasPurchased(purchased);
      }
    } catch (error) {
      console.error('Error checking purchase:', error);
    } finally {
      setCheckingPurchase(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Você precisa estar logado para adicionar ao carrinho');
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', {
        productId: product.id,
        quantity: 1
      });

      // Refresh cart data
      await fetchCart();

      alert('Produto adicionado ao carrinho!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        alert('Sua sessão expirou. Faça login novamente.');
        navigate('/login');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('já está no carrinho')) {
        alert('Produto já está no carrinho!');
        navigate('/cart');
      } else {
        alert('Erro ao adicionar produto ao carrinho');
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button onClick={() => navigate('/marketplace')} className="hover:text-purple-600">
          Marketplace
        </button>
        <span>/</span>
        <span className="text-gray-900">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Left Column - Image */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
            {product.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <FiPackage size={64} />
              </div>
            )}
          </div>

          {/* Video Preview */}
          {product.videoUrl && (
            <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden aspect-video">
              <video controls className="w-full h-full">
                <source src={product.videoUrl} type="video/mp4" />
              </video>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

          {/* Producer */}
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <FiUsers size={18} />
            <span>Por {product.producer?.name || 'Produtor'}</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              R$ {product.price.toFixed(2)}
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FiTag size={18} />
              <span className="text-sm">{product.category}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiClock size={18} />
              <span className="text-sm">{product.duration || 'Duração variável'}</span>
            </div>
          </div>

          {/* Purchase Status / Action Button */}
          {hasPurchased ? (
            <div className="mb-4">
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                  <span className="text-2xl">✓</span>
                  <span>Você já possui este produto!</span>
                </div>
                <p className="text-green-600 text-sm">Acesse os arquivos abaixo</p>
              </div>

              {product.filesUrl && product.filesUrl.length > 0 ? (
                <div className="space-y-2">
                  {product.filesUrl.map((fileUrl, index) => (
                    <a
                      key={index}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      📥 Baixar Arquivo {product.filesUrl.length > 1 ? `${index + 1}` : ''}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-center">
                  <p className="text-yellow-800">Este produto ainda não tem arquivos disponíveis para download.</p>
                  <p className="text-yellow-600 text-sm mt-1">Entre em contato com o produtor para mais informações.</p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={checkingPurchase}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition text-lg font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart size={24} />
              {checkingPurchase ? 'Verificando...' : 'Adicionar ao Carrinho'}
            </button>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">O que você vai receber:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Combos Section */}
      {relatedCombos.length > 0 && (
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 border border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <FiPackage size={32} className="text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">💰 Economize Comprando em Combo!</h2>
                <p className="text-gray-600">Este produto faz parte de ofertas especiais</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {relatedCombos.map((combo) => (
                <div key={combo.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{combo.title}</h3>
                        <p className="text-gray-600 text-sm">{combo.description}</p>
                      </div>
                      <div className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">
                        {combo.discountPercentage}% OFF
                      </div>
                    </div>

                    {/* Products in Combo */}
                    <div className="mb-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        {combo.productDetails?.length} Produtos inclusos:
                      </p>
                      {combo.productDetails?.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                          <span className="flex-1 text-gray-700">{p.title}</span>
                          <span className="text-gray-500">R$ {p.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Preço individual:</span>
                        <span className="text-gray-500 line-through">
                          R$ {combo.totalRegularPrice?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Preço do combo:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          R$ {combo.discountPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right text-green-600 font-semibold mt-1">
                        Economize R$ {combo.savings?.toFixed(2)}!
                      </div>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handleBuyCombo(combo)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold"
                    >
                      Adicionar Combo ao Carrinho
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre este produto</h2>
        <div className="prose max-w-none text-gray-700">
          {product.description}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {product.targetAudience && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Público-alvo</h3>
            <p className="text-gray-700">{product.targetAudience}</p>
          </div>
        )}

        {product.requirements && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Requisitos</h3>
            <p className="text-gray-700">{product.requirements}</p>
          </div>
        )}
      </div>
    </div>
  );
}
