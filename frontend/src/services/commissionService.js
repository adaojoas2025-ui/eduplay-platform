import api from './api';

export const commissionService = {
  getMyCommissions: async (params = {}) => {
    const response = await api.get('/commissions/my-commissions', { params });
    return response.data;
  },

  getCommissionStats: async () => {
    const response = await api.get('/commissions/stats');
    return response.data;
  },

  requestWithdrawal: async (amount, withdrawalData) => {
    const response = await api.post('/commissions/withdraw', {
      amount,
      ...withdrawalData,
    });
    return response.data;
  },

  getWithdrawals: async (params = {}) => {
    const response = await api.get('/commissions/withdrawals', { params });
    return response.data;
  },

  // Admin functions
  getAllCommissions: async (params = {}) => {
    const response = await api.get('/commissions', { params });
    return response.data;
  },

  approveWithdrawal: async (withdrawalId) => {
    const response = await api.post(`/commissions/withdrawals/${withdrawalId}/approve`);
    return response.data;
  },

  rejectWithdrawal: async (withdrawalId, reason) => {
    const response = await api.post(`/commissions/withdrawals/${withdrawalId}/reject`, {
      reason,
    });
    return response.data;
  },
};
