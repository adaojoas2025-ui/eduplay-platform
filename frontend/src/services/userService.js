import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  becomeSeller: async () => {
    const response = await api.post('/users/become-seller');
    return response.data;
  },

  // Admin functions
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  suspendUser: async (userId) => {
    const response = await api.post(`/users/${userId}/suspend`);
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await api.post(`/users/${userId}/activate`);
    return response.data;
  },
};
