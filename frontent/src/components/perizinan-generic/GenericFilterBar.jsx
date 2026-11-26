import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, ChevronDown, FileSpreadsheet, Building2, FileWarning, Search, RotateCcw, Columns } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  toggleColumn,
  sortDateOrder,
  setSortDateOrder
}) {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';

  // Refs untuk click-outside detection
  const importMenuRef = useRef(null);
  const sortRef = useRef(null);
  const columnRef = useRef(null);

  // Tutup semua dropdown saat klik di luar area manapun
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (importMenuRef.current && !importMenuRef.current.contains(e.target)) {
        setIsImportMenuOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortDropdownOpen(false);
      }
      if (columnRef.current && !columnRef.current.contains(e.target)) {
        setIsColumnDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsImportMenuOpen, setIsColumnDropdownOpen]);

  // Helper: buka satu dropdown, tutup yang lain
  const openImport = () => {
    setIsImportMenuOpen(prev => !prev);
    setIsSortDropdownOpen(false);
    setIsColumnDropdownOpen(false);
  };
  const openSort = () => {
    setIsSortDropdownOpen(prev => !prev);
    setIsImportMenuOpen(false);
    setIsColumnDropdownOpen(false);
  };
  const openColumn = () => {
    setIsColumnDropdownOpen(prev => !prev);
    setIsSortDropdownOpen(false);
    setIsImportMenuOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Tab + Unggah Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 font-mono-data mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* TAB + UNGGAH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab('main')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeMainTab === 'main'
                ? 'bg-[#005ea4] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Data Utama</span>
          </button>

          {!isViewer && (
            <button
              onClick={() => setActiveMainTab('staging')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
                activeMainTab === 'staging'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <FileWarning className="w-4 h-4 text-amber-500" />
              <span>Menunggu Dokumen (Staging)</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white font-bold rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tombol Import — z-index tinggi agar tidak tertimpa */}
        {!isViewer && (
          <div ref={importMenuRef} className="relative" style={{ zIndex: 50 }}>
            <button
              onClick={openImport}
              className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Unggah Dokumen {categoryName}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isImportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown import */}
            <div
              className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 text-xs font-mono-data transition-all duration-200 origin-top-right ${
                isImportMenuOpen
                  ? 'opacity-100 scale-100 visible translate-y-0'
                  : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'
              }`}
              style={{ zIndex: 50 }}
            >
              <button
                onClick={() => { setIsSingleModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#005ea4] shrink-0" />
                <div>
                  <span className="block">Unggah Data Manual {categoryName} Baru</span>
                </div>
              </button>
              <button
                onClick={() => { setIsCsvModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="block">Unggah Template {categoryName}</span>
                  <span className="text-[10px] text-slate-500 font-normal">Format data tabel massal</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search + Tombol Filter */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Cari dokumen ${categoryName || 'perizinan'}, kode, nomor sertifikat...`}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] transition-colors"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 font-mono-data">
          {/* Reset Filter */}
          {(searchTerm || filterJenis !== 'All' || filterLokasi !== 'All' || filterStatus !== 'All' || visibleColumnKeys.length < allColumns.length) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Urutkan Dropdown */}
          <div ref={sortRef} className="relative" style={{ zIndex: 40 }}>
            <button
              onClick={openSort}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition-colors"
            >
              <span>{sortDateOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute right-0 top-full mt-1.5 w-32 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs transition-all duration-200 origin-top-right ${
                isSortDropdownOpen
                  ? 'opacity-100 scale-100 visible translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'
              }`}
              style={{ zIndex: 40 }}
            >
              {[
                { value: 'desc', label: 'Terbaru' },
                { value: 'asc', label: 'Terlama' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortDateOrder(opt.value); setIsSortDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer rounded-lg mx-0.5 ${
                    sortDateOrder === opt.value
                      ? 'bg-blue-50 text-[#005ea4] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pilih Kolom Dropdown */}
          <div ref={columnRef} className="relative" style={{ zIndex: 40 }}>
            <button
              onClick={openColumn}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition-colors"
            >
              <Columns className="w-4 h-4 text-[#005ea4]" />
              <span>Kolom ({visibleColumnKeys.length}/{allColumns.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isColumnDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
              className={`absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 text-xs transition-all duration-200 origin-top-right ${
                isColumnDropdownOpen
                  ? 'opacity-100 scale-100 visible translate-y-0'
                  : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'
              }`}
              style={{ zIndex: 40 }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="font-bold text-slate-900 text-xs">Visibilitas Kolom</span>
                <button
                  onClick={selectAllColumns}
                  className="text-[11px] text-[#005ea4] font-bold hover:underline cursor-pointer"
                >
                  Pilih Semua
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                {allColumns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer select-none transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded border-slate-300 accent-[#005ea4]"
                    />
                    <span className="text-slate-700 font-medium text-xs">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
