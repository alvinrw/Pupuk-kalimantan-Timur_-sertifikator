import {
  ShieldAlert, Clock, CheckCircle2, Ban, RotateCcw,
  Factory, Building2, FileSpreadsheet, FolderKanban, PackageCheck, Activity,
  History, Sparkles, Database
} from 'lucide-react';

export const statusColorsGuide = [
  {
    title: "Non Aktif",
    badge: "Afkir",
    code: "bg-[#0f172a] text-white border-slate-700",
    bgCard: "bg-slate-900 text-white border-slate-700",
    icon: Ban,
    iconColor: "text-slate-200",
    description: "Dokumen atau aset peralatan pabrik yang sudah tidak beroperasi lagi, dibongkar, atau dinonaktifkan secara resmi. Sertifikat tidak perlu diperpanjang lagi dan diarsipkan untuk audit historis."
  },
  {
    title: "Expired / Kadaluarsa",
    badge: "Expired",
    code: "bg-rose-100 text-rose-900 border-rose-300",
    bgCard: "bg-rose-50 border-rose-200 text-rose-950",
    icon: ShieldAlert,
    iconColor: "text-rose-600",
    description: "Masa berlaku sertifikat perizinan telah melewati tanggal kadaluarsa (sisa hari ≤ 0). Berisiko hukum & keselamatan K3. Harus segera dilakukan resertifikasi ulang atau tera ulang."
  },
  {
    title: "Perpanjangan",
    badge: "Perpanjang",
    code: "bg-amber-100 text-amber-900 border-amber-300",
    bgCard: "bg-amber-50 border-amber-200 text-amber-950",
    icon: Clock,
    iconColor: "text-amber-600",
    description: "Masa berlaku sertifikat mendekati kadaluarsa (sisa hari ≤ 30 hari) ATAU sedang dalam tahap pengajuan audit resertifikasi lapangan oleh Disnaker/Kemenperin/Sucofindo."
  },
  {
    title: "Aktif",
    badge: "Aktif",
    code: "bg-emerald-100 text-emerald-800 border-emerald-300",
    bgCard: "bg-emerald-50/70 border-emerald-200 text-emerald-950",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    description: "Dokumen sertifikat perizinan masih berlaku sah secara hukum dengan sisa masa berlaku aman di atas 30 hari."
  }
];

export const workflowSteps = [
  {
    step: 1,
    title: "Input & Impor Data Perizinan Massal",
    icon: Database,
    desc: "Pengguna menginput data perizinan melalui form '+ Tambah Single Perizinan Baru' atau mengunggah file CSV Master gabungan multi-unit."
  },
  {
    step: 2,
    title: "Pemantauan Tenggat Otomatis",
    icon: Activity,
    desc: "Sistem SERTIFIKATOR menghitung sisa hari secara real-time dan mengelompokkan dokumen ke dalam 5 Summary Cards di menu Monitoring & Evaluasi."
  },
  {
    step: 3,
    title: "Fase Staging (Melengkapi Dokumen)",
    icon: RotateCcw,
    desc: "Dokumen yang berstatus Perpanjangan akan masuk ke fase staging, di mana pengguna dapat melengkapi draft data sertifikat baru sebelum diunggah."
  },
  {
    step: 4,
    title: "Upload Sertifikat Baru + AI Scanning",
    icon: Sparkles,
    desc: "Saat mengunggah sertifikat baru (PDF), AI akan membantu mengekstrak Nomor SK, Tanggal Terbit, dan Expired secara otomatis agar tidak perlu mengetik manual."
  },
  {
    step: 5,
    title: "Pencatatan Audit Log & Histori Otomatis",
    icon: History,
    desc: "Hasil perpanjangan terekam secara otomatis ke dalam rekam jejak timeline 'Riwayat Perpanjangan' sebagai arsip kepatuhan audit perusahaan."
  }
];

export const modulesGuide = [
  {
    title: "Perizinan Peralatan Pabrik",
    icon: Factory,
    items: "Mengelola dan memantau status sertifikasi K3 untuk seluruh peralatan operasional pabrik seperti Bejana Tekan, Crane, dan Instalasi Listrik."
  },
  {
    title: "Perizinan Aset ",
    icon: Building2,
    items: "Mengurus legalitas kepemilikan dan kelayakan fungsi dari aset tetap perusahaan, termasuk Gedung, Lahan, dan Fasilitas Lingkungan."
  },
  {
    title: "Perizinan Proyek ",
    icon: FolderKanban,
    items: "Memantau kelengkapan izin konstruksi, sertifikat laik fungsi, dan dokumen legal lainnya untuk proyek ekspansi atau pembangunan baru."
  },
  {
    title: "Perizinan & Sertifikasi Produk",
    icon: PackageCheck,
    items: "Mengelola administrasi pengesahan standar mutu produk (SNI, Halal, Industri Hijau) agar selalu valid dan memenuhi regulasi."
  },
  {
    title: "Administrasi Lainnya ",
    icon: FileSpreadsheet,
    items: "Menyimpan dan mengawasi masa berlaku perlindungan hak cipta (HAKI) untuk program komputer, buku panduan, dan karya intelektual lainnya."
  },
  {
    title: "Monitoring & Evaluasi",
    icon: Activity,
    items: "Dashboard pemantauan terpusat yang menampilkan ringkasan data, notifikasi kedaluwarsa, dan riwayat perpanjangan secara real-time."
  }
];

