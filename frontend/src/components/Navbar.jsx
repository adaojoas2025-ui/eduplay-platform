import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiDollarSign } from 'react-icons/fi';
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
      {/* Mobile: Horizontal scroll navbar - v2.0 */}
      <div className="md:hidden overflow-x-auto scrollbar-hide" data-version="2.0">
        <div className="flex items-center gap-3 px-2 h-12 min-w-max">
          <Link to="/" className="flex items-center space-x-1 flex-shrink-0">
            <div className="text-xl">🎓</div>
            <span className="text-base font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent whitespace-nowrap">
              EducaplayJA
            </span>
          </Link>

          <div className="h-6 w-px bg-gray-300"></div>

          {!authenticated ? (
            <>
              <Link to="/marketplace" className="text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap flex items-center gap-1">
                📦 Marketplace
              </Link>
              <Link to="/admin/apps" className="text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap flex items-center gap-1">
                📱 Apps
              </Link>
              <Link to="/login" className="text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap border border-gray-300 rounded-lg">
                Entrar
              </Link>
              <Link to="/register" className="text-xs font-bold bg-primary-500 text-white px-4 py-1.5 rounded-lg hover:bg-primary-600 whitespace-nowrap">
                Criar Conta
              </Link>
            </>
          ) : (
            <>
              <Link to="/marketplace" className="text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap">
                📦 Marketplace
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin/apps" className="text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap">
                  📱 Apps
                </Link>
              )}
              <Link to="/my-courses" className="text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap">
                📚 Cursos
              </Link>
              <Link to="/checkout" className="relative px-3 py-1.5">
                <FiShoppingCart className="text-lg text-gray-700" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 whitespace-nowrap border border-red-300 rounded-lg"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </div>

      {/* Desktop: Layout normal */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-3xl">🎓</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                EDUPLAY
              </span>
            </Link>

            <div className="flex items-center space-x-8">
              <Link to="/marketplace" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                Marketplace
              </Link>

              {authenticated ? (
                <>
                  <Link to="/seller/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 font-medium transition-colors">
                    <FiDollarSign className="text-lg" />
                    <span>Financeiro</span>
                  </Link>

                  {user?.role === 'BUYER' && (
                    <Link to="/upgrade-to-producer" className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                      Tornar-se Vendedor
                    </Link>
                  )}

                  {user?.role === 'ADMIN' && (
                    <>
                      <Link to="/admin/dashboard" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                        Admin
                      </Link>
                      <Link to="/admin/apps" className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 font-medium transition-colors">
                        <span>📱</span>
                        <span>Apps</span>
                      </Link>
                    </>
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

                  <div className="flex items-center space-x-3">
                    <Link
                      to="/seller/dashboard"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors"
                    >
                      <FiUser className="text-xl" />
                      <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="text-gray-700 hover:text-primary-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                          <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                            Meu Perfil
                          </Link>
                          <Link to="/my-products" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                            Meus Produtos
                          </Link>
                          <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                            Pedidos
                          </Link>
                          <Link to="/seller/dashboard" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                            <FiDollarSign />
                            <span>Financeiro</span>
                          </Link>
                          <hr className="my-2" />
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center space-x-2">
                            <FiLogOut />
                            <span>Sair</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-500 font-medium">Entrar</Link>
                  <Link to="/register" className="btn-primary">Criar Conta</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
