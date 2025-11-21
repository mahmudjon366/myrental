import api from './api';
import { Rental, RentalStats } from '../types';

export const rentalService = {
  // Get all rentals
  getAll: async (params?: { 
    status?: string; 
    customer?: string; 
    product?: string; 
    page?: number; 
    limit?: number; 
  }) => {
    const response = await api.get('/rentals', { params });
    return response.data as {
      rentals: Rental[];
      totalPages: number;
      currentPage: number;
      total: number;
    };
  },

  // Get single rental
  getById: async (id: string) => {
    const response = await api.get(`/rentals/${id}`);
    return response.data as Rental;
  },

  // Create new rental
  create: async (rentalData: {
    productId: string;
    customerId: string;
    quantity: number;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => {
    const response = await api.post('/rentals', rentalData);
    return response.data as Rental;
  },

  // Update rental
  update: async (id: string, rentalData: Partial<Rental>) => {
    const response = await api.put(`/rentals/${id}`, rentalData);
    return response.data as Rental;
  },

  // Return rental
  returnRental: async (id: string) => {
    const response = await api.patch(`/rentals/${id}/return`);
    return response.data as Rental;
  },

  // Delete rental
  delete: async (id: string) => {
    const response = await api.delete(`/rentals/${id}`);
    return response.data;
  },

  // Get rental statistics
  getStats: async () => {
    const response = await api.get('/rentals/stats/overview');
    return response.data as RentalStats;
  },
};