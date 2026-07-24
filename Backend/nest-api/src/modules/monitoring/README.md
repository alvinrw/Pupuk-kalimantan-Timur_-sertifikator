# 📊 Modul: Monitoring & Expiry Engine (`monitoring`)

> Modul ini bertanggung jawab menghitung masa berlaku/sisa hari sertifikat secara dinamis dan menyediakan data statistik monitoring.

---

## 📋 Checklist Pekerjaan

- [ ] **`GET /api/monitoring/overview`**:
  - Menghasilkan statistik total (Total Dokumen, Aktif, Perpanjang, Expired, Afkir).
- [ ] **`GET /api/monitoring/expiry-list`**:
  - Mengembalikan daftar seluruh sertifikat dengan **perhitungan sisa hari dinamis** (`sisaHari = expiredDate - todayDate`).
  - Mengurutkan daftar dari sertifikat yang paling kritis / mendekati kadaluarsa.
- [ ] **Filter Status Engine**:
  - Pengelompokan status otomatis: 
    - `Perpanjang` (jika sisa hari <= 30 hari)
    - `Expired` (jika sisa hari <= 0 hari)
    - `Aktif` (jika sisa hari > 30 hari)

---

## 📁 Struktur File Target
```text
monitoring/
├── monitoring.controller.ts
├── monitoring.service.ts
└── monitoring.module.ts
```
