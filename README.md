# 📄 Sertifikator — Enterprise Permit Intelligence Platform

> **Sertifikator** adalah platform manajemen perizinan & sertifikasi terpusat berbasis AI (*Enterprise Permit Management System*) yang dirancang untuk mengelola seluruh dokumen legal, perizinan aset, sertifikasi peralatan pabrik, hingga produk industri secara terstruktur, otomatis, dan akurat.

Sistem ini mengintegrasikan pengolahan data master, ekstraksi PDF berbasis **OCR & Artificial Intelligence**, pencocokan entitas (*Entity Matching*) dengan *Confidence Scoring*, pemantauan masa berlaku (*Expiration Monitoring*), hingga alur perpanjangan massal (*Batch Renewal Workflow*).

---

## 📸 Fitur Utama

- 📊 **Interactive Executive Dashboard**: Ringkasan real-time total sertifikat, status kelayakan, sertifikat akan/telah expired, serta akurasi ekstraksi OCR.
- ⚡ **Bulk Upload & AI Processing Pipeline**: Pengunggahan file ZIP berisi ratusan/ribuan sertifikat PDF yang secara otomatis diproses melalui pipeline OCR (PaddleOCR/Tesseract), pembersihan teks, klasifikasi dokumen, dan ekstraksi metadata.
- 🤖 **Automated Entity Matching & Confidence Scoring**: Pencocokan hasil ekstraksi dokumen dengan data master (CSV) menggunakan string similarity & fuzzy matching. Dokumen dengan *confidence score* tinggi otomatis terhubung, sedangkan *confidence score* rendah masuk ke antrean *Manual Review*.
- 🏢 **Multi-Kategori Perizinan**:
  1. **Peralatan Pabrik** (Boiler, Bejana Tekan, Pesawat Angkat & Angkut, Tangki Timbun B3, dll.)
  2. **Perizinan Aset & Bangunan** (Sertifikat HGB, Izin Lokasi, AMDAL, Kelayakan Bangunan)
  3. **Administrasi & Kekayaan Intelektual (HAKI)** (Hak Cipta, Paten, Merek, Lisensi Operasional)
  4. **Perizinan Proyek & Konstruksi** (PBG/IMB, Sertifikat Laik Fungsi Proyek)
  5. **Perizinan & Sertifikasi Produk** (SNI Urea/NPK, Sertifikat Halal, Registrasi Edar Kementan)
- ⏱️ **Monitoring Masa Berlaku & Status Dual-Level**:
  - **Status Kelayakan Objek (*Permit Condition*)**: `Layak`, `Repair`, `Tidak Layak` (berdasarkan inspeksi teknis lapangan).
  - **Status Sertifikasi (*Certification Status*)**: `Belum Diajukan`, `Sedang Diproses`, `Menunggu Verifikasi`, `Aktif`, `Akan Expired` (≤ 30 hari), `Expired`.
- 📦 **Batch Renewal Workflow**: Fitur pembuatan paket pengajuan perpanjangan sertifikat secara massal berdasarkan instansi penerbit (Disnaker, Sucofindo, RINA, KLHK, Kementan, dll.).
- 📥 **CSV Master Data Import**: Dukungan impor data master perizinan dari berbagai divisi perusahaan via CSV.

---

## 🏗️ Arsitektur & Struktur Direktori

```text
Inventor/
├── Backend/                        # [Back-end Service] Modul OCR, AI Inference Engine, DB Engine (Python / FastAPI)
├── frontent/                       # [Front-end Service] Dashboard UI & Enterprise Portal (React + Vite + TailwindCSS)
│   ├── public/                     # Asset statis
│   ├── src/
│   │   ├── components/             # Component UI & Modal (ZipOcrModal, CsvImportModal, SingleEntryModal, dll.)
│   │   ├── data/                   # Mock Data & State Definitions (mockData.js)
│   │   ├── pages/                  # Halaman Aplikasi (Dashboard, PeralatanPabrik, MonitoringSertifikasi, dll.)
│   │   ├── App.jsx                 # Routing & State Orchestration Utama
│   │   └── main.jsx                # Entrypoint React
│   ├── package.json
│   └── vite.config.js
├── stitch_task_management_system/  # Dokumentasi & Wireframe Referensi UI
├── task.md                         # Spesifikasi Bisnis & Kebutuhan AI Pipeline Lengkap
└── README.md                       # Dokumentasi Utama Proyek
```

