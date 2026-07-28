# 📖 Frontend — Inventor PKT (Sertifikator)

> React + Vite + TailwindCSS 4.x frontend untuk sistem manajemen sertifikasi aset, peralatan pabrik, dan legalitas dokumen PKT.

---

## 🚀 Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Build production
npm run build
```

Server akan berjalan di `http://localhost:5173`.  
Pastikan backend NestJS sudah aktif di `http://localhost:3000`.

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di folder ini (lihat `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_USE_DUMMY_DATA=false
```

---

## 📁 Struktur Folder

```
src/
├── config/
│   └── api.js                      ← BASE_URL, UPLOAD_ENDPOINT, getFullFileUrl()
│
├── hooks/
│   └── useDocumentDetail.js        ← Custom hook: semua state & logic halaman detail
│
├── pages/
│   ├── DocumentDetailPage.jsx      ← Orchestrator halaman detail (559 baris)
│   ├── MonitoringSertifikasi.jsx   ← Halaman monitoring seluruh sertifikat
│   ├── PeralatanPabrik.jsx         ← Halaman peralatan pabrik
│   ├── InformasiLainnya.jsx        ← Halaman informasi lainnya
│   ├── PerizinanGeneric.jsx        ← Halaman perizinan proyek/produk (generik)
│   ├── AdministrasiLainnya.jsx     ← Halaman administrasi (HAKI, dll.)
│   ├── PerizinanAset.jsx           ← Halaman perizinan aset
│   ├── Dashboard.jsx               ← Halaman dashboard utama
│   └── ...
│
├── components/
│   ├── document-detail/            ← ⭐ Sub-komponen halaman detail
│   │   ├── CertHistorySection.jsx  ← Tabel histori + garis waktu audit
│   │   ├── CertificateNavCards.jsx ← Kartu navigasi sertifikat terhubung
│   │   ├── ModalConfirm.jsx        ← Generic confirm modal (reusable)
│   │   ├── ModalUploadCert.jsx     ← Modal unggah / koreksi PDF manual
│   │   ├── ModalAddLinkedCert.jsx  ← Modal tambah sertifikat terhubung
│   │   └── ModalEditHistoryRow.jsx ← Modal edit baris histori
│   │
│   ├── CsvImportModal.jsx
│   ├── Sidebar.jsx
│   └── ...
│
├── services/
│   ├── api.js                      ← Axios instance terpusat
│   ├── masterItemsService.js       ← CRUD master items & certificates
│   └── csvService.js               ← Upload CSV
│
└── data/
    ├── mockData.js
    └── masterDataset.js
```

---

## 🧩 Pola Arsitektur

### Custom Hook Pattern
Semua state dan logic bisnis `DocumentDetailPage` diekstrak ke `useDocumentDetail.js`.  
Komponen utama hanya bertugas sebagai **orchestrator** — menerima nilai dari hook dan mendistribusikannya ke sub-komponen.

```jsx
// di DocumentDetailPage.jsx
const hook = useDocumentDetail({ item, onBack, onSaveUpdate, ... });
const { formData, historyList, openUploadModal, ... } = hook;

return (
  <>
    <CertHistorySection historyList={historyList} openUploadModal={openUploadModal} ... />
    <CertificateNavCards linkedCerts={linkedCerts} ... />
    <ModalConfirm isOpen={isDeleteDialogOpen} onConfirm={handleDeleteMasterItem} ... />
  </>
);
```

### Centralized API Config
**Jangan hardcode URL API langsung di JSX/handler.** Gunakan selalu dari `config/api.js`:

```js
import { BASE_URL, UPLOAD_ENDPOINT, getFullFileUrl } from '../config/api';

// Buka PDF
window.open(getFullFileUrl(fileUrl), '_blank');

// Upload file
fetch(UPLOAD_ENDPOINT, { method: 'POST', body: formData });
```

---

## 🔑 Fitur Utama

| Fitur | Komponen / Hook |
|-------|----------------|
| Navigasi antar sertifikat | `CertificateNavCards.jsx`, `activeCertId` di hook |
| Histori sertifikat + audit timeline | `CertHistorySection.jsx` |
| Upload / koreksi PDF manual | `ModalUploadCert.jsx` |
| Tambah sertifikat terhubung | `ModalAddLinkedCert.jsx` |
| Afkir / Aktifkan / Hapus | `ModalConfirm.jsx` (reusable) |
| Monitoring sertifikat (global) | `MonitoringSertifikasi.jsx` |
