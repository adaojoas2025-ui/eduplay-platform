import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiShoppingCart, FiFileText } from 'react-icons/fi';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setPurchasing(true);
      const response = await orderAPI.create({
        productId: id,
        payerInfo: {},
      });

      // Redirect to Mercado Pago checkout
      window.location.href = response.data.initPoint;
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao criar pedido');
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl h-96 flex items-center justify-center overflow-hidden">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <FiShoppingCart className="h-32 w-32 text-primary-300" />
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          {product.producer && (
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <FiUser className="h-5 w-5" />
              <span>Por {product.producer.name}</span>
            </div>
          )}

          <div className="text-4xl font-bold text-primary mb-6">
            R$ {product.price.toFixed(2)}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Descrição</h3>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {product.files && product.files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FiFileText className="h-5 w-5 mr-2" />
                Arquivos inclusos ({product.files.length})
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {product.files.map((file) => (
                  <li key={file.id}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="btn btn-primary w-full text-lg py-3 disabled:opacity-50"
          >
            {purchasing ? 'Processando...' : 'Comprar Agora'}
          </button>

          {!isAuthenticated && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Você precisa estar logado para comprar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
