import api from './api';

export const productService = {
  getAll: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data;
  }
};
