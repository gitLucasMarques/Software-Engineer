import api from './api';

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  }
};
