# 📦 Modul: Master Items (`master-items`)

> Modul ini bertanggung jawab mengelola data utama Perizinan Aset, Proyek, Produk, dan Peralatan Pabrik.

---

## 📋 Checklist Pekerjaan

- [ ] **Data Model / Entity**:
  - Buat Prisma Schema / Entity untuk `items`.
  - Fields: `id`, `code`, `title` (merekItem), `categoryKey` (`perizinan-aset`, `perizinan-proyek`, `perizinan-produk`, `peralatan-pabrik`), `unitLocation`, `status`, `luasM2`, `luasHa`, `peruntukan`, `issueDate`, `expiryDate`, `keterangan`.
- [ ] **`GET /api/items`**:
  - Mendukung Query: `?categoryKey=perizinan-aset`, `?search=...`, `?status=...`.
  - Mengembalikan list data + jumlah sertifikat terhubung (`linkedCertificatesCount`).
- [ ] **`GET /api/items/:id`**:
  - Mengembalikan detail 1 item beserta list `linkedCertificates[]` & `documentHistories[]`.
- [ ] **`POST /api/items`**:
  - Tambah data single item perizinan/peralatan baru.
- [ ] **`PUT /api/items/:id`**:
  - Update data item.
- [ ] **`DELETE /api/items/:id`**:
  - Hapus data item.

---

## 📁 Struktur File Target
```text
master-items/
├── dto/
│   ├── create-master-item.dto.ts
│   └── update-master-item.dto.ts
├── entities/
│   └── master-item.entity.ts
├── master-items.controller.ts
├── master-items.service.ts
└── master-items.module.ts
```
