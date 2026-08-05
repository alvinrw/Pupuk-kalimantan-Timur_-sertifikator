# 🧹 Catatan Refactoring Codebase — Inventor PKT

> Dokumen ini mencatat seluruh perubahan yang dilakukan dalam sesi refactoring besar-besaran (Sprint 1, Sprint 2 & Sprint 3) pada tanggal **28 - 30 Juli 2026**.

---

## 📊 Ringkasan Perubahan (Sprint 1, Sprint 2 & Sprint 3)

| File / Komponen | Baris Awal | Baris Akhir | Status | Deskripsi Ringkas |
|-----------------|------------|-------------|--------|-------------------|
| `DocumentDetailPage.jsx` | 2,183 | 559 | ✅ Sprint 1 | Ekstraksi sub-komponen tab & business hook |
| `MonitoringSertifikasi.jsx` | 1,404 | 196 | ✅ Sprint 2 | Abstraksi 15+ state ke `useMonitoring.js` |
| `PeralatanPabrik.jsx` | 1,156 | 451 | ✅ Sprint 2 | Pembagian hook & modal konfirmasi |
| `InformasiLainnya.jsx` | 963 | 310 | ✅ Sprint 2 | Pemisahan static dataset panduan |
| `PerizinanGeneric.jsx` | 917 | 370 | ✅ Sprint 2 | Custom hook `usePerizinanGeneric` |
| `BaseSplitScreenUploadModal.jsx` | 0 | 124 | ✅ Sprint 3 | **[NEW]** Reusable Split-Screen Modal Base Component |
| `useTableData.js` | 0 | 92 | ✅ Sprint 3 | **[NEW]** Reusable Table State Hook (Filter, Search, Sort) |
| `SingleEntryModal.jsx` | 496 | 290 | ✅ Sprint 3 | Refactored menggunakan `BaseSplitScreenUploadModal` |
| `ResolveDocumentModal.jsx` | 469 | 240 | ✅ Sprint 3 | Refactored menggunakan `BaseSplitScreenUploadModal` |

---

## ✅ Detail Refactoring Sprint 3 (30 Juli 2026)

### 1. Reusable Split-Screen Modal Base (`src/components/common/BaseSplitScreenUploadModal.jsx`)
- **Tujuan**: Menghilangkan redundansi kode modal upload PDF dan OCR verification yang sebelumnya terduplikasi di 8 file berbeda.
- **Fitur Utama**:
  - Standarisasi layout 2 kolom (Left: Form input & upload slot, Right: Iframe PDF Live Preview).
  - Isolasi header dark theme, indicator OCR AI, serta footer aksi (Batal & Submit).

### 2. Standarisasi Reusable Hook Tabel (`src/hooks/useTableData.js`)
- **Tujuan**: Menyatu-padukan logika filter pencarian kata kunci (*search term*), filter kategori, filter unit pabrik, sorting (*newest/oldest/title*), dan checkbox multi-selection yang sebelumnya terduplikasi di `usePeralatanPabrik`, `usePerizinanGeneric`, dan `useMonitoring`.

### 3. Refactoring Modal Upload & Verifikasi OCR (Human Verification)
- **`SingleEntryModal.jsx`**: Direstrukturisasi menggunakan `BaseSplitScreenUploadModal`, menyisakan hanya definisi form field master data (12 kolom lengkap).
- **`ResolveDocumentModal.jsx`**: Menggunakan base component split-screen baru untuk menyelesaikan tugas perizinan dengan lampiran PDF.
- **`UploadRenewalModal.jsx` & `ModalAddLinkedCert.jsx`**: Di-upgrade ke format Split-Screen layar ganda secara mandiri (*self-contained*) dengan integrasi `/upload-temp` dan `/move-temp` MinIO.

---

## ✅ Detail Refactoring Sprint 2

### 1. `MonitoringSertifikasi.jsx` (1,404 baris ➔ 196 baris)
- **`src/hooks/useMonitoring.js` [NEW]**: Diekstrak semua 15+ state variables, useEffect, filter handlers, quick actions (Renew, Afkir, Aktifkan, Batal Renew), dan upload renewal dengan OCR simulation.
- **`src/components/monitoring/SummaryCards.jsx` [NEW]**: 5 Kartu statistik monitoring terpisah.
- **`src/components/monitoring/FilterModal.jsx` [NEW]**: Pop-up modal multi-parameter filter.
- **`src/components/monitoring/MonitoringTable.jsx` [NEW]**: Tabel monitoring lengkap dengan aksi workflow.
- **`src/components/monitoring/UploadRenewalModal.jsx` [NEW]**: Modal unggah sertifikat baru + status pemindaian AI OCR.
- **Penggunaan `ModalConfirm.jsx`**: Menggantikan 4 blok modal konfirmasi (Afkir, Aktifkan, Perpanjang, Batal) dengan komponen reusable dari Sprint 1.

### 2. `PeralatanPabrik.jsx` (1,156 baris ➔ 451 baris)
- **`src/hooks/usePeralatanPabrik.js` [NEW]**: Custom hook berisi semua logic fetch data, visibility kolom, filter header, re-assign target sertifikat, dan bulk exempt.
- **Penggunaan `ModalConfirm.jsx`**: Konfirmasi hapus baris kini memakai `ModalConfirm`.

