import api, { USE_DUMMY_DATA } from './api';

export const uploadCsv = async (file, type, categoryKey = '') => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Uploading CSV: ${file.name} for type: ${type}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      message: 'Berhasil upload (Dummy)',
      importedCount: 5,
      errors: []
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type); // 'master_items', 'certificates', 'permits'
  if (categoryKey) {
    formData.append('categoryKey', categoryKey);
  }

  try {
    const response = await api.post('/csv-import/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading CSV:', error);
    throw error;
  }
};

export const getCsvHistory = async (categoryKey = '') => {
  if (USE_DUMMY_DATA) {
    return [];
  }
  try {
    const params = {};
    if (categoryKey) params.categoryKey = categoryKey;
    const response = await api.get('/csv-import/history', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching CSV history:', error);
    return [];
  }
};

export const deleteCsvHistory = async (id) => {
  if (USE_DUMMY_DATA) {
    return { message: 'Deleted' };
  }
  try {
    const response = await api.delete(`/csv-import/history/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting CSV history:', error);
    return { message: 'Error deleting' };
  }
};
