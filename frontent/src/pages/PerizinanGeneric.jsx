import React, { useState, useMemo } from 'react';
import {
  Search,
  FileSpreadsheet,
  Columns,
  PlusCircle,
  ChevronDown,
  RotateCcw,
  Eye,
  FileCheck,
  Check
} from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import HistoryModal from '../components/HistoryModal';
import SingleEntryGenericModal from '../components/SingleEntryGenericModal';
import DocumentDetailPage from './DocumentDetailPage';
import { masterCertificatesData } from '../data/masterDataset';

export default function PerizinanGeneric({ title, subtitle, categoryName }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Header Dropdown Filter States
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterLokasi, setFilterLokasi] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals & Popovers State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);

  // Dynamic Filtering from connected Master Dataset
  const [documents, setDocuments] = useState(masterCertificatesData);

  const isAsetCategory = useMemo(() => {
    return categoryName?.toLowerCase().includes('aset');
  }, [categoryName]);

  // Columns Configuration
  const defaultColumns = [
    { key: "no", label: "No." },
    { key: "code", label: "Kode / Tag Perizinan" },
    { key: "title", label: "Nama Dokumen / Item" },
    { key: "jenisItem", label: "Jenis Perizinan" },
    { key: "unit", label: "Unit Pabrik / Lokasi" },
    { key: "user", label: "User / Instansi" },
    { key: "certificateNo", label: "No. Sertifikat" },
    { key: "issueDate", label: "Terbit" },
    { key: "expiryDate", label: "Expired" },
    { key: "status", label: "Status" }
  ];

  const asetColumns = [
    { key: "no", label: "NO." },
    { key: "certificateNo", label: "NOMOR SERTIFIKAT" },
    { key: "unit", label: "LOKASI" },
    { key: "luasM2", label: "LUAS (M²)" },
    { key: "luasHa", label: "LUAS (HA)" },
    { key: "peruntukan", label: "PERUNTUKAN" },
    { key: "issueDate", label: "TANGGAL AWAL PENGAJUAN" },
    { key: "expiryDate", label: "MASA BERLAKU PRODUK" },
    { key: "kondisi", label: "KONDISI" },
    { key: "keterangan", label: "KETERANGAN" },
    { key: "status", label: "STATUS" }
  ];

  const allColumns = isAsetCategory ? asetColumns : defaultColumns;

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

  // Filtered dataset according to category & search
  const categoryFilteredDocs = useMemo(() => {
    return documents.filter(doc => {
      if (categoryName) {
        const catLower = categoryName.toLowerCase();
        const docCatKey = (doc.categoryKey || '').toLowerCase();
        const docKatDoc = (doc.kategoriDokumen || '').toLowerCase();
        const docJenis = (doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || '').toLowerCase();

        // Direct Keyword Category Matching
        if (catLower.includes('aset') && (docCatKey.includes('aset') || docKatDoc.includes('aset'))) return true;
        if (catLower.includes('proyek') && (docCatKey.includes('proyek') || docKatDoc.includes('proyek'))) return true;
        if (catLower.includes('produk') && (docCatKey.includes('produk') || docKatDoc.includes('produk'))) return true;

        const isMatchCategory =
          docKatDoc.includes(catLower) ||
          docCatKey.includes(catLower) ||
          catLower.includes(docKatDoc) ||
          catLower.includes(docCatKey) ||
          docJenis.includes(catLower);
        
        if (!isMatchCategory && !doc.id?.startsWith('PERIZ-MANUAL') && !doc.id?.startsWith('DOC-CSV')) return false;
      }
      return true;
    });
  }, [documents, categoryName]);

  const uniqueJenis = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.jenisItem || i.jenisPeralatan || i.jenisCiptaan || 'General'))], [categoryFilteredDocs]);
  const uniqueLokasi = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.unitPabrik || i.unit || i.lokasi || 'Kantor Pusat'))], [categoryFilteredDocs]);
  const uniqueStatus = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.status || 'Aktif'))], [categoryFilteredDocs]);

  const filteredDocs = useMemo(() => {
    return categoryFilteredDocs.filter(doc => {
      const titleStr = doc.title || doc.merekItem || doc.judulCiptaan || '';
      const codeStr = doc.code || doc.id || doc.noSertifikat || '';
      const unitStr = doc.unit || doc.unitPabrik || doc.lokasi || '';
      const certStr = doc.certificateNo || doc.noSertifikat || '';
      const jenisStr = doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || '';
      const statusStr = doc.status || 'Aktif';

      const matchesSearch =
        titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        codeStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unitStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certStr.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesJenis = filterJenis === 'All' || jenisStr === filterJenis;
      const matchesLokasi = filterLokasi === 'All' || unitStr === filterLokasi;
      const matchesStatus = filterStatus === 'All' || statusStr === filterStatus;

      return matchesSearch && matchesJenis && matchesLokasi && matchesStatus;
    });
  }, [categoryFilteredDocs, searchTerm, filterJenis, filterLokasi, filterStatus]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterJenis('All');
    setFilterLokasi('All');
    setFilterStatus('All');
    selectAllColumns();
  };

  const handleCsvImported = (newItems) => {
    const formatted = newItems.map((item, idx) => ({
      id: `DOC-CSV-${Date.now()}-${idx}`,
      code: item.code || `PERIZ-CSV-${idx + 100}`,
      title: item.title || item.merekItem,
      unit: item.unit || "Pabrik 1A",
      user: "Dept. General & Legal",
      issueDate: "2024-01-01",
      expiryDate: item.expiry || "2027-12-31",
      certificateNo: item.certificateNo || `CERT-CSV-${idx}`,
      status: "Aktif",
      merekItem: item.title,
      jenisItem: categoryName || "Generic Perizinan",
      jenisPeralatan: categoryName,
      unitPabrik: item.unit || "Pabrik 1A",
      berakhir: item.expiry,
      noSertifikat: item.certificateNo,
      hasCertificatePdf: true
    }));
    setDocuments(prev => [...formatted, ...prev]);
  };

  const handleSingleAdded = (newItem) => {
    setDocuments(prev => [newItem, ...prev]);
  };

  // Helper to determine status color styling for table rows
  const getRowStatusStyle = (doc) => {
    const statusStr = (doc.status || '').toLowerCase();
    
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

  if (detailModalItem) {
    return (
      <DocumentDetailPage
        item={detailModalItem}
        onBack={() => setDetailModalItem(null)}
        onSaveUpdate={(updatedDoc) => {
          setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? { ...d, ...updatedDoc, title: updatedDoc.merekItem || d.title } : d));
        }}
        onQuickRenew={(id) => {
          alert(`Inisiasi Perpanjangan untuk dokumen ${id}. Menuju menu Monitoring.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Menandai dokumen ${id} sebagai Afkir.`);
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans-clean">
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
            <span>+ Kelola / Impor Dokumen</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isImportMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isImportMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
              <button
                onClick={() => { setIsSingleModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">+ Tambah Single Perizinan Baru</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Input manual 1 dokumen {categoryName}</span>
                </div>
              </button>

              <button
                onClick={() => { setIsCsvModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer"
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

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider">
                {isVisible("no") && <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">NO.</th>}
                
                {!isAsetCategory && isVisible("code") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-[#005ea4]">KODE PERIZINAN</th>}
                {!isAsetCategory && isVisible("title") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">NAMA DOKUMEN / ITEM</th>}

                {/* JENIS PERIZINAN FILTER (non-aset) */}
                {!isAsetCategory && isVisible("jenisItem") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>JENIS PERIZINAN</span>
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

                {/* NO. SERTIFIKAT (First for Aset) */}
                {isVisible("certificateNo") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-[#005ea4]">NOMOR SERTIFIKAT</th>}

                {/* LOKASI / UNIT FILTER */}
                {isVisible("unit") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>LOKASI</span>
                      <select
                        value={filterLokasi}
                        onChange={(e) => setFilterLokasi(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer"
                      >
                        <option value="All">Semua</option>
                        {uniqueLokasi.filter(l => l !== 'All').map((l, idx) => (
                          <option key={idx} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {/* ASET SPECIFIC HEADERS */}
                {isAsetCategory && isVisible("luasM2") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">LUAS (M²)</th>}
                {isAsetCategory && isVisible("luasHa") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">LUAS (HA)</th>}
                {isAsetCategory && isVisible("peruntukan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">PERUNTUKAN</th>}

                {!isAsetCategory && isVisible("user") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">INSTANSI / USER</th>}
                
                {isVisible("issueDate") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">{isAsetCategory ? "TANGGAL AWAL PENGAJUAN" : "TERBIT"}</th>}
                {isVisible("expiryDate") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">{isAsetCategory ? "MASA BERLAKU PRODUK" : "EXPIRED"}</th>}

                {isAsetCategory && isVisible("kondisi") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KONDISI</th>}
                {isAsetCategory && isVisible("keterangan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KETERANGAN</th>}

                {/* STATUS FILTER */}
                {isVisible("status") && (
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>STATUS</span>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer"
                      >
                        <option value="All">Semua</option>
                        {uniqueStatus.filter(s => s !== 'All').map((s, idx) => (
                          <option key={idx} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                <th className="py-3.5 px-4 font-bold text-right whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, index) => {
                  const rowClass = getRowStatusStyle(doc);
                  const statusStr = (doc.status || '').toLowerCase();
                  const isAfkir = statusStr === 'afkir' || statusStr === 'decommissioned';
                  const isExpired = statusStr === 'expired';
                  const isPerpanjang = statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'proses';

                  const docTitle = doc.title || doc.merekItem || doc.judulCiptaan || '-';
                  const docCode = doc.code || doc.id || doc.noSertifikat || '-';
                  const docUnit = doc.unit || doc.unitPabrik || doc.lokasi || '-';
                  const docCert = doc.certificateNo || doc.noSertifikat || '-';
                  const docExpiry = doc.expiryDate || doc.berakhir || doc.kapanBerakhir || '-';
                  const docJenis = doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || categoryName || 'Generic';
                  const docUser = doc.user || doc.issuer || doc.keterangan || 'Dept. General';
                  const docIssue = doc.tanggalAwalPengajuan || doc.issueDate || doc.terbit || doc.tanggalCiptaan || '-';

                  return (
                    <tr key={doc.id} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                      {isVisible("no") && (
                        <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap">
                          {index + 1}
                        </td>
                      )}
                      
                      {!isAsetCategory && isVisible("code") && (
                        <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                          {docCode}
                        </td>
                      )}

                      {!isAsetCategory && isVisible("title") && (
                        <td
                          onClick={() => setDetailModalItem(doc)}
                          className={`py-3.5 px-4 font-bold cursor-pointer hover:underline font-sans whitespace-nowrap ${
                            isAfkir ? 'text-white' : 'text-slate-900 hover:text-[#005ea4]'
                          }`}
                          title="Klik untuk Lihat Detail Penuh"
                        >
                          <div className="flex items-center gap-2">
                            <FileCheck className={`w-3.5 h-3.5 ${doc.hasCertificatePdf !== false ? (isAfkir ? 'text-slate-300' : 'text-emerald-600') : 'text-slate-400'}`} />
                            <span>{docTitle}</span>
                          </div>
                        </td>
                      )}

                      {!isAsetCategory && isVisible("jenisItem") && (
                        <td className={`py-3.5 px-4 font-semibold whitespace-nowrap ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                          {docJenis}
                        </td>
                      )}

                      {/* NO. SERTIFIKAT */}
                      {isVisible("certificateNo") && (
                        <td
                          onClick={() => setDetailModalItem(doc)}
                          className={`py-3.5 px-4 font-bold whitespace-nowrap cursor-pointer hover:underline ${
                            isAfkir ? 'text-slate-200' : 'text-[#005ea4]'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <FileCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${doc.hasCertificatePdf !== false ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <div>
                              <span className="block">{docCert}</span>
                              {doc.linkedCertificates?.length > 0 && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[#005ea4]/10 text-[#005ea4] border border-[#005ea4]/25 rounded text-[10px] font-bold whitespace-nowrap">
                                  +{doc.linkedCertificates.length} Sertifikat Lainnya
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* LOKASI */}
                      {isVisible("unit") && (
                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold">
                          {docUnit}
                        </td>
                      )}

                      {/* ASET SPECIFIC VALUES */}
                      {isAsetCategory && isVisible("luasM2") && (
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                          {doc.luasM2 || doc.kapasitas || '12.000 m²'}
                        </td>
                      )}

                      {isAsetCategory && isVisible("luasHa") && (
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                          {doc.luasHa || '1,2 Ha'}
                        </td>
                      )}

                      {isAsetCategory && isVisible("peruntukan") && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                          {doc.peruntukan || doc.title || doc.merekItem || 'Fasilitas Industrial'}
                        </td>
                      )}

                      {!isAsetCategory && isVisible("user") && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                          {docUser}
                        </td>
                      )}

                      {isVisible("issueDate") && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {docIssue}
                        </td>
                      )}

                      {isVisible("expiryDate") && (
                        <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isAfkir ? 'text-slate-300' : 'text-rose-700'}`}>
                          {docExpiry}
                        </td>
                      )}

                      {isAsetCategory && isVisible("kondisi") && (
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                          {doc.kondisi || (isAfkir ? 'Afkir / Non-Aktif' : isExpired ? 'Perlu Re-sertifikasi' : 'Baik & Layak')}
                        </td>
                      )}

                      {isAsetCategory && isVisible("keterangan") && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono-data text-[11px]">
                          {doc.keterangan || doc.user || 'DPMPTSP / BPN Kota Bontang'}
                        </td>
                      )}

                      {isVisible("status") && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                            isAfkir
                              ? 'bg-slate-800 text-white border-slate-600'
                              : isExpired
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : isPerpanjang
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {doc.status || 'Aktif'}
                          </span>
                        </td>
                      )}

                      {/* LIHAT DETAIL BUTTON */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono-data">
                        <button
                          onClick={() => setDetailModalItem(doc)}
                          className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumnKeys.length + 1} className="py-8 text-center text-[#64748B] font-mono-data">
                    Tidak ada dokumen {categoryName} yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SingleEntryGenericModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onAddSuccess={handleSingleAdded}
        categoryName={categoryName}
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
