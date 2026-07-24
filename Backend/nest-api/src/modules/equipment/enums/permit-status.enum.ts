/**
 * Status Kelayakan Objek (Permit Condition) - Berdasarkan Inspeksi Teknis Lapangan
 */
export enum StatusKelayakan {
  LAYAK = 'Layak',
  REPAIR = 'Repair',
  TIDAK_LAYAK = 'Tidak Layak',
}

/**
 * Status Sertifikasi Administrasi (Certification Status)
 */
export enum StatusSertifikasi {
  BELUM_DIAJUKAN = 'Belum Diajukan',
  SEDANG_DIPROSES = 'Sedang Diproses',
  MENUNGGU_VERIFIKASI = 'Menunggu Verifikasi',
  AKTIF = 'Aktif',
  AKAN_EXPIRED = 'Akan Expired',
  EXPIRED = 'Expired',
}
