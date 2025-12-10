// Sistema de autenticação MINIMALISTA - apenas localStorage

export function saveAuth(user, accessToken, refreshToken) {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userData', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
}

export function getUser() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function isAuthenticated() {
  return !!localStorage.getItem('token') && !!localStorage.getItem('userData');
}
