# 📊 Modul: CSV / Bulk Import (`csv-import`)

> Modul ini bertanggung jawab mengolah data masal yang diunggah melalui berkas CSV / Excel dari interface frontend.

---

## 📋 Checklist Pekerjaan

- [ ] **`POST /api/import/csv`**:
  - Menerima file upload `.csv` atau `.xlsx`.
  - Menguraikan (parsing) baris data perizinan/peralatan.
  - Melakukan bulk-insert data ke database `items`.
  - Mengembalikan summary respon: `{ totalImported: 15, failedCount: 0 }`.

---

## 📁 Struktur File Target
```text
csv-import/
├── csv-import.controller.ts
├── csv-import.service.ts
└── csv-import.module.ts
```
