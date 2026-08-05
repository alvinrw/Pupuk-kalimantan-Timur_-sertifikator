import React from 'react';
import { Filter, X, RotateCcw, Check } from 'lucide-react';

/**
 * FilterModal ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Pop-up filter modal untuk MonitoringSertifikasi.
 */
export default function FilterModal({
  isOpen, onClose, onReset,
  filterKategori, setFilterKategori,
  filterUnitPabrik, setFilterUnitPabrik,
  filterStatusOperasional, setFilterStatusOperasional,
  filterRentangHari, setFilterRentangHari,
  customUrgentDays,
  uniqueUnitPabrik,
  filteredCount, totalCount
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">Filter Kategori & Data Monitoring</h3>
              <p className="text-xs text-slate-400 font-mono-data">Sesuaikan kriteria pencarian dan rentang sisa hari perizinan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs font-mono-data">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">1. Kategori Perizinan Utama</label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
            >
              <option value="All">Semua Jenis Perizinan ({totalCount})</option>
              <option value="Perizinan Peralatan Pabrik">Perizinan Peralatan Pabrik</option>
              <option value="Perizinan Aset">Perizinan Aset & Lahan</option>
              <option value="Perizinan Produk">Perizinan Produk (SNI/Halal)</option>
              <option value="Perizinan Proyek">Perizinan Proyek (SLF/PUPR)</option>
              <option value="Administrasi Lainnya">Administrasi Lainnya (Software/HAKI)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">2. Unit Pabrik / Area Operasional</label>
            <select
              value={filterUnitPabrik}
              onChange={(e) => setFilterUnitPabrik(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
            >
              {uniqueUnitPabrik.map((u, idx) => (
                <option key={idx} value={u}>{u === 'All' ? 'Semua Unit Pabrik' : u}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">3. Status Fisik Peralatan</label>
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

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">4. Sisa Hari Expired</label>
            <select
              value={filterRentangHari}
              onChange={(e) => setFilterRentangHari(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
            >
              <option value="All">Semua Rentang Hari</option>
              <option value="expired">Expired (≤ 0 Hari)</option>
              <option value="urgent">Urgent (≤ {customUrgentDays || 30} Hari)</option>
              <option value="60">2 Bulan (≤ 60 Hari)</option>
              <option value="90">3 Bulan (≤ 90 Hari)</option>
              <option value="180">6 Bulan (≤ 180 Hari)</option>
              <option value="365">1 Tahun (≤ 365 Hari)</option>
            </select>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold font-mono-data">Hasil Filter Data:</span>
            <span className="text-xs font-extrabold text-[#005ea4] bg-white px-2.5 py-1 rounded-lg border border-blue-200">
              {filteredCount} of {totalCount} items
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors font-mono-data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors font-mono-data cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
