# 🗺️ ROADMAP & ARSITEKTUR BACKEND (SERTIFIKATOR PKT)

Sistem Backend dikembangkan menggunakan **NestJS (Node.js + TypeScript)** dengan arsitektur **Modular / Feature-Based**.

---

## 📂 Panduan Modul (`Backend/nest-api/src/modules/`)

Setiap modul berdiri sendiri dan memiliki file `README.md` tersendiri di dalam foldernya yang berisi spesifikasi API & checklist tugas.

```text
src/modules/
├── master-items/           # CRUD Data Utama (Aset, Proyek, Produk, Peralatan)
├── certificates/           # Multi-Certificates Hub & Sertifikat Terhubung
├── monitoring/             # Hitung Sisa Hari Expired Dinamis & Alerting
├── document-history/       # Upload PDF SK & Log Histori Berkas
├── csv-import/             # Bulk Import Data via CSV / Excel
├── equipment/              # Modul Peralatan Pabrik
├── ocr/                    # Integration Bridge ke FastAPI OCR Service
├── auth/                   # Modul Authentication & User Management
└── storage/                # Handler File Storage / Multer
```

---

## 🔀 Git & Workflow Kerjasama Tim

1. **Pilih Modul**: Setiap anggota tim dapat mengambil modul yang mau dikerjakan (misal: Anggota A mengerjakan `master-items`, Anggota B mengerjakan `certificates`).
2. **Buat Branch**: Buat branch sesuai nama modul yang dikerjakan:
   - `feature/modul-master-items`
   - `feature/modul-certificates`
   - `feature/modul-monitoring`
3. **Fokus Folder**: Kerjakan file di dalam folder modul masing-masing untuk menghindari konflik *git merge*.
4. **Merge**: Setelah selesai dan dites via Postman/Swagger, lakukan Pull Request ke branch utama.
