# 🗺️ ROADMAP & ARSITEKTUR BACKEND (SERTIFIKATOR PKT)

Sistem Backend dikembangkan menggunakan **NestJS (Node.js + TypeScript)** dengan arsitektur **Modular/Feature-Based**.

---

## 📂 Struktur Folder Global (`Backend/nest-api/src/`)

```text
src/
├── config/                     # Konfigurasi DB, Environment Variables
├── database/                   # Seeders & Migrations
├── modules/
│   ├── auth/                   # Authentication (Login/JWT)
│   ├── master-items/           # [DEV 1] CRUD Aset, Proyek, Produk, Peralatan
│   ├── csv-import/             # [DEV 1] Bulk Upload Data via CSV
│   ├── certificates/           # [DEV 2] Multi-Certificates Hub & Linked Certs
│   ├── monitoring/             # [DEV 2] Dynamic Expiry Calculation & Dashboard Stats
│   ├── document-history/       # [DEV 2] Upload PDF & History Logs
│   ├── equipment/              # Peralatan Pabrik (Existing)
│   └── ocr/                    # Integration Bridge ke FastAPI OCR Service
├── app.module.ts
└── main.ts
```

---

## 👥 Pembagian Tugas & File Checklist

| Pengembang | Modul Utama | File Task / Guide |
| :--- | :--- | :--- |
| **Developer 1** | `master-items`, `csv-import`, `database/` | [`TASK_DEV1.md`](file:///c:/Users/alvin/Documents/Coolyeah/PKT/Inventor/Backend/TASK_DEV1.md) |
| **Developer 2** | `certificates`, `monitoring`, `document-history` | [`TASK_DEV2.md`](file:///c:/Users/alvin/Documents/Coolyeah/PKT/Inventor/Backend/TASK_DEV2.md) |

---

## 🔀 Git Workflow untuk 2 Developer

1. **Checkout Branch Masing-masing**:
   - Dev 1: `git checkout -b feature/backend-master-items`
   - Dev 2: `git checkout -b feature/backend-certificates`
2. **Commit & Push per Modul**:
   - Hanya edit file di dalam folder modul milik masing-masing!
3. **Merge ke Branch Utama**:
   - Setelah modul selesai & dites di Postman, buka Pull Request (PR) ke `baru_fixUI` / `main`.

---

## 🔗 Panduan Integrasi Frontend - Backend

Setelah API siap, ganti koneksi data di frontend dari `masterDataset.js` menggunakan Fetch/Axios ke URL Backend: `http://localhost:3000/api/...`.
