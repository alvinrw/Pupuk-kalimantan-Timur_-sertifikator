import React from 'react';
import { BookOpen, Info, ShieldCheck, Zap, DownloadCloud, FileText, Blocks, LayoutDashboard } from 'lucide-react';

export default function InformasiWebsite() {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans-clean">
      {/* Header Halaman */}
      <div className="bg-white px-8 py-6 border-b border-slate-200 sticky top-0 z-40 rounded-tl-3xl shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Info className="w-7 h-7 text-[#005ea4]" />
              Informasi Website
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Kenali lebih dekat platform Sertifikator dan unduh panduan penggunaannya.
            </p>
          </div>
          <button
            disabled
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-bold shadow-xs cursor-not-allowed transition-all"
            title="Sedang dalam penyusunan"
          >
            <DownloadCloud className="w-5 h-5" />
            <span>Guide Book (Segera Hadir)</span>
          </button>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Hero Section */}
          <div className="bg-gradient-to-br from-[#005ea4] to-[#004881] rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-logo-sutasoma text-4xl font-bold tracking-tight mb-4">
                Sistem Terpadu <span className="text-blue-200">Sertifikator</span>
              </h2>
              <p className="text-blue-50 text-base leading-relaxed font-medium mb-6">
                Sertifikator adalah platform digital komprehensif yang dirancang untuk mendigitalkan, memantau, dan mengelola seluruh siklus hidup dokumen perizinan.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                  <ShieldCheck className="w-5 h-5 text-blue-200" />
                  <span className="font-bold text-sm">Keamanan Terjamin</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                  <Zap className="w-5 h-5 text-emerald-300" />
                  <span className="font-bold text-sm">Real-time Monitoring</span>
                </div>
              </div>
            </div>

            {/* Dekorasi Visual */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 translate-x-16 rounded-3xl blur-xl" />
            <BookOpen className="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 rotate-12" />
          </div>

          {/* Grid Fitur Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-[#005ea4] rounded-xl flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Dashboard Pintar & Notifikasi</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Menyediakan rangkuman eksekutif terkait jumlah dokumen aktif, dokumen yang akan segera kedaluwarsa, dan riwayat perpanjangan. Dilengkapi dengan notifikasi otomatis untuk memastikan tidak ada perizinan yang terlewat dari tenggat waktu.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Blocks className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Manajemen Modul Dinamis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Struktur data (kolom dan baris) dapat diubahsuaikan sesuai dengan kebutuhan masing-masing modul (Peralatan, Aset, Proyek, Produk). Memungkinkan fleksibilitas tinggi tanpa perlu bantuan dari tim pengembang IT.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hierarki Master & Child</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mengakomodasi data master (contoh: kompresor) yang bisa memiliki banyak sub-dokumen atau sertifikat *child* (contoh: sertifikat layak operasi tiap tahun). Data saling berelasi dengan rapi.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Guide Book & Panduan</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Buku panduan lengkap (PDF) akan segera tersedia untuk memandu setiap divisi dalam memanfaatkan platform Sertifikator secara maksimal, mulai dari tahap input data hingga ekspor laporan.
                </p>
              </div>

              {/* Badge Segera Hadir */}
              <div className="absolute top-6 right-6 bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Coming Soon
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6 text-center border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">
              Sertifikator v2.0.0 &copy; 2026. Dikembangkan untuk sentralisasi tata kelola perizinan perusahaan.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
