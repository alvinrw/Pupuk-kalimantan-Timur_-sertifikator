# 📋 TASK BACKEND — DEVELOPER 2 (Multi-Certificates Hub, Monitoring & File Storage)

> **Role Focus**: Penanggung jawab Relasi Multi-Certificate, Engine Monitoring Expiry, dan Service File Upload PDF.

---

## 🎯 Modul Utama
1. `src/modules/certificates/` (Multi-Certificate Hub / Sertifikat Terhubung)
2. `src/modules/monitoring/` (Monitoring Sisa Hari, Status & Alerting Expiry)
3. `src/modules/document-history/` (Histori Berkas & Upload PDF Manual)

---

## 📋 Checklist Pekerjaan

### Phase 1: Database Migration & Entities
- [ ] Buat / Update Entity untuk tabel `linked_certificates`:
  - Fields: `id`, `itemId` (FK ke `items`), `jenisSertifikat` (PBG, SLF, HGB, SNI, dll), `noSertifikat`, `instansi`, `terbit`, `expired`, `status`, `pdfName`, `hasPdf`.
- [ ] Buat / Update Entity untuk tabel `document_histories`:
  - Fields: `id`, `itemId`, `periode`, `noSertifikat`, `instansi`, `tglTerbit`, `tglExpired`, `statusHukum`, `fileUrl`.

### Phase 2: Modul `certificates` (Multi-Cert Hub)
- [ ] **`GET /api/items/:itemId/linked-certificates`**:
  - Ambil semua sertifikat yang terhubung ke 1 Aset/Proyek/Produk tertentu.
- [ ] **`POST /api/items/:itemId/linked-certificates`**:
  - Tambahkan sertifikat terhubung baru ke item tersebut.
- [ ] **`DELETE /api/certificates/:certId`**:
  - Hapus sertifikat terhubung.

### Phase 3: Modul `monitoring`
- [ ] **`GET /api/monitoring/overview`**:
  - Ambil ringkasan statistik (Total Dokumen, Aktif, Perpanjang, Expired, Afkir).
- [ ] **`GET /api/monitoring/expiry-list`**:
  - Mengembalikan daftar seluruh sertifikat (baik item utama maupun sertifikat terhubung) dengan **perhitungan sisa hari dinamis** (`sisaHari = expiredDate - today`).
  - Urutkan berdasarkan yang paling mendesak/hampir expired.

### Phase 4: Modul `document-history` & File Storage
- [ ] **`POST /api/document-history/upload`**:
  - Handle upload file PDF SK menggunakan Multer.
  - Simpan berkas ke storage lokal (`uploads/pdfs/`) atau S3.
- [ ] **`GET /api/files/pdf/:filename`**:
  - Stream / download berkas PDF untuk dibuka dari frontend.

---

## 🛠️ Folder Kerja Anda
- `Backend/nest-api/src/modules/certificates/`
- `Backend/nest-api/src/modules/monitoring/`
- `Backend/nest-api/src/modules/document-history/`
