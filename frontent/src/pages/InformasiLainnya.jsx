import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Ban,
  RotateCcw,
  FileText,
  Factory,
  Building2,
  FileSpreadsheet,
  FolderKanban,
  PackageCheck,
  Activity,
  History,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  FileCheck,
  Download,
  Check,
  Info,
  PlusCircle,
  Link2,
  Upload,
  Eye
} from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';
import { masterCertificatesData } from '../data/masterDataset';

export default function InformasiLainnya() {
  const [activeGuideTab, setActiveGuideTab] = useState('overview'); // 'overview' | 'status' | 'workflow' | 'columns'
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);
  const [selectedJenisTutorial, setSelectedJenisTutorial] = useState('jenis1'); // 'jenis1' | 'jenis2'
  const [activeCategoryTab, setActiveCategoryTab] = useState('peralatan');

  const statusColorsGuide = [
    {
      title: "Afkir / Decommissioned",
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
      title: "Perpanjangan / Urgent / Process",
      badge: "Perpanjang",
      code: "bg-amber-100 text-amber-900 border-amber-300",
      bgCard: "bg-amber-50 border-amber-200 text-amber-950",
      icon: Clock,
      iconColor: "text-amber-600",
      description: "Masa berlaku sertifikat mendekati kadaluarsa (sisa hari ≤ 30 hari) ATAU sedang dalam tahap pengajuan audit resertifikasi lapangan oleh Disnaker/Kemenperin/Sucofindo."
    },
    {
      title: "Valid / Masa Berlaku Aman",
      badge: "Aktif",
      code: "bg-emerald-100 text-emerald-800 border-emerald-300",
      bgCard: "bg-emerald-50/70 border-emerald-200 text-emerald-950",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      description: "Dokumen sertifikat perizinan masih berlaku sah secara hukum dengan sisa masa berlaku aman di atas 30 hari."
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Input & Impor Data Perizinan Massal",
      icon: Database,
      desc: "Pengguna menginput data perizinan melalui form '+ Tambah Single Perizinan Baru' atau mengunggah file CSV Master gabungan multi-unit."
    },
    {
      step: 2,
      title: "Pemantauan Tenggat Otomatis H-30",
      icon: Activity,
      desc: "Sistem SERTIFIKATOR menghitung sisa hari secara real-time dan mengelompokkan dokumen ke dalam 5 Summary Cards di menu Monitoring & Evaluasi."
    },
    {
      step: 3,
      title: "Penandaan Fase Status 'Proses Sertifikasi'",
      icon: RotateCcw,
      desc: "Penandaan status dokumen (Warna Kuning / Perpanjang) sebagai indikator bahwa sertifikat sedang dalam fase proses perpanjangan atau pembaruan SK."
    },
    {
      step: 4,
      title: "Upload Sertifikat Baru + AI OCR Scanning",
      icon: Sparkles,
      desc: "Setelah sertifikat penerbitan baru terbit, unggah PDF ke sistem. AI OCR Engine otomatis mengekstrak Nomor SK, Tanggal Terbit, dan Expired Baru tanpa ketik manual."
    },
    {
      step: 5,
      title: "Pencatatan Audit Log & Histori Otomatis",
      icon: History,
      desc: "Hasil perpanjangan terekam secara otomatis ke dalam rekam jejak timeline 'Riwayat Perpanjangan' sebagai arsip kepatuhan audit perusahaan."
    }
  ];

  const modulesGuide = [
    {
      title: "Perizinan Peralatan Pabrik",
      icon: Factory,
      items: "Bejana Tekan / Boiler, Pesawat Angkat (Crane), Tangki Timbun B3, Mesin Tenaga, Instalasi Listrik & Petir, Timbangan Metrologi, Fire Alarm System."
    },
    {
      title: "Perizinan Aset & Bangunan",
      icon: Building2,
      items: "Persetujuan Bangunan Gedung (PBG), Hak Guna Bangunan (HGB), Izin Tersus Pelabuhan Dermaga, Akreditasi Lab QC B3, Izin Lingkungan WWTP."
    },
    {
      title: "Perizinan Proyek & Konstruksi",
      icon: FolderKanban,
      items: "Sertifikat Laik Fungsi (SLF), PBG Proyek Ekspansi Kilang, Izin K3 Heavy Lifting Crane Proyek, PBG Gudang Bagging Plant, Piping Pipe-Rack."
    },
    {
      title: "Perizinan & Sertifikasi Produk",
      icon: PackageCheck,
      items: "Sertifikat SNI Urea & NPK Pelangi, Sertifikat Halal BPJPH Kemenag, Sertifikat Industri Hijau Level 5, Standard Mutu Ekspor."
    },
    {
      title: "Administrasi Lainnya / HAKI",
      icon: FileSpreadsheet,
      items: "Hak Cipta Program Komputer (Software), Buku Panduan K3 Operasi Kilang, Desain Layout Control Room, Modul SOP Operasional."
    },
    {
      title: "Monitoring & Evaluasi",
      icon: Activity,
      items: "Rekapitulasi 5 Summary Cards, Filter Multi-Parameter, Slide-over Riwayat Audit Log, dan Modal Resertifikasi + Pemindaian AI OCR PDF."
    }
  ];

  // Specific Columns Description per 5 Categories
  const categoryColumnsDetail = {
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

  // Specific CSV Templates per 5 Categories
  const categoryTemplates = {
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

  // Dynamic Generator & Auto Download CSV Master Template per Selected Category
  const handleDownloadSelectedCsv = (catKey) => {
    const target = categoryTemplates[catKey || activeCategoryTab] || categoryTemplates.peralatan;
    const blob = new Blob([target.rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", target.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedDocDetail) {
    return (
      <DocumentDetailPage
        item={selectedDocDetail}
        onBack={() => setSelectedDocDetail(null)}
        onSaveUpdate={(updatedDoc) => {
          alert(`Sertifikat ${updatedDoc.id} berhasil diperbarui.`);
        }}
        onQuickRenew={(id) => {
          alert(`Inisiasi perpanjangan untuk sertifikat ${id}.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Status sertifikat ${id} ditandai sebagai Afkir.`);
        }}
      />
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans-clean max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <h1 className="font-logo-sutasoma text-2xl md:text-3xl font-bold tracking-tight text-[#005ea4] select-none">
            SERTIFIKATOR
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-mono-data leading-relaxed">
            Sistem Informasi Pengelolaan, Pemantauan Masa Berlaku, dan Resertifikasi Perizinan Peralatan Pabrik, Aset, Proyek, Produk, dan HAKI Terpadu.
          </p>
        </div>
      </div>

      {/* Navigation Guide Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 font-mono-data">
        <button
          onClick={() => setActiveGuideTab('overview')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeGuideTab === 'overview'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Modul Aplikasi</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('status')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeGuideTab === 'status'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>2. Warna Status Dokumen</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('workflow')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeGuideTab === 'workflow'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>3. Alur Kerja & AI OCR</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('multicert')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeGuideTab === 'multicert'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>4. Panduan Tambah Item & Sertifikat Terhubung</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('columns')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeGuideTab === 'columns'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>5. Struktur Kolom & Templat Impor CSV</span>
        </button>
      </div>

      {/* TAB 1: CAKUPAN MODUL APLIKASI */}
      {activeGuideTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#005ea4]" />
              <span>Modul & Kategori Perizinan di Dalam Sistem</span>
            </h3>
            <span className="text-xs font-mono-data text-slate-500 font-bold">6 Modul Utama Terkoneksi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modulesGuide.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#005ea4] transition-all space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-[#005ea4] rounded-xl border border-blue-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{mod.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 font-mono-data leading-relaxed">
                    <span className="font-bold text-slate-800">Cakupan Data:</span> {mod.items}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ARTI WARNA STATUS DOKUMEN */}
      {activeGuideTab === 'status' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Sistem Penandaan Warna Status Baris Tabel (Hitam, Merah, Kuning, Clean)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {statusColorsGuide.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className={`p-6 rounded-2xl border ${st.bgCard} shadow-xs space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-6 h-6 ${st.iconColor}`} />
                      <h4 className="font-extrabold text-sm tracking-tight">{st.title}</h4>
                    </div>
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${st.code}`}>
                      {st.badge}
                    </span>
                  </div>
                  <p className="text-xs font-mono-data leading-relaxed opacity-90">
                    {st.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ALUR KERJA RESERTIFIKASI & AI OCR */}
      {activeGuideTab === 'workflow' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#005ea4]" />
              <span>Alur Kerja (Workflow Step-by-Step) Pengelolaan Dokumen</span>
            </h3>
          </div>

          <div className="space-y-4">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#005ea4] text-white flex items-center justify-center font-extrabold text-base shrink-0 font-mono-data shadow-xs">
                    {step.step}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#005ea4]" />
                      <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-mono-data leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PANDUAN TAMBAH ITEM & SERTIFIKAT TERHUBUNG */}
      {activeGuideTab === 'multicert' && (
        <div className="space-y-8 font-sans-clean">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#005ea4]" />
              <span>Panduan Tutorial: Cara Menambahkan Item & Sertifikat Terhubung</span>
            </h3>
            <span className="text-xs font-mono-data text-[#005ea4] font-bold">Panduan Langkah demi Langkah</span>
          </div>

          {/* COMPARISON CARD: 2 JENIS MODUL PERIZINAN (CLICKABLE CARDS) */}
          <div className="space-y-2 font-sans-clean">
            <p className="text-xs text-slate-500 font-mono-data font-bold">
              Pilih jenis tutorial alur kerja di bawah ini:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono-data text-xs">
              {/* TYPE 1: MULTI-SERTIFIKAT (CLICKABLE) */}
              <div
                onClick={() => setSelectedJenisTutorial('jenis1')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedJenisTutorial === 'jenis1'
                    ? 'bg-blue-50/70 border-2 border-[#005ea4] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2.5 text-[#005ea4] font-bold text-sm">
                    <Link2 className="w-4.5 h-4.5 shrink-0 text-[#005ea4]" />
                    <h4>JENIS 1: Menu Dengan Multi-Sertifikat Terhubung</h4>
                  </div>
                  {selectedJenisTutorial === 'jenis1' ? (
                    <span className="px-2.5 py-0.5 bg-[#005ea4] text-white text-[10px] font-bold rounded-full">
                      Terpilih
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                      Pilih Tutorial
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  <b>Modul</b>: Perizinan Aset, Perizinan Proyek & Konstruksi, dan Sertifikasi Produk.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li><b>Karakteristik</b>: 1 Entitas dapat memiliki <b>banyak sertifikat terhubung</b> (PBG, SLF, HGB, Amdal, SNI, Halal).</li>
                  <li><b>Behavior Tabel Utama</b>: <b>1 baris per sertifikat</b> (1 aset/proyek dengan 3 sertifikat = 3 baris di tabel).</li>
                </ul>
              </div>

              {/* TYPE 2: SINGLE SERTIFIKAT (CLICKABLE) */}
              <div
                onClick={() => setSelectedJenisTutorial('jenis2')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedJenisTutorial === 'jenis2'
                    ? 'bg-slate-100 border-2 border-slate-700 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                    <FileCheck className="w-4.5 h-4.5 shrink-0 text-slate-700" />
                    <h4>JENIS 2: Menu Single Sertifikat & Pindah Target</h4>
                  </div>
                  {selectedJenisTutorial === 'jenis2' ? (
                    <span className="px-2.5 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded-full">
                      Terpilih
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                      Pilih Tutorial
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  <b>Modul</b>: Perizinan Peralatan Pabrik dan Administrasi Lainnya / Hak Cipta (HAKI).
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li><b>Karakteristik</b>: 1 Peralatan/Ciptaan terikat pada <b>1 Sertifikat/SK</b> (dengan opsi Pindah Target).</li>
                  <li><b>Behavior Tabel Utama</b>: 1 Item peralatan/ciptaan selalu konsisten <b>1 baris</b> pada tabel utama.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* DYNAMIC TUTORIAL VIEW BASED ON SELECTED JENIS */}
          {selectedJenisTutorial === 'jenis1' && (
            <div className="space-y-6">
              {/* HEADER BANNER JENIS 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono-data text-xs">
                <span className="font-bold text-[#005ea4] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#005ea4]" />
                  <span>Panduan Alur Kerja JENIS 1 (Perizinan Aset, Proyek & Konstruksi, & Sertifikasi Produk)</span>
                </span>
                <span className="text-slate-700 font-bold bg-slate-200 px-2.5 py-0.5 rounded text-[11px]">
                  Multi-Sertifikat Terhubung
                </span>
              </div>

              {/* SECTION A: CARA MENAMBAHKAN ITEM BARU */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#005ea4] text-white flex items-center justify-center font-bold text-lg font-mono-data shadow-xs">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">1. Cara Menambahkan Data Item / Perizinan Baru (Input 1 Data Manual)</h4>
                    <p className="text-xs text-slate-500 font-mono-data">Untuk menambahkan entitas baru (Aset, Peralatan, Proyek, atau Produk)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono-data text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">1</span>
                      <span>Buka Halaman Perizinan</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Pilih menu perizinan dari Sidebar kiri (misal: <b>Perizinan Aset</b>, <b>Perizinan Peralatan Pabrik</b>, <b>Perizinan Proyek</b>, atau <b>Sertifikasi Produk</b>).
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">2</span>
                      <span>Klik "+ Kelola / Impor"</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Pada kanan atas tabel, klik tombol <b>+ Kelola / Impor Dokumen</b> lalu pilih opsi <b>+ Input 1 Data Manual</b>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">3</span>
                      <span>Isi Formulir & Simpan</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Isi spesifikasi item (Merek/Nama Item, Tipe, Nomor Seri, Lokasi, No. SK, Tgl Terbit/Expired). Klik <b>Simpan Data</b> untuk menampilkan ke tabel.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION B: CARA MENAMBAHKAN SERTIFIKAT TERHUBUNG (MULTI-SERTIFIKAT) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 font-mono-data">
                  <div className="w-10 h-10 rounded-xl bg-[#005ea4] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    B
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">2. Cara Menambahkan Sertifikat Terhubung (Multi-Sertifikat Per Item)</h4>
                    <p className="text-xs text-slate-500 font-mono-data">Untuk menghubungkan beberapa dokumen sertifikat (PBG, SLF, Amdal, SNI, Halal) ke satu entitas yang sama</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono-data text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                      <Eye className="w-4 h-4 text-[#005ea4]" />
                      <span>Langkah 1: Lihat Detail</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Klik <b>Lihat Detail</b> (atau klik nama item/no sertifikat) pada baris tabel utama untuk membuka Halaman Detail.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                      <Link2 className="w-4 h-4 text-[#005ea4]" />
                      <span>Langkah 2: Tambah Sertifikat</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Di Halaman Detail, gulir ke bagian <b>Sertifikat Terhubung</b> dan klik tombol <b>+ Tambah Sertifikat Terhubung</b>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                      <Upload className="w-4 h-4 text-[#005ea4]" />
                      <span>Langkah 3: Form & Upload PDF</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Isi Jenis Sertifikat (PBG, SLF, Amdal, SNI), No. SK, Instansi, Tgl Terbit/Expired, lalu klik <b>Pilih Berkas PDF</b> untuk mengunggah sertifikat.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#005ea4]" />
                      <span>Langkah 4: Otomatis Tambah Baris</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Klik <b>Simpan Sertifikat</b>. Sertifikat baru tersimpan di Detail dan <b>Tabel Utama otomatis menampilkan 1 baris tambahan</b>!
                    </p>
                  </div>
                </div>

                {/* MEKANISME TABEL UTAMA EXPLANATION BOX */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono-data text-xs text-slate-800">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Info className="w-4 h-4 text-[#005ea4]" />
                    <span>Prinsip Kerja Multi-Sertifikat Per Baris Tabel Utama:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                    <li><b>Data Utama Tetap 1 Entitas</b>: Menambahkan sertifikat terhubung tidak membuat aset/alat baru, melainkan menambahkan sertifikat di bawah entitas yang sama.</li>
                    <li><b>Tabel Utama Menampilkan Per Sertifikat</b>: Jika 1 aset punya 3 sertifikat terhubung, tabel utama menampilkan 3 baris terpisah untuk sertifikat tersebut.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedJenisTutorial === 'jenis2' && (
            <div className="space-y-6 font-sans-clean">
              {/* HEADER BANNER JENIS 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono-data text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-700" />
                  <span>Panduan Alur Kerja JENIS 2 (Perizinan Peralatan Pabrik & Administrasi Lainnya / HAKI)</span>
                </span>
                <span className="text-slate-700 font-bold bg-slate-200 px-2.5 py-0.5 rounded text-[11px]">
                  Single Certificate Model
                </span>
              </div>

              {/* SECTION A: CARA MENAMBAH ITEM PERALATAN / CIPTAAN BARU */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 font-mono-data">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">1. Cara Menambahkan Data Peralatan Pabrik atau Hak Cipta Baru</h4>
                    <p className="text-xs text-slate-500">Input registrasi item baru (Bejana Tekan, Crane, Tangki B3, atau Karya Cipta HAKI)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono-data text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">1</span>
                      <span>Buka Menu Peralatan / Administrasi</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Pilih menu <b>Perizinan Peralatan Pabrik</b> atau <b>Administrasi Lainnya</b> dari Sidebar kiri.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">2</span>
                      <span>Klik "+ Input Data Manual"</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Klik tombol <b>+ Kelola / Impor</b> lalu pilih opsi <b>+ Input 1 Data Manual</b> untuk membuka formulir registrasi.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">3</span>
                      <span>Isi Spesifikasi & Simpan</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Isi Kode Tag / Judul Ciptaan, Merek / Jenis, No. Sertifikat SK Disnaker/Kemenkumham, Tanggal Terbit/Expired, lalu klik <b>Simpan Data</b>.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION B: CARA PINDAH TARGET SERTIFIKAT */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 font-mono-data">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    B
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">2. Fitur Pindah Target Sertifikat (Re-assign Certificate)</h4>
                    <p className="text-xs text-slate-500">Gunakan fitur ini jika nomor SK / berkas PDF ciptaan tertukar antar item</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-data text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">1</span>
                      <span>Klik Menu Aksi Baris</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Pada kolom paling kanan baris ciptaan, klik tombol titik tiga <b>Aksi (...)</b> lalu pilih <b>Pindah Target Sertifikat</b>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">2</span>
                      <span>Pilih Karya Cipta Tujuan</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Cari dan pilih judul ciptaan penerima yang sesuai pada daftar modal pemindahan target sertifikat.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">3</span>
                      <span>Konfirmasi Pemindahan</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Klik <b>Pindahkan Sertifikat</b>. Sertifikat beserta berkas PDF otomatis berpindah target ke karya cipta yang baru secara instan.
                    </p>
                  </div>
                </div>

                {/* PRINSIP KERJA SINGLE CERTIFICATE BOX */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono-data text-xs text-slate-800">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Info className="w-4 h-4 text-slate-700" />
                    <span>Prinsip Kerja Model Single Sertifikat:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                    <li><b>Model 1-to-1 Strictly</b>: 1 Peralatan/Ciptaan diwakili oleh 1 Surat SK/Pencatatan resmi.</li>
                    <li><b>Konsistensi Baris Tabel</b>: Jumlah baris pada tabel utama selalu tepat sama dengan jumlah entitas yang terdaftar.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PENJELASAN STRUKTUR KOLOM TABEL & TEMPLAT CSV MASTER */}
      {activeGuideTab === 'columns' && (
        <div className="space-y-8 font-sans-clean">
          {/* DYNAMIC CATEGORY DOWNLOAD TEMPLATE BANNER */}
          <div className="p-6 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#005ea4]" />
                <h4 className="font-bold text-base text-slate-900">
                  Unduh {categoryTemplates[activeCategoryTab]?.title || 'Templat CSV Master'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-mono-data">
                Gunakan templat CSV spesifik ini untuk mengunggah data <b>{categoryColumnsDetail[activeCategoryTab]?.categoryTitle}</b> sekaligus.
              </p>
            </div>

            <button
              onClick={() => handleDownloadSelectedCsv(activeCategoryTab)}
              className="px-5 py-2.5 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all font-mono-data cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download CSV {categoryTemplates[activeCategoryTab]?.fileName}</span>
            </button>
          </div>

          {/* SUB-TABS UNTUK 5 KATEGORI PERIZINAN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#005ea4]" />
                <span>Rincian Struktur Kolom per 5 Kategori Perizinan</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono-data">
              <button
                onClick={() => setActiveCategoryTab('peralatan')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'peralatan'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1. Peralatan Pabrik
              </button>

              <button
                onClick={() => setActiveCategoryTab('aset')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'aset'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2. Perizinan Aset
              </button>

              <button
                onClick={() => setActiveCategoryTab('proyek')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'proyek'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                3. Perizinan Proyek
              </button>

              <button
                onClick={() => setActiveCategoryTab('produk')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'produk'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                4. Sertifikasi Produk
              </button>

              <button
                onClick={() => setActiveCategoryTab('haki')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === 'haki'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                5. Administrasi / HAKI
              </button>
            </div>

            {/* TABEL PENJELASAN KOLOM KATEGORI AKTIF */}
            {categoryColumnsDetail[activeCategoryTab] && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 bg-slate-900 text-white font-bold text-xs flex items-center justify-between font-mono-data">
                  <span>{categoryColumnsDetail[activeCategoryTab].categoryTitle}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Total {categoryColumnsDetail[activeCategoryTab].columns.length} Kolom Data
                  </span>
                </div>
                <table className="w-full text-left border-collapse font-mono-data text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 font-bold w-1/4">NAMA KOLOM TABEL</th>
                      <th className="py-3.5 px-4 font-bold">DESKRIPSI & FUNGSI ISIAN DATA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {categoryColumnsDetail[activeCategoryTab].columns.map((col, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#005ea4] whitespace-nowrap">
                          {col.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {col.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ATURAN FORMAT PENGISIAN DATAFRAME CSV */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-mono-data text-xs">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#005ea4]" />
              <span>Petunjuk Format Pengisian CSV Master yang Valid</span>
            </h4>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li><b>Encoding File</b>: Gunakan format penyimpan file <b>CSV (Comma Delimited) (*.csv)</b> dengan encoding <b>UTF-8</b>.</li>
              <li><b>Header Kolom Wajib</b>: `code`, `title`, `category`, `unit`, `certificateNo`, `issueDate`, `expiryDate`, `status`.</li>
              <li><b>Format Tanggal</b>: Gunakan format ISO standar <b>YYYY-MM-DD</b> (contoh: 2026-08-15).</li>
              <li><b>Pencocokan Otomatis</b>: Setelah CSV diunggah, data akan langsung dipetakan ke modul yang bersangkutan dan dihitung sisa harinya secara otomatis di menu Monitoring.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
