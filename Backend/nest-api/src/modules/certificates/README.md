# 📜 Modul: Multi-Certificates Hub (`certificates`)

> Modul ini bertanggung jawab mengelola relasi **Multi-Certificate** (Sertifikat Terhubung per Produk/Aset/Proyek).

---

## 📋 Checklist Pekerjaan

- [ ] **Data Model / Entity**:
  - Buat Entity untuk `linked_certificates`.
  - Fields: `id`, `itemId` (FK ke `items`), `jenisSertifikat` (PBG, SLF, HGB, SNI, Halal, dll), `noSertifikat`, `instansi`, `terbit`, `expired`, `status`, `pdfName`, `hasPdf`.
- [ ] **`GET /api/items/:itemId/linked-certificates`**:
  - Ambil seluruh daftar sertifikat yang terhubung ke 1 item.
- [ ] **`POST /api/items/:itemId/linked-certificates`**:
  - Tambahkan sertifikat terhubung baru ke item tersebut.
- [ ] **`DELETE /api/certificates/:certId`**:
  - Hapus sertifikat terhubung dari item.

---

## 📁 Struktur File Target
```text
certificates/
├── dto/
│   └── create-certificate.dto.ts
├── entities/
│   └── certificate.entity.ts
├── certificates.controller.ts
├── certificates.service.ts
└── certificates.module.ts
```
