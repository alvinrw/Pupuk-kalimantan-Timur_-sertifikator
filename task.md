# Sertifikator - Business Context

## Project Overview

Sertifikator adalah Enterprise Permit Management System yang dikembangkan untuk membantu perusahaan mengelola seluruh dokumen sertifikasi dan perizinan secara terpusat.

Sistem ini tidak hanya berfungsi sebagai tempat penyimpanan dokumen, tetapi juga mampu melakukan ekstraksi informasi otomatis dari dokumen PDF menggunakan OCR dan Artificial Intelligence, kemudian menghubungkan hasil ekstraksi tersebut dengan data master perusahaan.

Target pengguna utama adalah administrator perusahaan, tim HSE, Quality Assurance, Asset Management, Engineering, Procurement, dan divisi lain yang bertanggung jawab terhadap pengelolaan dokumen legal maupun sertifikasi.

---

# Main Objectives

Sistem harus mampu:

- Menyimpan seluruh data perizinan perusahaan.
- Menyimpan seluruh file sertifikat.
- Mengelola masa berlaku sertifikat.
- Menghubungkan sertifikat dengan data master perusahaan.
- Melakukan OCR terhadap dokumen PDF.
- Mengekstrak informasi penting dari sertifikat.
- Memberikan monitoring status sertifikasi.
- Memberikan notifikasi sebelum sertifikat berakhir.

---

# Permit Categories

Terdapat lima kategori utama.

1. Peralatan Pabrik
2. Perizinan Aset
3. Administrasi Lainnya
4. Perizinan Proyek
5. Perizinan Produk

Seluruh kategori memiliki struktur data yang sama.

---

# Data Source

Data berasal dari dua sumber.

## 1. CSV

CSV dikirim oleh masing-masing divisi.

CSV berisi data master.

Contoh:

- Nama
- Divisi
- Nomor Asset
- Nomor Sertifikat
- Lokasi
- Keterangan

CSV hanya berisi metadata.

Tidak terdapat file PDF.

---

## 2. ZIP

Administrator mengunggah satu file ZIP yang berisi seluruh dokumen sertifikat.

Contoh:

sertifikat.zip

├── Boiler.pdf
├── Forklift.pdf
├── ISO9001.pdf
├── Produk_A.pdf
├── ...

Jumlah file dapat mencapai ratusan bahkan ribuan.

---

# AI Processing Pipeline

Setelah ZIP diunggah.

AI akan melakukan proses berikut.

1. Extract seluruh PDF.

2. OCR seluruh halaman.

3. Membersihkan hasil OCR.

4. Melakukan klasifikasi dokumen.

5. Mengekstrak informasi penting.

6. Melakukan entity matching.

7. Menghubungkan dokumen dengan data CSV.

8. Mengupdate database.

---

# OCR

OCR hanya bertugas mengubah gambar menjadi teks.

OCR tidak menentukan isi informasi.

OCR yang digunakan:

- PaddleOCR

Alternatif:

- Tesseract
- EasyOCR

---

# Information Extraction

AI harus mampu mengenali informasi berikut apabila tersedia.

- Nomor Sertifikat
- Nama Sertifikat
- Jenis Sertifikat
- Nama Peralatan
- Nama Produk
- Nama Aset
- Nama Proyek
- Instansi Penerbit
- Tanggal Terbit
- Tanggal Berlaku
- Tanggal Berakhir
- Nomor Dokumen

Tidak semua dokumen memiliki seluruh field.

AI harus mengisi field yang tersedia.

---

# Document Classification

AI harus mampu mengenali jenis dokumen.

Contoh:

- Sertifikat Kalibrasi
- Sertifikat Halal
- Sertifikat BPOM
- Sertifikat ISO
- Sertifikat SNI
- Sertifikat K3
- Sertifikat Laik Operasi
- Sertifikat Uji
- Sertifikat Produk
- Dokumen Perizinan

Jenis dokumen dapat bertambah di masa depan.

Sistem harus mudah dikembangkan.

---

# Entity Matching

Setelah OCR selesai.

AI harus mencocokkan hasil ekstraksi dengan data master.

Pencocokan tidak boleh hanya berdasarkan nama file.

AI dapat menggunakan:

- Nama aset
- Nomor sertifikat
- Nomor aset
- Nomor proyek
- Nama produk
- Similarity string
- Fuzzy matching

Setiap hasil matching harus memiliki confidence score.

---

# Confidence Score

Confidence tinggi

↓

Dokumen langsung terhubung.

Confidence rendah

↓

Masuk ke antrean manual review.

---

# Manual Review

Administrator dapat melihat.

- Hasil OCR
- Metadata
- Confidence Score
- Kandidat data master

Administrator dapat memilih pasangan yang benar.

---

# Permit Status

Setiap data memiliki dua status yang berbeda.

## 1. Permit Condition

Menggambarkan kondisi objek.

Pilihan:

- Layak
- Repair
- Tidak Layak

Status ini berasal dari hasil inspeksi.

Bukan dari AI.

---

## 2. Certification Status

Menggambarkan proses administrasi.

Pilihan:

- Belum Diajukan
- Sedang Diproses
- Menunggu Verifikasi
- Aktif
- Akan Expired
- Expired

Status ini dapat diperbarui secara otomatis berdasarkan tanggal maupun tindakan administrator.

---

# Expiration Logic

AI harus memonitor tanggal berakhir.

Jika:

Tanggal sekarang > tanggal expired

↓

Status menjadi Expired.

Jika:

Sisa masa berlaku <= 30 hari

↓

Status menjadi Akan Expired.

Jika sertifikat baru berhasil dihubungkan.

↓

Status menjadi Aktif.

---

# Notification

Sistem harus mampu menghasilkan notifikasi.

Contoh:

- Sertifikat akan expired.
- Sertifikat telah expired.
- Sertifikat baru berhasil ditambahkan.
- Sertifikat sedang diproses.
- Tidak ditemukan dokumen sertifikat.

---

# Search

Pengguna dapat mencari berdasarkan.

- Nama
- Nomor Sertifikat
- Nomor Asset
- Nomor Dokumen
- Divisi
- Jenis Sertifikat
- Instansi

---

# Filtering

Data dapat difilter berdasarkan.

Kategori

Status Sertifikasi

Status Kelayakan

Divisi

Instansi

Tanggal Expired

---

# Scalability

Sistem harus dirancang agar mampu menangani.

- Ribuan data master.
- Ribuan dokumen PDF.
- Banyak divisi.
- Banyak kategori sertifikasi.
- Banyak jenis dokumen.

---

# Future Features

- AI chatbot untuk bertanya tentang sertifikat.
- Auto reminder email.
- WhatsApp notification.
- Dashboard analytics.
- AI recommendation.
- Duplicate document detection.
- AI document validation.
- Versioning dokumen.
- Audit trail.
- Approval workflow.

---

# AI Assistant Role

AI bertindak sebagai intelligent assistant.

AI membantu administrator.

AI tidak boleh mengambil keputusan yang bersifat legal.

Jika confidence rendah.

AI hanya memberikan rekomendasi.

Administrator tetap menjadi pengambil keputusan akhir.

---

# Guiding Principle

Sertifikator bukan hanya Document Management System.

Sertifikator adalah Enterprise Permit Intelligence Platform yang menggabungkan Document Management, OCR, Artificial Intelligence, Monitoring, Notification, dan Decision Support untuk membantu perusahaan mengelola seluruh sertifikasi secara efisien, akurat, dan terpusat.