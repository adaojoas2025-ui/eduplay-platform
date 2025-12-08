import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart')) || [],

  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      return; // Product already in cart
    }

    const newItems = [...items, { ...product, quantity: 1 }];
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  removeItem: (productId) => {
    const items = get().items.filter((item) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(items));
    set({ items });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price, 0);
  },

  getItemCount: () => {
    return get().items.length;
  },
}));
