import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';
import { useAuth } from '../hooks/useAuth';
import { orderAPI } from '../services/api';

export default function GuestCheckout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/${productId}`);
      setProduct(res.data.product || res.data.data);
    } catch {
      setError('Produto não encontrado.');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logged-in user: use the authenticated order endpoint directly
  const handleAuthenticatedPurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderAPI.create({ productId, paymentType: 'pix' });
      const paymentUrl = response.data.data?.paymentUrl || response.data.paymentUrl || response.data.initPoint || response.data.data?.initPoint;
      window.location.href = paymentUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar pedido. Tente novamente.');
      setLoading(false);
    }
  };

  // Guest user: create account + order in one step
  const handleGuestPurchase = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Preencha nome e e-mail para continuar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/orders/guest`, {
        productId,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        paymentType: 'pix',
      });

      const { paymentUrl, accessToken, refreshToken } = res.data.data;

      // Auto-login with the returned tokens
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }

      window.location.href = paymentUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/marketplace" className="text-purple-600 hover:underline">Voltar ao Marketplace</Link>
        </div>
      </div>
    );
  }

  const price = product?.price ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Product summary */}
          {product?.thumbnailUrl && (
            <img src={product.thumbnailUrl} alt={product.title} className="w-full h-48 object-cover" />
          )}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">{product?.title}</h2>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {price === 0 ? 'Grátis' : `R$ ${price.toFixed(2).replace('.', ',')}`}
            </p>
          </div>

          <div className="p-6">
            {isAuthenticated ? (
              // Logged-in flow: just confirm and pay
              <div className="space-y-4">
                <p className="text-gray-600">
                  Comprando como <strong>{user?.name}</strong> ({user?.email})
                </p>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  onClick={handleAuthenticatedPurchase}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Pagar Agora'}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Não é você?{' '}
                  <button
                    onClick={() => { localStorage.clear(); window.location.reload(); }}
                    className="text-purple-600 hover:underline"
                  >
                    Sair
                  </button>
                </p>
              </div>
            ) : (
              // Guest flow: name + email form
              <form onSubmit={handleGuestPurchase} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Seus dados para acesso</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Usaremos seu e-mail para criar sua conta e enviar o acesso ao produto.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Continuar para Pagamento'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Já tem conta?{' '}
                  <Link to={`/login?redirect=/checkout/${productId}`} className="text-purple-600 hover:underline">
                    Entrar
                  </Link>
                </p>

                <p className="text-xs text-gray-400 text-center">
                  Ao continuar, uma conta será criada automaticamente com seu e-mail e
                  você receberá as credenciais de acesso por e-mail.
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center mt-4">
          <Link to={`/product/${productId}`} className="text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar ao produto
          </Link>
        </p>
      </div>
    </div>
  );
}
