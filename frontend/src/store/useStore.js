import { create } from 'zustand';
import api from '../services/api';

const useStore = create((set, get) => ({
  // User state
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, cart: [] });
  },
  
  // Cart state
  cart: JSON.parse(localStorage.getItem('cart')) || [],
  
  addToCart: (product) => {
    const cart = get().cart;
    const exists = cart.find(item => item.id === product.id);
    
    if (!exists) {
      const newCart = [...cart, product];
      localStorage.setItem('cart', JSON.stringify(newCart));
      set({ cart: newCart });
      return true;
    }
    return false;
  },
  
  removeFromCart: (productId) => {
    const cart = get().cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    set({ cart });
  },
  
  clearCart: () => {
    localStorage.removeItem('cart');
    set({ cart: [] });
  },
  
  // Products state
  products: [],
  loading: false,
  
  fetchProducts: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await api.get('/products', { params });
      set({ products: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

export default useStore;
