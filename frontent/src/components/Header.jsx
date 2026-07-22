import React from 'react';

export default function Header({ activeTab }) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'peralatan-pabrik': return 'Perizinan Peralatan Pabrik';
      case 'perizinan-aset': return 'Perizinan Aset & Bangunan';
      case 'administrasi-lainnya': return 'Administrasi & Perizinan Umum';
      case 'perizinan-proyek': return 'Perizinan Proyek & Konstruksi';
      case 'perizinan-produk': return 'Perizinan & Sertifikasi Produk';
      case 'monitoring': return 'Monitoring & Evaluasi Perizinan';
      case 'pengaturan': return 'Pengaturan Sistem & Pengguna';
      default: return 'Sertifikator System';
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 font-sans-clean">
      {/* Title Area */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {getTabTitle()}
          </h2>
        </div>
      </div>
    </header>
  );
}
