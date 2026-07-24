# 🤖 Modul: OCR (Jembatan AI)

> **Status**: ✅ **SELESAI (TERINTEGRASI DENGAN FASTAPI)**
> **Fokus Utama**: Modul ini bertugas sebagai JEMBATAN pengirim file antara NestJS (Backend Utama) dan FastAPI Python (Backend AI).

---

## 📋 Apa Saja yang Dikerjakan Modul Ini?
Modul ini **TIDAK** membaca tulisan di dalam PDF. Modul ini hanya bertugas layaknya "Tukang Pos":
1. Menerima kiriman file PDF dari *Frontend* (lewat form-data).
2. Membungkus ulang file tersebut pakai `FormData`.
3. Mengirim (POST) file tersebut ke server Python AI yang ada di `http://127.0.0.1:8000/api/v1/ocr/process-pdf`.
4. Menunggu AI selesai berpikir, lalu menangkap JSON hasilnya.
5. Mengirim balik JSON tersebut ke *Frontend*.

---

## 🛠️ Catatan Penting (Troubleshooting)
Kalau misal besok-besok ada *error* pas *upload* PDF, cek dua hal ini:
1. **Server Python Harus Nyala!** Pastikan terminal Python (FastAPI) kamu sedang jalan (`uvicorn app.main:app --port 8000`). Kalau Python mati, NestJS bakal memunculkan error `AI OCR Service Error: connect ECONNREFUSED`.
2. **Library Axios**: Modul ini sangat bergantung pada `axios` dan `form-data`. Kalau ada *error* soal library, jalankan `npm install @nestjs/axios axios form-data`.

---

## 🗺️ Endpoint yang Tersedia
- `POST /api/v1/ocr/upload-scan`: Menerima key `file` (format multipart/form-data) dan mengembalikan JSON hasil bacaan AI.
