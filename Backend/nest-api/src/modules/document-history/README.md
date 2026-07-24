# 📑 Modul: Document History & PDF File Storage (`document-history`)

> Modul ini bertanggung jawab mengelola histori versi berkas SK fisik/digital dan service upload/download file PDF.

---

## 📋 Checklist Pekerjaan

- [ ] **Data Model / Entity**:
  - Buat Entity `document_histories` (Fields: `id`, `itemId`, `periode`, `noSertifikat`, `instansi`, `tglTerbit`, `tglExpired`, `statusHukum`, `fileUrl`).
- [ ] **`POST /api/document-history/upload`**:
  - Endpoint upload file PDF SK (menggunakan Multer / NestJS FileInterceptor).
  - Simpan metadata ke tabel `document_histories`.
- [ ] **`GET /api/document-history/item/:itemId`**:
  - Ambil daftar histori berkas fisik/digital untuk 1 item tertentu.
- [ ] **`GET /api/files/pdf/:filename`**:
  - Endpoint streaming / download berkas PDF untuk dibuka dari frontend.

---

## 📁 Struktur File Target
```text
document-history/
├── dto/
│   └── upload-history.dto.ts
├── entities/
│   └── document-history.entity.ts
├── document-history.controller.ts
├── document-history.service.ts
└── document-history.module.ts
```
