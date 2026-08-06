import React from 'react';
import { PlusCircle, ChevronDown, FileSpreadsheet, Building2, FileWarning, Search, RotateCcw, Columns } from 'lucide-react';

export default function GenericFilterBar({
  title,
  subtitle,
  categoryName,
  isImportMenuOpen,
  setIsImportMenuOpen,
  setIsSingleModalOpen,
  setIsCsvModalOpen,
  activeMainTab,
  setActiveMainTab,
  pendingCount,
  searchTerm,
  setSearchTerm,
  filterJenis,
  filterLokasi,
  filterStatus,
  visibleColumnKeys,
  allColumns,
  resetFilters,
  isColumnDropdownOpen,
  setIsColumnDropdownOpen,
  selectAllColumns,
  isVisible,
  toggleColumn
}) {
  return (
    <div className="space-y-6">
      {/* Header & Workflow Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-600 font-mono-data">
            {subtitle}
          </p>
        </div>

        {/* Dropdown Menu "+ Kelola / Impor Dokumen" */}
        <div className="relative font-mono-data">
          <button
            onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Kelola / Impor Data {categoryName}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isImportMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isImportMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
              <button
                onClick={() => { setIsSingleModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">+ Tambah Data {categoryName} Baru</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Input manual 1 entitas master {categoryName}</span>
                </div>
              </button>

              <button
                onClick={() => { setIsCsvModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="block">Impor CSV Master {categoryName}</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Muat CSV daftar list entitas master</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB SWITCHER: DATA UTAMA VS STAGING */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveMainTab('main')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeMainTab === 'main'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Data Utama</span>
        </button>

        <button
          onClick={() => setActiveMainTab('staging')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
            activeMainTab === 'staging'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <FileWarning className="w-4 h-4 text-amber-500" />
          <span>Menunggu Dokumen (Staging)</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white font-bold rounded-full animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Search, Reset Filters, & Column Selector */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 relative">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Cari dokumen ${categoryName || 'perizinan'}, kode, nomor sertifikat...`}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="flex items-center gap-2 font-mono-data">
          {(searchTerm || filterJenis !== 'All' || filterLokasi !== 'All' || filterStatus !== 'All' || visibleColumnKeys.length < allColumns.length) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}

          {/* Column Visibility Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
            >
              <Columns className="w-4 h-4 text-[#005ea4]" />
              <span>Pilih Kolom ({visibleColumnKeys.length}/{allColumns.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-40 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">Visibilitas Kolom</span>
                  <button
                    onClick={selectAllColumns}
                    className="text-[11px] text-[#005ea4] font-bold hover:underline cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {allColumns.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isVisible(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded border-slate-300 text-[#005ea4] focus:ring-[#005ea4]"
                      />
                      <span className="text-slate-700 font-medium">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
