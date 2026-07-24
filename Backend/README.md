# 🛠️ Backend Sertifikator

Selamat datang di modul **Backend Sertifikator**. Modul ini dirancang dengan arsitektur microservices modern yang terpisah secara modular antara **API Gateway & Business Logic** (NestJS) dan **AI/OCR Processing Service** (FastAPI).

---

## 📁 Struktur Direktori Backend

```text
Backend/
├── nest-api/                           # 🟢 MAIN API SERVICE (NestJS / Node.js)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                   # [Otentikasi] Login, JWT token, Role-Based Access Control
│   │   │   ├── equipment/              # [Data Master] Data Peralatan Pabrik, Aset, Lokasi, Divisi
│   │   │   ├── permits/                # [Perizinan] Sertifikat, Expiration Engine, Status Kelayakan
│   │   │   ├── ocr/                    # [OCR Client] Orkestrasi Upload ZIP ke FastAPI & Manual Review Queue
│   │   │   └── storage/                # [Storage Engine] Koneksi Upload/Download File ke MinIO (S3)
│   │   ├── database/                   # [DB Schema] PostgreSQL Connection & TypeORM / Prisma Entities
│   │   ├── common/                     # [Helper] Filter Exception, Interceptors, Guards, Utilities
│   │   ├── app.module.ts               # Root Module NestJS
│   │   └── main.ts                     # Entrypoint Server NestJS (Port 3000)
│   ├── package.json
│   └── tsconfig.json
│
├── fastapi-ocr/                        # 🟡 AI & OCR SERVICE (FastAPI / Python)
│   ├── app/
│   │   ├── api/                        # [REST Endpoints] Router untuk /process-zip & /process-pdf
│   │   ├── ocr_engine/                 # [OCR Engine] Modul PaddleOCR / Tesseract PDF Reader
│   │   ├── extractor/                  # [Rule Engine] Ekstraksi No. Sertifikat, Expiry Date, Instansi
│   │   ├── matching/                   # [Entity Matcher] String Similarity & Fuzzy Confidence Score
│   │   ├── core/                       # [Config] Environment variables & App settings
│   │   └── main.py                     # Entrypoint Server FastAPI (Port 8000)
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml                  # 🐳 Container Orchestration (Postgres, MinIO, Redis, NestJS, FastAPI)
└── README.md                           # Dokumentasi ini
```

---

## 🚀 Panduan Ringkas Menjalankan Service

### 1. Menggunakan Docker Compose (Rekomendasi Utama)

Pastikan **Docker Desktop** sudah aktif di komputer kamu, kemudian jalankan:

```bash
# Jalankan seluruh service (PostgreSQL, MinIO, Redis, NestJS, FastAPI)
docker-compose up -d
```

Service akan aktif di port berikut:
- **NestJS API**: `http://localhost:3000`
- **FastAPI OCR**: `http://localhost:8000` (Dokumentasi Swagger di `http://localhost:8000/docs`)
- **MinIO Console**: `http://localhost:9001` (User: `minioadmin`, Pass: `minioadmin`)
- **PostgreSQL**: `localhost:5432` (DB: `sertifikator_db`)

---

## 🔑 Fungsi Masing-Masing Modul

### 1. `nest-api` (NestJS)
- Bertindak sebagai gerbang utama (*API Gateway*) untuk aplikasi **React Frontend**.
- Menyimpan dan memproses CRUD Data Master Peralatan, Sertifikat, dan Notifikasi.
- Menyediakan otentikasi pengguna (Admin, Tim HSE, Inspector).
- Berkomunikasi dengan **MinIO** untuk menyimpan dokumen asli `.pdf` dan file `.zip`.

### 2. `fastapi-ocr` (FastAPI Python)
- Bertugas khusus menerima file PDF / ZIP dari NestJS.
- Membaca teks dokumen menggunakan **PaddleOCR**.
- Mengekstrak field penting (Tanggal Berlaku, Nomor Sertifikat, Nama Peralatan) menggunakan **Rule Engine NLP**.
- Menghitung **Confidence Score** pencocokan dengan Data Master.
