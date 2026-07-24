# 📋 Checklist Tugas & Roadmap Pengembangan Sertifikator

Dokumen ini berisi panduan langkah demi langkah (*step-by-step roadmap*) yang jelas dan terstruktur mengenai apa saja yang perlu dilakukan untuk menyelesaikan proyek **Sertifikator**.

---

## 🎯 Tahap 1: Setup & Verifikasi Backend Baseline

- [x] **Inisialisasi Arsitektur Backend**
  - [x] Membuat folder `Backend/nest-api` (NestJS Gateway)
  - [x] Membuat folder `Backend/fastapi-ocr` (FastAPI Python OCR Service)
  - [x] Menyusun `docker-compose.yml` (PostgreSQL, MinIO, Redis, NestJS, FastAPI)
- [x] **Otomatisasi MinIO Bucket**
  - [x] Menambahkan init-container `createbuckets` di `docker-compose.yml`
  - [x] Membuat `StorageService` di NestJS untuk pembuatan bucket `sertifikator-docs` otomatis
- [x] **Pembuatan DTO & Entity Schema di NestJS**
  - [x] Enums `StatusKelayakan` & `StatusSertifikasi`
  - [x] `CreateEquipmentDto`, `UpdateEquipmentDto`, `EquipmentQueryDto`
  - [x] `EquipmentService` (CRUD + In-memory seed data dari mock) & `EquipmentController` (REST API)
- [ ] **Setup Local Docker (Opsional jika ingin jalankan DB/Storage)**
  - [ ] Download & Install **Docker Desktop**
  - [ ] Jalankan `docker-compose up -d` di folder `Backend/`
  - [ ] Uji akses Swagger NestJS di `http://localhost:3000/api/docs`

---

## 🎨 Tahap 2: Finalisasi UI Frontend (`frontent/src/`)

- [ ] **Halaman Peralatan Pabrik ([PeralatanPabrik.jsx](file:///c:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/src/pages/PeralatanPabrik.jsx))**
  - [ ] Rapikan pencarian (Search bar), filter kategori, dan unit pabrik
  - [ ] Selesaikan tombol aksi (*Detail*, *Edit*, *Hapus*) pada baris tabel
- [ ] **Modal Single Entry Data ([SingleEntryModal.jsx](file:///c:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/src/components/SingleEntryModal.jsx))**
  - [ ] Validasi form input (Nomor Sertifikat, Tanggal Terbit, Expiry Date, Instansi)
- [ ] **Modal Bulk Upload ZIP & OCR ([ZipOcrModal.jsx](file:///c:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/src/components/ZipOcrModal.jsx))**
  - [ ] Penyempurnaan alur Stepper UI (Pilih ZIP -> Processing Progress -> Preview Match -> Confirm)
- [ ] **Modul Expiration Monitoring ([MonitoringSertifikasi.jsx](file:///c:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/src/pages/MonitoringSertifikasi.jsx))**
  - [ ] Verifikasi tampilan badge status (`Akan Expired` ≤ 30 hari & `Expired`)
  - [ ] Selesaikan form modal Paket Resertifikasi / Batch Renewal ([RenewalBatchModal.jsx](file:///c:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/src/components/RenewalBatchModal.jsx))

---

## 🔄 Tahap 3: Integrasi Frontend ke Backend REST API (Dicicil Satu Per Satu)

- [ ] **Integrasi Data Peralatan Pabrik**
  - [ ] Ganti pembacaan `mockData.js` di `PeralatanPabrik.jsx` dengan `fetch('http://localhost:3000/api/v1/equipment')`
  - [ ] Hubungkan form modal tambah data dengan HTTP `POST /api/v1/equipment`
- [ ] **Integrasi Import CSV**
  - [ ] Hubungkan modal [CsvImportModal.jsx](file:///c:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/src/components/CsvImportModal.jsx) untuk pengiriman file `.csv` ke backend
- [ ] **Integrasi MinIO PDF Viewer**
  - [ ] Tampilkan file PDF sertifikat langsung dari URL MinIO Presigned URL di dalam modal preview frontend

---

## 🤖 Tahap 4: Pengujian AI OCR & Entity Matching Engine (`fastapi-ocr/`)

- [ ] **Modul OCR Python (`app/ocr_engine/paddle_ocr.py`)**
  - [ ] Pasang library `PaddleOCR` / `pdfplumber` untuk mengekstrak teks PDF
  - [ ] Tes ekstraksi pada beberapa contoh file PDF sertifikat nyata
- [ ] **Modul Rule Engine NLP (`app/extractor/info_extractor.py`)**
  - [ ] Buat pattern regex/parsing untuk membaca Nomor Sertifikat, Expiry Date, dan Nama Instansi
- [ ] **Modul Entity Matching (`app/matching/entity_matcher.py`)**
  - [ ] Pengujian pencocokan fuzzy string (*RapidFuzz*) antara hasil ekstraksi dokumen dengan Data Master di database
  - [ ] Verifikasi logika Confidence Score (≥ 85% Auto Link, < 85% masuk Antrean Manual Review)

---

## 🚀 Tahap 5: End-to-End Testing & Polish

- [ ] Tes alur lengkap: Upload File ZIP ➔ AI OCR ➔ Auto-Matching / Manual Review ➔ Status Expiration Warning ➔ Renewal Batch.
- [ ] Verifikasi performa dan kerapian antarmuka pengguna.
