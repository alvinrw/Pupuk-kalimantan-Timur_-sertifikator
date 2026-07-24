# 📑 Sertifikator - OCR & AI Intelligence Module Progress Report

Dokumen ini mencatat **kemajuan riset OCR**, **arsitektur modul ekstraksi**, serta **strategi orkestrasi & pencocokan data master** pada platform **Sertifikator** (PT Pupuk Kalimantan Timur).

---

## 🚀 1. Laporan Progress Ekstraksi OCR Per Kategori Sertifikat

| Kategori Sertifikat | File Script Module | Status Progress | Field Utama yang Berhasil Diekstrak |
| :--- | :--- | :---: | :--- |
| **Instalasi Penyalur Petir** | `ocr_penyalur_petir.py` | **100% DONE** | Nomor Sertifikat, Tanggal Inspeksi, Tanggal Terbit, Tanggal Expired, & **Nilai Tahanan Pembumian (Grounding Ω)**. |
| **Timbangan (SKHP Metrologi)** | `test_cert_page_only.py` | **100% DONE** | Nomor SKHP, Tanggal Pengujian, Tanggal Terbit, & Tanggal Pengujian Ulang (Expired). |
| **Fire Alarm System** | `ocr_fire_alarm.py` | **80% DONE** | Nomor Surat, Merek/Model, Jumlah Detector, Tanggal Terbit, & **Auto Expired (+1 Tahun)**. |
| **Peralatan Lain (Crane, Bejana Tekan, dll)** | `fastapi-ocr/app/` | *In Pipeline* | Menggunakan General Anchor Extractor (`test_cert_page_only.py`). |

---

## ❓ 2. Pertanyaan & Jawaban Arsitektur Sistem

### ❓ Pertanyaan 1: *Bagaimana cara menangani jenis sertifikat yang sangat beragam?*

> **Solusi Arsitektur**: **Multi-Category Dynamic Parser & Generic Anchor Strategy**

```text
                  [ Upload PDF Sertifikat ]
                              │
                              ▼
                ┌───────────────────────────┐
                │ 1. Header Classifier      │ (Deteksi Kata Kunci Jenis Dokumen)
                └─────────────┬─────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
[ Template Petir ]    [ Template Alarm ]     [ Template Timbangan ]
  (Penyalur Petir)      (Fire Alarm)          (SKHP Metrologi)
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │ 2. General Anchor Fallback│ (Untuk Sertifikat Kategori Baru)
                └───────────────────────────┘
```

1. **Category Detection**:
   Sistem membaca baris pertama/header dokumen untuk mengenali kategori perizinan (misal: *"PENYALUR PETIR"*, *"FIRE ALARM"*, *"METROLOGI LEGAL"*, *"BEJANA TEKAN"*).
2. **Specialist Parsing Route**:
   Setelah kategori terdeteksi, dokumen diarahkan ke modul spesialis yang sesuai.
3. **General Anchor Fallback**:
   Jika jenis dokumen belum memiliki parser spesialis, dokumen ditangani oleh **General Extractor** (`test_cert_page_only.py`) yang mengekstrak 4 field universal: `nomor_sertifikat`, `tanggal_inspeksi`, `tanggal_terbit`, dan `tanggal_berakhir`.

---

### ❓ Pertanyaan 2: *Bagaimana cara Orkestrasi & Linking ke Nomor Seri / Tag Number Aset Master?*

> **Solusi Arsitektur**: **AI Fuzzy Entity Matcher & Cross-Check Engine**

Hasil ekstraksi OCR mentah dari dokumen **tidak langsung disimpan mentah-mentah ke database**, melainkan melewati modul **Entity Matcher** (`entity_matcher.py`):

```json
[ OCR Teks Mentah ]        [ Fuzzy Entity Matcher ]       [ Master Database Aset ]
"S671/DTKT-1ll"     ───►  Pencocokan Tag Number  ───►  "500.15.18.2/5674/DTKT-III"
"JT 8 (2896) UBS 6"       Similarity Score: 98.7%      Asset ID: EQ-2896
```

1. **Tag Number / Serial Matching**:
   Sistem mengekstrak nomor seri/tag number aset dari dokumen (misal: `JT 8 (2896) UBS 6` atau serial `C337801041`).
2. **Database Lookup**:
   Tag/Serial tersebut dicocokkan dengan **Master Data Aset Pabrik** di PostgreSQL NestJS Backend.
3. **Auto-Correction & Auto-Link**:
   - Jika **Confidence Score ≥ 85%**: Sistem otomatis mengoreksi kesalahan baca stempel (misal `S671` ➔ `5671`) dan menghubungkan sertifikat langsung ke aset master (`AUTO_LINKED`).
   - Jika **Confidence Score < 85%**: Dokumen masuk ke antrean **Manual Review Queue** di dashboard admin untuk diverifikasi 1-click oleh user.

---

## 🛠️ File Utama Pada Folder `Testing_ocr/`

- **[test_cert_page_only.py](file:///C:/Users/alvin/Documents/Coolyeah/PKT/Inventor/Testing_ocr/test_cert_page_only.py)**: Engine Utama General Extractor 4 Field.
- **[ocr_penyalur_petir.py](file:///C:/Users/alvin/Documents/Coolyeah/PKT/Inventor/Testing_ocr/ocr_penyalur_petir.py)**: Modul Extractor Spesialis Penyalur Petir (+Tahanan Pembumian Ω).
- **[ocr_fire_alarm.py](file:///C:/Users/alvin/Documents/Coolyeah/PKT/Inventor/Testing_ocr/ocr_fire_alarm.py)**: Modul Extractor Spesialis Fire Alarm System (+Auto +1 Tahun Expired).
- **[cert_page_only_result.json](file:///C:/Users/alvin/Documents/Coolyeah/PKT/Inventor/Testing_ocr/cert_page_only_result.json)**: Sample output JSON hasil ekstraksi general.
