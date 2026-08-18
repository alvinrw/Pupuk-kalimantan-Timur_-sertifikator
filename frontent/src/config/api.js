// Konfigurasi API terpusat untuk seluruh frontend
// Ubah BASE_URL di sini jika environment berubah (staging, production, dll.)

export const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';
export const API_BASE = `${BASE_URL}/api/v1`;
export const UPLOAD_ENDPOINT = `${BASE_URL}/api/v1/document-history/upload`;

/**
 * Konversi path file relatif ke URL lengkap.
 * Jika path sudah berupa URL lengkap, dikembalikan apa adanya.
 * @param {string|null} path
 * @returns {string|null}
 */
export function getFullFileUrl(path) {
  if (!path) return null;
  
  const token = sessionStorage.getItem('token') || '';
  // Check if it's a PDF or Image file
  const isViewable = 
    path.toLowerCase().endsWith('.pdf') || path.includes('.pdf?') ||
    path.toLowerCase().endsWith('.png') || path.includes('.png?') ||
    path.toLowerCase().endsWith('.jpg') || path.includes('.jpg?') ||
    path.toLowerCase().endsWith('.jpeg') || path.includes('.jpeg?');
  
  if (isViewable) {
    return `${API_BASE}/document-history/view-watermarked?token=${encodeURIComponent(token)}&filePath=${encodeURIComponent(path)}`;
  }
  
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_URL}${path}`;
}
