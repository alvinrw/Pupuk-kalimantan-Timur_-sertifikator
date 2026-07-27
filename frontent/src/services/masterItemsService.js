import api, { USE_DUMMY_DATA } from './api';
import { masterCertificatesData as masterDataset } from '../data/masterDataset';

/**
 * Fetch all master items
 * @param {string} categoryKey - Optional filter by category
 * @param {string} search - Optional search query
 */
export const getMasterItems = async (categoryKey = '', search = '') => {
  if (USE_DUMMY_DATA) {
    console.log('[DUMMY MODE] Fetching Master Items from local dataset...');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simple filter simulation for dummy data
    let result = [...masterDataset];
    if (categoryKey) {
      result = result.filter(item => item.KategoriId === categoryKey || item.KategoriNama?.toLowerCase().includes(categoryKey.toLowerCase()));
    }
    if (search) {
      result = result.filter(item => item.Nama.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }

  // Real API Fetch
  console.log('[REAL API] Fetching Master Items from NestJS...');
  const params = {};
  if (categoryKey) params.categoryKey = categoryKey;
  if (search) params.search = search;

  const response = await api.get('/master-items', { params });
  return response.data;
};

/**
 * Fetch a single master item by ID
 */
export const getMasterItemById = async (id) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Fetching Master Item ${id}...`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const item = masterDataset.find(x => String(x.id) === String(id) || String(x.MasterId) === String(id));
    if (!item) throw new Error('Item not found in dummy data');
    return item;
  }

  console.log(`[REAL API] Fetching Master Item ${id}...`);
  const response = await api.get(`/master-items/${id}`);
  return response.data;
};

/**
 * Delete a single master item by ID
 */
export const deleteMasterItem = async (id) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Deleting Master Item ${id}...`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { message: 'Deleted (Dummy)' };
  }

  console.log(`[REAL API] Deleting Master Item ${id}...`);
  const response = await api.delete(`/master-items/${id}`);
  return response.data;
};

/**
 * Update an existing master item
 */
export const updateMasterItem = async (id, data) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Updating Master Item ${id}...`, data);
    await new Promise(res => setTimeout(res, 300));
    return { id, ...data };
  }
  console.log(`[REAL API] Updating Master Item ${id}...`);

  const payload = {};
  if (data.title || data.merekItem) payload.title = data.merekItem || data.title;
  if (data.code || data.tipe) payload.code = data.code || data.tipe;
  if (data.categoryKey) payload.categoryKey = data.categoryKey;
  if (data.unitLocation || data.lokasi) payload.unitLocation = data.lokasi || data.unitLocation;
  if (data.status) payload.status = data.status;
  if (data.luasM2) payload.luasM2 = data.luasM2;
  if (data.luasHa) payload.luasHa = data.luasHa;
  if (data.peruntukan) payload.peruntukan = data.peruntukan;
  if (data.terbit || data.issueDate) payload.issueDate = data.terbit || data.issueDate;
  if (data.berakhir || data.expiryDate) payload.expiryDate = data.berakhir || data.expiryDate;
  if (data.keterangan) payload.keterangan = data.keterangan;

  const response = await api.put(`/master-items/${id}`, payload);
  return response.data;
};

/**
 * Resolve exemption with mandatory note
 */
export const resolveMasterItemExemption = async (id, note) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Resolving Exemption for ${id}...`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { message: 'Exemption resolved (Dummy)', documentStatus: 'EXEMPT', exemptionNote: note };
  }

  console.log(`[REAL API] Resolving Exemption for ${id}...`);
  const response = await api.patch(`/master-items/${id}/resolve-exemption`, { note });
  return response.data;
};

/**
 * Create a new master item
 */
export const createMasterItem = async (data) => {
  if (USE_DUMMY_DATA) {
    console.log('[DUMMY MODE] Creating Master Item...', data);
    await new Promise(res => setTimeout(res, 300));
    return { id: `DUMMY-${Date.now()}`, ...data };
  }
  console.log('[REAL API] Creating Master Item...');
  const response = await api.post('/master-items', data);
  return response.data;
};

/**
 * Create a certificate attached to a master item
 */
export const createCertificateForMasterItem = async (certificateData) => {
  if (USE_DUMMY_DATA) {
    console.log('[DUMMY MODE] Creating Certificate...', certificateData);
    await new Promise(res => setTimeout(res, 300));
    return { id: `CERT-${Date.now()}`, ...certificateData };
  }
  console.log('[REAL API] Creating Certificate...');
  const response = await api.post('/certificates', certificateData);
  return response.data;
};

/**
 * Create a new certificate connected to an item
 */
export const createCertificate = async (data) => {
  if (USE_DUMMY_DATA) {
    console.log('[DUMMY MODE] Creating Certificate...', data);
    await new Promise(res => setTimeout(res, 300));
    return { id: `CERT-${Date.now()}`, ...data };
  }
  console.log('[REAL API] Creating Certificate...');
  const response = await api.post('/certificates', data);
  return response.data;
};

/**
 * Update an existing certificate by ID
 */
export const updateCertificate = async (id, data) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Updating Certificate ${id}...`, data);
    await new Promise(res => setTimeout(res, 300));
    return { id, ...data };
  }
  console.log(`[REAL API] Updating Certificate ${id}...`);
  const response = await api.put(`/certificates/${id}`, data);
  return response.data;
};

/**
 * Delete a certificate by ID
 */
export const deleteCertificate = async (id) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Deleting Certificate ${id}...`);
    await new Promise(res => setTimeout(res, 300));
    return { message: 'Deleted (Dummy)' };
  }
  console.log(`[REAL API] Deleting Certificate ${id}...`);
  const response = await api.delete(`/certificates/${id}`);
  return response.data;
};
