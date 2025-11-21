import api from './api';
import { DailyReport, MonthlyReport, RevenueChartData } from '../types';

export const reportService = {
  // Get daily report
  getDailyReport: async (date?: string) => {
    const response = await api.get('/reports/daily', { params: { date } });
    return response.data as DailyReport;
  },

  // Get monthly report
  getMonthlyReport: async (year?: number, month?: number) => {
    const response = await api.get('/reports/monthly', { params: { year, month } });
    return response.data as MonthlyReport;
  },

  // Get revenue chart data
  getRevenueChartData: async (period: '7d' | '30d' | '12m' = '7d') => {
    const response = await api.get('/reports/charts/revenue', { params: { period } });
    return response.data as RevenueChartData[];
  },

  // Export daily report
  exportDailyReport: async (date: string) => {
    const response = await api.get(`/reports/export/daily/${date}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export monthly report
  exportMonthlyReport: async (year: number, month: number) => {
    const response = await api.get(`/reports/export/monthly/${year}/${month}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get all rentals (for reports page)
  getRentals: async () => {
    const response = await api.get('/reports/rentals');
    return response.data;
  },

  // Get total income (for reports page)
  getTotalIncome: async () => {
    const response = await api.get('/reports/income/total');
    return response.data;
  },
};