---

## 🔄 AI Processing Pipeline

```text
[ Data Master (CSV) ] ──────────┐
                                ├──> [ Database / Master Store ]
[ ZIP File (Ratusan PDF) ] ─────┘
            │
            ▼
┌─────────────────────────┐
│  1. Extract PDF         │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  2. OCR Text Extraction │ (PaddleOCR / Tesseract / EasyOCR)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  3. Text Cleaning       │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  4. Document Classify   │ (Sertifikat Kalibrasi, K3, Laik Operasi, ISO, Halal, dll.)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  5. Info Extraction     │ (No Sertifikat, Nama Peralatan/Aset, Expiry Date, Instansi, dll.)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  6. Entity Matching     │ (Fuzzy matching + String similarity)
└───────────┬─────────────┘
            ▼
      [ Confidence Score ]
       ├── High (≥ 85%) ──> Auto Link ke Data Master ──> Update Status: Aktif
       └── Low  (< 85%) ──> Manual Review Queue (Verifikasi Admin)
```

---

## 🚀 Cara Menjalankan Aplikasi (Frontend & Backend)

### Prasyarat
- **Node.js**: v18.x atau lebih baru
- **npm** / **yarn** / **pnpm**
- **Docker Desktop** (harus dalam kondisi aktif/berjalan)

> [!IMPORTANT]  
> Pastikan **Docker Desktop** sudah dibuka dan berjalan di *background* sebelum menjalankan backend, karena database PostgreSQL berjalan di dalam *container* Docker.

### Langkah 1: Menjalankan Backend (NestJS & Database)

Buka terminal baru dan jalankan perintah berikut:

1. **Masuk ke direktori backend**:
   ```bash
   cd backend/nest-api
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Database via Docker Compose**:
   ```bash
   docker-compose up -d
   ```
   *(Pastikan tidak ada error dan container postgres berjalan).*

4. **Jalankan Migrasi Database (Prisma)**:
   ```bash
   npx prisma migrate dev
   ```

5. **Jalankan Backend Server**:
    ```bash
    npm run start:dev
    ```
    Backend akan berjalan di `http://localhost:3000`.

### Langkah 2: Menjalankan Backend AI OCR (Python FastAPI)

Backend ini bertugas memproses gambar dari drag-and-drop Frontend menggunakan mesin AI PaddleOCR. Buka terminal baru (biarkan terminal NestJS tetap berjalan), lalu:

1. **Masuk ke direktori fastapi-ocr**:
   ```bash
   cd backend/fastapi-ocr
   ```

2. **Jalankan Server Uvicorn (FastAPI)**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Server AI OCR akan berjalan di `http://127.0.0.1:8000`.

### Langkah 3: Menjalankan Frontend (React)

Buka terminal baru lagi, lalu jalankan perintah berikut:

1. **Masuk ke direktori frontend**:
   ```bash
   cd frontent
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. **Buka di Browser**:
   Buka URL yang ditampilkan di terminal (biasanya `http://localhost:5173`).

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 19
  - Vite 5
  - TailwindCSS 4
  - Lucide React (Icon System)
  - Recharts (Analytics & Charting)
- **Backend & AI Pipeline (Rencana Integrasi)**:
  - Python / FastAPI
  - PaddleOCR / Tesseract OCR
  - Levenshtein / FuzzyWuzzy (Entity Matching)
  - PostgreSQL / SQLAlchemy

---

## 📄 Spesifikasi Lengkap

Untuk mempelajari rancangan bisnis, alur pengujian, logika *expiration*, notifikasi, hingga *future roadmap* secara mendalam, silakan merujuk ke dokumentasi [task.md](./task.md).
