# 📊 Modul: Monitoring & Expiry Engine (`monitoring`)

> Modul ini bertanggung jawab menghitung masa berlaku/sisa hari sertifikat secara dinamis, menyediakan data statistik monitoring perizinan perusahaan, dan mengelompokkan urutan sertifikat berdasarkan tingkat urgensi kadaluarsa.

---

## 🎯 Tujuan Utama Modul

1. **Engine Hitung Sisa Hari Dinamis**: Menghitung selisih hari antara tanggal hari ini (`todayDate`) dengan tanggal kadaluarsa sertifikat (`expiredDate`).
2. **Kategori Status Otomatis (Expiration Logic)**:
   - **`EXPIRED`**: Jika `sisaHari <= 0` (Sertifikat telah kadaluarsa).
   - **`PERPANJANG` / `AKAN_EXPIRED`**: Jika `0 < sisaHari <= 30` (Sertifikat memerlukan perhatian khusus/perpanjangan).
   - **`AKTIF`**: Jika `sisaHari > 30` (Sertifikat masih berlaku aman).
   - **`AFKIR`**: Sertifikat/Peralatan yang sudah dinonaktifkan atau diafkirkan secara eksplisit.
3. **Restricted Folder Scope**: Semua kode logika monitoring hanya berada di dalam folder `src/modules/monitoring/` agar terisolasi dari modul tim lain.

---

## 🛠️ Spesifikasi API & Payload

### 1. `GET /api/monitoring/overview`
Mengembalikan rangkuman statistik agregat status sertifikat.

- **Query Parameters**:
  - `category` *(optional, string)*: Filter berdasarkan kategori (misal: `Peralatan Pabrik`, `Perizinan Aset`, `Perizinan Proyek`, `Sertifikasi Produk`, `Administrasi Lainnya`).
  - `divisi` *(optional, string)*: Filter berdasarkan unit/divisi pemilik aset.

- **Response Body Example (`200 OK`)**:
```json
{
  "statusCode": 200,
  "message": "Berhasil mengambil data statistik monitoring",
  "data": {
    "totalDocuments": 150,
    "aktif": 105,
    "perpanjang": 25,
    "expired": 15,
    "afkir": 5,
    "percentage": {
      "aktif": 70.0,
      "perpanjang": 16.67,
      "expired": 10.0,
      "afkir": 3.33
    }
  }
}
```

---

### 2. `GET /api/monitoring/expiry-list`
Mengembalikan daftar sertifikat lengkap dengan kalkulasi `sisaHari` dinamis dan status otomatis.

- **Query Parameters**:
  - `status` *(optional, string)*: Filter status (`AKTIF` | `PERPANJANG` | `EXPIRED` | `AFKIR`).
  - `category` *(optional, string)*: Filter kategori sertifikat.
  - `search` *(optional, string)*: Kata kunci pencarian (Nama Sertifikat, No. SK, Tag/Nomor Aset).
  - `sortBy` *(optional, string)*: Urutkan berdasarkan (`sisaHari` | `expiredDate` | `namaItem`). Default: `sisaHari`.
  - `order` *(optional, 'asc' | 'desc')*: Urutan (`asc` = paling kritis di atas). Default: `asc`.
  - `page` *(optional, number)*: Halaman pagination (default: `1`).
  - `limit` *(optional, number)*: Jumlah data per halaman (default: `10`).

- **Response Body Example (`200 OK`)**:
```json
{
  "statusCode": 200,
  "message": "Berhasil mengambil daftar monitoring sertifikat",
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  },
  "data": [
    {
      "id": "cert-101",
      "namaItem": "Bejana Tekan Air Compressor",
      "nomorSertifikat": "500/DISNAKER/2021",
      "kategori": "Peralatan Pabrik",
      "divisi": "Pabrik 1A",
      "tanggalTerbit": "2021-05-10T00:00:00.000Z",
      "tanggalExpired": "2026-08-01T00:00:00.000Z",
      "sisaHari": 8,
      "statusDinamis": "PERPANJANG",
      "isAfkir": false
    }
  ]
}
```

---

## 📁 Struktur Berkas Terisolasi

```text
src/modules/monitoring/
├── dto/
│   ├── monitoring-query.dto.ts
│   └── monitoring-response.dto.ts
├── monitoring.controller.ts
├── monitoring.service.ts
├── monitoring.module.ts
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
   Buka browser di `http://localhost:3001/api/docs` lalu coba ikuti endpoint di tag `Monitoring`.
3. **Uji via cURL / Postman**:
   - `curl -X GET http://localhost:3001/api/v1/monitoring/overview`
   - `curl -X GET http://localhost:3001/api/v1/monitoring/expiry-list?status=PERPANJANG&sortBy=sisaHari&order=asc`

---

## 📝 Rekam Jejak Pengerjaan (Changelog)

**Fitur & Modul yang Telah Diselesaikan:**

1. **Pembuatan Endpoint & Logika Monitoring**:
   - `GET /api/v1/monitoring/overview`: Membuat *endpoint* untuk mendapatkan ringkasan statistik (Aktif, Perpanjang, Expired, Afkir) lengkap dengan kalkulasi persentase.
   - `GET /api/v1/monitoring/expiry-list`: Membuat *endpoint* untuk menampilkan daftar sertifikat lengkap dengan kalkulasi `sisaHari` secara *real-time* dan pengurutan otomatis (sisa hari paling kritis/sedikit berada di atas).
   - Mengimplementasikan isolasi logika *business rules* mengenai penentuan rentang status (EXPIRED, PERPANJANG, AKTIF) di dalam `monitoring.service.ts` dengan basis `new Date()`.

2. **Penerapan Struktur Modular (Isolasi Terjaga)**:
   - Dibuat khusus di dalam folder `src/modules/monitoring/` yang terisolasi, meliputi *Controller*, *Service*, *DTO*, dan *Module*.
   - Mendaftarkan `MonitoringModule` ke dalam root `AppModule` tanpa memodifikasi fitur milik tim lain sedikitpun.

3. **Penyelesaian Konfigurasi Lingkungan (Environment)**:
   - Menyediakan file `.env` di dalam `nest-api` dan mengubah *Port* ke `3001` untuk menghindari konflik (*EADDRINUSE* pada Port 3000).
   - Menyesuaikan *Global Prefix* menjadi `/api/v1` dan memastikan halaman **Swagger UI** berjalan mulus untuk memfasilitasi pengujian API mandiri tanpa bergantung pada *frontend*.
   - Menambahkan *container* ke `docker-compose.yml` untuk PostgreSQL dan MinIO sebagai persiapan *database*.
