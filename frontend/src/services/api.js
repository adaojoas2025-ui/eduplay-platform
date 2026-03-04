import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Request interceptor - Token exists:', !!token);
    console.log('📍 Request URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('❌ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            { refreshToken }
          );
          
          const { accessToken } = response.data.data;
          localStorage.setItem('token', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Show error toast (skip 403 - components handle permission errors themselves)
    if (error.response?.status !== 403) {
      const message = error.response?.data?.message || 'Erro ao processar requisição';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Product API endpoints
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getMyProducts: () => api.get('/products/my-products'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadThumbnail: (id, file) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return api.post(`/products/${id}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadFiles: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post(`/products/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Order API endpoints
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getMySales: () => api.get('/orders/my-sales'),
  create: (data) => api.post('/orders', data),
};

// User API endpoints
export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/users/profile', data),
  updateProducerSettings: (data) => api.patch('/users/producer-settings', data),
  upgradeToProducer: (data) => api.post('/users/upgrade-to-producer', data),
};

// Admin API endpoints
export const adminAPI = {
  getUsers: (params) => api.get('/users', { params }),
  approveProducer: (id) => api.patch(`/users/${id}`, { status: 'APPROVED' }),
  rejectProducer: (id) => api.patch(`/users/${id}`, { status: 'REJECTED' }),
  suspendUser: (id) => api.post(`/users/${id}/suspend`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
