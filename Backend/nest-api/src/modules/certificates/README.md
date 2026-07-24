# 📜 Modul: Multi-Certificates Hub (`certificates`)

> **STATUS: ✅ 100% SELESAI (COMPLETE)**
> Modul ini sudah rampung. Tabel Certificate dan Relasi ke tabel Aset sudah terbuat. Seluruh API CRUD Sertifikat sudah berfungsi normal. Tidak ada lagi tanggungan kodingan di folder ini.

> **Fokus Utama**: Modul ini bertanggung jawab mengelola relasi **Multi-Certificate** (Sertifikat/Surat Izin yang terhubung ke suatu Produk/Aset/Proyek).
> **Konsep Baru (Relasi / Foreign Key)**: Satu Aset (contoh: Pabrik Urea) bisa punya BANYAK Sertifikat (SLF, Amdal, Izin Lingkungan). Oleh karena itu, kita akan belajar menghubungkan 2 tabel!

---

## 🗺️ Step-by-Step Pengerjaan

### STEP 1: Update Skema Database (Prisma)
Kita akan menambahkan tabel baru bernama `Certificate` di file `prisma/schema.prisma` yang terhubung (berelasi) dengan tabel `MasterItem`.
- Menambahkan model `Certificate` dengan kolom: `id`, `itemId` (Foreign Key), `jenisSertifikat`, `noSertifikat`, `instansi`, `terbit`, `expired`, `status`.
- Menjalankan `npx prisma db push` untuk membuat tabelnya di PostgreSQL.

### STEP 2: Pembuatan DTO (Validasi Input)
Membuat "Penjaga Pintu" untuk memastikan JSON dari Frontend valid.
- `create-certificate.dto.ts`
- `update-certificate.dto.ts`

### STEP 3: Koding Endpoint API
Mengedit file `certificates.controller.ts` dan `certificates.service.ts` untuk membuat 4 endpoint sakti:
- [x] **`GET /api/v1/certificates/item/:itemId`**: Ambil seluruh daftar sertifikat milik 1 Aset/Proyek tertentu.
- [x] **`POST /api/v1/certificates`**: Tambah sertifikat baru yang terhubung ke suatu Aset.
- [x] **`PUT /api/v1/certificates/:id`**: Update rincian sertifikat (misal: perpanjang tanggal expired).
- [x] **`DELETE /api/v1/certificates/:id`**: Hapus sertifikat.

---

## 📁 Struktur File Target
```text
certificates/
├── dto/
│   ├── create-certificate.dto.ts
│   └── update-certificate.dto.ts
├── certificates.controller.ts    (Tempat mendefinisikan URL API)
├── certificates.service.ts       (Tempat memanggil query database)
└── certificates.module.ts
```
