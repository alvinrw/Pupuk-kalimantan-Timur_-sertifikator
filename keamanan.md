# 🔒 Dokumen Keamanan — Platform Sertifikator PKT

> **Versi:** 1.0
> **Tanggal:** 26 Agustus 2026
> **Tim:** PKT Sertifikator Development Team
> **Status:** Internal — Rahasia

---

## 1. Arsitektur Keamanan

```
┌─────────────────────────────────────────────────────────┐
│                    Internet / Intranet                   │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS (produksi)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              React Frontend (Vite)                      │
│  - Token disimpan di sessionStorage (bukan localStorage)│
│  - Kirim token via Authorization: Bearer <token>        │
│  - Tidak ada secret di kode frontend                    │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (HTTPS)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              NestJS API Gateway                         │
│  - CORS: whitelist origin spesifik (ALLOWED_ORIGINS)    │
│  - Global Rate Limiting: 100 req/menit (ThrottlerGuard) │
│  - Login Rate Limit: 5 percobaan/menit per IP           │
│  - JWT Authentication (Bearer Token)                    │
│  - Role-Based Access Control (RBAC)                     │
│  - Input Validation (ValidationPipe whitelist=true)     │
│  - Body limit: 5MB                                      │
└───────────┬─────────────────────────┬───────────────────┘
            │                         │
            ▼                         ▼
┌───────────────────┐     ┌───────────────────────────────┐
│   PostgreSQL DB   │     │      MinIO Object Storage     │
│   (Prisma ORM)    │     │   (PDF / Dokumen Sertifikat)  │
└───────────────────┘     └───────────────────────────────┘
```

---

## 2. Sistem Autentikasi dan Otorisasi

### 2.1 Hierarki Role

| Role | Akses |
|---|---|
| **Super Admin** | Semua fitur + manajemen user. Tidak bisa dihapus. |
| **Admin 1/2/3** | Semua fitur kecuali hapus Super Admin |
| **User** | Baca + input data + upload dokumen |
| **Viewer** | Hanya baca data (read-only) |

### 2.2 JWT Token

- **Algoritma:** HS256
- **Masa Berlaku:** 1 hari (dikonfigurasi via JWT_EXPIRES_IN)
- **Penyimpanan:** sessionStorage (terhapus saat tab/browser ditutup)
- **Transmisi:** Hanya via Authorization: Bearer header (TIDAK via URL)

---

## 3. Kebijakan Environment Variables

Semua kredensial sensitif WAJIB disimpan di file .env dan TIDAK BOLEH di-commit ke Git.

### Variabel Wajib untuk Produksi

| Variable | Keterangan |
|---|---|
| JWT_SECRET | Kunci JWT — min 64 karakter acak |
| JWT_EXPIRES_IN | Masa berlaku token (contoh: 1d) |
| ALLOWED_ORIGINS | Whitelist domain frontend |
| DATABASE_URL | Koneksi PostgreSQL |
| MINIO_ACCESS_KEY | Username MinIO — jangan gunakan default |
| MINIO_SECRET_KEY | Password MinIO — min 16 karakter |
| NODE_ENV | Wajib diset ke "production" di server |

### Cara Generate JWT_SECRET yang Kuat

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 4. Mekanisme Perlindungan yang Aktif

### Rate Limiting (Anti Brute-Force)

| Endpoint | Limit | TTL |
|---|---|---|
| POST /auth/login | 5 request | 60 detik |
| Semua endpoint lain | 100 request | 60 detik |

Jika limit terlampaui, server mengembalikan 429 Too Many Requests.

### Perlindungan Lain

- **CORS Whitelist** — hanya menerima request dari origin di ALLOWED_ORIGINS
- **Input Validation** — ValidationPipe whitelist aktif, field asing ditolak (400)
- **Password Hashing** — bcrypt dengan cost factor 10
- **Endpoint Protection** — semua endpoint (kecuali login) dilindungi JwtAuthGuard + RolesGuard
- **Swagger Disabled** — dokumentasi API tidak bisa diakses saat NODE_ENV=production
- **Body Limit** — maksimal 5MB per request

---

## 5. Checklist Pra-Deploy (WAJIB)

### Konfigurasi
- [ ] NODE_ENV=production sudah diset
- [ ] JWT_SECRET sudah diganti dengan string acak min 64 karakter
- [ ] ALLOWED_ORIGINS hanya berisi domain produksi
- [ ] Kredensial MinIO sudah diganti dari nilai default
- [ ] File .env ada di .gitignore dan tidak di-commit

### Infrastruktur
- [ ] API berjalan di belakang HTTPS
- [ ] Port MinIO (9000) tidak terekspos ke internet
- [ ] Port PostgreSQL (5432) tidak terekspos ke internet
- [ ] Swagger /api/docs tidak bisa diakses

### Kode
- [ ] Tidak ada kata "sementara" atau "SECRET_KEY_SEMENTARA" di kode
- [ ] Semua endpoint baru menggunakan JwtAuthGuard

---

## 6. Prosedur Respons Insiden

### Jika JWT Secret Bocor

1. Ganti JWT_SECRET di .env produksi dengan nilai baru
2. Restart server NestJS — semua token lama langsung invalid
3. Beritahu semua pengguna untuk login ulang
4. Periksa ActivityLog untuk aktivitas mencurigakan

### Jika Kredensial Database Bocor

1. Ubah password PostgreSQL segera
2. Update DATABASE_URL di .env
3. Restart server dan audit query history

### Jika Kredensial MinIO Bocor

1. Ubah access key dan secret key di MinIO Admin Console
2. Update MINIO_ACCESS_KEY dan MINIO_SECRET_KEY di .env
3. Restart server dan periksa file yang diakses secara tidak wajar

---

## 7. Riwayat Pembaruan

| Tanggal | Versi | Perubahan |
|---|---|---|
| 26 Agustus 2026 | 1.0 | Dokumen awal dibuat berdasarkan hasil audit keamanan |

---

*Dokumen ini harus diperbarui setiap kali ada perubahan arsitektur keamanan yang signifikan.*
