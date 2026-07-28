# 🧹 Catatan Refactoring Codebase — Inventor PKT

> Dokumen ini mencatat seluruh perubahan yang dilakukan dalam sesi refactoring besar-besaran pada tanggal **28 Juli 2026**.

---

## 📊 Ringkasan Perubahan

| File | Sebelum | Sesudah | Pengurangan |
|------|---------|---------|-------------|
| `DocumentDetailPage.jsx` | 2,183 baris | 559 baris | **-74%** ✅ |
| Logic handler | inline di komponen | `useDocumentDetail.js` (hook terpisah) | Terpisah |
| Modal blocks | 7 modal hardcoded inline | 4 komponen + 1 reusable | Bersih |
| Hardcoded URL | `http://localhost:3000` di 3+ tempat | `config/api.js` (1 tempat) | Bersih |

---

## ✅ Apa yang Berubah?

### 1. `src/config/api.js` — [NEW]
**Centralized API Configuration**

Sebelumnya `http://localhost:3000` di-*hardcode* langsung di dalam handler di `DocumentDetailPage.jsx` (muncul di 3+ tempat). Sekarang semua URL dikontrol dari satu file.

```js
// Sebelum (tersebar di berbagai handler):
const uploadRes = await fetch('http://localhost:3000/api/v1/document-history/upload', ...);
const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;

// Sesudah (dari config):
import { UPLOAD_ENDPOINT, getFullFileUrl } from '../config/api';
const uploadRes = await fetch(UPLOAD_ENDPOINT, ...);
window.open(getFullFileUrl(fileUrl), '_blank');
```

---

### 2. `src/hooks/useDocumentDetail.js` — [NEW]
**Custom Hook — semua state & business logic**

Diekstrak dari `DocumentDetailPage.jsx`. Berisi:
- 20+ state variables (isEditing, formData, historyList, linkedCerts, dll.)
- 15+ handler functions (handleSave, handleUploadSubmit, confirmAfkir, dll.)
- 3 useEffect hooks (fetch history, sync formData, sync activeCertId)

---

### 3. `src/components/document-detail/` — [NEW FOLDER]

Folder baru berisi semua sub-komponen yang sebelumnya inline di `DocumentDetailPage.jsx`:

| File | Deskripsi | Baris Lama (inline) |
|------|-----------|---------------------|
| `ModalConfirm.jsx` | Generic reusable confirm modal | ~200 baris (5 blok duplikat) |
| `ModalUploadCert.jsx` | Modal unggah/koreksi PDF | ~145 baris |
| `ModalAddLinkedCert.jsx` | Modal tambah sertifikat terhubung | ~200 baris |
| `ModalEditHistoryRow.jsx` | Modal edit baris histori | ~90 baris |
| `CertHistorySection.jsx` | Tabel histori + audit timeline | ~160 baris |
| `CertificateNavCards.jsx` | Kartu navigasi sertifikat | ~175 baris |

---

### 4. `src/pages/DocumentDetailPage.jsx` — [REWRITE]
**Sebelum:** God Component 2,183 baris — semua modal, semua section, semua state, semua handler digabung jadi satu.  
**Sesudah:** Orchestrator 559 baris — hanya menerima data dari hook dan mendistribusikan ke sub-komponen.

---

### 5. `frontent/README.md` — [NEW]
Dokumentasi lengkap frontend: cara run, struktur folder, pola arsitektur.

---

## 🔧 Cara Navigasi Codebase Setelah Refactor

```
Mau ubah logic upload?     → src/hooks/useDocumentDetail.js (handleUploadSubmit)
Mau ubah tampilan histori? → src/components/document-detail/CertHistorySection.jsx
Mau ubah modal konfirmasi? → src/components/document-detail/ModalConfirm.jsx
Mau tambah field di form?  → src/pages/DocumentDetailPage.jsx (Edit Form section)
Mau ubah URL API?          → src/config/api.js
```

---

## ⚠️ Yang BELUM Direfactor (Next Steps)

File-file berikut masih besar dan perlu refactoring di sprint berikutnya:

| File | Baris | Prioritas |
|------|-------|-----------|
| `MonitoringSertifikasi.jsx` | 1,295 | 🔴 Tinggi |
| `PeralatanPabrik.jsx` | 1,072 | 🟡 Sedang |
| `InformasiLainnya.jsx` | 908 | 🟡 Sedang |
| `PerizinanGeneric.jsx` | 836 | 🟢 Rendah |

Pola refactoring yang sama bisa diterapkan:
1. Buat custom hook untuk state & logic masing-masing halaman.
2. Pecah section besar menjadi komponen terpisah di `components/`.
