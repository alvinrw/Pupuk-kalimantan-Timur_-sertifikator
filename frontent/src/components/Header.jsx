import React from 'react';
import { PupukKaltimLogo, PupukIndonesiaLogo, DanantaraLogo } from './CorporateLogos';

export default function Header({ activeTab }) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'peralatan-pabrik': return 'Perizinan Peralatan Pabrik';
      case 'perizinan-aset': return 'Perizinan Aset & Bangunan';
      case 'administrasi-lainnya': return 'Administrasi & Perizinan Umum (HAKI)';
      case 'perizinan-proyek': return 'Perizinan Proyek & Konstruksi';
      case 'perizinan-produk': return 'Perizinan & Sertifikasi Produk';
      case 'monitoring': return 'Monitoring & Evaluasi Perizinan';
      case 'riwayat-perpanjangan': return 'Riwayat Perpanjangan & Rekam Jejak Audit';
      case 'pengaturan': return 'Pengaturan Sistem & Pengguna';
      default: return 'Sertifikator System';
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 font-sans-clean">
      {/* Title Area */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
            {getTabTitle()}
          </h2>
        </div>
      </div>

      {/* Corporate Rebranding Logos Group (Pupuk Kaltim • Pupuk Indonesia • Danantara) */}
      <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <PupukKaltimLogo className="h-6" />
        <span className="h-4 w-[1px] bg-slate-300" />
        <PupukIndonesiaLogo className="h-6" />
        <span className="h-4 w-[1px] bg-slate-300" />
        <DanantaraLogo className="h-6" />
      </div>
    </header>
  );
}
