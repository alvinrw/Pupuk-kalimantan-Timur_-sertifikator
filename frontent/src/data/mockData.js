// data/mockData.js — Barrel re-export file untuk backward compatibility
// Data statis asli telah dipisahkan berdasarkan domain:
// - mockEquipment.js: Data statistik & peralatan pabrik
// - mockOcr.js: Data hasil OCR, notifikasi, dan log aktivitas
// - mockIuranData.js: Data iuran keanggotaan profesi & sertifikasi

export { mockStats, mockEquipmentList } from './mockEquipment';
export { mockOcrExtractions, mockNotifications, mockActivityLogs } from './mockOcr';
export { mockIuranData } from './mockIuranData';
