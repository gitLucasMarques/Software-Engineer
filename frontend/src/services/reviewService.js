import api from './api';

export const reviewService = {
  create: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  getByProduct: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  update: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
};
