import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Clock,
  CheckCircle2,
  Wrench,
  XCircle,
  Activity,
  Filter,
  X,
  RotateCcw,
  Check
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
  Cell
} from 'recharts';

export default function Dashboard({ stats }) {
  // Category & Multi-Parameter Filter States
  const [filterKategori, setFilterKategori] = useState('All');
  const [filterUnitPabrik, setFilterUnitPabrik] = useState('All');
  const [filterStatusOperasional, setFilterStatusOperasional] = useState('All');

  // Pop-up Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Master Data Mock per Kategori untuk Dashboard Interaktif
  const allDashboardItems = useMemo(() => [
    // Peralatan Pabrik
    { id: 1, kategori: "Perizinan Peralatan Pabrik", jenis: "Penyalur Petir", unit: "UBS 6", opStatus: "Aktif", legalStatus: "warning", sisaHari: 25 },
    { id: 2, kategori: "Perizinan Peralatan Pabrik", jenis: "Fire Alarm System", unit: "Diklat B", opStatus: "Aktif", legalStatus: "warning", sisaHari: 55 },
    { id: 3, kategori: "Perizinan Peralatan Pabrik", jenis: "Timbangan Metrologi", unit: "Pabrik NPK", opStatus: "Aktif", legalStatus: "valid", sisaHari: 210 },
    { id: 4, kategori: "Perizinan Peralatan Pabrik", jenis: "Bejana Tekan", unit: "Pabrik 2", opStatus: "Repair", legalStatus: "expired", sisaHari: -10 },
    { id: 5, kategori: "Perizinan Peralatan Pabrik", jenis: "Crane / PAA", unit: "Pabrik 3", opStatus: "Repair", legalStatus: "warning", sisaHari: 80 },
    { id: 6, kategori: "Perizinan Peralatan Pabrik", jenis: "Tangki Timbun B3", unit: "Pabrik 5", opStatus: "Aktif", legalStatus: "warning", sisaHari: 68 },
    { id: 7, kategori: "Perizinan Peralatan Pabrik", jenis: "Diesel Fire Pump", unit: "Pabrik 1A", opStatus: "Rusak", legalStatus: "expired", sisaHari: -25 },
    { id: 8, kategori: "Perizinan Peralatan Pabrik", jenis: "Boiler Utilitas", unit: "Pabrik 4", opStatus: "Aktif", legalStatus: "valid", sisaHari: 400 },
    
    // Perizinan Aset
    { id: 9, kategori: "Perizinan Aset", jenis: "Sertifikat HGB & Lahan", unit: "Kawasan Industri", opStatus: "Aktif", legalStatus: "valid", sisaHari: 220 },
    { id: 10, kategori: "Perizinan Aset", jenis: "Izin Dampak Lingkungan (AMDAL)", unit: "Kawasan Utama", opStatus: "Aktif", legalStatus: "valid", sisaHari: 500 },

    // Perizinan Proyek
    { id: 11, kategori: "Perizinan Proyek", jenis: "Sertifikat Laik Fungsi (SLF)", unit: "Pabrik 6", opStatus: "Aktif", legalStatus: "warning", sisaHari: 18 },

    // Perizinan Produk
    { id: 12, kategori: "Perizinan Produk", jenis: "Sertifikasi SNI Urea", unit: "Pabrik 1A", opStatus: "Aktif", legalStatus: "valid", sisaHari: 660 },

    // Administrasi Lainnya
    { id: 13, kategori: "Administrasi Lainnya", jenis: "Ciptaan Program Komputer", unit: "Gedung Utama", opStatus: "Aktif", legalStatus: "valid", sisaHari: 950 }
  ], []);

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterKategori !== 'All') count++;
    if (filterUnitPabrik !== 'All') count++;
    if (filterStatusOperasional !== 'All') count++;
    return count;
  }, [filterKategori, filterUnitPabrik, filterStatusOperasional]);

  // Filtered items based on dropdown selections
  const filteredItems = useMemo(() => {
    return allDashboardItems.filter(item => {
      const matchKategori = filterKategori === 'All' || item.kategori === filterKategori;
      const matchUnit = filterUnitPabrik === 'All' || item.unit === filterUnitPabrik;
      const matchOp = filterStatusOperasional === 'All' || item.opStatus === filterStatusOperasional;
      return matchKategori && matchUnit && matchOp;
    });
  }, [allDashboardItems, filterKategori, filterUnitPabrik, filterStatusOperasional]);

  // Dynamic Operational Counts
  const opStats = useMemo(() => {
    const aktif = filteredItems.filter(i => i.opStatus === 'Aktif').length;
    const repair = filteredItems.filter(i => i.opStatus === 'Repair').length;
    const rusak = filteredItems.filter(i => i.opStatus === 'Rusak').length;
    return { aktif, repair, rusak };
  }, [filteredItems]);

  // Dynamic Legal Permit Counts
  const legalStats = useMemo(() => {
    const total = filteredItems.length;
    const valid = filteredItems.filter(i => i.legalStatus === 'valid').length;
    const warning = filteredItems.filter(i => i.legalStatus === 'warning').length;
    const expired = filteredItems.filter(i => i.legalStatus === 'expired').length;
    return { total, valid, warning, expired };
  }, [filteredItems]);

  const statusPieData = [
    { name: 'Sertifikat Valid', value: legalStats.valid, color: '#10B981' },
    { name: 'Akan Expired (< 30 Hari)', value: legalStats.warning, color: '#F59E0B' },
    { name: 'Expired / Perlu Renewal', value: legalStats.expired, color: '#EF4444' },
  ];

  const plantBarData = useMemo(() => {
    const units = ['Pabrik 1A', 'Pabrik 2', 'Pabrik 3', 'Pabrik 4', 'Pabrik 5', 'Pabrik 6', 'UBS 6', 'Diklat B', 'Pabrik NPK'];
    return units.map(unitName => {
      const unitItems = filteredItems.filter(i => i.unit === unitName);
      return {
        name: unitName,
        Aktif: unitItems.filter(i => i.opStatus === 'Aktif').length,
        Repair: unitItems.filter(i => i.opStatus === 'Repair').length,
        Rusak: unitItems.filter(i => i.opStatus === 'Rusak').length,
      };
    }).filter(u => u.Aktif > 0 || u.Repair > 0 || u.Rusak > 0 || filterUnitPabrik === u.name);
  }, [filteredItems, filterUnitPabrik]);

  const resetFilters = () => {
    setFilterKategori('All');
    setFilterUnitPabrik('All');
    setFilterStatusOperasional('All');
  };

  return (
    <div className="p-8 space-y-8 font-sans-clean max-w-7xl mx-auto">
      {/* Clean Page Title Header with Single Pop-up Filter Button */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#005ea4]" />
            Dashboard Monitoring Sertifikasi & Operational Status
          </h1>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            Ringkasan kelayakan izin sertifikat dan status fisik peralatan pabrik (Aktif, Repair, Rusak)
          </p>
        </div>

        {/* POP-UP FILTER BUTTON */}
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <span className="text-xs text-slate-500 font-mono-data font-bold hidden sm:inline">
              Showing {filteredItems.length} of {allDashboardItems.length} items
            </span>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors font-mono-data cursor-pointer"
          >
            <Filter className="w-4 h-4 text-white" />
            <span>Filter Kategori & Data</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-amber-400 text-slate-900 rounded-full text-[10px] flex items-center justify-center font-extrabold ml-1 shadow-2xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* OPERATIONAL STATUS BREAKDOWN CARDS (AKTIF, REPAIR, RUSAK) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2 font-mono-data">
          <Activity className="w-4 h-4 text-[#005ea4]" />
          <span>Status Kondisi Fisik Peralatan Pabrik</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Aktif */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Aktif (Operasional)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-emerald-600">
                {opStats.aktif}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono-data mt-1">Normal Operasional</span>
            </div>
          </div>

          {/* Repair */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Repair (Perbaikan)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-amber-600">
                {opStats.repair}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono-data mt-1">Perbaikan / Overhaul</span>
            </div>
          </div>

          {/* Rusak */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Rusak (Out of Order)</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-rose-600">
                {opStats.rusak}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono-data mt-1">Tidak Laik / Stop Operasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* SERTIFIKAT STATUS SUMMARY */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2 font-mono-data">
          <FileCheck2 className="w-4 h-4 text-[#005ea4]" />
          <span>Status Masa Berlaku Sertifikat Perizinan</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Total */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Sertifikat</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900">
                {legalStats.total}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono-data mt-1">Total Dokumen Terdaftar</span>
            </div>
          </div>

          {/* Valid */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Sertifikat Valid</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-emerald-600">
                {legalStats.valid}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono-data mt-1">Masa Berlaku Aman</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Akan Expired (&lt;2 Bulan / 60 Hari)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-amber-600">
                {legalStats.warning}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono-data mt-1">Perlu Pengajuan Berkas</span>
            </div>
          </div>

          {/* Expired */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Expired / Perlu Renewal</span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-rose-600">
                {legalStats.expired}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono-data mt-1">Kadaluarsa (Proses SK)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Distribusi Kondisi Peralatan per Unit Pabrik
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-data">
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-3 h-3 rounded bg-emerald-500"></span> Aktif
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-3 h-3 rounded bg-amber-500"></span> Repair
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-3 h-3 rounded bg-rose-500"></span> Rusak
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plantBarData} barGap={4}>
                <XAxis dataKey="name" stroke="#334155" fontSize={11} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#334155" fontSize={11} fontWeight="bold" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="Aktif" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Repair" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rusak" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 mb-4 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                Proporsi Masa Berlaku Sertifikat
              </h3>
            </div>
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-2.5 border-t border-slate-200 pt-4 font-mono-data">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-800 font-bold">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {item.value} Dokumen
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POP-UP FILTER MODAL SYSTEM */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">Filter Kategori & Data Overview</h3>
                  <p className="text-xs text-slate-400 font-mono-data">Sesuaikan tampilan statistik dashboard sesuai kebutuhan</p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-mono-data">
              {/* 1. Filter Kategori Perizinan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Kategori Perizinan Utama
                </label>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
                >
                  <option value="All">Semua Jenis Perizinan ({allDashboardItems.length})</option>
                  <option value="Perizinan Peralatan Pabrik">Perizinan Peralatan Pabrik</option>
                  <option value="Perizinan Aset">Perizinan Aset & Lahan</option>
                  <option value="Perizinan Produk">Perizinan Produk (SNI/Halal)</option>
                  <option value="Perizinan Proyek">Perizinan Proyek (SLF/PUPR)</option>
                  <option value="Administrasi Lainnya">Administrasi Lainnya (Software/HAKI)</option>
                </select>
              </div>

              {/* 2. Filter Unit Pabrik */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  2. Unit Pabrik / Area Operasional
                </label>
                <select
                  value={filterUnitPabrik}
                  onChange={(e) => setFilterUnitPabrik(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
                >
                  <option value="All">Semua Unit Pabrik / Area</option>
                  <option value="Pabrik 1A">Pabrik 1A</option>
                  <option value="Pabrik 2">Pabrik 2</option>
                  <option value="Pabrik 3">Pabrik 3</option>
                  <option value="Pabrik 4">Pabrik 4</option>
                  <option value="Pabrik 5">Pabrik 5</option>
                  <option value="Pabrik 6">Pabrik 6</option>
                  <option value="UBS 6">UBS 6</option>
                  <option value="Diklat B">Diklat B</option>
                  <option value="Pabrik NPK">Pabrik NPK</option>
                  <option value="Kawasan Industri">Kawasan Industri</option>
                </select>
              </div>

              {/* 3. Filter Status Fisik Operasional */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  3. Status Fisik Peralatan
                </label>
                <select
                  value={filterStatusOperasional}
                  onChange={(e) => setFilterStatusOperasional(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
                >
                  <option value="All">Semua Status Fisik Operasional</option>
                  <option value="Aktif">Aktif (Operasional Normal)</option>
                  <option value="Repair">Repair (Dalam Perbaikan/Overhaul)</option>
                  <option value="Rusak">Rusak (Out of Service / Tidak Laik)</option>
                </select>
              </div>

              {/* Summary Indicator inside Modal */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold font-mono-data">Hasil Filter Data:</span>
                <span className="text-xs font-extrabold text-[#005ea4] bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                  {filteredItems.length} of {allDashboardItems.length} items
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors font-mono-data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors font-mono-data cursor-pointer"
              >
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


