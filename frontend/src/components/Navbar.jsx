import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { toast } from 'react-toastify';
import { getUser, isAuthenticated, clearAuth } from '../lib/auth';

export default function Navbar() {
  const { cart } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Estado local que FORÇA re-render quando auth muda
  const [authState, setAuthState] = useState({
    user: getUser(),
    authenticated: isAuthenticated()
  });

  // Re-verifica auth a cada 500ms para detectar mudanças
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUser = getUser();
      const currentAuth = isAuthenticated();

      // Se mudou, atualiza o estado (isso força re-render)
      if (JSON.stringify(currentUser) !== JSON.stringify(authState.user) ||
          currentAuth !== authState.authenticated) {
        setAuthState({
          user: currentUser,
          authenticated: currentAuth
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [authState]);

  const handleLogout = () => {
    clearAuth();
    toast.success('Logout realizado com sucesso!');
    window.location.href = '/';
  };

  const { user, authenticated } = authState;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-3xl">🎓</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              EDUPLAY
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
              Marketplace
            </Link>

            {authenticated ? (
              <>
                {(user?.role === 'PRODUCER' || user?.role === 'ADMIN') && (
                  <Link to="/seller/dashboard" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                    Área do Vendedor
                  </Link>
                )}

                {user?.role === 'BUYER' && (
                  <Link to="/upgrade-to-producer" className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                    Tornar-se Vendedor
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                    Admin
                  </Link>
                )}

                <Link to="/my-courses" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                  Meus Cursos
                </Link>

                <Link to="/my-products" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                  Meus Produtos
                </Link>

                <Link to="/checkout" className="relative">
                  <FiShoppingCart className="text-2xl text-gray-700 hover:text-primary-500 transition-colors" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors"
                  >
                    <FiUser className="text-xl" />
                    <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                      <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                        Meu Perfil
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                        Meus Pedidos
                      </Link>
                      <Link to="/my-products" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                        Meus Produtos
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center space-x-2">
                        <FiLogOut />
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-500 font-medium">Entrar</Link>
                <Link to="/register" className="btn-primary">Criar Conta</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl text-gray-700">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link to="/marketplace" className="block text-gray-700 hover:text-primary-500 font-medium" onClick={() => setMenuOpen(false)}>
              Marketplace
            </Link>
            {authenticated ? (
              <>
                <Link to="/my-courses" className="block text-gray-700 hover:text-primary-500 font-medium" onClick={() => setMenuOpen(false)}>
                  Meus Cursos
                </Link>
                <Link to="/my-products" className="block text-gray-700 hover:text-primary-500 font-medium" onClick={() => setMenuOpen(false)}>
                  Meus Produtos
                </Link>
                <Link to="/profile" className="block text-gray-700 hover:text-primary-500 font-medium" onClick={() => setMenuOpen(false)}>
                  Meu Perfil
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left text-red-600 font-medium">
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-primary-500 font-medium" onClick={() => setMenuOpen(false)}>
                  Entrar
                </Link>
                <Link to="/register" className="block btn-primary text-center" onClick={() => setMenuOpen(false)}>
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