export const categoryColumnsDetail = {
  peralatan: {
    categoryTitle: "1. Perizinan Peralatan Pabrik",
    icon: Factory,
    columns: [
      { key: "no", name: "NO.", desc: "Nomor urut registrasi data peralatan." },
      { key: "code", name: "NOMOR TAG / KODE ALAT", desc: "Kode identifikasi unik peralatan pabrik (contoh: EQ-B201P2, EQ-JT82896)." },
      { key: "merekItem", name: "JENIS & MEREK PERALATAN", desc: "Nama peralatan & spesifikasi merek (contoh: Primary Reformer Boiler, Overhead Crane 50T)." },
      { key: "jenisItem", name: "SUB-KATEGORI K3", desc: "Klasifikasi K3 (Bejana Tekan, Pesawat Angkat, Tangki B3, Listrik/Petir, Metrologi, Fire Alarm)." },
      { key: "unitPabrik", name: "UNIT PABRIK / LOKASI", desc: "Unit area pabrik tempat alat berada (Pabrik 1, Pabrik 2, Pabrik 3, UBS 6, Dermaga)." },
      { key: "user", name: "DEPT. PENANGGUNG JAWAB", desc: "Departemen pemilik operasional alat (Dept. Pemeliharaan, Dept. Utility, Dept. K3)." },
      { key: "noSertifikat", name: "NO. SERTIFIKAT K3", desc: "Nomor SK/Sertifikat pengujian dari Disnaker / Sucofindo / UPT Metrologi." },
      { key: "tanggalInspeksi", name: "TGL. INSPEKSI", desc: "Tanggal pelaksanaan uji riksa kelayakan di lapangan." },
      { key: "terbit", name: "TGL. TERBIT", desc: "Tanggal sertifikat resmi disahkan." },
      { key: "berakhir", name: "TGL. EXPIRED", desc: "Tanggal batas kadaluarsa sertifikat K3." },
      { key: "status", name: "STATUS KELAYAKAN", desc: "Status visual (Aktif, Perpanjang, Expired, Afkir)." },
      { key: "aksi", name: "AKSI", desc: "Tombol 'Lihat Detail' untuk membuka pratinjau berkas PDF sertifikat." }
    ]
  },
  aset: {
    categoryTitle: "2. Perizinan Aset & Bangunan",
    icon: Building2,
    columns: [
      { key: "no", name: "NO.", desc: "Nomor urut registrasi data perizinan aset." },
      { key: "certificateNo", name: "NOMOR SERTIFIKAT", desc: "Nomor SK/Sertifikat perizinan legal aset (contoh: PBG-64.74/DPMPTSP/2022, HGB-04.12.00.12/BPN-BTG/2019)." },
      { key: "unit", name: "LOKASI", desc: "Lokasi fisik kawasan aset (contoh: Kantor Pusat, Dermaga 2, Kawasan Industri Loktuan)." },
      { key: "luasM2", name: "LUAS (M²)", desc: "Ukuran luas aset bangunan/lahan dalam meter persegi (m²)." },
      { key: "luasHa", name: "LUAS (HA)", desc: "Ukuran luas kawasan aset dalam Hektar (Ha)." },
      { key: "peruntukan", name: "PERUNTUKAN", desc: "Fungsi operasional penggunaan aset (Gedung Perkantoran, Dermaga Export, Area Silo Urea)." },
      { key: "tanggalAwalPengajuan", name: "TANGGAL AWAL PENGAJUAN", desc: "Tanggal pertama kali berkas perizinan diajukan ke instansi terkait." },
      { key: "masaBerlaku", name: "MASA BERLAKU PRODUK", desc: "Tanggal batas kadaluarsa / akhir masa berlaku legalitas aset." },
      { key: "kondisi", name: "KONDISI", desc: "Status fisik & kelayakan operasional aset (Baik & Layak Huni, Perlu Re-sertifikasi, Afkir)." },
      { key: "keterangan", name: "KETERANGAN", desc: "Catatan penjelas & instansi pengesah perizinan (DPMPTSP, BPN, KPLP, KAN)." },
      { key: "status", name: "STATUS", desc: "Status kelayakan legalitas (Aktif, Perpanjang, Expired, Afkir)." }
    ]
  },
  proyek: {
    categoryTitle: "3. Perizinan Proyek & Konstruksi",
    icon: FolderKanban,
    columns: [
      { key: "no", name: "NO.", desc: "Nomor urut data perizinan proyek." },
      { key: "code", name: "KODE PROYEK", desc: "Kode unik proyek ekspansi (contoh: SLF-PRJ-01, PBG-PRJ-04)." },
      { key: "merekItem", name: "NAMA PROYEK / BANGUNAN", desc: "Judul fasilitas proyek (SLF Pabrik Amuria-2, PBG Expansion Jetty 4)." },
      { key: "jenisItem", name: "JENIS IZIN KONSTRUKSI", desc: "Kategori perizinan (SLF Sertifikat Laik Fungsi, PBG Ekspansi, K3 Lifting Project)." },
      { key: "unitPabrik", name: "UNIT AREA PROYEK", desc: "Lokasi site proyek (Pabrik 4, Dermaga 4, Area NPK 2)." },
      { key: "user", name: "KONTRAKTOR / DEPT", desc: "Tim manajemen proyek atau kontraktor pelaksana." },
      { key: "noSertifikat", name: "NO. SLF / PBG", desc: "Nomor sertifikat laik fungsi / izin konstruksi." },
      { key: "terbit", name: "TGL. TERBIT", desc: "Tanggal terbit SLF/PBG." },
      { key: "berakhir", name: "TGL. EXPIRED", desc: "Tanggal berakhir masa berlaku SLF/PBG." },
      { key: "status", name: "STATUS PROYEK", desc: "Status kelayakan fungsi proyek (Aktif, Perpanjang, Expired, Afkir)." }
    ]
  },
  produk: {
    categoryTitle: "4. Perizinan & Sertifikasi Produk",
    icon: PackageCheck,
    columns: [
      { key: "no", name: "NO.", desc: "Nomor urut registrasi produk." },
      { key: "code", name: "KODE REGISTRASI", desc: "Kode unik sertifikasi produk (SNI-UREA-PKT, HALAL-NPK-02)." },
      { key: "merekItem", name: "NAMA PRODUK / BRAND", desc: "Nama komoditas fertilizer (Urea Prill/Granular, NPK Pelangi, Amonia Industri)." },
      { key: "jenisItem", name: "JENIS SERTIFIKASI", desc: "Standardisasi mutu (Sertifikat SNI, Sertifikat Halal BPJPH, Industri Hijau Level 5)." },
      { key: "unitPabrik", name: "UNIT PRODUKSI", desc: "Unit pabrik produsen (All Plant Units, Pabrik NPK, Kompleks Industri)." },
      { key: "user", name: "LEMBAGA SERTIFIKASI", desc: "Lembaga sertuji (LSPro Kemenperin, BPJPH Kemenag, Sucofindo Export)." },
      { key: "noSertifikat", name: "NO. SERTIFIKAT RESMI", desc: "Nomor sertifikat mutu / edar produk." },
      { key: "terbit", name: "TGL. TERBIT", desc: "Tanggal penerbitan lisensi mutu." },
      { key: "berakhir", name: "MUKIM EXPIRED", desc: "Batas waktu pembaruan sertifikat produk." },
      { key: "status", name: "STATUS REGULASI", desc: "Status lisensi (Aktif, Perpanjang, Expired, Afkir)." }
    ]
  },
  haki: {
    categoryTitle: "5. Administrasi Lainnya / Hak Cipta (HAKI)",
    icon: FileSpreadsheet,
    columns: [
      { key: "no", name: "NO.", desc: "Nomor urut registrasi HAKI." },
      { key: "code", name: "KODE HAKI / EC", desc: "Nomor pendaftaran Ditjen KI (contoh: EC00202400192, EC00201999120)." },
      { key: "merekItem", name: "JUDUL CIPTAAN / KARYA", desc: "Judul karya cipta (Sistem Sertifikator AI, Buku Panduan K3 Kilang, Layout Control Room)." },
      { key: "jenisItem", name: "JENIS CIPTAAN", desc: "Kategori HAKI (Program Komputer / Software, Buku Karya Tulis, Desain Layout)." },
      { key: "unitPabrik", name: "UNIT OWNER", desc: "Unit/Departemen pencipta karya (Dept. IT Central, Dept. K3, Dept. Enjiniring)." },
      { key: "user", name: "PENCIPTA / PENERBIT", desc: "Pencipta ciptaan / Kementerian Hukum & HAM RI." },
      { key: "noSertifikat", name: "NO. SURAT PENCATATAN", desc: "Nomor sertifikat Hak Cipta Kemenkumham RI." },
      { key: "terbit", name: "TGL. CIPTAAN", desc: "Tanggal pertama kali ciptaan diumumkan." },
      { key: "berakhir", name: "MASA LISENSI", desc: "Masa berlaku perlindungan Hak Cipta." },
      { key: "status", name: "STATUS HAK CIPTA", desc: "Status perlindungan (Aktif, Perpanjang, Expired, Afkir)." }
    ]
  }
};

