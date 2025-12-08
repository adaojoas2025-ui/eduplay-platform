import { create } from 'zustand';
import { productService } from '../services/productService';

export const useProductStore = create((set, get) => ({
  products: [],
  currentProduct: null,
  categories: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await productService.getAll(params);
      set({
        products: data.products || data.data || data,
        pagination: data.pagination || get().pagination,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await productService.getById(id);
      set({ currentProduct: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  searchProducts: async (query, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await productService.search(query, filters);
      set({
        products: data.products || data.data || data,
        pagination: data.pagination || get().pagination,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const data = await productService.getCategories();
      set({ categories: data });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },
}));
