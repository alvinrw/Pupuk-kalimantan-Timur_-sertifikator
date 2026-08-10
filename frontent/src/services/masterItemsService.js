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
      result = result.filter(item => 
        item.KategoriId === categoryKey || 
        item.categoryKey === categoryKey ||
        item.KategoriNama?.toLowerCase().includes(categoryKey.toLowerCase())
      );
    }
    if (search) {
      result = result.filter(item => item.Nama.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }

  // Real API Fetch
  console.log('[REAL API] Fetching Master Items from NestJS...');
  const params = { _t: Date.now() };
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
  const response = await api.get(`/master-items/${id}`, { params: { _t: Date.now() } });
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

  const validCategories = [
    'peralatan-pabrik', 'perizinan-aset', 'administrasi-lainnya',
    'bangunan-generic', 'lingkungan-generic', 'kesehatan-generic',
    'proteksi-kebakaran', 'pesawat-angkat-angkut', 'pesawat-tenaga-produksi',
    'instalasi-penyalur-petir', 'esdm-generic', 'komunikasi-generic',
    'disnaker-generic', 'haki-generic'
  ];
  
  const mappedCategoryKey = validCategories.includes(data.categoryKey)
    ? data.categoryKey
    : (validCategories.includes(data.jenisPeralatan) ? data.jenisPeralatan : undefined);

  const payload = {
    title: data.title || data.merekItem,
    code: data.code || data.tipe || data.noSertifikat,
    categoryKey: mappedCategoryKey,
    unitLocation: data.unitLocation || data.lokasi,
    status: data.status,
    luasM2: data.luasM2,
    luasHa: data.luasHa,
    peruntukan: data.peruntukan,
    issueDate: data.issueDate || data.terbit || data.tanggalInspeksi || data.tanggalCiptaan,
    expiryDate: data.expiryDate || data.berakhir,
    keterangan: data.keterangan,
    documentStatus: data.documentStatus
  };

  // Clean undefined properties
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

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
 * Bulk create masters and certificates from parsed CSV grouping
 */
export const bulkCreateMastersWithCertificates = async (groupedData, categoryKey, fileName) => {
  if (USE_DUMMY_DATA) {
    console.log('[DUMMY MODE] Bulk creating...', groupedData);
    await new Promise(res => setTimeout(res, 800));
    const createdMasters = [];
    let successCount = 0;
    
    for (const group of groupedData) {
      const masterData = {
        id: `DUMMY-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        title: group.master.title,
        merekItem: group.master.title,
        jenisPeralatan: group.master.tipe,
        code: group.master.code,
        unitLocation: group.master.unitLocation,
        user: group.master.penanggungJawab,
        status: group.master.status,
        categoryKey,
        documentStatus: 'PENDING_DOC', // Always goes to staging
        certificates: []
      };

      for (const cert of group.certificates) {
        masterData.certificates.push({
          id: `CERT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          namaSertifikat: cert.namaSertifikat,
          noSertifikat: cert.noSertifikat,
          terbit: cert.terbit,
          expired: cert.expired,
          status: 'Aktif',
          fileUrl: null // Wait for user to upload PDF
        });
      }
      createdMasters.push(masterData);
      masterDataset.unshift(masterData); // Add to the front of the dummy dataset
      successCount += group.certificates.length > 0 ? group.certificates.length : 1;
    }
    
    return { 
      success: true, 
      importedCount: createdMasters.length, 
      successCount: successCount, 
      failedRows: [], 
      masters: createdMasters 
    };
  }

  // REAL API logic
  console.log('[REAL API] Bulk creating...');
  const response = await api.post('/csv-import/bulk-nested', { data: groupedData, categoryKey, fileName });
  return response.data;
};

/**
 * Update Notification Setting for a master item
 */
export const updateNotificationSetting = async (id, data) => {
  if (USE_DUMMY_DATA) {
    console.log(`[DUMMY MODE] Updating Notification Setting ${id}...`, data);
    await new Promise(res => setTimeout(res, 300));
    return data;
  }
  const response = await api.put(`/master-items/${id}/notification-setting`, data);
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
