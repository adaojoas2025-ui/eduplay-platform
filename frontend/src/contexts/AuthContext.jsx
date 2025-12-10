import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('🔵 AuthProvider RENDER - user:', user, 'isAuth:', isAuthenticated);

  // Carrega usuário do localStorage na inicialização
  useEffect(() => {
    console.log('🟢 AuthProvider MOUNT - iniciando verificação');
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      console.log('🟡 loadUserFromStorage - token exists:', !!token, 'userData exists:', !!userData);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Usuário carregado do localStorage:', parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        console.log('❌ Nenhum usuário no localStorage');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log('✅ Loading completo');
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    try {
      console.log('🔐 LOGIN CHAMADO com:', userData);

      // 1. Salva no localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('💾 Dados salvos no localStorage');

      // 2. Atualiza estado IMEDIATAMENTE e de forma SÍNCRONA
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ Estado atualizado - user:', userData.name, 'isAuth: true');

      return { success: true };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    try {
      console.log('🚪 LOGOUT CHAMADO');

      // 1. Remove do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      console.log('💾 localStorage limpo');

      // 2. Atualiza estado IMEDIATAMENTE
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Estado atualizado - user: null, isAuth: false');

      return { success: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return { success: false, error: 'Erro ao fazer logout' };
    }
  };

  const updateUser = (userData) => {
    try {
      console.log('🔄 UPDATE USER chamado com:', userData);

      // 1. Atualiza localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('💾 userData atualizado no localStorage');

      // 2. Atualiza estado
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ Estado atualizado');

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      return { success: false, error: 'Erro ao atualizar usuário' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
  };

  console.log('🎯 AuthProvider VALUE:', { user: user?.name, isAuthenticated, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
