import api from './api';
import { BackupData, BackupInfo } from '../types';

export const backupService = {
  // Export backup data
  exportData: async () => {
    const response = await api.get('/backup/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Import backup data
  importData: async (data: BackupData, clearExisting: boolean = false) => {
    const response = await api.post('/backup/import', {
      data: data.data,
      clearExisting,
    });
    return response.data;
  },

  // Get backup info
  getBackupInfo: async () => {
    const response = await api.get('/backup/info');
    return response.data as BackupInfo;
  },
};