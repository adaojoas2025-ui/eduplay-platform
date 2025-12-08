import api from './api';

export const paymentService = {
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  processPayment: async (paymentId, paymentMethod) => {
    const response = await api.post(`/payments/${paymentId}/process`, {
      paymentMethod,
    });
    return response.data;
  },

  createMercadoPagoPreference: async (orderData) => {
    const response = await api.post('/payments/mercadopago/preference', orderData);
    return response.data;
  },

  getMercadoPagoStatus: async (preferenceId) => {
    const response = await api.get(`/payments/mercadopago/status/${preferenceId}`);
    return response.data;
  },
};
