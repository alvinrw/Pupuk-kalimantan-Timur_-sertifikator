import React, { useMemo, useState } from 'react';
import { Users, Building2, ChevronDown, Loader2, BarChart2 } from 'lucide-react';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAsosiasiDropdownOpen, setIsAsosiasiDropdownOpen] = useState(false);
  const [expandedKompartemen, setExpandedKompartemen] = useState(null);

  const handleFilterChange = (val) => {
    setIsAnimating(true);
    setTimeout(() => {
      setFilterAsosiasi(val);
      setIsAnimating(false);
    }, 200); // Tunggu sebentar untuk memudar, lalu ganti data & munculkan lagi
  };

  const {
    totalAnggota,
    totalAsosiasi,
    kompartemenData,
    maxAnggota,
    uniqueAsosiasiList
  } = useMemo(() => {
    const canonicalMap = new Map();
    const getCanonicalAssoc = (rawAssoc) => {
      if (!rawAssoc) return 'Unknown';
      let clean = rawAssoc.trim().replace(/\s+/g, ' ');
      // Fix known typos
      clean = clean.replace(/keanggotaaan/ig, 'Keanggotaan');
      
      const key = clean.toLowerCase();
      if (!canonicalMap.has(key)) {
        let pretty = clean.replace(/\b\w/g, c => c.toUpperCase());
        // Fix uppercase acronyms that might have been lowercase in raw data
        pretty = pretty.replace(/\bIai\b/g, 'IAI')
                       .replace(/\bAppi\b/g, 'APPI')
                       .replace(/\bIia\b/g, 'IIA')
                       .replace(/\bIsaca\b/g, 'ISACA')
                       .replace(/\bKan\b/g, 'KAN')
                       .replace(/\bEpd\b/g, 'EPD')
                       .replace(/\bSni\b/g, 'SNI')
                       .replace(/\bPii\b/g, 'PII');
        canonicalMap.set(key, pretty);
      }
      return canonicalMap.get(key);
    };

    const kompartemenMap = {};
    const totalAsosiasiSet = new Set();
    
    let filteredData = data;
    if (filterAsosiasi !== 'Semua Asosiasi') {
      filteredData = data.filter(d => getCanonicalAssoc(d.asosiasi) === filterAsosiasi);
    }

    filteredData.forEach(item => {
      const komp = item.kompartemen || 'Tidak Diketahui';
      const assoc = getCanonicalAssoc(item.asosiasi);
      
      if (!kompartemenMap[komp]) {
        kompartemenMap[komp] = { asosiasiSet: new Set(), asosiasiDetails: {}, anggotaCount: 0 };
      }
      
      kompartemenMap[komp].asosiasiSet.add(assoc);
      if (!kompartemenMap[komp].asosiasiDetails[assoc]) {
        kompartemenMap[komp].asosiasiDetails[assoc] = { count: 0, members: [] };
      }
      kompartemenMap[komp].asosiasiDetails[assoc].count += 1;
      if (item.nama) {
        kompartemenMap[komp].asosiasiDetails[assoc].members.push({
          nama: item.nama,
          unitKerja: item.unitKerja || ''
        });
      }
      kompartemenMap[komp].anggotaCount += 1;
      
      if (filterAsosiasi === 'Semua Asosiasi' || filterAsosiasi === assoc) {
         totalAsosiasiSet.add(assoc);
      }
    });

    const kompData = Object.keys(kompartemenMap).map(k => ({
      name: k,
      asosiasiCount: kompartemenMap[k].asosiasiSet.size,
      anggotaCount: kompartemenMap[k].anggotaCount,
      asosiasiList: Object.keys(kompartemenMap[k].asosiasiDetails)
        .map(assocName => ({ 
          name: assocName, 
          count: kompartemenMap[k].asosiasiDetails[assocName].count,
          members: kompartemenMap[k].asosiasiDetails[assocName].members
        }))
        .sort((a, b) => b.count - a.count),
      color: KOMPARTEMEN_COLORS[k] || 'bg-slate-500',
      bgColor: KOMPARTEMEN_BG_COLORS[k] || 'bg-slate-50 text-slate-600'
    })).sort((a, b) => b.anggotaCount - a.anggotaCount);

    const maxA = Math.max(...kompData.map(k => k.anggotaCount), 1);

    // Dapatkan list asosiasi untuk dropdown
    const allAssoc = new Set();
    data.forEach(item => {
      if (item.asosiasi) allAssoc.add(getCanonicalAssoc(item.asosiasi));
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <BarChart2 className="w-5 h-5 text-[#005ea4]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Ringkasan Distribusi Asosiasi</h3>
              <p className="text-xs text-slate-500 font-medium">Pemetaan sebaran jumlah asosiasi dan total anggota di setiap kompartemen</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                onClick={() => setIsAsosiasiDropdownOpen(!isAsosiasiDropdownOpen)}
                className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg pl-4 pr-3 py-2 text-xs font-bold text-slate-600 focus:outline-none hover:border-[#005ea4] focus:ring-2 focus:ring-[#005ea4]/20 cursor-pointer shadow-2xs font-mono-data transition-all w-full sm:w-[360px]"
              >
                <span className="truncate text-left flex-1">
                  {filterAsosiasi === 'Semua Asosiasi' ? 'Filter: Semua Asosiasi' : filterAsosiasi}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isAsosiasiDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`absolute right-0 top-full mt-2 w-full sm:w-[360px] z-[99] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden origin-top-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isAsosiasiDropdownOpen 
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 scale-95 -translate-y-3 pointer-events-none'
                }`}
              >
                <div className="max-h-[300px] overflow-y-auto py-1.5 custom-scrollbar">
                  {uniqueAsosiasiList.map(assoc => (
                    <button
                      key={assoc}
                      onClick={() => {
                        handleFilterChange(assoc);
                        setIsAsosiasiDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer duration-200 ${
                        filterAsosiasi === assoc 
                          ? 'bg-blue-50 text-[#005ea4] font-bold border-l-2 border-[#005ea4]' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border-l-2 border-transparent'
                      }`}
                    >
                      {assoc === 'Semua Asosiasi' ? 'Filter: Semua Asosiasi' : assoc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body - List of Kompartemen */}
        <div className={`p-6 space-y-8 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {kompartemenData.map((komp, idx) => {
            const progressPercent = Math.min(100, Math.max(2, (komp.anggotaCount / maxAnggota) * 100));
            const isExpanded = expandedKompartemen === komp.name || filterAsosiasi !== 'Semua Asosiasi';
            return (
              <div key={idx} className="flex flex-col gap-4 border border-transparent hover:border-slate-100 p-2 -mx-2 rounded-2xl transition-colors">
                {/* Main Row */}
                <div 
                  className="flex flex-col lg:flex-row lg:items-center gap-6 cursor-pointer group"
                  onClick={() => setExpandedKompartemen(expandedKompartemen === komp.name ? null : komp.name)}
                >
                  {/* Info Left */}
                  <div className="flex items-center gap-4 w-full lg:w-64 shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${komp.bgColor}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#005ea4] transition-colors">{komp.name}</h4>
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-50 text-[#005ea4]' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pt-2 pb-4 lg:ml-16 lg:mr-36">
                      <div className="flex items-center gap-2 mb-4 text-slate-700">
                        <Users className="w-4 h-4 text-[#005ea4]" />
                        <h5 className="text-sm font-bold">Detail Asosiasi & Peserta</h5>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {komp.asosiasiList?.map((assoc, i) => (
                          <div key={i} className="flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <span className="text-sm font-bold text-slate-800 leading-tight" title={assoc.name}>{assoc.name}</span>
                              <span className="text-[10px] font-mono-data font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md shrink-0 ml-4">
                                {assoc.count} Org
                              </span>
                            </div>
                            
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Daftar Anggota:</div>
                            
                            <ul className="space-y-3">
                              {assoc.members && assoc.members.map((member, idx) => (
                                <li key={idx} className="flex gap-2.5 items-start">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-700">{member.nama}</span>
                                    {member.unitKerja && (
                                      <span className="text-[9px] font-mono-data font-bold text-slate-500 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 mt-1 w-max">
                                        {member.unitKerja}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
