import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Users, CheckCircle2, Loader2, Info, Building2, BarChart2, Wallet, Search, ChevronUp, ChevronDown, ChevronsUpDown, PieChart as PieChartIcon, Check } from 'lucide-react';
import useIuranKeanggotaan from '../../hooks/useIuranKeanggotaan';

const KOMPARTEMEN_COLORS = {
  'Manajemen Keuangan': '#065f46',       // Emerald-800 (Dark Green)
  'Satuan Pengawasan Intern': '#f59e0b', // Amber
  'Sekretaris Perusahaan': '#1d4ed8',    // Dark Blue
  'HSE dan Teknologi': '#ef4444',        // Red
  'Sumber Daya Manusia': '#8b5cf6',      // Purple
  'Tidak Diketahui': '#64748b'           // Slate
};

export default function MonitoringAnggaran({ hideDetails = false }) {
  const { data, loading, error } = useIuranKeanggotaan();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'jumlahOrang', direction: 'desc' });
  const [expandedKompartemen, setExpandedKompartemen] = useState(null);
  const [filterAsosiasi, setFilterAsosiasi] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { chartData, asosiasiOptions } = useMemo(() => {
    const kompMap = {}; 
    const allAsosiasi = new Set();

    const normalizeAsosiasiName = (name) => {
      const original = (name || 'Asosiasi Tidak Bernama').trim();
      let cleaned = original;
      const lower = original.toLowerCase();

      // Kasus khusus yang sering typo atau beda penulisan
      if (lower.includes('certified management accountants') && !lower.includes('isaca')) {
        return 'Iuran Keanggotaan Certified Management Accountants';
      }
      if (lower.includes('konsultan pajak indonesia')) {
        return 'Iuran Keanggotaan Ikatan Konsultan Pajak Indonesia';
      }
      
      // IAI (Tangani typo seperti "Keanggotaaan")
      if (/^(iuran|pendaftaran).*?iai$/i.test(lower) || lower === 'iai') {
        return 'Iuran Keanggotaan IAI';
      }
      // IIA
      if (/^(iuran|pendaftaran).*?iia$/i.test(lower) || lower === 'iia') {
        return 'Iuran Keanggotaan IIA';
      }
      // PII
      if (/^(iuran|pendaftaran).*?pii$/i.test(lower) || lower === 'pii') {
        return 'Iuran Keanggotaan PII';
      }

      // Standarisasi prefix yang bervariasi menjadi satu bentuk baku ("Iuran Keanggotaan")
      const prefixRegex = /^(Pendaftaran Keanggotaan|Pendaftaran \& Keanggotaan|Pendaftaran dan Keanggotaan|Iuran keanggotaa?a?n|Pendaftaran)\s+/i;
      if (prefixRegex.test(cleaned)) {
          cleaned = cleaned.replace(prefixRegex, 'Iuran Keanggotaan ');
      }
      
      // Bersihkan spasi ganda jika ada
      return cleaned.replace(/\s+/g, ' ').trim();
    };

    data.forEach(item => {
      const komp = (item.kompartemen || 'Tidak Diketahui').trim();
      const rawAsosiasi = (item.asosiasi || 'Asosiasi Tidak Bernama').trim();
      const asosiasi = normalizeAsosiasiName(rawAsosiasi);
      const personName = (item.nama || 'Tidak Diketahui').trim();
      const personUnit = (item.unitKerja || '').trim();
      const nominal = Number(item.nominal) || 0;

      allAsosiasi.add(asosiasi);

      if (!kompMap[komp]) kompMap[komp] = {};
      if (!kompMap[komp][asosiasi]) kompMap[komp][asosiasi] = { people: new Set(), totalBiaya: 0 };
      
      const personData = JSON.stringify({ name: personName, unit: personUnit });
      kompMap[komp][asosiasi].people.add(personData);
      kompMap[komp][asosiasi].totalBiaya += nominal;
    });

    const cData = Object.keys(kompMap).map(k => {
      const asosiasiKeys = Object.keys(kompMap[k]);
      let totalAnggotaKomp = 0;
      
      const asosiasiDetails = asosiasiKeys.map(a => {
        const pSize = kompMap[k][a].people.size;
        totalAnggotaKomp += pSize;
        return {
          name: a,
          kompartemen: k,
          jumlahOrang: pSize,
          totalBiaya: kompMap[k][a].totalBiaya,
          orangList: Array.from(kompMap[k][a].people).map(p => JSON.parse(p)).sort((a,b) => a.name.localeCompare(b.name))
        };
      }).sort((a,b) => a.name.localeCompare(b.name));

      return {
        name: k,
        jumlah: asosiasiKeys.length,
        jumlahAnggota: totalAnggotaKomp,
        asosiasiDetails: asosiasiDetails
      };
    }).sort((a, b) => b.jumlah - a.jumlah);

    const asosiasiListUnique = Array.from(allAsosiasi).sort((a,b) => a.localeCompare(b));

    return { chartData: cData, asosiasiOptions: asosiasiListUnique };
  }, [data]);

  const finalChartData = useMemo(() => {
    if (filterAsosiasi === 'All') return chartData;
    return chartData.map(c => ({
      ...c,
      asosiasiDetails: c.asosiasiDetails.filter(a => a.name === filterAsosiasi)
    })).filter(c => c.asosiasiDetails.length > 0);
  }, [chartData, filterAsosiasi]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const totalAsosiasi = asosiasiOptions.length;
  const totalPeserta = chartData.reduce((sum, c) => sum + c.jumlahAnggota, 0);
  const totalAnggaran = data.reduce((sum, d) => sum + (Number(d.nominal) || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="text-slate-500 font-bold font-mono-data">Memuat Data Pemetaan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 font-bold flex flex-col items-center justify-center gap-2">
        <Info className="w-6 h-6" />
        <span>Gagal memuat data: {error}</span>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-700 text-lg">Belum Ada Data Asosiasi</h3>
        <p className="text-slate-500 text-sm">Tidak ditemukan relasi kompartemen dan asosiasi yang terdaftar.</p>
      </div>
    );
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(angka);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs font-mono-data">
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{data.name}</p>
          <div className="flex flex-col gap-1">
            <p className="text-[#005ea4] font-bold flex justify-between gap-4">
              <span>Asosiasi:</span> 
              <span>{data.jumlah}</span>
            </p>
            <p className="text-emerald-600 font-bold flex justify-between gap-4">
              <span>Anggota:</span> 
              <span>{data.jumlahAnggota}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const DonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs font-mono-data">
          <p className="font-bold text-slate-800 mb-1">{payload[0].name}</p>
          <p className="text-[#005ea4] font-bold">{formatRupiah(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    // Pecah teks yang kepanjangan jadi 2 baris agar tetap lurus & rapi
    const words = payload.value.split(' ');
    let line1 = payload.value;
    let line2 = '';
    
    if (words.length > 2 || (words.length === 2 && payload.value.length > 15)) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(' ');
      line2 = words.slice(mid).join(' ');
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={14} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight="bold">
          <tspan textAnchor="middle" x="0">{line1}</tspan>
          {line2 && <tspan textAnchor="middle" x="0" dy="12">{line2}</tspan>}
        </text>
      </g>
    );
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    if (sortConfig.direction === 'asc') return <ChevronUp className="w-3.5 h-3.5 text-blue-600" />;
    return <ChevronDown className="w-3.5 h-3.5 text-blue-600" />;
  };
  return (
    <div className="space-y-6 font-sans-clean animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Section: Overview Tabel Distribusi Asosiasi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#005ea4]" />
              Ringkasan Distribusi Asosiasi
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pemetaan sebaran jumlah asosiasi dan total anggota di setiap kompartemen
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full sm:w-[320px] text-[13px] font-bold bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:border-[#005ea4] hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#005ea4]/20 shadow-xs"
            >
              <span className="truncate pr-2 text-left">
                {filterAsosiasi === 'All' ? 'Filter: Semua Asosiasi' : filterAsosiasi}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
              className={`absolute top-full mt-2 right-0 w-full sm:w-[400px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-300 ease-out origin-top-right ${
                isDropdownOpen ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
              }`}
            >
              <div className="max-h-[320px] overflow-y-auto overscroll-contain py-2 custom-scrollbar">
                  <div
                    onClick={() => {
                      setFilterAsosiasi('All');
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 text-xs font-bold cursor-pointer transition-colors ${
                      filterAsosiasi === 'All' ? 'bg-blue-50 text-[#005ea4]' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Semua Asosiasi</span>
                    {filterAsosiasi === 'All' && <Check className="w-4 h-4 text-[#005ea4]" />}
                  </div>
                  
                  <div className="h-px bg-slate-100 my-1 mx-4"></div>
                  
                  {asosiasiOptions.map(opt => (
                    <div
                      key={opt}
                      onClick={() => {
                        setFilterAsosiasi(opt);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-start justify-between px-4 py-3 text-xs cursor-pointer transition-colors ${
                        filterAsosiasi === opt ? 'bg-blue-50 text-[#005ea4] font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <span className="leading-relaxed pr-4 text-left">{opt}</span>
                      {filterAsosiasi === opt && <Check className="w-4 h-4 text-[#005ea4] shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-0 mt-2 space-y-3">
          {finalChartData.map((row, idx) => {
              const baseColor = KOMPARTEMEN_COLORS[row.name] || '#94a3b8';
            const maxAnggota = Math.max(...finalChartData.map(d => d.jumlahAnggota), 1);
            const percentage = Math.max(2, (row.jumlahAnggota / maxAnggota) * 100);

            const isExpanded = filterAsosiasi !== 'All' ? true : expandedKompartemen === row.name;
            const kompartemenAsosiasi = row.asosiasiDetails;

            return (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl hover:border-slate-300 hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div 
                  onClick={() => setExpandedKompartemen(isExpanded ? null : row.name)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer gap-4 group"
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-4 w-full sm:w-1/3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105" 
                      style={{ backgroundColor: `${baseColor}15`, color: baseColor }}
                    >
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{row.name}</h4>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{row.jumlah} Asosiasi Terdaftar</p>
                    </div>
                  </div>
                  
                  {/* Center: Visual Progress Bar */}
                  <div className="flex-1 w-full sm:pl-8 sm:pr-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Kapasitas Anggota</span>
                      <span className="font-bold text-slate-700">{row.jumlahAnggota} Anggota</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: baseColor
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 animate-[pulse_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Chevron */}
                  <div className="hidden sm:flex items-center justify-center pr-2">
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Detail */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="bg-slate-50/50 border-t border-slate-100 p-5">
                      <h5 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#005ea4]" />
                        Detail Asosiasi & Peserta
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kompartemenAsosiasi.map((aso, asoIdx) => (
                          <div key={asoIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-[#005ea4]/30 transition-colors">
                            <div className="flex justify-between items-start mb-3 gap-2">
                              <h6 className="font-bold text-[13px] text-slate-800 leading-snug line-clamp-2">{aso.name}</h6>
                              <span className="bg-blue-50 text-[#005ea4] text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shrink-0">
                                {aso.jumlahOrang} Org
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Daftar Anggota:</p>
                              <ul className="space-y-1.5 mb-1">
                                {aso.orangList.map((orang, oIdx) => (
                                  <li key={oIdx} className="flex flex-col items-start gap-1 p-2 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-0.5"></span>
                                      <span className="text-xs font-semibold text-slate-700 leading-tight">{orang.name}</span>
                                    </div>
                                    {orang.unit && (
                                      <span className="text-[10px] text-slate-500 font-medium ml-3.5 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider">{orang.unit}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {finalChartData.length === 0 && (
            <div className="py-12 text-center text-slate-500 font-medium bg-slate-50/50 rounded-xl border border-slate-100">
              Belum ada data distribusi asosiasi.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Total Asosiasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center flex-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-500"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 font-mono-data uppercase tracking-wider mb-1">Total Asosiasi</p>
              <p className="text-4xl font-black text-slate-800">{totalAsosiasi}</p>
            </div>
          </div>
        </div>
        
        {/* Card Total Anggota */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center flex-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-colors duration-500"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 font-mono-data uppercase tracking-wider mb-1">Total Keanggotaan</p>
              <p className="text-4xl font-black text-slate-800">{totalPeserta}</p>
            </div>
          </div>
        </div>
      </div>



    </div>
  );
}
