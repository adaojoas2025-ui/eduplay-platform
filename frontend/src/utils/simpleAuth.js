// Sistema de autenticação ULTRA SIMPLES usando Window Events

// Funções de gerenciamento
export const simpleAuth = {
  login(user, accessToken, refreshToken) {
    console.log('🔐 SimpleAuth: LOGIN', user.name);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userData', JSON.stringify(user));

    // Dispara evento do navegador
    window.dispatchEvent(new Event('auth-changed'));
    console.log('✅ Evento auth-changed disparado');
  },

  logout() {
    console.log('🚪 SimpleAuth: LOGOUT');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    // Dispara evento do navegador
    window.dispatchEvent(new Event('auth-changed'));
    console.log('✅ Evento auth-changed disparado');
  },

  updateUser(user) {
    console.log('🔄 SimpleAuth: UPDATE USER', user.name);
    localStorage.setItem('userData', JSON.stringify(user));

    // Dispara evento do navegador
    window.dispatchEvent(new Event('auth-changed'));
    console.log('✅ Evento auth-changed disparado');
  },

  getUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token') && !!localStorage.getItem('userData');
  },
};
