# 📋 TASK BACKEND — DEVELOPER 1 (Core Master Data & Data Processing)

> **Role Focus**: Penanggung jawab Master Data Item (Aset, Proyek, Produk, Peralatan) dan Bulk Import CSV.

---

## 🎯 Modul Utama
1. `src/modules/master-items/` (Data Utama Aset, Proyek, Produk, & Peralatan Pabrik)
2. `src/modules/csv-import/` (Bulk Import Data via CSV/Excel)
3. `src/database/` (Setup Migration & Seeder Data Awal)

---

## 📋 Checklist Pekerjaan

### Phase 1: Database Migration & Entities
- [ ] Buat / Update Prisma Schema (atau TypeORM Entity) untuk tabel `items` / `master_assets`.
  - Fields: `id`, `code`, `title` (merekItem), `categoryKey` (`perizinan-aset`, `perizinan-proyek`, `perizinan-produk`, `peralatan-pabrik`), `unitLocation`, `status`, `luasM2`, `luasHa`, `peruntukan`, `issueDate`, `expiryDate`, `keterangan`.
- [ ] Buat Seeder Data Awal di DB (isi sampel data dari `masterDataset.js` frontend).

### Phase 2: Modul `master-items`
- [ ] **`GET /api/items`**:
  - Filter query: `?categoryKey=perizinan-aset` / `?search=...` / `?status=...`.
  - Kembalikan list data beserta **`linkedCertificatesCount`** (jumlah sertifikat terhubung per item).
- [ ] **`GET /api/items/:id`**:
  - Ambil 1 item lengkap beserta list `linkedCertificates[]` & `documentHistories[]`.
- [ ] **`POST /api/items`**:
  - Tambah data single item perizinan/peralatan baru.
- [ ] **`PUT /api/items/:id`**:
  - Update data spesifikasi/informasi item.
- [ ] **`DELETE /api/items/:id`**:
  - Soft delete / hard delete item perizinan.

### Phase 3: Modul `csv-import`
- [ ] **`POST /api/import/csv`**:
  - Terima file `.csv` atau `.xlsx`.
  - Parse baris data dan jalankan bulk-insert ke tabel `items`.
  - Return ringkasan: `{ totalImported: 15, failed: 0 }`.

---

## 🛠️ Folder Kerja Anda
- `Backend/nest-api/src/modules/master-items/`
- `Backend/nest-api/src/modules/csv-import/`
