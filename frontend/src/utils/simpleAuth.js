// Sistema de autenticação usando Storage Event (API nativa do navegador)

export const simpleAuth = {
  login(user, accessToken, refreshToken) {
    console.log('🔐 SimpleAuth: LOGIN', user.name);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userData', JSON.stringify(user));

    // Força trigger do storage event criando e removendo uma key temporária
    localStorage.setItem('auth-trigger', Date.now().toString());
    localStorage.removeItem('auth-trigger');

    console.log('✅ Login completo - storage event disparado');
  },

  logout() {
    console.log('🚪 SimpleAuth: LOGOUT');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    // Força trigger do storage event
    localStorage.setItem('auth-trigger', Date.now().toString());
    localStorage.removeItem('auth-trigger');

    console.log('✅ Logout completo - storage event disparado');
  },

  updateUser(user) {
    console.log('🔄 SimpleAuth: UPDATE USER', user.name);
    localStorage.setItem('userData', JSON.stringify(user));

    // Força trigger do storage event
    localStorage.setItem('auth-trigger', Date.now().toString());
    localStorage.removeItem('auth-trigger');

    console.log('✅ Update completo - storage event disparado');
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
