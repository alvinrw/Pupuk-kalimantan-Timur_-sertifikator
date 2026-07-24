# 📝 Folder: Logs (`logs`)

> **Fungsi Utama**: Tempat curhat server saat dia pusing/mengalami *error*.

## 📋 Apa yang Dikerjakan di Sini?
Folder ini HANYA diperuntukkan sebagai tempat penyimpanan file `.log`.

**Kenapa Folder Ini Sangat Penting?**
Karena kamu menyebutkan OCR buatanmu belum 100% sempurna, ada kemungkinan saat diuji coba oleh orang lain menggunakan PDF yang aneh/format baru, program Python akan *crash* atau gagal membaca teks tertentu.

Di sinilah fitur *Logging* bekerja. 
Alih-alih aplikasi mati tanpa sebab, Python akan menulis semua uneg-unegnya (misal: `"Gagal menemukan regex Nomor Surat pada baris 42"`) ke dalam file `ocr_errors.log`. 

Sebagai *Developer*, kalau ada fitur yang mendadak tidak jalan, **jangan panik**. Hal pertama yang harus kamu lakukan adalah buka folder ini dan baca pesan *error* terakhirnya!

> **Catatan Git**: Biasanya, file berakhiran `.log` tidak ikut dimasukkan ke GitHub (diabaikan oleh `.gitignore`) agar riwayat komit tetap bersih.
