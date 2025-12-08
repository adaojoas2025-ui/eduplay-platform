import api from './api';

export const reviewService = {
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  getMyReviews: async () => {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  },
};
