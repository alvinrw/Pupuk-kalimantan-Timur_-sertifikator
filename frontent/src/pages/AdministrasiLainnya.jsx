import React, { useState, useMemo } from 'react';
import {
  Search,
  FileSpreadsheet,
  FileArchive,
  History,
  Columns,
  PlusCircle,
  ChevronDown,
  Trash2,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  X,
  Check,
  Building2,
  Eye
} from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import HistoryModal from '../components/HistoryModal';
import SingleEntryCiptaanModal from '../components/SingleEntryCiptaanModal';
import DocumentDetailPage from './DocumentDetailPage';
import { masterCertificatesData } from '../data/masterDataset';

export default function AdministrasiLainnya() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Header Dropdown Filter States
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterMasa, setFilterMasa] = useState('All');

  // Modals & Popovers
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  
  // Active Row Action Dropdown state
  const [openActionRowId, setOpenActionRowId] = useState(null);

  // Row Delete Confirmation Modal state
  const [rowConfirmModalOpen, setRowConfirmModalOpen] = useState(false);
  const [pendingDeleteRowId, setPendingDeleteRowId] = useState(null);

  // Ganti Target Sertifikat Modal State
  const [reassignCertRowItem, setReassignCertRowItem] = useState(null);
  const [searchTargetItemTerm, setSearchTargetItemTerm] = useState('');
  const [selectedNewTargetItem, setSelectedNewTargetItem] = useState(null);

  // Columns Configuration
  const allColumns = [
    { key: "no", label: "No." },
    { key: "judulCiptaan", label: "Judul Ciptaan" },
    { key: "jenisCiptaan", label: "Jenis Ciptaan" },
    { key: "tanggalCiptaan", label: "Tanggal Ciptaan" },
    { key: "masaBerlaku", label: "Masa Berlaku" },
    { key: "kapanBerakhir", label: "Kapan Berakhir" }
  ];

  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allColumns.map(c => c.key));

  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map(c => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  // Helper to determine status color styling for table rows (HITAM = Afkir, MERAH = Expired, KUNING = Perpanjangan)
  const getRowStatusStyle = (item) => {
    const statusStr = (item.status || '').toLowerCase();
    
    if (statusStr === 'afkir' || statusStr === 'decommissioned') {
      return 'bg-[#0f172a] text-white hover:bg-slate-900 border-b border-slate-700';
    }
    if (statusStr === 'expired') {
      return 'bg-rose-50/90 text-rose-950 hover:bg-rose-100 border-b border-rose-200';
    }
    if (statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'proses') {
      return 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border-b border-amber-200';
    }
    return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
  };

  // Connected Master Data Ciptaan
  const [ciptaanList, setCiptaanList] = useState(
    masterCertificatesData.filter(d => d.categoryKey === 'administrasi-lainnya')
  );

  // Unique options for dropdown filters
  const uniqueJenis = useMemo(() => ['All', ...new Set(ciptaanList.map(i => i.jenisCiptaan))], [ciptaanList]);
  const uniqueMasa = useMemo(() => ['All', ...new Set(ciptaanList.map(i => i.masaBerlaku))], [ciptaanList]);

  // Process Search & Category Filtering
  const filteredData = useMemo(() => {
    return ciptaanList.filter((item) => {
      const matchesSearch =
        item.judulCiptaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jenisCiptaan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesJenis = filterJenis === 'All' || item.jenisCiptaan === filterJenis;
      const matchesMasa = filterMasa === 'All' || item.masaBerlaku === filterMasa;

      return matchesSearch && matchesJenis && matchesMasa;
    });
  }, [ciptaanList, searchTerm, filterJenis, filterMasa]);

  // Handlers
  const handleCsvImported = (newParsed) => {
    const formatted = newParsed.map((n, i) => ({
      id: `CIP-CSV-${Date.now()}-${i}`,
      no: ciptaanList.length + i + 1,
      judulCiptaan: n.title || "Karya Ciptaan Baru",
      jenisCiptaan: "Program Komputer (Software)",
      tanggalCiptaan: "2026-07-22",
      masaBerlaku: "5 Tahun",
      kapanBerakhir: "2031-07-22",
      noSertifikat: n.certificateNo || `EC002026-${i}`,
      hasCertificatePdf: true
    }));
    setCiptaanList(prev => [...formatted, ...prev]);
  };

  const handleSingleAdded = (newItem) => {
    setCiptaanList(prev => [
      {
        id: newItem.id,
        no: prev.length + 1,
        judulCiptaan: newItem.judulCiptaan,
        jenisCiptaan: newItem.jenisCiptaan,
        tanggalCiptaan: newItem.tanggalCiptaan,
        masaBerlaku: newItem.masaBerlaku,
        kapanBerakhir: newItem.expiryDate,
        noSertifikat: `EC-REG-${Date.now().toString().substring(8)}`,
        hasCertificatePdf: newItem.hasCertificatePdf
      },
      ...prev
    ]);
  };

  const handleZipMatched = () => {
    alert("Berhasil menghubungkan file PDF ZIP ke baris tabel!");
  };

  // Row Delete Confirmation Trigger
  const requestDeleteRow = (rowId) => {
    setPendingDeleteRowId(rowId);
    setRowConfirmModalOpen(true);
    setOpenActionRowId(null);
  };

  const confirmDeleteRow = () => {
    setCiptaanList(prev => prev.filter(item => item.id !== pendingDeleteRowId));
    setRowConfirmModalOpen(false);
    setPendingDeleteRowId(null);
  };

  // Ganti Target Sertifikat Handler
  const openReassignTargetModal = (item) => {
    setReassignCertRowItem(item);
    setSelectedNewTargetItem(ciptaanList.find(e => e.id !== item.id) || ciptaanList[0]);
    setSearchTargetItemTerm('');
    setOpenActionRowId(null);
  };

  const confirmReassignTargetRow = () => {
    if (!reassignCertRowItem || !selectedNewTargetItem) return;

    setCiptaanList(prev =>
      prev.map(eq => {
        if (eq.id === selectedNewTargetItem.id) {
          return {
            ...eq,
            noSertifikat: reassignCertRowItem.noSertifikat,
            hasCertificatePdf: true
          };
        }
        if (eq.id === reassignCertRowItem.id) {
          return {
            ...eq,
            noSertifikat: "-",
            hasCertificatePdf: false
          };
        }
        return eq;
      })
    );

    alert(`Sertifikat ${reassignCertRowItem.noSertifikat} berhasil dipindahkan ke ${selectedNewTargetItem.judulCiptaan}!`);
    setReassignCertRowItem(null);
  };

  const filteredTargetList = ciptaanList.filter(eq =>
    eq.id !== reassignCertRowItem?.id &&
    (eq.judulCiptaan.toLowerCase().includes(searchTargetItemTerm.toLowerCase()) ||
     eq.jenisCiptaan.toLowerCase().includes(searchTargetItemTerm.toLowerCase()))
  );

  if (detailModalItem) {
    return (
      <DocumentDetailPage
        item={detailModalItem}
        onBack={() => setDetailModalItem(null)}
        onSaveUpdate={(updatedItem) => {
          setCiptaanList(prev => prev.map(i => i.id === updatedItem.id ? { ...i, ...updatedItem, judulCiptaan: updatedItem.merekItem || i.judulCiptaan } : i));
        }}
        onQuickRenew={(id) => {
          alert(`Inisiasi Perpanjangan untuk ciptaan ${id}. Menuju menu Monitoring.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Menandai ciptaan ${id} sebagai Afkir.`);
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-[#0F172A]">
            Administrasi & Perizinan Ciptaan (HAKI)
          </h2>
          <p className="text-xs text-[#64748B] font-mono-data">
            Daftar karya cipta, software internal, tata letak, tanggal ciptaan, dan masa berlaku perlindungan hukum
          </p>
        </div>

        {/* UNIFIED SINGLE ACTION DROPDOWN BUTTON */}
        <div className="relative">
          <button
            onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Kelola / Impor Dokumen</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Unified Popover Menu */}
          {isImportMenuOpen && (
            <div className="absolute right-0 top-11 z-40 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-1 space-y-1 text-xs font-sans-clean">
              <button
                onClick={() => { setIsSingleModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800"
              >
                <PlusCircle className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">+ Input 1 Data Manual</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Termasuk unggah berkas PDF sertifikat</span>
                </div>
              </button>

              <button
                onClick={() => { setIsCsvModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="block">Impor CSV Master</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Muat CSV gabungan multi-unit</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search, Reset Filters, & Column Selector */}
      <div className="bg-white p-4 rounded-lg border border-[#e2e8fo] shadow-2xs flex flex-wrap items-center justify-between gap-3 relative">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707783]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Judul Ciptaan, Jenis Ciptaan..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#f8fafc] border border-[#e2e8fo] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
            {filteredData.length} data ditemukan
          </div>

          {(filterJenis !== 'All' || filterMasa !== 'All') && (
            <button
              onClick={() => { setFilterJenis('All'); setFilterMasa('All'); }}
              className="text-xs font-bold text-rose-700 hover:underline px-2.5 py-1 bg-rose-50 rounded border border-rose-200"
            >
              Reset Filter Header
            </button>
          )}

          {/* COLUMN VISIBILITY */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs"
            >
              <Columns className="w-4 h-4 text-[#005ea4]" />
              <span>Pilih Kolom Tampil ({visibleColumnKeys.length}/{allColumns.length})</span>
            </button>

            {/* Dropdown Popover */}
            {isColumnDropdownOpen && (
              <div className="absolute right-0 top-10 z-40 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 space-y-2 text-xs font-sans-clean">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-xs">Centang Kolom yang Tampil</span>
                  <button
                    onClick={selectAllColumns}
                    className="text-[11px] font-mono-data font-bold text-[#005ea4] hover:underline"
                  >
                    Pilih Semua
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {allColumns.map((col) => {
                    const checked = isVisible(col.key);
                    return (
                      <label
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-slate-300 accent-[#005ea4]"
                        />
                        <span className="text-xs">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table with Custom 6 Columns & Header Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                {isVisible("no") && <th className="py-3.5 px-4 text-center font-bold whitespace-nowrap">NO.</th>}
                {isVisible("judulCiptaan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">JUDUL CIPTAAN</th>}
                
                {/* JENIS CIPTAAN FILTER */}
                {isVisible("jenisCiptaan") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>JENIS CIPTAAN</span>
                      <select
                        value={filterJenis}
                        onChange={(e) => setFilterJenis(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer"
                      >
                        <option value="All">Semua</option>
                        {uniqueJenis.filter(j => j !== 'All').map((j, idx) => (
                          <option key={idx} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {isVisible("tanggalCiptaan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">TANGGAL CIPTAAN</th>}

                {/* MASA BERLAKU FILTER */}
                {isVisible("masaBerlaku") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>MASA BERLAKU</span>
                      <select
                        value={filterMasa}
                        onChange={(e) => setFilterMasa(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer"
                      >
                        <option value="All">Semua</option>
                        {uniqueMasa.filter(m => m !== 'All').map((m, idx) => (
                          <option key={idx} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {isVisible("kapanBerakhir") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KAPAN BERAKHIR</th>}
                <th className="py-3.5 px-4 font-bold text-right whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const rowClass = getRowStatusStyle(item);
                  const isAfkir = item.status === 'Afkir';
                  const isExpired = item.status === 'Expired';
                  const isPerpanjang = item.status === 'Perpanjang' || item.status === 'In Progress';

                  return (
                    <tr key={item.id} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                      {isVisible("no") && (
                        <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap">
                          {index + 1}
                        </td>
                      )}
                      {isVisible("judulCiptaan") && (
                        <td
                          onClick={() => setDetailModalItem({ ...item, merekItem: item.judulCiptaan, jenisPeralatan: item.jenisCiptaan, berakhir: item.kapanBerakhir })}
                          className={`py-3.5 px-4 font-bold cursor-pointer hover:underline whitespace-nowrap ${
                            isAfkir ? 'text-white' : 'text-slate-900 hover:text-[#005ea4]'
                          }`}
                          title="Klik untuk Lihat Detail"
                        >
                          <div className="flex items-center gap-2">
                            <FileCheck className={`w-3.5 h-3.5 ${item.hasCertificatePdf ? (isAfkir ? 'text-slate-300' : 'text-emerald-600') : 'text-slate-400'}`} />
                            <span>{item.judulCiptaan}</span>
                          </div>
                        </td>
                      )}
                      {isVisible("jenisCiptaan") && (
                        <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                          {item.jenisCiptaan}
                        </td>
                      )}
                    {isVisible("tanggalCiptaan") && (
                      <td className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap">
                        {item.tanggalCiptaan}
                      </td>
                    )}
                    {isVisible("masaBerlaku") && (
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {item.masaBerlaku}
                      </td>
                    )}
                    {isVisible("kapanBerakhir") && (
                      <td className="py-3.5 px-4 font-mono-data font-bold text-rose-700 whitespace-nowrap">
                        {item.kapanBerakhir}
                      </td>
                    )}

                    {/* LIHAT DETAIL BUTTON */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono-data">
                      <button
                        onClick={() => setDetailModalItem({ ...item, merekItem: item.judulCiptaan, jenisPeralatan: item.jenisCiptaan, berakhir: item.kapanBerakhir })}
                        className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
              ) : (
                <tr>
                  <td colSpan={visibleColumnKeys.length + 1} className="py-8 text-center text-[#64748B] font-mono-data">
                    Tidak ada ciptaan yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GANTI TARGET SERTIFIKAT MODAL */}
      {reassignCertRowItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Ganti / Pindahkan Target Sertifikat</h4>
                <p className="text-[11px] text-blue-300 font-mono-data">Sertifikat: {reassignCertRowItem.noSertifikat} ({reassignCertRowItem.judulCiptaan})</p>
              </div>
              <button onClick={() => setReassignCertRowItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-700 font-medium">
                Pilih ciptaan tujuan tempat sertifikat <b>{reassignCertRowItem.noSertifikat}</b> ini akan dipindahkan:
              </p>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTargetItemTerm}
                  onChange={(e) => setSearchTargetItemTerm(e.target.value)}
                  placeholder="Cari Judul Ciptaan atau Jenis Ciptaan..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                {filteredTargetList.map((eq) => {
                  const isSelected = selectedNewTargetItem?.id === eq.id;
                  return (
                    <div
                      key={eq.id}
                      onClick={() => setSelectedNewTargetItem(eq)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#005ea4] ring-1 ring-[#005ea4]'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-data font-bold text-xs text-[#005ea4]">{eq.jenisCiptaan}</span>
                        </div>
                        <span className="font-bold text-xs text-slate-900 block">{eq.judulCiptaan}</span>
                      </div>

                      {isSelected && (
                        <div className="p-1 rounded-full bg-[#005ea4] text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReassignCertRowItem(null)}
                className="px-3.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReassignTargetRow}
                className="px-4 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Pindahkan Sertifikat ke Item Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL BEFORE DELETING ROW */}
      {rowConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Konfirmasi Penghapusan Baris</h4>
              <p className="text-xs text-slate-600 font-medium">
                Apakah Anda yakin ingin menghapus baris data ciptaan ini? Baris yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRowConfirmModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteRow}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Ya, Hapus Baris Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SingleEntryCiptaanModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onAddSuccess={handleSingleAdded}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleCsvImported}
      />

      <HistoryModal
        isOpen={!!historyTargetItem}
        onClose={() => setHistoryTargetItem(null)}
        documentItem={historyTargetItem}
      />
    </div>
  );
}
