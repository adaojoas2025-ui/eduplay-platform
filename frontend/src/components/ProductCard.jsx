import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import useStore from '../store/useStore';
import { toast } from 'react-toastify';

export default function ProductCard({ product }) {
  const { addToCart } = useStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    const added = addToCart(product);
    if (added) {
      toast.success('Produto adicionado ao carrinho!');
    } else {
      toast.info('Produto já está no carrinho');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`} className="card hover:shadow-lg transition-all duration-200 group">
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-4 h-48 bg-gray-200">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
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
    </Link>
  );
}
