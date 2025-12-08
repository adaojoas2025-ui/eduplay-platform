import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        loading: false,
      });

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const data = await authService.register(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        loading: false,
      });

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return false;
    }

    try {
      const userData = await authService.getCurrentUser();
      set({ user: userData, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      set({ isAuthenticated: false, user: null });
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return false;
    }
  },
}));
