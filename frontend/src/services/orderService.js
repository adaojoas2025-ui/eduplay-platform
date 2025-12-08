import api from './api';

export const orderService = {
  getAll: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  getMyPurchases: async () => {
    const response = await api.get('/orders/my-purchases');
    return response.data;
  },

  getMySales: async () => {
    const response = await api.get('/orders/my-sales');
    return response.data;
  },
};
