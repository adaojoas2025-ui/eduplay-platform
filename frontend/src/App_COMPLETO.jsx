// 🎓 EDUPLAY - PLATAFORMA MARKETPLACE PROFISSIONAL
// Versão completa tipo Eduzz/Hotmart

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

// ============================================
// COMPONENTES GLOBAIS
// ============================================

// Navbar Profissional
const Navbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
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

            {user ? (
              <>
                {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                  <Link to="/seller/dashboard" className="text-gray-700 hover:text-purple-600 font-semibold transition">
                    Vender
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
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
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
              to="/register"
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
            to="/register"
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition inline-block"
          >
            Criar Conta Grátis
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
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
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
  const navigate = useNavigate();

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

  const handleBuy = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    alert('Função de compra em desenvolvimento!');
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

          <button
            onClick={handleBuy}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition"
          >
            Comprar Agora
          </button>

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

// LOGIN (mantém o atual)
const Login = () => {
  const [email, setEmail] = useState('teste@exemplo.com');
  const [password, setPassword] = useState('Senha123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', accessToken);
        alert('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Senha:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white p-3 rounded font-bold hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-4 text-sm">
          <p className="text-gray-600 mb-2">Credenciais de teste:</p>
          <p><strong>Usuário:</strong> teste@exemplo.com / Senha123</p>
          <p><strong>Admin:</strong> admin@eduplay.com.br / admin123</p>
        </div>
        <Link to="/" className="text-blue-500 underline mt-4 inline-block">Voltar</Link>
      </div>
    </div>
  );
};

// REGISTER (mantém o atual mas simplificado)
const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', cpf: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', accessToken);
        alert('Conta criada com sucesso!');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Criar Conta</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Nome:</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Email:</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Senha:</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-2 border rounded" required />
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres com maiúscula, minúscula e número</p>
          </div>
          <div>
            <label className="block mb-2 font-semibold">CPF:</label>
            <input type="text" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} className="w-full p-2 border rounded" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
        <Link to="/" className="text-blue-500 underline mt-4 inline-block">Voltar</Link>
      </div>
    </div>
  );
};

// Placeholder pages
const MyCourses = () => <div className="p-8"><h1 className="text-3xl font-bold">Meus Cursos - Em breve</h1></div>;
const Orders = () => <div className="p-8"><h1 className="text-3xl font-bold">Meus Pedidos - Em breve</h1></div>;
const Profile = () => <div className="p-8"><h1 className="text-3xl font-bold">Perfil - Em breve</h1></div>;
const SellerDashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Dashboard Vendedor - Em breve</h1></div>;
const AdminDashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Admin Dashboard - Em breve</h1></div>;

// ============================================
// APP PRINCIPAL
// ============================================

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
