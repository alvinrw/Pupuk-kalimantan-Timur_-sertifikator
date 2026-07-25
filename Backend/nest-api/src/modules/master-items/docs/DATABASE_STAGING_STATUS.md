# Dokumentasi Skema Database: Staging & Penanganan Dokumen

Dokumen ini menjelaskan struktur data dan skema database baru yang diperbarui untuk mendukung fitur **Staging Area (Tab Menunggu Dokumen)** dan **Pengecualian Sertifikat dengan Catatan Alasan**.

---

## 1. Perubahan Skema (`MasterItem`)

Pada model `MasterItem` di file `prisma/schema.prisma`, ditambahkan dua atribut baru:

```prisma
model MasterItem {
  id             String   @id @default(uuid())
  // ... field lainnya ...
  
  // Status kelengkapan dokumen (PENDING_DOC, COMPLETED, EXEMPT)
  documentStatus String   @default("PENDING_DOC")
  exemptionNote  String?  // Catatan alasan jika tidak ada sertifikat

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## 2. Definisi Nilai `documentStatus`

| Nilai `documentStatus` | Keterangan | Ditampilkan di Tab |
| :--- | :--- | :--- |
| `PENDING_DOC` | Data baru diimpor dari CSV dan **belum memiliki file PDF sertifikat**. | **Tab "Menunggu Dokumen"** |
| `COMPLETED` | Data telah memiliki file PDF sertifikat yang valid. | **Tab "Data Utama"** (Badge Hijau) |
| `EXEMPT` | Data dikonfirmasi **tidak memerlukan / tidak ada sertifikat**, dilengkapi **Catatan Alasan Wajib**. | **Tab "Data Utama"** (Badge Abu-abu) |

---

## 3. Endpoints API Terkait

### a. Resolver Pengecualian Sertifikat
- **Endpoint:** `PATCH /api/master-items/:id/resolve-exemption`
- **Body:**
```json
{
  "note": "Aset non-Wajib K3 Depnaker / Hanya Surat Pabrikan"
}
```
- **Fungsi:** Mengubah `documentStatus` menjadi `EXEMPT` dan menyimpan `exemptionNote`.

### b. Impor CSV
- **Endpoint:** `POST /api/csv-import/upload`
- **Fungsi:** Secara otomatis menetapkan `documentStatus = 'PENDING_DOC'` untuk setiap item baru yang diimpor.

### c. Pembuatan Sertifikat Baru
- **Endpoint:** `POST /api/certificates`
- **Fungsi:** Secara otomatis memperbarui `MasterItem.documentStatus = 'COMPLETED'` ketika file/sertifikat baru terikat ke item tersebut.
