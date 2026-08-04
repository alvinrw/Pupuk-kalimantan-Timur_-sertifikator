import api, { USE_DUMMY_DATA } from './api';
import { mockIuranData } from '../data/mockData';

export const getIuranKeanggotaan = async () => {
  if (USE_DUMMY_DATA) {
    console.log('[DUMMY MODE] Fetching Iuran Keanggotaan...');
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockIuranData || [];
  }
  const response = await api.get('/iuran-keanggotaan');
  return response.data;
};

export const createIuranKeanggotaan = async (data) => {
  if (USE_DUMMY_DATA) {
    console.log('[DUMMY MODE] Creating Iuran Keanggotaan...', data);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { id: `DUMMY-${Date.now()}`, ...data };
  }
  const response = await api.post('/iuran-keanggotaan', data);
  return response.data;
};

export const updateIuranKeanggotaan = async (id, data) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Updating Iuran Keanggotaan ${id}...`, data);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { id, ...data };
  }
  const response = await api.patch(`/iuran-keanggotaan/${id}`, data);
  return response.data;
};

export const deleteIuranKeanggotaan = async (id) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Deleting Iuran Keanggotaan ${id}...`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { message: 'Deleted (Dummy)' };
  }
  const response = await api.delete(`/iuran-keanggotaan/${id}`);
  return response.data;
};
