import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiDollarSign, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { toast } from 'react-toastify';
import { getUser, isAuthenticated, clearAuth } from '../lib/auth';

export default function Navbar() {
  const { cart } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [authState, setAuthState] = useState({
    user: getUser(),
    authenticated: isAuthenticated()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const currentUser = getUser();
      const currentAuth = isAuthenticated();

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
      {/* MOBILE: Horizontal Scroll Navbar */}
      <div className="md:hidden overflow-x-auto scrollbar-hide">
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
              <Link to="/admin/apps" className="text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap">
                📱 Apps
              </Link>
              {(user?.role === 'PRODUCER' || user?.role === 'ADMIN') && (
                <Link to="/producer/dashboard" className="text-xs font-semibold text-primary-600 hover:text-primary-700 px-3 py-1.5 whitespace-nowrap">
                  💰 Vender
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="text-xs font-semibold text-purple-600 hover:text-purple-700 px-3 py-1.5 whitespace-nowrap">
                  Admin
                </Link>
              )}
              <Link to="/cart" className="relative text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap">
                🛒
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-1.5 whitespace-nowrap flex items-center gap-1 border border-gray-300 rounded-lg flex-shrink-0"
              >
                <FiUser className="w-3 h-3" />
                {user?.name?.split(' ')[0]}
                <FiChevronDown className={`w-3 h-3 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu - Outside scroll container */}
      {mobileMenuOpen && authenticated && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed top-14 right-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 md:hidden max-h-96 overflow-y-auto">
            <Link to="/my-courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
              Meus Cursos
            </Link>
            <Link to="/my-products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
              Meus Produtos
            </Link>
            <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
              Pedidos
            </Link>
            <Link to="/seller/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
              💰 Financeiro
            </Link>
            {(user?.role === 'PRODUCER' || user?.role === 'ADMIN') && (
              <Link to="/seller/combos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                📦 Meus Combos
              </Link>
            )}
            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
              Perfil
            </Link>
            {user?.role === 'BUYER' && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link to="/upgrade-to-producer" className="block px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  🚀 Tornar-se Vendedor
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link to="/admin/products" className="block px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  📋 Produtos Pendentes
                </Link>
                <Link to="/admin/combos" className="block px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  📦 Gerenciar Combos
                </Link>
                <Link to="/admin/commissions" className="block px-4 py-2 text-sm hover:bg-green-50 text-green-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  💰 Comissões (3%)
                </Link>
              </>
            )}
            <div className="border-t border-gray-200 my-2"></div>
            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
              Sair
            </button>
          </div>
        </>
      )}

      {/* DESKTOP: Normal Navbar */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-3xl">🎓</div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  EducaplayJA
                </span>
              </Link>

              <div className="hidden md:flex items-center space-x-4">
                <Link to="/marketplace" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Marketplace
                </Link>
                <Link to="/admin/apps" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Apps Educativos
                </Link>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {!authenticated ? (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-500 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Entrar
                  </Link>
                  <Link to="/register" className="bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                    Criar Conta
                  </Link>
                </>
              ) : (
                <>
                  {user?.role === 'PRODUCER' && (
                    <Link to="/producer/dashboard" className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      <FiDollarSign className="w-4 h-4" />
                      <span>Vender</span>
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin/dashboard" className="text-purple-600 hover:text-purple-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Admin
                    </Link>
                  )}
                  <Link to="/cart" className="relative text-gray-700 hover:text-primary-500 p-2 transition-colors">
                    <FiShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                      <span className="absolute top-0 right-0 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                  <div className="relative">
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      <FiUser className="w-5 h-5" />
                      <span>{user?.name?.split(' ')[0]}</span>
                      <FiChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <Link to="/my-courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                          Meus Cursos
                        </Link>
                        <Link to="/my-products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                          Meus Produtos
                        </Link>
                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                          Pedidos
                        </Link>
                        <Link to="/seller/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                          💰 Financeiro
                        </Link>
                        {(user?.role === 'PRODUCER' || user?.role === 'ADMIN') && (
                          <Link to="/seller/combos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                            📦 Meus Combos
                          </Link>
                        )}
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                          Perfil
                        </Link>
                        {user?.role === 'BUYER' && (
                          <>
                            <div className="border-t border-gray-200 my-2"></div>
                            <Link to="/upgrade-to-producer" className="block px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 font-semibold" onClick={() => setUserMenuOpen(false)}>
                              🚀 Tornar-se Vendedor
                            </Link>
                          </>
                        )}
                        {user?.role === 'ADMIN' && (
                          <>
                            <div className="border-t border-gray-200 my-2"></div>
                            <Link to="/admin/products" className="block px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 font-semibold" onClick={() => setUserMenuOpen(false)}>
                              📋 Produtos Pendentes
                            </Link>
                            <Link to="/admin/combos" className="block px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 font-semibold" onClick={() => setUserMenuOpen(false)}>
                              📦 Gerenciar Combos
                            </Link>
                            <Link to="/admin/commissions" className="block px-4 py-2 text-sm hover:bg-green-50 text-green-600 font-semibold" onClick={() => setUserMenuOpen(false)}>
                              💰 Comissões (3%)
                            </Link>
                          </>
                        )}
                        <div className="border-t border-gray-200 my-2"></div>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                          Sair
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
