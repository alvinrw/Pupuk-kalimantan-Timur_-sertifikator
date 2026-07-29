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
  FileWarning,
  ShieldAlert,
  UploadCloud,
  Eye,
  Loader2
} from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import HistoryModal from '../components/HistoryModal';
import SingleEntryCiptaanModal from '../components/SingleEntryCiptaanModal';
import ResolveDocumentModal from '../components/ResolveDocumentModal';
import DocumentDetailPage from './DocumentDetailPage';
import { getMasterItems, createMasterItem, resolveMasterItemExemption, createCertificateForMasterItem } from '../services/masterItemsService';

export default function AdministrasiLainnya() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('main'); // 'main' | 'staging'
  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('');
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);
  const [resolveTargetItem, setResolveTargetItem] = useState(null);
  
  // Header Dropdown Filter States
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterMasa, setFilterMasa] = useState('All');
  const [filterHasSertifikat, setFilterHasSertifikat] = useState('All'); // 'All' | 'ada' | 'tidak'

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
    { key: "hasSertifikat", label: "Ada Sertifikat" },
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
  const [ciptaanList, setCiptaanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems('administrasi-lainnya');
      const mapped = data.map((item, idx) => {
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

        const noCert = item.documentStatus === 'EXEMPT'
          ? 'Tanpa Sertifikat'
          : (primaryCert?.noSertifikat || primaryCert?.noIzin || item.certificateNo || item.code || '-');

        const expiryVal = primaryCert?.expired || item.expiryDate || '-';
        const issueVal = primaryCert?.terbit || item.issueDate || item.createdAt;

        return {
          id: item.id,
          MasterId: item.id,
          no: idx + 1,
          judulCiptaan: item.title || "Administrasi Lainnya",
          jenisCiptaan: item.categoryKey || "Administrasi",
          tanggalCiptaan: issueVal,
          masaBerlaku: item.areaSqm || "Selamanya",
          kapanBerakhir: expiryVal,
          noSertifikat: noCert,
          documentStatus: item.documentStatus || item.document_status || (certs.length > 0 ? 'COMPLETED' : 'PENDING_DOC'),
          exemptionNote: item.exemptionNote || null,
          hasCertificatePdf: !!primaryCert?.fileUrl,
          fileUrl: primaryCert?.fileUrl || null,
          status: item.status || "Aktif",
          merekItem: item.title,
          jenisPeralatan: item.categoryKey,
          linkedCertificates: certs
        };
      });
      setCiptaanList(mapped);
    } catch (error) {
      console.error("Failed to load AdministrasiLainnya", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const pendingCount = useMemo(() => {
    return ciptaanList.filter(item => item.documentStatus === 'PENDING_DOC').length;
  }, [ciptaanList]);

  const handleBulkExempt = async () => {
    if (selectedStagingIds.length === 0 || !bulkExemptNote.trim()) return;
    try {
      setIsSubmittingBulkExempt(true);
      for (const id of selectedStagingIds) {
        await resolveMasterItemExemption(id, bulkExemptNote.trim());
      }
      setSelectedStagingIds([]);
      setBulkExemptModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan bulk action.");
    } finally {
      setIsSubmittingBulkExempt(false);
    }
  };

  const toggleSelectStaging = (id) => {
    setSelectedStagingIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllStaging = (currentRows) => {
    if (selectedStagingIds.length === currentRows.length && currentRows.length > 0) {
      setSelectedStagingIds([]);
    } else {
      setSelectedStagingIds(currentRows.map(r => r.id || r.MasterId));
    }
  };

  // Unique options for dropdown filters
  const uniqueJenis = useMemo(() => ['All', ...new Set(ciptaanList.map(i => i.jenisCiptaan || i.jenisItem).filter(Boolean))], [ciptaanList]);
  const uniqueMasa = useMemo(() => ['All', ...new Set(ciptaanList.map(i => i.masaBerlaku).filter(Boolean))], [ciptaanList]);

  // Process Search & Category Filtering
  const filteredData = useMemo(() => {
    return ciptaanList.filter((item) => {
      const matchesTab = activeMainTab === 'staging'
        ? item.documentStatus === 'PENDING_DOC'
        : item.documentStatus !== 'PENDING_DOC';

      const judul = item.judulCiptaan || item.merekItem || '';
      const jenis = item.jenisCiptaan || item.jenisItem || '';

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        judul.toLowerCase().includes(searchLower) ||
        jenis.toLowerCase().includes(searchLower);

      const matchesJenis = filterJenis === 'All' || jenis === filterJenis;
      const matchesMasa = filterMasa === 'All' || (item.masaBerlaku || '') === filterMasa;
      const matchesHasSertifikat = filterHasSertifikat === 'All'
        ? true
        : filterHasSertifikat === 'ada'
        ? item.documentStatus !== 'EXEMPT'
        : item.documentStatus === 'EXEMPT';

      return matchesTab && matchesSearch && matchesJenis && matchesMasa && matchesHasSertifikat;
    });
  }, [ciptaanList, searchTerm, filterJenis, filterMasa, filterHasSertifikat, activeMainTab]);

  // Handlers
  const handleCsvImported = async () => {
    setActiveMainTab('staging');
    await loadData();
    setTimeout(() => {
      loadData();
    }, 800);
  };

  const handleSingleAdded = async (newItem) => {
    try {
      const createdItem = await createMasterItem({
        title: newItem.judulCiptaan || 'Unknown Item',
        code: newItem.noSertifikat || '-',
        categoryKey: 'administrasi-lainnya',
        unitLocation: 'Umum',
        status: 'Aktif',
        keterangan: 'Data Manual Input',
        issueDate: newItem.tanggalCiptaan || undefined,
        expiryDate: newItem.expiryDate || undefined,
        documentStatus: newItem.documentStatus
      });
      
      const targetItemId = createdItem?.id || createdItem?.MasterId || createdItem?.['id'];

      if (newItem.documentStatus === 'COMPLETED' && targetItemId) {
        let fileUrl = null;
        if (newItem.file) {
          const formData = new FormData();
          formData.append('file', newItem.file);
          try {
            const uploadRes = await fetch('http://localhost:3000/api/v1/document-history/upload', {
              method: 'POST',
              body: formData,
            });
            if (uploadRes.ok) {
              const uploadJson = await uploadRes.json();
              fileUrl = uploadJson?.data?.url || uploadJson?.data?.fileUrl || uploadJson?.data?.path || null;
            }
          } catch (uploadErr) {
            console.error("Gagal mengunggah file:", uploadErr);
          }
        }

        await createCertificateForMasterItem({
          itemId: targetItemId,
          jenisSertifikat: newItem.jenisCiptaan || 'Sertifikat Pencatatan',
          noSertifikat: newItem.noSertifikat || 'BELUM_ADA_SERTIFIKAT',
          status: 'Aktif',
          terbit: newItem.tanggalCiptaan || undefined,
          expired: newItem.expiryDate || undefined,
          fileUrl: fileUrl,
        });
      }

      setIsSingleModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert(`Gagal menyimpan data ke database! Error: ${error?.response?.data?.message || error.message}`);
    }
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
    loadData();
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
        hideLinkedCertificates={true}
        onBack={() => setDetailModalItem(null)}
        onSaveUpdate={(updatedItem) => {
          setCiptaanList(prev => prev.map(i => i.id === updatedItem.id ? { ...i, ...updatedItem, judulCiptaan: updatedItem.merekItem || i.judulCiptaan } : i));
          loadData();
        }}
        onQuickRenew={(id) => {
          alert(`Inisiasi Perpanjangan untuk ciptaan ${id}. Menuju menu Monitoring.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Menandai ciptaan ${id} sebagai Afkir.`);
        }}
        onDeleteSuccess={() => {
          setDetailModalItem(null);
          loadData();
        }}
        onRefreshRequired={() => loadData()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Data Administrasi dari Database...</p>
      </div>
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

      {/* BULK ACTION BAR */}
      {activeMainTab === 'staging' && selectedStagingIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between mt-4 shadow-2xs font-mono-data">
          <div className="text-amber-800 text-xs font-bold">
            {selectedStagingIds.length} item terpilih
          </div>
          <button 
            onClick={() => setBulkExemptModalOpen(true)}
            disabled={isSubmittingBulkExempt}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Tandai Terpilih Tanpa Sertifikat
          </button>
        </div>
      )}

      {/* Table with Custom 6 Columns & Header Filters */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${activeMainTab === 'staging' && selectedStagingIds.length > 0 ? 'mt-4' : 'mt-0'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                {activeMainTab === 'staging' && (
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredData.length > 0 && selectedStagingIds.length === filteredData.length}
                      onChange={() => toggleSelectAllStaging(filteredData)}
                      className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                    />
                  </th>
                )}
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

                {/* SERTIFIKAT FILTER */}
                {isVisible("hasSertifikat") && (
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>ADA SERTIFIKAT</span>
                      <select
                        value={filterHasSertifikat}
                        onChange={(e) => setFilterHasSertifikat(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer"
                      >
                        <option value="All">Semua</option>
                        <option value="ada">Ada</option>
                        <option value="tidak">Tidak Ada</option>
                      </select>
                    </div>
                  </th>
                )}

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

                  return (
                    <tr key={item.id} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                      {activeMainTab === 'staging' && (
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStagingIds.includes(item.id || item.MasterId)}
                            onChange={() => toggleSelectStaging(item.id || item.MasterId)}
                            className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                          />
                        </td>
                      )}
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
                      {isVisible("hasSertifikat") && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.documentStatus === 'PENDING_DOC' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <FileWarning className="w-3 h-3" />
                              Belum Upload
                            </span>
                          ) : item.documentStatus === 'EXEMPT' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              Tidak Ada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Ada
                            </span>
                          )}
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

                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono-data">
                      {item.documentStatus === 'PENDING_DOC' || activeMainTab === 'staging' ? (
                        <button
                          onClick={() => setResolveTargetItem(item)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <FileWarning className="w-3.5 h-3.5" />
                          <span>Perbaiki / Lengkapi</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setDetailModalItem({ ...item, merekItem: item.judulCiptaan, jenisPeralatan: item.jenisCiptaan, berakhir: item.kapanBerakhir })}
                          className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
              ) : (
                <tr>
                  <td colSpan={visibleColumnKeys.length + (activeMainTab === 'staging' ? 2 : 1)} className="py-8 text-center text-[#64748B] font-mono-data">
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
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleCsvImported}
        categoryKey="administrasi-lainnya"
        moduleName="Administrasi & Perizinan Ciptaan (HAKI)"
      />

      <SingleEntryCiptaanModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onAddSuccess={handleSingleAdded}
      />

      <ResolveDocumentModal
        isOpen={!!resolveTargetItem}
        onClose={() => setResolveTargetItem(null)}
        item={resolveTargetItem}
        onSuccess={loadData}
      />

      {/* BULK EXEMPT MODAL */}
      {bulkExemptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Tandai Tanpa Sertifikat
              </h3>
              <button 
                onClick={() => setBulkExemptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 font-medium">
                  Anda akan menandai <strong>{selectedStagingIds.length} item terpilih</strong> sebagai tidak memerlukan dokumen/sertifikat (EXEMPT).
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Alasan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={bulkExemptNote}
                  onChange={(e) => setBulkExemptNote(e.target.value)}
                  placeholder="Masukkan alasan mengapa dokumen tidak diperlukan..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] bg-slate-50 focus:bg-white resize-none"
                  rows={3}
                ></textarea>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkExemptModalOpen(false)}
                disabled={isSubmittingBulkExempt}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkExempt}
                disabled={isSubmittingBulkExempt || !bulkExemptNote.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
              >
                {isSubmittingBulkExempt && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ya, Tandai {selectedStagingIds.length} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
