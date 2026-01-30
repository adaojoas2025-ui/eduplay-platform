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
    <Link to={`/product/${product.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 group overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-gray-200">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            📚
          </div>
        )}
        {product.status === 'INACTIVE' && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Indisponível
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
          {product.title}
        </h3>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {product.description}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        <FiStar className="text-yellow-400 fill-current" />
        <span className="font-semibold">4.8</span>
        <span className="text-gray-500 text-sm">(234 avaliações)</span>
      </div>

      {/* Price and Action */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-primary-500">
            {formatPrice(product.price)}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <FiShoppingCart className="text-xl" />
        </button>
      </div>
      </div>
    </Link>
  );
}
