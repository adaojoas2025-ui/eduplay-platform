import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, cart: [] });
      },

  // Cart state
  cart: [],

  addToCart: (product) => {
    const cart = get().cart;
    const exists = cart.find(item => item.id === product.id);

    if (!exists) {
      const newCart = [...cart, product];
      set({ cart: newCart });
      return true;
    }
    return false;
  },

  removeFromCart: (productId) => {
    const cart = get().cart.filter(item => item.id !== productId);
    set({ cart });
  },

  clearCart: () => {
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
    }),
    {
      name: 'eduplay-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cart: state.cart,
      }),
    }
  )
);

export default useStore;
