import api from './api';
import { Customer, CustomerStats } from '../types';

export const customerService = {
  // Get all customers
  getAll: async (params?: { search?: string }) => {
    const response = await api.get('/customers', { params });
    return response.data as Customer[];
  },

  // Get single customer
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data as Customer;
  },

  // Create new customer
  create: async (customerData: Omit<Customer, '_id' | 'createdAt' | 'updatedAt' | 'totalRentals' | 'totalSpent'>) => {
    const response = await api.post('/customers', customerData);
    return response.data as Customer;
  },

  // Update customer
  update: async (id: string, customerData: Partial<Customer>) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data as Customer;
  },

  // Delete customer
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Get customer statistics
  getStats: async () => {
    const response = await api.get('/customers/stats/overview');
    return response.data as CustomerStats;
  },
};