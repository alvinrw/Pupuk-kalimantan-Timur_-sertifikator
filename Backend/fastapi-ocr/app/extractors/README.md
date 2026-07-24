# 🧠 Folder: Extractors (`app/extractors`)

> **Fungsi Utama**: Ini adalah "Dapur" atau "Otak" AI dari aplikasi OCR kita.

## 📋 Apa yang Dikerjakan di Sini?
Di sinilah tempat kamu menaruh script riset buatanmu (yang tadinya ada di folder `Testing_ocr`). 
Karena format setiap sertifikat itu berbeda-beda, kita memisahkannya menjadi file-file kecil yang spesifik.

**Contoh File yang Akan Ada di Sini:**
1. `fire_alarm.py`: Khusus berisi logika OCR, *Regex*, dan pemotongan kata untuk Sertifikat Fire Alarm.
2. `penyalur_petir.py`: Khusus berisi logika untuk Sertifikat Penyalur Petir.

**Alur Kerja di File Extractor:**
1. Menerima file gambar/PDF dari *Router*.
2. Membaca gambar menggunakan `RapidOCR`.
3. Mengekstrak baris-per-baris teks yang didapatkan.
4. Mencari "Nomor Surat", "Tanggal Terbit", "Expired" menggunakan *Regex*.
5. Merapikan data tersebut ke dalam sebuah *Dictionary/JSON* dan mengembalikannya ke *Router*.

Kalau kamu sadar ada AI yang salah baca huruf (misal angka 0 dibaca huruf O), **perbaikinya di folder ini!**
