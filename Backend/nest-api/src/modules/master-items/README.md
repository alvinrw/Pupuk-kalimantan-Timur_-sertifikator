# 📦 Modul: Master Items (`master-items`)

> **STATUS: ✅ 100% SELESAI (COMPLETE)**
> Modul ini sudah rampung. Tabel di database sudah terbuat dan seluruh API CRUD (GET, POST, PUT, DELETE) sudah berfungsi normal. Tidak ada lagi tanggungan kodingan di folder ini.

> **Fokus Utama**: Modul ini bertanggung jawab mengelola **Data Induk (Master Data)** Perizinan Aset, Proyek, Produk, dan Peralatan Pabrik. 
> **Catatan Penting**: Modul ini **TIDAK MENGURUS FILE PDF / MINIO**. Modul ini murni hanya operasi CRUD (Create, Read, Update, Delete) ke Database PostgreSQL.

---

## 🗺️ Step-by-Step Pengerjaan (Untuk Pemula)

### STEP 1: Instalasi & Setup Prisma ORM (Database)
Karena ini modul pertama yang dikerjakan di backend, kamu wajib melakukan inisialisasi koneksi database dulu:
1. Buka terminal di folder `Backend/nest-api/`.
2. Install Prisma: `npm install prisma --save-dev` dan `npm install @prisma/client`.
3. Inisialisasi Prisma: `npx prisma init`.
   - *Ini akan membuat folder `prisma/schema.prisma` dan file `.env`.*
4. Buka `.env` dan pastikan URL databasenya mengarah ke Docker:
   `DATABASE_URL="postgresql://postgres:password123@localhost:5432/sertifikator_db?schema=public"`

### STEP 2: Membuat Tabel di Database
1. Buka file `prisma/schema.prisma`.
2. Buat tabel `MasterItem`:
   ```prisma
   model MasterItem {
     id           String   @id @default(uuid())
     code         String?  // Kode Perizinan (Opsional)
     title        String   // Nama Produk / Aset / Proyek
     categoryKey  String   // 'perizinan-aset', 'perizinan-proyek', dll
     unitLocation String?  // Lokasi / Unit Pabrik
     status       String   @default("Aktif")
     luasM2       String?
     luasHa       String?
     peruntukan   String?
     issueDate    String?  // Boleh String (YYYY-MM-DD) atau DateTime
     expiryDate   String?
     keterangan   String?
     
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt
   }
   ```
3. Push tabel ini ke database Docker: `npx prisma db push`.

### STEP 3: Membuat Kerangka NestJS
NestJS punya fitur "Auto-Generate" kodingan. Jalankan command ini di terminal (`Backend/nest-api/`):
1. `npx nest g module modules/master-items`
2. `npx nest g service modules/master-items`
3. `npx nest g controller modules/master-items`

### STEP 4: Koding Endpoint (API)
Sekarang buka file `master-items.controller.ts` dan `master-items.service.ts` yang baru saja terbuat, dan buat 5 endpoint berikut:

- [x] **`GET /api/master-items`**
  - **Tugas**: Ambil semua data dari database. 
  - **Query Filter**: Harus bisa memfilter data. Contoh kalau frontend memanggil `/api/master-items?categoryKey=perizinan-aset`, maka backend hanya membalas data Aset.
- [x] **`GET /api/master-items/:id`**
  - **Tugas**: Ambil 1 baris data secara spesifik berdasarkan ID.
- [x] **`POST /api/master-items`**
  - **Tugas**: Terima JSON dari frontend (Body) lalu `prisma.masterItem.create()` ke database.
- [x] **`PUT /api/master-items/:id`**
  - **Tugas**: Update data (contoh: mengganti status dari Aktif ke Afkir).
- [x] **`DELETE /api/master-items/:id`**
  - **Tugas**: Hapus data dari tabel.

---

## 📁 Struktur File Setelah Selesai
Nantinya folder ini akan terlihat seperti ini:
```text
master-items/
├── dto/
│   ├── create-master-item.dto.ts (Aturan JSON saat POST)
│   └── update-master-item.dto.ts (Aturan JSON saat PUT)
├── master-items.controller.ts    (Tempat mendefinisikan GET/POST/PUT/DELETE)
├── master-items.service.ts       (Tempat memanggil query Prisma)
└── master-items.module.ts        (File pendaftaran modul)
```
