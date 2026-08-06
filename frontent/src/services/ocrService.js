import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';

/**
 * Memindai file PDF dan mengekstraksi metadata sertifikat (No Sertifikat, Tanggal Terbit, Tanggal Expired)
 * @param {File} file - Berkas PDF yang diunggah
 * @returns {Promise<Object>} Respon OCR data
 */
export async function scanPdfDocument(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/ocr/scan-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Gagal melakukan OCR scan pada PDF:', error);
    return null;
  }
}
