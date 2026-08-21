# 📑 Dokumentasi Struktur Perizinan & Sertifikasi

Dokumen ini menjelaskan struktur data, relasi, dan alur kerja (workflow) untuk modul-modul yang berkaitan dengan Perizinan dan Sertifikasi pada sistem. Terdapat dua arsitektur utama yang membedakan bagaimana data dan sertifikat dikelola.

---

## 1. Perizinan Peralatan Pabrik (Direct Certificate-Based)

Modul **Perizinan Peralatan Pabrik** berdiri dengan konsep flat (langsung), di mana data peralatan dan sertifikat/izinnya merupakan satu kesatuan yang tidak terpisahkan.

### 📌 Karakteristik Utama
- **1 Baris Data = 1 Sertifikat/Perizinan**.
- **TIDAK menggunakan konsep Master-Child** maupun fitur *“Sertifikat Terhubung”*.
- Setiap sertifikat berdiri sebagai satu data peralatan yang memiliki informasi sertifikatnya sendiri.

### 🔄 Alur Perpanjangan & Riwayat (History)
- Karena sertifikat memiliki masa berlaku, ketika sertifikat akan diperbarui/diperpanjang, pengguna dapat membuka halaman detail dan **mengunggah dokumen sertifikat baru**.
- Dokumen/sertifikat yang lama tidak dihapus, melainkan otomatis turun menjadi **Riwayat (History)** dari data tersebut.

### 🔔 Agenda & Notifikasi
- Sistem membuat notifikasi (pada menu *Agenda & Perpanjangan*) **hanya** untuk sertifikat yang berstatus **aktif**.
- Apabila dalam satu peralatan terdapat **lebih dari satu** sertifikat aktif (misal: transisi perpanjangan), sistem akan menggunakan **sertifikat aktif dengan masa berlaku paling lama** sebagai acuan notifikasi.
- Sertifikat yang sudah *expired* atau tidak aktif tidak akan memicu notifikasi aktif di Agenda.

### 📊 Monitoring & Evaluasi
- Data Peralatan Pabrik tetap terhubung penuh dengan halaman **Monitoring & Evaluasi** untuk memudahkan pelacakan kondisi dan status sertifikat.

---

## 2. Perizinan Aset, Produk, dan Proyek (Master-Child Relationship)

Berbeda dengan Peralatan Pabrik, ketiga modul ini (**Perizinan Aset**, **Perizinan Produk**, dan **Perizinan Proyek**) dirancang menggunakan arsitektur relasional **Master → Child → Sertifikat**.

### 📌 Karakteristik Utama
- **Halaman Utama menampilkan Data Master**. Sertifikat tidak berdiri sendiri sebagai satu baris di halaman depan.
- Menggunakan konsep **Sertifikat Terhubung**. Setiap sertifikat harus di- *attach* (dihubungkan) ke Child yang sesuai.

### 🗂️ Struktur Hierarki
**1 Master** dapat memiliki satu atau beberapa **Child**, dan setiap Child memiliki sertifikatnya sendiri.
```text
[Master] 
  ├── [Child 1] ──> (Sertifikat 1)
  ├── [Child 2] ──> (Sertifikat 2)
  └── [Child 3] ──> (Sertifikat 3)
```
*(Contoh: 1 Master Proyek Pembangunan memiliki Child Izin Lingkungan, Child Izin Mendirikan Bangunan, dll)*

### 🔍 Halaman Detail & Pengelolaan
- Saat pengguna membuka detail suatu Master, mereka akan diarahkan untuk melihat dan mengelola daftar **Child beserta sertifikat/dokumen** yang dimilikinya.
- Informasi agregat pada Master (seperti status keseluruhan, masa berlaku, dan monitoring) dihitung atau ditampilkan **berdasarkan data Child** yang ada di dalamnya.

---

## ⚖️ Ringkasan Perbedaan (Matrix)

| Modul | Struktur Data | Fitur Sertifikat Terhubung |
| :--- | :--- | :---: |
| **Peralatan Pabrik** | 1 baris = 1 sertifikat | ❌ Tidak Ada |
| **Perizinan Aset** | Master → Child → Sertifikat | ✅ Ada |
| **Perizinan Produk** | Master → Child → Sertifikat | ✅ Ada |
| **Perizinan Proyek** | Master → Child → Sertifikat | ✅ Ada |

---
**Catatan Penting untuk Pengembangan Lanjutan:**
*Konsep Peralatan Pabrik dan konsep Master-Child (Aset/Produk/Proyek) tidak boleh dicampuradukkan. Seluruh logika UI, penyimpanan (database), pengelolaan riwayat, notifikasi Agenda, hingga Monitoring & Evaluasi harus mematuhi batas arsitektur tabel di atas.*
