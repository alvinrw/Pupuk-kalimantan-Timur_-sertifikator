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
  Eye,
  Award
} from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';
import { masterCertificatesData } from '../data/masterDataset';

export default function InformasiLainnya() {
  const [activeGuideTab, setActiveGuideTab] = useState('overview'); // 'overview' | 'status' | 'workflow' | 'columns' | 'certificates'
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);

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

  const tableColumnsExplanation = [
    { name: "NO.", desc: "Nomor urut registrasi data perizinan di dalam tabel." },
    { name: "KODE / TAG PERIZINAN", desc: "Kode identifikasi unik peralatan atau perizinan (contoh: EQ-B201P2, PBG-KP-01, SLF-PRJ-01)." },
    { name: "NAMA DOKUMEN / ITEM", desc: "Nama lengkap perizinan atau merek peralatan pabrik. Klik untuk membuka Halaman Detail Penuh." },
    { name: "JENIS PERIZINAN", desc: "Sub-kategori atau klaster teknis perizinan (contoh: Bejana Tekan, PBG, SLF, Halal BPJPH, Software HAKI)." },
    { name: "UNIT PABRIK / LOKASI", desc: "Lokasi spesifik fisik peralatan atau aset (contoh: Pabrik 2 Area Reformer, Dermaga 2, Kantor Pusat, Pabrik NPK)." },
    { name: "USER / INSTANSI", desc: "Departemen penanggung jawab internal ATAU instansi penguji penerbit perizinan (Disnaker, Sucofindo, PUPR, BPN, Kemenkumham)." },
    { name: "NO. SERTIFIKAT", desc: "Nomor resmi SK / Sertifikat yang terbit dari instansi berwenang." },
    { name: "TERBIT", desc: "Tanggal pertama kali sertifikat diterbitkan atau disahkan." },
    { name: "EXPIRED", desc: "Tanggal batas akhir masa berlaku sertifikat. Menjadi acuan perhitungan sisa hari." },
    { name: "STATUS", desc: "Status kelayakan & alur kerja perizinan (Aktif, Perpanjang, Expired, atau Afkir)." },
    { name: "AKSI", desc: "Tombol 'Lihat Detail' untuk membuka berkas sertifikat PDF, mengedit data, dan mengunduh berkas." }
  ];

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
          <h1 className="font-logo-sutasoma text-2xl font-bold tracking-tight text-[#005ea4] select-none">
            SERTIFIKATOR
          </h1>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Panduan Lengkap Sistem
          </h2>
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
          onClick={() => setActiveGuideTab('columns')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeGuideTab === 'columns'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>4. Penjelasan Kolom Tabel</span>
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

      {/* TAB 4: PENJELASAN STRUKTUR KOLOM TABEL */}
      {activeGuideTab === 'columns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#005ea4]" />
              <span>Penjelasan Struktur Kolom Data Tabel Perizinan</span>
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse font-mono-data text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-bold w-1/4">NAMA KOLOM</th>
                  <th className="py-3.5 px-4 font-bold">DESKRIPSI & FUNGSI DATA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tableColumnsExplanation.map((col, idx) => (
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
        </div>
      )}
    </div>
  );
}
