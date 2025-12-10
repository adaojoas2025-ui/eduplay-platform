import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('🔵 AuthProvider renderizou - user:', user);

  // Verifica o estado de autenticação ao carregar
  useEffect(() => {
    console.log('🟢 AuthProvider useEffect - verificando localStorage');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      console.log('🟡 checkAuthStatus - token:', !!token, 'userData:', !!userData);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Usuário encontrado no localStorage:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('❌ Nenhum usuário no localStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    try {
      console.log('🔐 LOGIN chamado com userData:', userData);

      // Salva tokens no localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userData', JSON.stringify(userData));

      console.log('💾 Dados salvos no localStorage');

      // ATUALIZA O ESTADO IMEDIATAMENTE
      setUser(userData);

      console.log('✅ Estado atualizado - user agora é:', userData);

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    console.log('🚪 LOGOUT chamado');

    // Remove dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    console.log('💾 Dados removidos do localStorage');

    // ATUALIZA O ESTADO IMEDIATAMENTE
    setUser(null);

    console.log('✅ Estado atualizado - user agora é null');
  };

  const updateUser = (userData) => {
    console.log('🔄 UPDATE USER chamado com:', userData);

    // Atualiza dados do usuário
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);

    console.log('✅ Usuário atualizado');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
