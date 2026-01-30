import { Link, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ProductCard({ product }) {
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Previne a propagação do evento para o Link

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado para adicionar ao carrinho');
        navigate('/login');
        return;
      }

      await api.post('/cart', {
        productId: product.id,
        quantity: 1
      });

      // Refresh cart data
      await fetchCart();

      toast.success('Produto adicionado ao carrinho!');

      // Navigate to cart page
      setTimeout(() => navigate('/cart'), 500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Sua sessão expirou. Faça login novamente.');
        navigate('/login');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('já está no carrinho')) {
        toast.info('Produto já está no carrinho');
      } else {
        toast.error('Erro ao adicionar produto ao carrinho');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Se o produto não tem slug, não renderizar o link
  if (!product || !product.slug) {
    console.warn('Product missing slug:', product);
    return null;
  }

  return (
    <Link to={`/product/${product.slug}`} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 group overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden h-32 bg-gray-200">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            📚
          </div>
        )}
        {product.status === 'INACTIVE' && (
          <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
            Indisponível
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-bold mb-1 line-clamp-2 group-hover:text-primary-500 transition-colors">
          {product.title}
        </h3>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-2">
        <FiStar className="text-yellow-400 fill-current text-xs" />
        <span className="text-xs font-semibold">4.8</span>
        <span className="text-gray-500 text-xs">(234)</span>
      </div>

      {/* Price and Action */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-primary-500">
          {formatPrice(product.price)}
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <FiShoppingCart className="text-sm" />
        </button>
      </div>
      </div>
    </Link>
  );
}
