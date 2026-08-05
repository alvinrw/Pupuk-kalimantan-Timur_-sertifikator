import React from 'react';
import { Search, Columns, ChevronDown } from 'lucide-react';

export default function PeralatanFilterBar({
  searchTerm,
  setSearchTerm,
  filteredDataLength,
  filterJenis, setFilterJenis,
  filterLokasi, setFilterLokasi,
  filterUser, setFilterUser,
  filterStatus, setFilterStatus,
  isColumnDropdownOpen, setIsColumnDropdownOpen,
  visibleColumnKeys, allColumns,
  selectAllColumns, toggleColumn
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-[#e2e8fo] shadow-2xs flex flex-wrap items-center justify-between gap-3 relative">
      <div className="relative flex-1 min-w-[280px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707783]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari Jenis Peralatan, Merek, Tipe, No Seri, atau Sertifikat..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-[#f8fafc] border border-[#e2e8fo] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
          {filteredDataLength} data ditemukan
        </div>

        {/* Reset Filters button if any active */}
        {(filterJenis !== 'All' || filterLokasi !== 'All' || filterUser !== 'All' || filterStatus !== 'All') && (
          <button
            onClick={() => { setFilterJenis('All'); setFilterLokasi('All'); setFilterUser('All'); setFilterStatus('All'); }}
            className="text-xs font-bold text-rose-700 hover:underline px-2.5 py-1 bg-rose-50 rounded border border-rose-200"
          >
            Reset Filter Header
          </button>
        )}

        {/* COLUMN VISIBILITY DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs transition-colors cursor-pointer"
          >
            <Columns className="w-4 h-4 text-[#005ea4]" />
            <span>Pilih Kolom Tampil ({visibleColumnKeys.length}/{allColumns.length})</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isColumnDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Popover */}
          <div className={`absolute right-0 top-10 z-40 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 space-y-2 text-xs font-sans-clean transition-all duration-200 origin-top-right ${isColumnDropdownOpen ? 'scale-100 opacity-100 visible pointer-events-auto translate-y-0' : 'scale-95 opacity-0 invisible pointer-events-none -translate-y-2'}`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-xs">Centang Kolom yang Tampil</span>
                <button
                  onClick={selectAllColumns}
                  className="text-[11px] font-mono-data font-bold text-[#005ea4] hover:underline cursor-pointer"
                >
                  Pilih Semua
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                {allColumns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumnKeys.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#005ea4] focus:ring-[#005ea4] cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 select-none">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
