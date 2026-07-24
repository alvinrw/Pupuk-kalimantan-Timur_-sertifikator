# 🗺️ ROADMAP & STATUS BACKEND "SERTIFIKATOR"

Dokumen ini berfungsi sebagai papan pantau (Dashboard) untuk melihat sejauh mana progres pengerjaan Backend (baik NestJS maupun FastAPI) dari proyek Sertifikator ini.

---

## 1️⃣ SERVER AI (FastAPI Python)
Lokasi Folder: `Backend/fastapi-ocr/`
> Server kecil yang tugasnya khusus membaca tulisan di dalam Sertifikat/PDF.

| Modul / Fitur | Status | Catatan / Tanggungan |
| :--- | :---: | :--- |
| **Setup Arsitektur & Routes** | ✅ Selesai | Endpoint `POST /api/v1/ocr/process-pdf` sudah jalan. |
| **Extractor: Fire Alarm** | ✅ Selesai | Script OCR sudah jalan, regex berhasil nge-dapetin tanggal & nomor. |
| **Extractor: Penyalur Petir** | ❌ Belum | (TANGGUNGAN) Memindahkan logika PoC penyalur petir dari `Testing_ocr`. |
| **Autodetect Jenis Sertifikat** | ❌ Belum | (TANGGUNGAN) AI harus bisa otomatis nebak apakah PDF yang dikirim itu SLF, AMDAL, atau Fire Alarm. Saat ini baru di-*hardcode* ke Fire Alarm. |

---

## 2️⃣ SERVER UTAMA (NestJS & Prisma)
Lokasi Folder: `Backend/nest-api/`
> Server besar (API Gateway) yang ngurusin Database dan komunikasi ke Frontend React.

### ✅ Yang Sudah Selesai
| Modul / Folder | Keterangan |
| :--- | :--- |
| **`database` & `schema.prisma`** | Koneksi ke PostgreSQL sudah jalan. Tabel `master_items` dan `certificates` sudah dibuat. |
| **`modules/master-items`** | Fitur CRUD (Create, Read, Update, Delete) Data Pabrik / Aset sudah beres dan jalan lancar. |
| **`modules/ocr`** | Jembatan pengirim PDF ke FastAPI sudah aktif. NestJS sudah bisa ngobrol dengan Python. |

### ⏳ Yang Sedang Dikerjakan (In Progress)
| Modul / Folder | PIC | Keterangan |
| :--- | :---: | :--- |
| **`modules/certificates`** | Temanmu | Sedang mengerjakan logika CRUD khusus sertifikat. |

### ❌ Tanggungan Utama (Belum Dikerjakan)
| Modul / Folder | Tingkat Kepentingan | Apa yang Kurang? |
| :--- | :---: | :--- |
| **Relasi Database (Prisma)** | 🔥 CRITICAL | API `master-items` belum nampilin data Sertifikat bawaannya pas dipanggil (*join table* belum dipakai). |
| **`modules/permits`** | 🟡 Medium | Tabel `Permits` (Perizinan non-sertifikat) belum dibikin di database. Kodingan CRUD masih kosong. |
| **`modules/document-history`** | 🟡 Medium | Tabel untuk nyatet log Riwayat Dokumen belum ada. |
| **`modules/monitoring`** | 🟡 Medium | Tabel *Logging* dan *cronjob* buat nge-cek sertifikat mana yang mau *expired* (H-30) belum dibuat. |
| **Koneksi Frontend** | 🔥 CRITICAL | Website React saat ini masih pakai data bohongan, harus segera disambungkan ke API NestJS ini. |

---

## 🚀 Prioritas Selanjutnya (Next Action)
Sesuai **Implementation Plan** yang barusan diajukan, fokus kita selanjutnya adalah merapikan urusan **Database**:
1. Mendesain tabel-tabel sisanya di `schema.prisma`.
2. Melakukan *sync* ke PostgreSQL.
3. Memperbaiki fungsi `findAll()` di `master-items` agar langsung membawa data sertifikat (Relasi).
