import api from './api';
import { Product, ProductStats } from '../types';

export const productService = {
  // Get all products
  getAll: async (params?: { search?: string; status?: string }) => {
    const response = await api.get('/products', { params });
    return response.data as Product[];
  },

  // Get single product
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data as Product;
  },

  // Create new product
  create: async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'rentedQuantity'>) => {
    const response = await api.post('/products', productData);
    return response.data as Product;
  },

  // Update product
  update: async (id: string, productData: Partial<Product>) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data as Product;
  },

  // Delete product
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get product statistics
  getStats: async () => {
    const response = await api.get('/products/stats/overview');
    return response.data as ProductStats;
  },
};