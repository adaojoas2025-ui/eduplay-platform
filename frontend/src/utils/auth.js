// Sistema de autenticação ULTRA-SIMPLIFICADO
// Apenas localStorage + callbacks para forçar re-render

const AUTH_CALLBACKS = [];

// Gerenciamento de tokens e user data
export const auth = {
  // Login
  login(user, accessToken, refreshToken) {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userData', JSON.stringify(user));
    console.log('✅ AUTH: Login realizado -', user.name);
    notifyChange();
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    console.log('✅ AUTH: Logout realizado');
    notifyChange();
  },

  // Update user
  updateUser(user) {
    localStorage.setItem('userData', JSON.stringify(user));
    console.log('✅ AUTH: User atualizado -', user.name);
    notifyChange();
  },

  // Get current user
  getUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Get token
  getToken() {
    return localStorage.getItem('token');
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token') && !!localStorage.getItem('userData');
  },

  // Subscribe to auth changes
  subscribe(callback) {
    AUTH_CALLBACKS.push(callback);
    console.log('🔔 AUTH: Novo subscriber adicionado. Total:', AUTH_CALLBACKS.length);

    // Return unsubscribe function
    return () => {
      const index = AUTH_CALLBACKS.indexOf(callback);
      if (index > -1) {
        AUTH_CALLBACKS.splice(index, 1);
        console.log('🔔 AUTH: Subscriber removido. Total:', AUTH_CALLBACKS.length);
      }
    };
  },
};

// Notify all subscribers when auth state changes
function notifyChange() {
  console.log('🔔 AUTH: Notificando', AUTH_CALLBACKS.length, 'subscribers');
  AUTH_CALLBACKS.forEach((callback, index) => {
    try {
      callback();
      console.log(`✅ Subscriber ${index + 1} executado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao executar subscriber ${index + 1}:`, error);
    }
  });
}
