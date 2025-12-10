// 🎓 EDUPLAY - PLATAFORMA MARKETPLACE PROFISSIONAL
// Versão completa tipo Eduzz/Hotmart

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CallbackGoogle from './components/auth/CallbackGoogle';
import ProtectedRoute from './components/ProtectedRoute';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailure from './pages/OrderFailure';
import OrderPending from './pages/OrderPending';
import Checkout from './pages/Checkout';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import ProductForm from './pages/ProductForm';
import AdminDashboard from './pages/AdminDashboard';
import AdminCommissions from './pages/AdminCommissions';
import Gamification from './pages/Gamification';
import GamificationAdmin from './pages/admin/GamificationAdmin';
import UpgradeToProducer from './pages/UpgradeToProducer';
import { AchievementQueueManager } from './components/AchievementNotification';
import { API_URL } from './config/api.config';


// ============================================
// COMPONENTES GLOBAIS
// ============================================

// Navbar Profissional
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();

  // Lê do localStorage direto
  const userData = localStorage.getItem('userData');
  const user = userData ? JSON.parse(userData) : null;
  const isAuthenticated = !!localStorage.getItem('token') && !!userData;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl">🎓</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              EDUPLAY
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-gray-700 hover:text-purple-600 font-semibold transition">
              Marketplace
            </Link>

            {user && (
              <>
                <Link to="/gamification" className="text-gray-700 hover:text-purple-600 font-semibold transition flex items-center space-x-1">
                  <span className="text-xl">🏆</span>
                  <span>Gamificação</span>
                </Link>

                <Link to="/cart" className="relative text-gray-700 hover:text-purple-600 transition">
                  <span className="text-2xl">🛒</span>
                  {cart.count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.count}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user ? (
              <>
                {(user.role === 'PRODUCER' || user.role === 'ADMIN') && (
                  <Link to="/seller/dashboard" className="text-gray-700 hover:text-purple-600 font-semibold transition">
                    Vender
                  </Link>
                )}

                {user.role === 'BUYER' && (
                  <Link to="/upgrade-to-producer" className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                    Tornar-se Vendedor
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-purple-600 font-semibold transition">
                    Admin
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-semibold transition"
                  >
                    <span>{user.name.split(' ')[0]}</span>
                    <span className="text-xs">▼</span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                      <Link to="/my-courses" className="block px-4 py-2 hover:bg-gray-100">
                        Meus Cursos
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                        Pedidos
                      </Link>
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                        Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-purple-600 font-semibold transition">
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Footer Profissional
const Footer = () => (
  <footer className="bg-gray-900 text-white py-12 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">🎓 EDUPLAY</h3>
          <p className="text-gray-400">A maior plataforma de produtos digitais do Brasil</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Plataforma</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/marketplace" className="hover:text-white">Marketplace</Link></li>
            <li><Link to="/about" className="hover:text-white">Sobre</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Suporte</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
            <li><a href="#" className="hover:text-white">Contato</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
            <li><a href="#" className="hover:text-white">Privacidade</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>© 2025 EDUPLAY. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

// Product Card
const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-6xl">
        📚
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-purple-600">
            R$ {product.price.toFixed(2)}
          </span>
          <span className="text-yellow-500">★ 4.8</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PÁGINAS
// ============================================

// HOME com Hero
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products?limit=6`);
      console.log('API Response:', response.data);
      const productsData = response.data.data?.items || response.data.items || [];
      console.log('Products:', productsData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            A Maior Plataforma de<br />Produtos Digitais do Brasil
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Compre e venda cursos, ebooks, mentorias e muito mais
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/marketplace"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition"
            >
              Explorar Produtos
            </Link>
            <Link
              to="/seller/products/new"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-purple-600 transition"
            >
              Começar a Vender
            </Link>
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold">Produtos em Destaque</h2>
          <Link to="/marketplace" className="text-purple-600 font-semibold hover:underline">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Comece a Vender Seus Produtos Hoje
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a milhares de produtores que já faturam na EDUPLAY
          </p>
          <Link
            to="/seller/products/new"
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition inline-block"
          >
            Começar a Vender
          </Link>
        </div>
      </section>
    </div>
  );
};

// MARKETPLACE
const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products?search=${search}`);
      const productsData = response.data.data?.items || response.data.items || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Marketplace</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
          />
          <button type="submit" className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700">
            Buscar
          </button>
        </div>
      </form>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
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
};

// PRODUCT DETAILS
const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const success = await addToCart(id);
    setAddingToCart(false);
    if (success) {
      alert('✅ Produto adicionado ao carrinho!');
    }
  };

  const handleBuyNow = async () => {
    setAddingToCart(true);
    const success = await addToCart(id);
    setAddingToCart(false);
    if (success) {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="h-96 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white text-9xl">
          📚
        </div>

        {/* Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{product.description}</p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              R$ {product.price.toFixed(2)}
            </div>
            <p className="text-gray-600">Pagamento único</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleBuyNow}
              disabled={addingToCart}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition disabled:opacity-50"
            >
              {addingToCart ? 'Adicionando...' : 'Comprar Agora'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full border-2 border-purple-600 text-purple-600 py-4 rounded-lg font-bold text-lg hover:bg-purple-50 transition disabled:opacity-50"
            >
              {addingToCart ? 'Adicionando...' : '🛒 Adicionar ao Carrinho'}
            </button>
          </div>

          <div className="mt-8 border-t pt-8">
            <h3 className="font-bold text-lg mb-4">O que você vai aprender:</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Acesso vitalício ao conteúdo</li>
              <li>✓ Certificado de conclusão</li>
              <li>✓ Suporte direto com o autor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// LOGIN
const Login = () => {
  const [email, setEmail] = useState('teste@exemplo.com');
  const [password, setPassword] = useState('Senha123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Salva no localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(user));

        alert('Login realizado com sucesso!');

        // Reload completo da página
        window.location.href = '/';
      }
    } catch (err) {
      console.error('❌ ERRO LOGIN:', err);
      console.error('📦 Response:', err.response);
      console.error('📝 Data:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Erro desconhecido';
      const status = err.response?.status || 'sem conexão';
      setError(`${errorMsg} (Status: ${status})`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetMessage('');

    try {
      // Simulação de envio de email de recuperação
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetMessage('✅ Email de recuperação enviado! Verifique sua caixa de entrada.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage('');
      }, 3000);
    } catch (err) {
      setResetMessage('❌ Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold mb-4">Recuperar Senha</h1>
          <p className="text-gray-600 mb-6">Digite seu email para receber as instruções de recuperação:</p>
          {resetMessage && (
            <div className={`${resetMessage.includes('✅') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded mb-4`}>
              {resetMessage}
            </div>
          )}
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold">Email:</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                placeholder="seu@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>
          <button
            onClick={() => setShowForgotPassword(false)}
            className="text-purple-600 hover:underline mt-4 inline-block"
          >
            ← Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Login</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Senha:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-purple-600 hover:underline text-sm"
            >
              Esqueci minha senha
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou continue com</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-purple-600 font-semibold hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-semibold mb-1">Credenciais de teste:</p>
          <p><strong>Vendedor:</strong> teste@exemplo.com / Senha123</p>
          <p><strong>Admin:</strong> admin@eduplay.com.br / admin123</p>
        </div>

        <Link to="/" className="text-purple-600 hover:underline mt-4 inline-block">← Voltar para Home</Link>
      </div>
    </div>
  );
};

// REGISTER
const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', cpf: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Salva no localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(user));

        alert('Conta criada com sucesso!');

        // Reload completo da página
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Criar Conta</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <button
          onClick={handleGoogleSignup}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Cadastrar com Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou cadastre-se com email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Nome Completo:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              placeholder="João Silva"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">CPF:</label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => setFormData({...formData, cpf: e.target.value})}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Senha:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres com maiúscula, minúscula e número</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-purple-600 font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </div>

        <Link to="/" className="text-purple-600 hover:underline mt-4 inline-block">← Voltar para Home</Link>
      </div>
    </div>
  );
};

// Cart Page
const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-6xl">🛒</span>
          <h2 className="text-2xl font-bold mt-4 text-gray-800">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mt-2">Adicione produtos para começar!</p>
          <Link
            to="/marketplace"
            className="mt-6 inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Meu Carrinho</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de itens */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6 flex gap-6">
                <img
                  src={item.product.thumbnailUrl || 'https://via.placeholder.com/150'}
                  alt={item.product.title}
                  className="w-32 h-32 object-cover rounded"
                />

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{item.product.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.product.category}</p>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    R$ {item.price.toFixed(2)} cada
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo do pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'itens'})</span>
                  <span className="font-semibold">R$ {cart.total.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-purple-600">R$ {cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition mb-3"
              >
                Finalizar Compra
              </button>

              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                    clearCart();
                  }
                }}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder pages
const MyCourses = () => <div className="p-8"><h1 className="text-3xl font-bold">Meus Cursos - Em breve</h1></div>;
const Orders = () => <div className="p-8"><h1 className="text-3xl font-bold">Meus Pedidos - Em breve</h1></div>;
const Profile = () => <div className="p-8"><h1 className="text-3xl font-bold">Perfil - Em breve</h1></div>;

// ============================================
// APP PRINCIPAL
// ============================================

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AchievementQueueManager />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<CallbackGoogle />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id/success" element={<OrderSuccess />} />
        <Route path="/order/:id/failure" element={<OrderFailure />} />
        <Route path="/order/:id/pending" element={<OrderPending />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/seller/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/products" element={<ProtectedRoute><SellerProducts /></ProtectedRoute>} />
        <Route path="/seller/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
        <Route path="/seller/products/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/commissions" element={<ProtectedRoute><AdminCommissions /></ProtectedRoute>} />
        <Route path="/admin/gamification" element={<ProtectedRoute><GamificationAdmin /></ProtectedRoute>} />
        <Route path="/gamification" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
        <Route path="/upgrade-to-producer" element={<ProtectedRoute><UpgradeToProducer /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
