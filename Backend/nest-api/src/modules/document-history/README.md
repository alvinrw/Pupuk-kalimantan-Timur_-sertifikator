# 📑 Modul: Document History & File Storage (`document-history`)

> **Fokus Utama**: Modul ini bertanggung jawab mengelola proses penerimaan **File (seperti PDF)** dari klien (*frontend*) melalui multipart/form-data, dan mengunggahnya secara aman ke *Brankas File* S3-compatible (**MinIO Storage**), serta mengembalikan informasi akses URL file tersebut.

---

## 🎯 Tujuan Utama Modul

1. **File Receiver (Multer)**: Menyediakan *endpoint* yang secara otomatis mencegat (*intercept*) kiriman *multipart/form-data* dari klien, mengekstrak file, dan memvalidasi tipe file serta batas ukurannya.
2. **MinIO Uploader**: Melakukan inisialisasi koneksi dengan MinIO Server (via MinIO SDK), memastikan *bucket* tujuan (*sertifikator-docs*) tersedia, lalu melakukan *streaming upload* file (*buffer*).
3. **URL Generator**: Setelah *upload* berhasil, modul akan mengembalikan URL langsung ke aset tersebut agar *frontend* bisa menampilkannya.
4. **Isolasi Logika**: Seluruh logika yang bersinggungan dengan *upload* file dan riwayat dokumen dibatasi secara eksklusif dalam folder `src/modules/document-history/`.

---

## 🛠️ Spesifikasi API & Payload

### 1. `POST /api/v1/document-history/upload`
Mengunggah satu buah dokumen ke sistem MinIO dan mencatat jejak penyimpanannya.

- **Content-Type**: `multipart/form-data`
- **Body / Payload**:
  - `file` *(File)*: Dokumen asli (PDF/JPG/PNG) yang ingin diunggah. Maksimal 5MB.

- **Response Body Example (`201 Created`)**:
```json
{
  "statusCode": 201,
  "message": "File berhasil diunggah ke storage MinIO!",
  "data": {
    "originalName": "Sertifikat_Bejana.pdf",
    "fileName": "1698765432-Sertifikat_Bejana.pdf",
    "mimeType": "application/pdf",
    "size": 1024500,
    "url": "http://localhost:9000/sertifikator-docs/1698765432-Sertifikat_Bejana.pdf"
  }
}
```

- **Error Response Example (`500 Internal Server Error`)**:
```json
{
  "message": "Gagal mengunggah file ke MinIO storage (pastikan container MinIO hidup)",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

---

## 🗺️ Step-by-Step Pengerjaan & Alur (Internal)

1. **Instalasi Dependensi**: 
   Dibutuhkan `minio`, `@types/minio`, dan `@types/multer` untuk *type-safety* dan utilitas *upload*.
2. **Konfigurasi MinIO Service**:
   Membaca `.env` (`MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_NAME`), menginisialisasi `Minio.Client`.
3. **Pengecekan Bucket (Bucket Checking)**:
   Service akan melakukan verifikasi (`bucketExists`); jika `sertifikator-docs` belum ada, ia akan membuatkannya secara otomatis (`makeBucket`).
4. **Penamaan Unik (File Renaming)**:
   Mencegah tabrakan nama file dengan cara menambahkan cap waktu (*timestamp*) unik sebelum nama asli file.
5. **Streaming Upload (PutObject)**:
   Menyuntikkan `file.buffer` dan ukuran file langsung ke *storage* agar tidak memberatkan memori sistem (tanpa perlu menyimpan file di diska lokal `/tmp` terlebih dahulu).

---

## 📁 Struktur Berkas Terisolasi
```text
src/modules/document-history/
├── document-history.controller.ts  (Router & Multer Interceptor)
├── document-history.service.ts     (MinIO Upload Engine & Logic)
├── document-history.module.ts      (DI & Pendaftaran modul)
└── README.md
```

---

## 🧪 Cara Pengujian / Verifikasi

1. **Jalankan NestJS Server**:
   ```bash
   cd Backend/nest-api
   npm run start:dev
   ```
2. **Uji via Swagger UI**:
   - Buka browser di `http://localhost:3001/api/docs`.
   - Cari bagian **Document History** -> `POST /upload`.
   - Klik **Try it out**, pilih file dari komputer Anda (Choose File), lalu klik **Execute**.
3. **Uji via MinIO Console**:
   - Jika Anda memiliki MinIO Console berjalan, login dengan `minioadmin` / `minioadmin` (Port 9001).
   - Masuk ke *bucket* `sertifikator-docs` dan verifikasi apakah file Anda benar-benar tersimpan!

---

## ✅ Pencapaian Tahap 1 (Selesai)

Berikut adalah ringkasan pekerjaan yang telah berhasil kita selesaikan dan uji secara nyata pada tahap ini:

1. **Penyelesaian Konflik Port Backend**
   - Menemukan dan mengatasi konflik `EADDRINUSE` (Port 3001) agar server NestJS dapat menyala dan merender Swagger UI tanpa bentrok dengan layanan lain.
2. **Setup Lingkungan Infrastruktur (Docker & WSL)**
   - Berhasil mendiagnosis dan "membangunkan" Docker Desktop/WSL2 yang nyangkut menggunakan `wsl --shutdown`.
   - Menyesuaikan eksekusi `docker-compose up -d` langsung ke kontainer infrastruktur murni (`postgres`, `minio`, `createbuckets`) untuk menghindari gagal *build* dan bentrok *port* Redis yang sudah berjalan di *host*.
3. **Verifikasi End-to-End MinIO Upload**
   - Menguji langsung unggah file PDF melalui **Swagger UI**.
   - Membuktikan bahwa `DocumentHistoryService` secara otomatis menginisialisasi sambungan, menggunakan *bucket* `sertifikator-docs`, membubuhi awalan *timestamp* ke nama file, dan melakukan proses *upload buffer* memori secara sempurna.
   - Hasil unggahan tervalidasi dapat diakses langsung oleh *browser* melalui MinIO *URL* dengan kode kembalian API `201 Created`.
