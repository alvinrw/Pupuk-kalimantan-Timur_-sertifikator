import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

export default function AdministrasiLainnya() {
  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col font-sans-clean">
      {/* Header Bar */}
      <div className="mb-6">
        <h2 className="font-bold text-xl text-[#0F172A]">
          Perizinan Administrasi Lainnya
        </h2>
        <p className="text-xs text-[#64748B] font-mono-data">
          Modul ini sedang dalam tahap pengembangan
        </p>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm p-12">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
          <FileSpreadsheet className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Segera Hadir</h3>
        <p className="text-sm text-slate-500 text-center max-w-md leading-relaxed">
          Halaman Perizinan Administrasi Lainnya sedang dirancang dan akan segera tersedia. Konten pada halaman ini belum difinalisasi sehingga untuk sementara dikosongkan.
        </p>
      </div>
    </div>
  );
}
