import React, { useMemo, useState } from 'react';
import { Users, Building2, ChevronDown, Loader2 } from 'lucide-react';
import useIuranKeanggotaan from '../../hooks/useIuranKeanggotaan';

const KOMPARTEMEN_COLORS = {
  'Manajemen Keuangan': 'bg-emerald-500',
  'Satuan Pengawasan Intern': 'bg-amber-500',
  'Sekretaris Perusahaan': 'bg-blue-600',
  'HSE dan Teknologi': 'bg-rose-500',
  'Sumber Daya Manusia': 'bg-purple-500',
  'Tidak Diketahui': 'bg-slate-400'
};

const KOMPARTEMEN_BG_COLORS = {
  'Manajemen Keuangan': 'bg-emerald-50 text-emerald-600',
  'Satuan Pengawasan Intern': 'bg-amber-50 text-amber-600',
  'Sekretaris Perusahaan': 'bg-blue-50 text-blue-600',
  'HSE dan Teknologi': 'bg-rose-50 text-rose-600',
  'Sumber Daya Manusia': 'bg-purple-50 text-purple-600',
  'Tidak Diketahui': 'bg-slate-50 text-slate-600'
};

export default function MonitoringAnggaran() {
  const { data, loading, error } = useIuranKeanggotaan();
  const [filterAsosiasi, setFilterAsosiasi] = useState('Semua Asosiasi');

  const {
    totalAnggota,
    totalAsosiasi,
    kompartemenData,
    maxAnggota,
    uniqueAsosiasiList
  } = useMemo(() => {
    const kompartemenMap = {};
    const totalAsosiasiSet = new Set();
    
    let filteredData = data;
    if (filterAsosiasi !== 'Semua Asosiasi') {
      filteredData = data.filter(d => d.asosiasi === filterAsosiasi);
    }

    filteredData.forEach(item => {
      const komp = item.kompartemen || 'Tidak Diketahui';
      const assoc = item.asosiasi || 'Unknown';
      
      if (!kompartemenMap[komp]) {
        kompartemenMap[komp] = { asosiasiSet: new Set(), anggotaCount: 0 };
      }
      
      kompartemenMap[komp].asosiasiSet.add(assoc);
      kompartemenMap[komp].anggotaCount += 1;
      
      if (filterAsosiasi === 'Semua Asosiasi' || filterAsosiasi === assoc) {
         totalAsosiasiSet.add(assoc);
      }
    });

    const kompData = Object.keys(kompartemenMap).map(k => ({
      name: k,
      asosiasiCount: kompartemenMap[k].asosiasiSet.size,
      anggotaCount: kompartemenMap[k].anggotaCount,
      color: KOMPARTEMEN_COLORS[k] || 'bg-slate-500',
      bgColor: KOMPARTEMEN_BG_COLORS[k] || 'bg-slate-50 text-slate-600'
    })).sort((a, b) => b.anggotaCount - a.anggotaCount);

    const maxA = Math.max(...kompData.map(k => k.anggotaCount), 1);

    // Dapatkan list asosiasi untuk dropdown
    const allAssoc = new Set();
    data.forEach(item => {
      if (item.asosiasi) allAssoc.add(item.asosiasi);
    });

    return {
      totalAnggota: filteredData.length,
      totalAsosiasi: totalAsosiasiSet.size,
      kompartemenData: kompData,
      maxAnggota: maxA,
      uniqueAsosiasiList: ['Semua Asosiasi', ...Array.from(allAssoc).sort()]
    };
  }, [data, filterAsosiasi]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="text-slate-500 font-bold font-mono-data">Memuat Data Keanggotaan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 font-bold">
        Gagal memuat data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans-clean animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
          <Users className="w-6 h-6 text-[#005ea4]" />
          Data Keanggotaan & Administrasi Lainnya
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1 ml-8">
          Overview sebaran kapasitas anggota dan asosiasi per kompartemen.
        </p>
      </div>

      {/* MAIN CARD: RINGKASAN DISTRIBUSI ASOSIASI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Ringkasan Distribusi Asosiasi</h3>
              <p className="text-xs text-slate-500 font-medium">Pemetaan sebaran jumlah asosiasi dan total anggota di setiap kompartemen</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <select
              value={filterAsosiasi}
              onChange={(e) => setFilterAsosiasi(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#005ea4] cursor-pointer shadow-2xs font-mono-data"
            >
              {uniqueAsosiasiList.map(assoc => (
                <option key={assoc} value={assoc}>
                  {assoc === 'Semua Asosiasi' ? 'Filter: Semua Asosiasi' : assoc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* Card Body - List of Kompartemen */}
        <div className="p-6 space-y-8">
          {kompartemenData.map((komp, idx) => {
            const progressPercent = Math.min(100, Math.max(2, (komp.anggotaCount / maxAnggota) * 100));
            return (
              <div key={idx} className="flex flex-col lg:flex-row lg:items-center gap-6">
                
                {/* Info Left */}
                <div className="flex items-center gap-4 w-full lg:w-64 shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${komp.bgColor}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{komp.name}</h4>
                    <p className="text-xs text-slate-500 font-mono-data mt-0.5">{komp.asosiasiCount} Asosiasi Terdaftar</p>
                  </div>
                </div>

                {/* Progress Bar Center */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kapasitas Anggota</span>
                    <div className="flex items-center gap-2 lg:hidden">
                      <span className="font-bold text-slate-800 text-sm">{komp.anggotaCount}</span>
                      <span className="text-[10px] font-mono-data text-slate-500">Anggota</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${komp.color}`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Info Right (Desktop) */}
                <div className="hidden lg:flex items-center justify-end gap-4 w-32 shrink-0">
                  <div className="flex items-baseline gap-1.5 text-right">
                    <span className="font-extrabold text-slate-800 text-sm">{komp.anggotaCount}</span>
                    <span className="text-[10px] font-mono-data font-bold text-slate-500">Anggota</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            );
          })}

          {kompartemenData.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500 font-mono-data">Tidak ada data untuk filter tersebut.</p>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* TOTAL ASOSIASI */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Total Asosiasi</span>
            <span className="text-4xl font-extrabold text-slate-800">{totalAsosiasi}</span>
          </div>
        </div>

        {/* TOTAL KEANGGOTAAN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Total Keanggotaan</span>
            <span className="text-4xl font-extrabold text-slate-800">{totalAnggota}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
