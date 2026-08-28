import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Clock,
  CheckCircle2,
  Filter,
  X,
  RotateCcw,
  Loader2,
  FileMinus,
  Wrench,
  Power,
  Wallet,
  FileX,
  Ban,
  Database,
  Users,
  ChevronDown
} from 'lucide-react';

const AnimatedDropdown = ({ value, options, onChange, variant = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLabel = (val) => {
    const opt = options.find(o => o.value === val);
    return opt ? opt.label : val;
  };

  const isLight = variant === 'light';
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none transition-all duration-200 cursor-pointer shadow-xs min-w-[180px] ${
          isLight 
            ? 'bg-white border border-slate-300 text-slate-800 hover:border-[#005ea4] hover:bg-slate-50' 
            : 'bg-slate-700 border border-slate-600 text-white hover:border-[#005ea4] hover:bg-slate-600'
        } ${isOpen && isLight ? 'border-[#005ea4] ring-1 ring-[#005ea4]/20' : ''} ${isOpen && !isLight ? 'border-[#005ea4] ring-1 ring-[#005ea4]/50' : ''}`}
      >
        <span className="truncate">{getLabel(value)}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} ${isLight ? 'text-slate-400' : 'text-slate-300'}`} />
      </button>

      <div 
        className={`absolute z-50 mt-1 w-max min-w-[100%] rounded-xl border shadow-xl overflow-hidden transform transition-all duration-200 origin-top-left ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        } ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}
      >
        <div className="py-1.5 flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`text-left px-3 py-2 text-xs font-semibold transition-colors duration-150 ${
                value === opt.value
                  ? (isLight ? 'bg-blue-50 text-[#005ea4]' : 'bg-slate-700 text-white')
                  : (isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white')
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getMasterItems } from '../services/masterItemsService';
import { getIuranKeanggotaan } from '../services/iuranService';
import MonitoringAnggaran from '../components/monitoring/MonitoringAnggaran';export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('perizinan'); // 'perizinan' | 'administrasi'
  const [filterKategori, setFilterKategori] = useState('All');
  const [customUrgentDays, setCustomUrgentDays] = useState(30);

  // States untuk filter Tanggal Terbit di bagian bawah
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filterKategoriBawah, setFilterKategoriBawah] = useState('All');

  const [rawItems, setRawItems] = useState([]);
  const [iuranData, setIuranData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [data, iuran] = await Promise.all([
          getMasterItems(),
          getIuranKeanggotaan()
        ]);
        setRawItems(data);
        setIuranData(iuran);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const COLORS = ['#005ea4', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#f97316'];

  const iuranChartData = useMemo(() => {
    const counts = {};
    iuranData.forEach(item => {
      const comp = item.kompartemen || 'Lainnya';
      counts[comp] = (counts[comp] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [iuranData]);

  // Memetakan semua items ke format flat untuk dashboard
  const allDashboardItems = useMemo(() => {
    const calcDiff = (dStr) => {
      if (!dStr || dStr === '-' || dStr === '2030-01-01' || dStr.trim() === '') return -999;
      const expiry = new Date(dStr);
      if (isNaN(expiry.getTime())) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);
      return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getWfStatus = (st, docSt) => {
      const lowerSt = (st || '').toLowerCase();
      if (lowerSt === 'afkir' || lowerSt === 'decommissioned') return 'decommissioned';
      if (lowerSt === 'perpanjang' || lowerSt === 'perpanjangan' || lowerSt === 'in progress' || lowerSt === 'in_progress') return 'in_progress';
      if (docSt === 'EXEMPT') return 'exempt';
      return 'completed';
    };

    const flattened = [];
    rawItems.forEach(item => {
      if (item.documentStatus === 'PENDING_DOC') return;

      const certs = item.certificates || [];
      const activeCerts = certs.filter(c => c.status === 'Aktif' || c.status === 'Active' || !c.status);

      let primaryCert = null;
      if (activeCerts.length > 0) {
        primaryCert = activeCerts.slice().sort((a, b) => {
          const dA = new Date(a.expired && a.expired !== '-' ? a.expired : '1970-01-01').getTime();
          const dB = new Date(b.expired && b.expired !== '-' ? b.expired : '1970-01-01').getTime();
          if (dA !== dB) return dB - dA;
          const hasPdfA = !!a.fileUrl;
          const hasPdfB = !!b.fileUrl;
          if (hasPdfA !== hasPdfB) return hasPdfB ? 1 : -1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        })[0];
      } else if (certs.length > 0) {
        primaryCert = certs[0];
      }

      const formatCategoryName = (key) => {
        if (!key) return 'Lainnya';
        if (key === 'peralatan-pabrik' || key.toLowerCase() === 'peralatan pabrik') return 'Perizinan Peralatan Pabrik';
        if (key === 'perizinan-aset' || key.toLowerCase() === 'perizinan aset') return 'Perizinan Aset';
        if (key === 'perizinan-proyek' || key.toLowerCase() === 'perizinan proyek') return 'Perizinan Proyek';
        if (key === 'perizinan-produk' || key.toLowerCase() === 'perizinan produk') return 'Perizinan Produk';
        if (key === 'sertifikat-ciptaan' || key.toLowerCase() === 'sertifikat ciptaan') return 'Perizinan Hak Cipta';
        // Biarkan key aslinya jika tidak match, contohnya "Perizinan"
        return key.charAt(0).toUpperCase() + key.slice(1);
      };

      const formatToDDMMYYYY = (rawDateStr) => {
        if (!rawDateStr || rawDateStr === '-') return '-';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDateStr)) return rawDateStr;
        try {
          const dObj = new Date(rawDateStr);
          if (!isNaN(dObj.getTime())) {
            const dd = String(dObj.getDate()).padStart(2, '0');
            const mm = String(dObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dObj.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
          }
        } catch (_) { }
        return rawDateStr;
      };

      const rawExp = primaryCert?.expired || item.expiryDate;
      const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
      const hari = calcDiff(dateVal);
      const tglExpiredFormatted = formatToDDMMYYYY(dateVal);

      const wfStatus = getWfStatus(item.status, item.documentStatus || 'EXEMPT');

      const rawTerbit = primaryCert?.terbit || item.issueDate || '-';
      const tglTerbitFormatted = formatToDDMMYYYY(rawTerbit);

      flattened.push({
        id: item.id,
        kategori: formatCategoryName(item.categoryKey),
        jenis: item.title || 'Unknown',
        unit: item.unitLocation || 'Umum',
        opStatus: item.status || 'Aktif',
        sisaHari: hari,
        workflowStatus: wfStatus,
        merekItem: item.title || '-',
        nomorSeriTipe: item.code || '-',
        nomorSertifikat: primaryCert?.noSertifikat || primaryCert?.noIzin || (item.documentStatus === 'EXEMPT' || item.documentStatus === 'PENDING_DOC' ? 'Tanpa Sertifikat' : '-'),
        tglExpired: tglExpiredFormatted,
        tglTerbit: tglTerbitFormatted
      });
    });
    return flattened;
  }, [rawItems]);

  const filteredItems = useMemo(() => {
    return allDashboardItems.filter(item => {
      const matchKategori = filterKategori === 'All' || item.kategori === filterKategori;
      return matchKategori;
    });
  }, [allDashboardItems, filterKategori]);

  const stats = useMemo(() => {
    const threshold = parseInt(customUrgentDays) || 30;

    const expired = filteredItems.filter(c => c.sisaHari !== null && c.sisaHari <= 0 && c.workflowStatus !== 'decommissioned').length;
    const urgent = filteredItems.filter(c => c.sisaHari !== null && c.sisaHari > 0 && c.sisaHari <= threshold && c.workflowStatus !== 'decommissioned').length;
    const valid = filteredItems.filter(c => (c.sisaHari === null || c.sisaHari > threshold) && c.workflowStatus !== 'decommissioned' && c.workflowStatus !== 'exempt').length;

    const decommissioned = filteredItems.filter(c => c.workflowStatus === 'decommissioned').length;
    const exempt = filteredItems.filter(c => c.workflowStatus === 'exempt').length;
    const total = filteredItems.length;
    const totalActive = filteredItems.filter(c => c.workflowStatus !== 'decommissioned').length;

    return {
      expired, urgent, valid, threshold,
      decommissioned, exempt, total, totalActive
    };
  }, [filteredItems, customUrgentDays]);

  const statusPieData = [
    { name: 'Sertifikat Valid', value: stats.valid, color: '#10B981' },
    { name: 'Tanpa Sertifikat (Exempt)', value: stats.exempt, color: '#94A3B8' },
    { name: `Urgent (≤ ${stats.threshold} Hari)`, value: stats.urgent, color: '#F59E0B' },
    { name: 'Expired', value: stats.expired, color: '#EF4444' },
  ];

  // Data Bar Chart (pemetaan kategori)
  const categoryBarData = useMemo(() => {
    const threshold = parseInt(customUrgentDays) || 30;
    const categories = Array.from(new Set(allDashboardItems.map(i => i.kategori)));
    return categories.map(cat => {
      const catItems = filteredItems.filter(i => i.kategori === cat);
      return {
        name: cat,
        Valid: catItems.filter(c => (c.sisaHari === null || c.sisaHari > threshold) && c.workflowStatus !== 'decommissioned' && c.workflowStatus !== 'exempt').length,
        Urgent: catItems.filter(c => c.sisaHari !== null && c.sisaHari > 0 && c.sisaHari <= threshold && c.workflowStatus !== 'decommissioned').length,
        Expired: catItems.filter(c => c.sisaHari !== null && c.sisaHari <= 0 && c.workflowStatus !== 'decommissioned').length,
      };
    }).filter(u => u.Valid > 0 || u.Urgent > 0 || u.Expired > 0 || filterKategori === u.name);
  }, [filteredItems, allDashboardItems, filterKategori, customUrgentDays]);

  // Filtering untuk list tabel Terbit di bagian bawah
  const displayedIssuedCertificates = useMemo(() => {
    return filteredItems.filter(item => {
      // 1. Filter by Search Query
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          item.merekItem.toLowerCase().includes(q) ||
          item.jenis.toLowerCase().includes(q) ||
          item.nomorSeriTipe.toLowerCase().includes(q) ||
          item.nomorSertifikat.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Filter by Date Range Terbit
      if (isDateFilterActive) {
        if (!item.tglTerbit || item.tglTerbit === '-') return false;
        const pubDate = new Date(item.tglTerbit);
        if (isNaN(pubDate.getTime())) return false;

        if (dateRangeStart) {
          const start = new Date(dateRangeStart + '-01');
          if (pubDate < start) return false;
        }
        if (dateRangeEnd) {
          const [ey, em] = dateRangeEnd.split('-').map(Number);
          const end = new Date(ey, em, 0); // hari terakhir di bulan tersebut
          if (pubDate > end) return false;
        }
      }
      // 3. Filter by Category khusus Bawah
      if (filterKategoriBawah !== 'All') {
        if (item.kategori !== filterKategoriBawah) return false;
      }

      return true;
    });
  }, [filteredItems, searchTerm, dateRangeStart, dateRangeEnd, isDateFilterActive, filterKategoriBawah]);

  const chartDataSertifikatTerbit = useMemo(() => {
    const counts = {};
    displayedIssuedCertificates.forEach(item => {
      const cat = item.kategori || 'Lainnya';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      Jumlah: counts[key]
    })).sort((a, b) => b.Jumlah - a.Jumlah);
  }, [displayedIssuedCertificates]);

  const handleApplyDateFilter = () => {
    setIsDateFilterActive(!!(dateRangeStart || dateRangeEnd));
  };

  const handleResetDateFilter = () => {
    setDateRangeStart('');
    setDateRangeEnd('');
    setIsDateFilterActive(false);
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['No', 'Kategori', 'Jenis', 'Merek/Nama', 'No Seri', 'No Sertifikat', 'Tgl Terbit', 'Tgl Expired', 'Status'];
    const rows = displayedIssuedCertificates.map((doc, idx) => [
      idx + 1,
      doc.kategori || '-',
      doc.jenis || '-',
      doc.merekItem || '-',
      doc.nomorSeriTipe || '-',
      doc.nomorSertifikat || '-',
      doc.tglTerbit !== '-' ? doc.tglTerbit : '-',
      doc.tglExpired !== '-' ? doc.tglExpired : '-',
      doc.workflowStatus || '-'
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_terbit_sertifikasi_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(displayedIssuedCertificates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_terbit_sertifikasi_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Statistik Dashboard Overview...</p>
      </div>
    );
  }

  const getCategoryOptions = () => {
    const predefined = [
      'Perizinan Peralatan Pabrik',
      'Perizinan Aset',
      'Perizinan Proyek',
      'Perizinan Produk'
    ];
    const categories = Array.from(new Set(allDashboardItems.map(i => i.kategori))).filter(Boolean);
    const combined = Array.from(new Set([...predefined, ...categories]));
    return ['All', ...combined.sort()];
  };

  const indicators = [
    { label: 'Non-Sertifikat', value: stats.exempt, color: '#64748B' },
    { label: 'Afkir / Non-Aktif', value: stats.decommissioned, color: '#0f172a' },
    { label: 'Sertifikat Aktif', value: stats.valid, color: '#10B981' },
    { label: 'Expired', value: stats.expired, color: '#EF4444' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 font-sans-clean max-w-[1400px] mx-auto bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 font-mono-data text-xs md:text-sm max-w-2xl leading-relaxed">
            Ringkasan status legalitas dan operasional seluruh aset, peralatan pabrik, proyek, dan dokumen HAKI.
          </p>
        </div>

        {/* Inline Filter Kategori */}
        {activeTab === 'perizinan' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold text-slate-600 font-mono-data whitespace-nowrap">Kategori Perizinan:</label>
              <AnimatedDropdown
                variant="light"
                value={filterKategori}
                onChange={setFilterKategori}
                options={getCategoryOptions().map(cat => ({
                  value: cat,
                  label: cat === 'All' ? 'Semua Jenis Perizinan' : cat
                }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl shadow-xs border border-slate-200">
        <button
          onClick={() => setActiveTab('perizinan')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'perizinan'
              ? 'bg-[#005ea4] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Overview Perizinan & Sertifikat
        </button>
        <button
          onClick={() => setActiveTab('administrasi')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'administrasi'
              ? 'bg-[#005ea4] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Administrasi & Keanggotaan
        </button>
      </div>

      {activeTab === 'perizinan' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* SUMMARY CARDS — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Urgent */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono-data text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
                Urgent ≤
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={customUrgentDays}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setCustomUrgentDays(val === '' ? '' : Math.max(1, parseInt(val) || 1));
                  }}
                  className="w-7 px-0 py-0.5 text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-[#005ea4] focus:bg-white"
                />
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-slate-800">{stats.urgent}</span>
              <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">item</span>
            </div>
          </div>
        </div>

        {/* Card 2: Sertifikat Aktif */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col space-y-2">
            <span className="text-slate-500 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sertifikat Aktif
            </span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-slate-800">{stats.valid}</span>
              <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">item</span>
            </div>
          </div>
        </div>

        {/* Card 3: Non-Sertifikat */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col space-y-2">
            <span className="text-slate-500 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1.5">
              <FileX className="w-3.5 h-3.5" /> Non-Sertifikat
            </span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-slate-800">{stats.exempt}</span>
              <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">item</span>
            </div>
          </div>
        </div>

        {/* Card 4: Expired */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col space-y-2">
            <span className="text-slate-500 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Expired
            </span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-slate-800">{stats.expired}</span>
              <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">item</span>
            </div>
          </div>
        </div>

        {/* Card 5: Non-Aktif / Afkir */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col space-y-2">
            <span className="text-slate-500 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5" /> Non-Aktif / Afkir
            </span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-slate-800">{stats.decommissioned}</span>
              <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">item</span>
            </div>
          </div>
        </div>

        {/* Card 6: Total Keseluruhan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col space-y-2">
            <span className="text-slate-500 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Total Keseluruhan
            </span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-slate-800">{stats.total}</span>
              <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">item</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHART VISUALISASI (BULAT-BULAT & PEMETAAN KATEGORI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart (Bulat-bulat) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col relative overflow-hidden">
          <h3 className="font-bold text-slate-800 text-sm mb-4 relative z-10">Distribusi Status Sertifikat</h3>
          <div className="flex-1 min-h-[250px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Item`, 'Jumlah']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-slate-800">{stats.totalActive}</span>
              <span className="text-[10px] text-slate-500 font-mono-data font-bold">Total Aktif</span>
            </div>
          </div>
          <div className="mt-4 space-y-2 relative z-10">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono-data">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart (Kategori) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs col-span-1 lg:col-span-2 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-bold text-slate-800 text-sm">Pemetaan Status Kategori Perizinan</h3>
          </div>

          <div className="flex-1 min-h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                <Bar dataKey="Valid" stackId="a" fill="#10B981" name="Valid / Aman" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Urgent" stackId="a" fill="#F59E0B" name={`Urgent (≤ ${stats.threshold} Hr)`} />
                <Bar dataKey="Expired" stackId="a" fill="#EF4444" name="Expired" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* SECTION: Sertifikat Terbit — Filter + Tabel */}
      <div className="pt-8 mt-8 border-t border-slate-200">
        <div className="mb-4 flex flex-col xl:flex-row xl:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <Database className="w-5 h-5 text-[#005ea4]" />
              Data Sertifikat Terbit
              <span className="ml-2 px-2.5 py-0.5 bg-blue-100 text-[#005ea4] text-xs rounded-full font-bold">
                {displayedIssuedCertificates.length} Total
              </span>
            </h2>
            <p className="text-sm text-slate-500 font-medium ml-7">Riwayat sertifikat yang telah terbit berdasarkan rentang waktu dan kategori.</p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 ml-7 xl:ml-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs font-mono-data"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shadow-xs font-mono-data"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-800 rounded-xl px-5 py-3 flex flex-wrap items-end gap-4 mb-0">
          {/* Date Range */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono-data font-bold mb-0.5">Dari</span>
              <input
                type="month"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
              />
            </div>
            <span className="text-slate-400 text-xs mb-1.5">s.d.</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono-data font-bold mb-0.5">Sampai</span>
              <input
                type="month"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
              />
            </div>
            <button
              onClick={handleApplyDateFilter}
              className="px-3.5 py-1 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-lg transition-colors font-mono-data shadow-xs mb-0.5"
            >
              Terapkan
            </button>
            {isDateFilterActive && (
              <button
                onClick={handleResetDateFilter}
                className="px-2 py-1 text-slate-300 hover:text-white font-bold text-xs rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors flex items-center gap-1 mb-0.5"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-slate-600" />

          {/* Category Filter */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono-data font-bold mb-0.5 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Kategori / Jenis Perizinan
              </span>
              <AnimatedDropdown
                variant="dark"
                value={filterKategoriBawah}
                onChange={setFilterKategoriBawah}
                options={[
                  { value: 'All', label: 'Semua Jenis Perizinan' },
                  ...getCategoryOptions().filter(cat => cat !== 'All').map(cat => ({
                    value: cat,
                    label: cat
                  }))
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Sertifikat Terbit */}
      {chartDataSertifikatTerbit.length > 0 && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 font-mono-data">Grafik Distribusi Kategori Sertifikat Terbit</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataSertifikatTerbit} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                />
                <Bar dataKey="Jumlah" fill="#005ea4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
              <th className="py-3 px-4 text-center font-bold">NO.</th>
              <th className="py-3 px-4 font-bold text-[#005ea4]">KATEGORI DOKUMEN</th>
              <th className="py-3 px-4 font-bold">JENIS PERIZINAN / ALAT</th>
              <th className="py-3 px-4 font-bold">MEREK / NAMA ITEM</th>
              <th className="py-3 px-4 font-bold">NOMOR SERI / TAG</th>
              <th className="py-3 px-4 font-bold">NO. SERTIFIKAT</th>
              <th className="py-3 px-4 font-bold">TANGGAL TERBIT</th>
              <th className="py-3 px-4 font-bold">TANGGAL EXPIRATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {displayedIssuedCertificates.length > 0 ? (
              displayedIssuedCertificates.map((item, index) => {
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono-data font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#005ea4]">
                      {item.kategori}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {item.jenis}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.merekItem}
                    </td>
                    <td className="py-3 px-4 font-mono-data text-slate-600">
                      {item.nomorSeriTipe}
                    </td>
                    <td className="py-3 px-4 font-mono-data text-slate-800">
                      {item.nomorSertifikat}
                    </td>
                    <td className="py-3 px-4 font-mono-data font-bold text-slate-700">
                      {item.tglTerbit !== '-' ? item.tglTerbit : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono-data font-bold text-slate-900">
                      {item.tglExpired !== '-' ? item.tglExpired : '-'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500 font-mono-data">
                  Tidak ada sertifikat yang terbit pada kriteria/rentang ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
      )}

      {activeTab === 'administrasi' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 flex flex-col xl:flex-row xl:items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                <Users className="w-5 h-5 text-[#005ea4]" />
                Data Keanggotaan & Administrasi Lainnya
              </h2>
              <p className="text-sm text-slate-500 font-medium ml-7">Overview sebaran kapasitas anggota dan asosiasi per kompartemen.</p>
            </div>
          </div>
          <MonitoringAnggaran />
        </div>
      )}
    </div>
  );
}