export const categoryTemplates = {
  peralatan: {
    fileName: "Template_Impor_Peralatan_Pabrik_PKT.csv",
    title: "Templat CSV Peralatan Pabrik",
    rows: [
      "code,merekItem,jenisPeralatan,unitPabrik,lokasi,user,noSertifikat,tanggalInspeksi,terbit,berakhir,status",
      "EQ-B201P2,Primary Reformer Boiler B-201-P2,Bejana Tekan / Boiler,Pabrik 2,Pabrik 2 (Area Reformer),Dept. Operasi Pabrik 2,CERT-7734/DISNAKER-KT/2023,2023-04-10,2023-04-15,2026-08-15,Aktif",
      "EQ-CR402P3,Overhead Crane 50 Ton SWL,Pesawat Angkat & Angkut,Pabrik 3,Pabrik 3 (Urea Silo B),Dept. Pemeliharaan,SUCO-PAA-88219-2021,2021-01-05,2021-01-10,2024-01-10,Expired"
    ]
  },
  aset: {
    fileName: "Template_Impor_Perizinan_Aset_PKT.csv",
    title: "Templat CSV Perizinan Aset & Bangunan",
    rows: [
      "certificateNo,unit,luasM2,luasHa,peruntukan,tanggalAwalPengajuan,expiryDate,kondisi,keterangan,status",
      "PBG-64.74/DPMPTSP/2022,Kantor Pusat (Kawasan Industri Bontang),12.000 m²,1.2 Ha,Gedung Perkantoran & Admin,2021-11-10,2042-01-15,Baik & Layak Huni,DPMPTSP Kota Bontang - Masa Berlaku 20 Tahun,Aktif",
      "HGB-04.12.00.12/BPN-BTG/2019,Kawasan Industri Loktuan (Pabrik 3 & 4),45.000 m²,4.5 Ha,Area Silo & Gudang Urea,2019-03-10,2049-05-20,Aktif / Hak Tanah Sah,BPN Kota Bontang - Hak Guna Bangunan 30 Tahun,Aktif"
    ]
  },
  proyek: {
    fileName: "Template_Impor_Perizinan_Proyek_PKT.csv",
    title: "Templat CSV Perizinan Proyek & Konstruksi",
    rows: [
      "code,title,jenisItem,unitPabrik,user,certificateNo,issueDate,expiryDate,status",
      "SLF-PRJ-01,SLF Proyek Ekosistem Pabrik Amuria-2,SLF (Sertifikat Laik Fungsi),Pabrik 4,Dinas PUPR Kota Bontang,SLF-64.74/PUPR-BTG/2023,2023-11-12,2028-11-12,Aktif",
      "PBG-PRJ-04,PBG Proyek Expansion Jetty 4,PBG Proyek Expansion,Dermaga 4,Dinas PUPR Bontang,PBG-PROYEK-8812-PUPR,2021-08-10,2026-08-06,Perpanjang"
    ]
  },
  produk: {
    fileName: "Template_Impor_Sertifikasi_Produk_PKT.csv",
    title: "Templat CSV Sertifikasi & Regulasi Produk",
    rows: [
      "code,title,jenisItem,unitPabrik,user,certificateNo,issueDate,expiryDate,status",
      "SNI-UREA-PKT,Sertifikat SNI Pupuk Urea Prill & Granular,Sertifikat SNI Produk,All Plant Units,LSPro Kemenperin,LSPro-004-IDN/SNI/2024,2024-02-18,2028-02-18,Aktif",
      "HALAL-NPK-02,Sertifikat Halal NPK Pelangi & Amonia,Sertifikat Halal MUI & BPJPH,Pabrik NPK,BPJPH Kemenag RI,ID6411000045210923,2023-08-15,2026-08-14,Perpanjang"
    ]
  },
  haki: {
    fileName: "Template_Impor_Administrasi_HAKI_PKT.csv",
    title: "Templat CSV Administrasi HAKI & Hak Cipta",
    rows: [
      "code,title,jenisCiptaan,unitPabrik,user,certificateNo,issueDate,expiryDate,status",
      "EC00202400192,Sistem Informasi Sertifikator Inventory AI PKT,Program Komputer (Software),IT Central,Dirjen Kekayaan Intelektual,EC00202400192,2024-03-10,2029-03-10,Aktif",
      "EC00201999120,Buku Panduan Keselamatan Operasi Kilang Amonia-4,Buku / Karya Tulis,Pabrik 4,Dirjen KI Kemenkumham RI,EC00201999120,2019-08-15,2024-01-15,Expired"
    ]
  }
};
