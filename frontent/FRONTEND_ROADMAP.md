# 🎨 Frontend Roadmap: Orkestrasi UI & Backend

Dokumen ini berisi peta jalan (Roadmap) untuk menyambungkan antarmuka React (UI) dengan API NestJS yang sudah selesai kita buat. Kita akan memecah pekerjaan menjadi beberapa tahap agar terstruktur dan gampang di- *tracking*.

---

## 📁 Tahap 1: Setup API & Service Layer (Pondasi)
Sebelum kita mengubah halaman UI, kita butuh jembatan komunikasi ke Backend. Daripada *fetch* API berantakan di setiap halaman, kita akan pusatkan semuanya di satu folder.

- [x] **Bikin Folder `src/services/`**: Tempat menyimpan fungsi-fungsi Axios/Fetch ke API.
  - `api.js`: File konfigurasi Axios utama (Base URL `http://localhost:3000/api/v1`).
  - `masterItemsService.js`: Fungsi `getAllItems()`, `getItemById()`.
  - `certificatesService.js`: Fungsi `getCertificates()`, dsb.
  - `permitsService.js`: Fungsi CRUD untuk Izin.
  - `ocrService.js`: Fungsi buat *upload* PDF ke AI.
  - `csvService.js`: Fungsi buat *upload* CSV massal.

---

## 🗑️ Tahap 2: Pembersihan Data Palsu (Dummy Data)
Menghapus "Roda Bantuan" agar aplikasi kita murni mengambil data dari *database* asli.

- [x] Hapus/Non-aktifkan `src/data/masterDataset.js` dan kawan-kawannya.
- [x] Sesuaikan nama variabel di *Frontend* dengan *Database* (misal: di React tertulis `TglTerbit`, padahal di database Prisma tertulis `issueDate`).

---

## 🖥️ Tahap 3: Orkestrasi Halaman Utama (Pages)
Menyambungkan data dari Service Layer ke halaman UI.

- [x] **Halaman Dashboard (`Dashboard.jsx`)**: Menampilkan statistik asli (Jumlah Aset, Sertifikat Expired, dsb) dari *endpoint* NestJS.
- [x] **Halaman Tabel Utama (Daftar Pabrik / Aset)**: Menampilkan tabel hasil fetch dari `masterItemsService`.
- [x] **Halaman Detail Pabrik (`DocumentDetailModal.jsx` dll)**: Saat satu pabrik diklik, tarik data relasinya (Sertifikat & Permits) dari `master-items/item/:itemId`.

---

## ☁️ Tahap 4: Fitur Canggih (Upload & AI)
Mengintegrasikan fitur utama yang sudah kita buat susah payah di Backend.

- [ ] **Fitur Upload CSV (Import)**: Membuat tombol UI untuk menembak file CSV ke `csv-import/upload` dan merefresh tabel secara otomatis.
- [ ] **Fitur Upload PDF (AI OCR)**: Mengaktifkan tombol *upload scan* di modal, mengirim file ke `ocr/upload-scan`, nunggu loading selesai, lalu mengisi otomatis *form* inputannya!

---

## Status Pekerjaan
Gunakan emoji berikut untuk memantau progres:
- ❌ **Belum Dimulai**
- ⏳ **Sedang Dikerjakan (In Progress)**
- ✅ **Selesai 100%**
