# 📄 Sertifikator

> **Sertifikator** adalah sistem manajemen perizinan perusahaan yang dirancang untuk mengelola seluruh dokumen sertifikasi secara terpusat, melakukan ekstraksi informasi otomatis dari dokumen PDF menggunakan OCR dan AI, serta memonitor status sertifikasi setiap aset, produk, maupun administrasi perusahaan.

## 🎯 Tujuan

- Menghilangkan proses pencatatan manual.
- Mengotomatisasi pembacaan dokumen menggunakan OCR.
- Menghubungkan sertifikat dengan data master.
- Memonitor masa berlaku sertifikat.
- Menyediakan dashboard modern.

## 🎨 Design Guidelines

- Tema: Putih, Biru (#1E88E5), Kuning (#FBC02D)
- Font judul: **Sutasoma**
- Tanpa logo, hanya teks **Sertifikator**
- Gaya: Enterprise, Minimalis, Elegan

## 📂 Menu

- Dashboard
- Peralatan Pabrik
- Perizinan Aset
- Administrasi Lainnya
- Perizinan Proyek
- Perizinan Produk
- Monitoring
- Notifikasi
- Riwayat
- Pengaturan

## ⚙️ Workflow

```text
CSV -> Database
ZIP -> Extract PDF -> OCR -> Document Classification
-> Information Extraction -> Entity Matching
-> Confidence Score -> Auto Link / Manual Review
-> Update Database
```

## 📊 Monitoring

Status Kelayakan:
- Layak
- Repair
- Tidak Layak

Status Sertifikasi:
- Belum Diajukan
- Sedang Diproses
- Menunggu Verifikasi
- Aktif
- Akan Expired
- Expired

## 🚀 Tech Stack

- React + TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Table
- Recharts
- React PDF Viewer