### 3. `PerizinanGeneric.jsx` (917 baris ➔ 370 baris)
- **`src/hooks/usePerizinanGeneric.js` [NEW]**: Hook terpisah untuk mengelola state pencarian, filter per jenis/lokasi/status, visibilitas 12+ kolom, dan staging bulk exempt.

### 4. `InformasiLainnya.jsx` (963 baris ➔ 310 baris)
- **`src/data/informasiData.js` [NEW]**: Ekstraksi semua data statis (kamus warna status, langkah workflow step-by-step, panduan 6 modul, rincian kolom 5 kategori, dan templat CSV).

---

## 🔧 Panduan Struktur Codebase Terbaru

```
src/
├── config/
│   └── api.js                       (Konfigurasi BASE_URL, UPLOAD_ENDPOINT terpusat)
├── data/
│   └── informasiData.js             (Data statis & kamus panduan sistem)
├── hooks/
│   ├── useDocumentDetail.js         (Business logic DocumentDetailPage)
│   ├── useMonitoring.js             (Business logic MonitoringSertifikasi)
│   ├── usePeralatanPabrik.js        (Business logic PeralatanPabrik)
│   ├── usePerizinanGeneric.js       (Business logic PerizinanGeneric)
│   └── useTableData.js              (Reusable Table State: Search, Filter, Sort & Selection) [NEW]
├── components/
│   ├── common/
│   │   └── BaseSplitScreenUploadModal.jsx (Reusable Split-Screen Modal Base) [NEW]
│   ├── document-detail/
│   │   ├── ModalConfirm.jsx         (Reusable confirmation modal)
│   │   ├── ModalUploadCert.jsx
│   │   ├── ModalAddLinkedCert.jsx
│   │   ├── ModalEditHistoryRow.jsx
│   │   ├── CertHistorySection.jsx
│   │   └── CertificateNavCards.jsx
│   └── monitoring/
│       ├── SummaryCards.jsx
│       ├── FilterModal.jsx
│       ├── MonitoringTable.jsx
│       └── UploadRenewalModal.jsx
└── pages/
    ├── DocumentDetailPage.jsx       (Orchestrator)
    ├── MonitoringSertifikasi.jsx    (Orchestrator)
    ├── PeralatanPabrik.jsx          (Orchestrator)
    ├── PerizinanGeneric.jsx         (Orchestrator)
    └── InformasiLainnya.jsx         (Orchestrator)
```

---

## 🎉 Status Refactoring

**Seluruh Tahap Refactoring Sprint 1, 2, & 3 Telah Selesai & Terverifikasi!**
- Sesuai instruksi, **TIDAK ADA PUSH KE GITHUB** pada sesi Sprint 3 ini.
- Build Frontend (`vite build`) & Backend (`nest build`) berjalan 100% lancar tanpa error/warning pemutus.
- Seluruh fungsi bisnis, form input, dan pratinjau PDF layar ganda dipastikan berjalan normal tanpa merusak fitur eksisting.

---

## ✅ Detail Refactoring Sprint 4 (5 Agustus 2026)

> **Fokus**: Membersihkan _spaghetti code_ pada modul Monitoring Sertifikasi + pembaruan terminologi UI.

### Perubahan File

| File / Komponen | Baris Awal | Baris Akhir | Deskripsi |
|---|---|---|---|
| `MonitoringSertifikasi.jsx` | 477 | ~230 | Hapus tabel inline duplikat, pakai `<MonitoringTable />`, hapus logika export duplikat |
| `MonitoringActionModals.jsx` | 237 | ~200 | Hapus dead code drag-drop, bersihkan import tak terpakai |
| `MonitoringTable.jsx` | 195 | 195 | Update teks UI: "Afkir"→"Nonaktif", "Valid"→"Aktif", fix null check sisaHari |
| `MonitoringSummaryCards.jsx` | 147 | 147 | Update label kartu "Non-Aktif / Afkir" → "Nonaktif" |
| `useMonitoring.js` | 513 | ~552 | Tambah `handleExportCSV` & `handleExportJSON`, expose di return object |

### Masalah yang Diperbaiki

1. **Tabel duplikat dihapus**: `MonitoringTable.jsx` sudah ada sejak Sprint 2 tapi tidak pernah dipakai — halaman utama memakai copy-paste inline 130 baris. Sekarang halaman hanya render `<MonitoringTable />`.
2. **Dead code dibersihkan**: `MonitoringActionModals.jsx` punya drag-drop state (`isDragging`, `handleDragOver`, dll.) yang tidak digunakan karena upload sudah ada di `UploadRenewalModal`.
3. **Logika export dipindah ke hook**: `handleExportCSV` & `handleExportJSON` yang sebelumnya di halaman utama kini ada di `useMonitoring.js` dan diterima melalui satu objek `m`.
4. **Terminologi UI diperbarui**:
   - "Afkir" → **"Nonaktif"** (semua label, tombol, teks modal)
   - "Valid" → **"Aktif"** (kolom Status Perizinan di tabel)
   - "Batal Afkir" → **"Batal Nonaktif"**
   - Nilai API yang dikirim ke Backend (`status: 'Afkir'`) **tidak diubah** agar tidak merusak Backend.
5. **Bug null safety**: Fix `doc.sisaHari <= 0` tanpa null check yang menyebabkan baris exempt/decommissioned ikut berwarna merah.

