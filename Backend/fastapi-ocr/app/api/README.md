# 🚪 Folder: API (`app/api`)

> **Fungsi Utama**: Bertindak sebagai "Pintu Masuk" atau Resepsionis bagi server FastAPI.

## 📋 Apa yang Dikerjakan di Sini?
Folder ini HANYA berisi file *router* (jalur URL). Semua *request* dari NestJS akan masuk lewat sini dulu.
Tugas file di dalam folder ini (misalnya `ocr_routes.py`):
1. Menerima file gambar/PDF yang di-upload dari NestJS.
2. Mengecek file tersebut (apakah ukurannya wajar, apakah beneran PDF/gambar).
3. Mengoper file tersebut ke folder `extractors` sesuai jenis sertifikatnya.
4. Mengembalikan respons berwujud JSON kembali ke NestJS.

**ATURAN PENTING**: JANGAN menaruh logika pembacaan OCR / *regex* / AI di dalam folder ini! Biarkan folder ini tetap bersih dan hanya bertugas sebagai pengarah jalan (Router).
