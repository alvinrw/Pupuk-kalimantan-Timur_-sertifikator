import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Filter,
  X,
  RotateCcw,
  Check,
  Loader2,
  RotateCw,
  FileMinus,
  Wrench,
  Power,
  Wallet
} from 'lucide-react';
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
import MonitoringAnggaran from '../components/monitoring/MonitoringAnggaran';

export default function Dashboard() {
  const [filterKategori, setFilterKategori] = useState('All');
  const [filterUnitPabrik, setFilterUnitPabrik] = useState('All');
  const [filterStatusOperasional, setFilterStatusOperasional] = useState('All');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Custom Urgent Threshold
  const [customUrgentDays, setCustomUrgentDays] = useState(30);

  const [rawItems, setRawItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getMasterItems();
        setRawItems(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const allDashboardItems = useMemo(() => {
    const calcDiff = (dStr) => {
      if (!dStr || dStr === '-' || dStr === '2030-01-01' || dStr.trim() === '') return null;
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
          return dB - dA;
        })[0];
      } else if (certs.length > 0) {
        primaryCert = certs[0];
      }

      const rawExp = primaryCert?.expired || item.expiryDate;
      const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
      const hari = calcDiff(dateVal);
      
      const wfStatus = getWfStatus(item.status, item.documentStatus || 'EXEMPT');

      flattened.push({
        id: item.id,
        kategori: item.categoryKey || 'Lainnya',
        jenis: item.title || 'Unknown',
        unit: item.unitLocation || 'Umum',
        opStatus: item.status || 'Aktif',
        sisaHari: hari,
        workflowStatus: wfStatus
      });
    });
    return flattened;
  }, [rawItems]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterKategori !== 'All') count++;
    if (filterUnitPabrik !== 'All') count++;
    if (filterStatusOperasional !== 'All') count++;
    return count;
  }, [filterKategori, filterUnitPabrik, filterStatusOperasional]);

  const filteredItems = useMemo(() => {
    return allDashboardItems.filter(item => {
      const matchKategori = filterKategori === 'All' || item.kategori === filterKategori;
      const matchUnit = filterUnitPabrik === 'All' || item.unit === filterUnitPabrik;
      const matchOp = filterStatusOperasional === 'All' || item.opStatus === filterStatusOperasional;
      return matchKategori && matchUnit && matchOp;
    });
  }, [allDashboardItems, filterKategori, filterUnitPabrik, filterStatusOperasional]);

  const stats = useMemo(() => {
    const threshold = parseInt(customUrgentDays) || 30;
    
    // Legalitas Stats
    const expired = filteredItems.filter(c => c.sisaHari !== null && c.sisaHari <= 0 && c.workflowStatus !== 'decommissioned').length;
    const urgent = filteredItems.filter(c => c.sisaHari !== null && c.sisaHari > 0 && c.sisaHari <= threshold && c.workflowStatus !== 'decommissioned').length;
    const valid = filteredItems.filter(c => (c.sisaHari === null || c.sisaHari > threshold) && c.workflowStatus !== 'decommissioned' && c.workflowStatus !== 'exempt').length;
    
    const totalActive = filteredItems.filter(c => c.workflowStatus !== 'decommissioned').length;
    
    // Operasional Fisik & Workflow Stats
    const inProgress = filteredItems.filter(c => c.workflowStatus === 'in_progress').length;
    const decommissioned = filteredItems.filter(c => c.workflowStatus === 'decommissioned').length;
    const exempt = filteredItems.filter(c => c.workflowStatus === 'exempt').length;
    
    const opAktif = filteredItems.filter(c => c.opStatus === 'Aktif' || c.opStatus === 'Proses').length;
    const opRusak = filteredItems.filter(c => c.opStatus === 'Rusak').length;
    const opRepair = filteredItems.filter(c => c.opStatus === 'Repair').length;

    return { 
      expired, urgent, valid, totalActive, threshold,
      inProgress, decommissioned, exempt,
      opAktif, opRusak, opRepair 
    };
  }, [filteredItems, customUrgentDays]);

  const statusPieData = [
    { name: 'Sertifikat Valid', value: stats.valid, color: '#10B981' },
    { name: 'Tanpa Sertifikat (Exempt)', value: stats.exempt, color: '#94A3B8' },
    { name: `Urgent (ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤ ${stats.threshold} Hari)`, value: stats.urgent, color: '#F59E0B' },
    { name: 'Expired', value: stats.expired, color: '#EF4444' },
  ];

  const categoryBarData = useMemo(() => {
    const threshold = parseInt(customUrgentDays) || 30;
    const categories = Array.from(new Set(allDashboardItems.map(i => i.kategori)));
    return categories.map(cat => {
      const catItems = filteredItems.filter(i => i.kategori === cat);
      return {
        name: cat,
        Valid: catItems.filter(c => (c.sisaHari === null || c.sisaHari > threshold) && c.workflowStatus !== 'decommissioned').length,
        Urgent: catItems.filter(c => c.sisaHari !== null && c.sisaHari > 0 && c.sisaHari <= threshold && c.workflowStatus !== 'decommissioned').length,
        Expired: catItems.filter(c => c.sisaHari !== null && c.sisaHari <= 0 && c.workflowStatus !== 'decommissioned').length,
      };
    }).filter(u => u.Valid > 0 || u.Urgent > 0 || u.Expired > 0 || filterKategori === u.name);
  }, [filteredItems, allDashboardItems, filterKategori, customUrgentDays]);

  const resetFilters = () => {
    setFilterKategori('All');
    setFilterUnitPabrik('All');
    setFilterStatusOperasional('All');
    setCustomUrgentDays(30);
  };

  const getCategoryOptions = () => ['All', ...new Set(allDashboardItems.map(item => item.kategori))];
  const getUnitOptions = () => ['All', ...new Set(allDashboardItems.map(item => item.unit))];

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Statistik Dashboard Overview...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 font-sans-clean max-w-[1600px] mx-auto bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 font-mono-data text-xs md:text-sm max-w-2xl leading-relaxed">
            Ringkasan status legalitas dan operasional fisik seluruh aset, peralatan pabrik, proyek, dan dokumen HAKI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-lg transition-colors shadow-2xs font-mono-data"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filter ({activeFilterCount})
            </button>
          )}
          
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-lg transition-all shadow-xs ${
              activeFilterCount > 0 ? 'bg-[#005ea4] text-white hover:bg-[#004881]' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter Data Global</span>
            {activeFilterCount > 0 && <span className="w-5 h-5 bg-white text-[#005ea4] rounded-full text-[10px] ml-1 flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {/* STATISTIK UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Status Legalitas */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider font-mono-data">
            <FileCheck2 className="w-4 h-4 text-[#005ea4]" />
            Status Legalitas Sertifikat
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-[#005ea4] transition-colors">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors z-0"></div>
              <div className="relative z-10 flex flex-col space-y-1">
                <span className="text-emerald-800 font-mono-data text-xs font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sertifikat Valid
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-emerald-600">{stats.valid}</span>
                  <span className="text-xs text-emerald-700 font-mono-data mb-1.5 font-bold">item</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-amber-400 transition-colors">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full transition-colors z-0"></div>
              <div className="relative z-10 flex flex-col space-y-1">
                <div className="flex items-center gap-1 mb-1 relative z-20">
                  <span className="text-amber-800 font-mono-data text-[10px] sm:text-[11px] font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 hidden sm:block" /> Urgent &le;
                  </span>
                  <input
                    type="number"
                    value={customUrgentDays}
                    onChange={(e) => setCustomUrgentDays(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-10 px-1 py-0.5 text-xs font-bold text-amber-900 bg-amber-100/50 border border-amber-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-amber-800 font-mono-data text-[10px] sm:text-[11px] font-bold uppercase">Hr</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-amber-600">{stats.urgent}</span>
                  <span className="text-xs text-amber-700 font-mono-data mb-1.5 font-bold">item</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-rose-400 transition-colors">
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-rose-500/10 rounded-tl-full transition-colors z-0"></div>
              <div className="relative z-10 flex flex-col space-y-1">
                <span className="text-rose-800 font-mono-data text-xs font-bold uppercase flex items-center gap-1.5 mt-1.5 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Expired
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-rose-600">{stats.expired}</span>
                  <span className="text-xs text-rose-700 font-mono-data mb-1.5 font-bold">item</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Operasional Fisik & Administratif */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider font-mono-data">
            <Activity className="w-4 h-4 text-[#005ea4]" />
            Status Operasional Fisik & Berkas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 h-[116px]">
            
            {/* Fisik Aktif */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-center transition-colors">
              <span className="text-emerald-700 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1 mb-1 leading-tight">
                <Power className="w-3 h-3 shrink-0" /> Fisik Aktif
              </span>
              <span className="text-2xl font-extrabold text-emerald-600">{stats.opAktif}</span>
            </div>

            {/* Rusak / Repair */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-center transition-colors">
              <span className="text-rose-700 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1 mb-1 leading-tight">
                <Wrench className="w-3 h-3 shrink-0" /> Rusak/Repair
              </span>
              <span className="text-2xl font-extrabold text-rose-600">{stats.opRusak + stats.opRepair}</span>
            </div>

            {/* In Progress */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-center transition-colors">
              <span className="text-amber-700 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1 mb-1 leading-tight">
                <RotateCw className="w-3 h-3 shrink-0" /> In Progress
              </span>
              <span className="text-2xl font-extrabold text-amber-600">{stats.inProgress}</span>
            </div>

            {/* Non Sertifikat */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-center transition-colors">
              <span className="text-slate-600 font-mono-data text-[10px] font-bold uppercase flex items-center gap-1 mb-1 leading-tight">
                <FileMinus className="w-3 h-3 shrink-0" /> Non Sertifikat
              </span>
              <span className="text-2xl font-extrabold text-slate-700">{stats.exempt}</span>
            </div>

          </div>
        </div>
      </div>

      {/* CHART VISUALISASI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart */}
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

        {/* Bar Chart (Per Kategori) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs col-span-1 lg:col-span-2 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-bold text-slate-800 text-sm">Pemetaan Status per Kategori Perizinan</h3>
            {filterKategori !== 'All' && (
              <span className="text-[10px] px-2 py-1 bg-blue-50 text-[#005ea4] border border-blue-200 rounded font-bold">Filtered: {filterKategori}</span>
            )}
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
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                <Bar dataKey="Valid" stackId="a" fill="#10B981" name="Valid / Aman" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Urgent" stackId="a" fill="#F59E0B" name={`Urgent (ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤ ${stats.threshold} Hr)`} />
                <Bar dataKey="Expired" stackId="a" fill="#EF4444" name="Expired" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MONITORING ANGGARAN */}
      <div className="pt-8 mt-8 border-t border-slate-200">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Wallet className="w-6 h-6 text-[#005ea4]" />
            Anggaran & Iuran
          </h2>
          <p className="text-sm text-slate-500 font-medium ml-8">Ringkasan serapan dan rincian iuran keanggotaan.</p>
        </div>
        <MonitoringAnggaran />
      </div>

      {/* FILTER MODAL */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">Filter Kategori & Data</h3>
                  <p className="text-xs text-slate-400 font-mono-data">Sesuaikan data yang ingin ditampilkan</p>
                </div>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs font-mono-data">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">1. Kategori Perizinan Utama</label>
                <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] cursor-pointer">
                  {getCategoryOptions().map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'Semua Jenis Perizinan' : cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">2. Status Fisik Peralatan</label>
                <select value={filterStatusOperasional} onChange={(e) => setFilterStatusOperasional(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] cursor-pointer">
                  <option value="All">Semua Status Fisik Operasional</option>
                  <option value="Aktif">Aktif (Operasional Normal)</option>
                  <option value="Repair">Repair (Dalam Perbaikan/Overhaul)</option>
                  <option value="Rusak">Rusak (Out of Service / Tidak Laik)</option>
                  <option value="Afkir">Afkir (Decommissioned)</option>
                </select>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button type="button" onClick={() => { resetFilters(); setIsFilterModalOpen(false); }} className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors font-mono-data">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
              <button type="button" onClick={() => setIsFilterModalOpen(false)} className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors font-mono-data cursor-pointer">
                <Check className="w-4 h-4" />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
