import api from './api';

export const productService = {
  getAll: async (params) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/api/products/search?q=${query}`);
    return response.data;
  }
};
