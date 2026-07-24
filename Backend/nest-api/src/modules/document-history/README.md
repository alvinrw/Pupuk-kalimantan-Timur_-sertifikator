# 📑 Modul: Document History & File Storage (`document-history`)

> **Fokus Utama**: Modul ini khusus mengurus **Upload File PDF** dari frontend dan menyimpannya ke Brankas File (MinIO Storage), lalu mencatat URL-nya.
> **Untuk Pemula**: Fokus dulu ke tahap Menerima File (Upload) via Multer dan MinIO. Jangan pusingkan database dulu!

---

## 🗺️ Step-by-Step Pengerjaan (Untuk Pemula)

### STEP 1: Instalasi Package Upload & MinIO
Karena tugasmu menerima file dan mengirimnya ke MinIO (S3), install *tools*-nya dulu:
1. Buka terminal di folder `Backend/nest-api/`.
2. Install MinIO client: `npm install minio` dan `npm install @types/minio --save-dev`.
3. Install Multer (untuk nerima file dari frontend): `npm install -D @types/multer`.

### STEP 2: Membuat Kerangka Modul
Biar nggak ngetik manual, suruh NestJS buatin kerangka file-nya:
1. `npx nest g module modules/document-history`
2. `npx nest g service modules/document-history`
3. `npx nest g controller modules/document-history`

### STEP 3: Bikin API Upload File (`Controller`)
Buka file `document-history.controller.ts` dan buat 1 endpoint sakti ini:

```typescript
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/document-history')
export class DocumentHistoryController {
  
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' adalah nama field dari Frontend
  uploadPdfFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    // TODO: Kirim file ini ke MinIO via Service!
    return { 
       message: 'File berhasil diterima backend!', 
       filename: file.originalname 
    };
  }
}
```
*Coba test Endpoint ini di Postman pakai form-data `file`! Kalau responnya sukses, lanjut Step 4.*

### STEP 4: Sambungkan ke MinIO (`Service`)
Buka file `document-history.service.ts`, lalu buat fungsi untuk *push* file yang tadi diterima ke MinIO:
1. Import `Client` dari package `minio`.
2. Gunakan kredensial yang ada di `.env` (Port: 9000, User: minioadmin, Pass: minioadmin).
3. Gunakan fungsi `minioClient.putObject('sertifikator-docs', filename, fileBuffer)`.
4. Return URL lengkapnya (contoh: `http://localhost:9000/sertifikator-docs/namafile.pdf`).

---

## 📁 Struktur File Setelah Selesai
```text
document-history/
├── document-history.controller.ts  (Terima file dari Frontend via Multer)
├── document-history.service.ts     (Push file ke MinIO & kembalikan URL-nya)
└── document-history.module.ts      (Pendaftaran modul)
```
