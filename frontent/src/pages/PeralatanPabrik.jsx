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
import SingleEntryModal from '../components/SingleEntryModal';
import ResolveDocumentModal from '../components/ResolveDocumentModal';
import DocumentDetailPage from './DocumentDetailPage';
import { getMasterItems, createMasterItem } from '../services/masterItemsService';
import { uploadCsv } from '../services/csvService';
import { Loader2, ShieldAlert, FileWarning } from 'lucide-react';

export default function PeralatanPabrik() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Column Header Dropdown Filter States
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterLokasi, setFilterLokasi] = useState('All');
  const [filterUser, setFilterUser] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals & Popovers
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [resolveTargetItem, setResolveTargetItem] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('main'); // 'main' | 'staging'

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

  // 14 Columns Configuration
  const allColumns = [
    { key: "no", label: "No." },
    { key: "jenisPeralatan", label: "Jenis Peralatan Pabrik" },
    { key: "merekItem", label: "Merek/Item" },
    { key: "tipe", label: "Tipe" },
    { key: "nomorSeri", label: "Nomor Seri" },
    { key: "kapasitas", label: "Kapasitas" },
    { key: "lokasi", label: "Lokasi" },
    { key: "user", label: "User" },
    { key: "status", label: "Status" },
    { key: "noSertifikat", label: "No. Sertifikat" },
    { key: "tanggalInspeksi", label: "Tanggal Inspeksi" },
    { key: "terbit", label: "Terbit" },
    { key: "berakhir", label: "Berakhir" },
    { key: "keterangan", label: "Keterangan" },
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
    const workflowStr = (item.workflowStatus || '').toLowerCase();
    
    // 1. HITAM (BLACK) -> Afkir / Decommissioned
    if (statusStr === 'afkir' || statusStr === 'decommissioned' || workflowStr === 'decommissioned') {
      return 'bg-[#0f172a] text-white hover:bg-slate-900 border-b border-slate-700';
    }

    let isExpired = statusStr === 'expired';
    let isPerpanjang = statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'in_progress' || workflowStr === 'in_progress';

    if (item.berakhir) {
      const today = new Date();
      const expDate = new Date(item.berakhir);
      if (!isNaN(expDate.getTime())) {
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
          isExpired = true;
        } else if (diffDays <= 30) {
          isPerpanjang = true;
        }
      }
    }

    // 2. MERAH (RED) -> Expired
    if (isExpired) {
      return 'bg-rose-50/90 text-rose-950 hover:bg-rose-100 border-b border-rose-200';
    }

    // 3. KUNING (YELLOW) -> Perpanjangan / In Progress / Urgent
    if (isPerpanjang) {
      return 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border-b border-amber-200';
    }

    // 4. INDIGO (PURPLE) -> Tanpa Sertifikat (EXEMPT)
    if (item.documentStatus === 'EXEMPT') {
      return 'bg-indigo-50/30 text-slate-800 hover:bg-indigo-50/60 border-b border-indigo-100 border-l-4 border-l-indigo-500';
    }

    // 5. DEFAULT (Clean Normal Row)
    return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
  };

  // Master Equipment Data connected from Database
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems('peralatan-pabrik');
      
      const flattened = [];
      data.forEach(item => {
        const docs = [];
        if (item.certificates?.length > 0) docs.push(...item.certificates);
        if (item.permits?.length > 0) docs.push(...item.permits);

        if (docs.length === 0) {
          flattened.push({
            id: item.id,
            MasterId: item.id,
            categoryKey: item.categoryKey,
            jenisPeralatan: item.title || 'Unknown',
            merekItem: item.code || '-',
            tipe: '-',
            nomorSeri: '-',
            kapasitas: '-',
            lokasi: item.unitLocation || 'Umum',
            user: 'Umum',
            status: item.status || 'Aktif',
            documentStatus: item.documentStatus || 'COMPLETED',
            exemptionNote: item.exemptionNote || null,
            noSertifikat: '-',
            tanggalInspeksi: item.issueDate || (item.createdAt ? item.createdAt.substring(0, 10) : '-'),
            terbit: item.issueDate || (item.createdAt ? item.createdAt.substring(0, 10) : '-'),
            berakhir: item.expiryDate || '-',
            keterangan: item.description || '-',
          });
        } else {
          docs.forEach(doc => {
            flattened.push({
              id: doc.id,
              MasterId: item.id,
              categoryKey: item.categoryKey,
              jenisPeralatan: item.title || 'Unknown',
              merekItem: item.code || '-',
              tipe: '-',
              nomorSeri: '-',
              kapasitas: '-',
              lokasi: item.unitLocation || 'Umum',
              user: 'Umum',
              status: item.status || 'Aktif',
              documentStatus: item.documentStatus === 'EXEMPT' ? 'EXEMPT' : 'COMPLETED',
              exemptionNote: item.exemptionNote || null,
              noSertifikat: doc.noSertifikat || doc.noIzin || '-',
              tanggalInspeksi: doc.terbit || item.issueDate || (item.createdAt ? item.createdAt.substring(0, 10) : '-'),
              terbit: doc.terbit || item.issueDate || (item.createdAt ? item.createdAt.substring(0, 10) : '-'),
              berakhir: doc.expired || item.expiryDate || '-',
              keterangan: doc.keterangan || item.description || '-',
            });
          });
        }
      });
      setEquipmentList(flattened);
    } catch (err) {
      console.error("Failed to fetch PeralatanPabrik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Unique options for header dropdowns
  const uniqueJenis = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.jenisPeralatan))], [equipmentList]);
  const uniqueLokasi = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.lokasi))], [equipmentList]);
  const uniqueUser = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.user))], [equipmentList]);

  const pendingCount = useMemo(() => {
    return equipmentList.filter(i => i.documentStatus === 'PENDING_DOC').length;
  }, [equipmentList]);

  // Process Search & Category Filtering
  const filteredData = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchesTab = activeMainTab === 'staging'
        ? item.documentStatus === 'PENDING_DOC'
        : item.documentStatus !== 'PENDING_DOC';

      const searchLower = (searchTerm || '').toLowerCase();
      const matchesSearch =
        (item.jenisPeralatan || '').toLowerCase().includes(searchLower) ||
        (item.merekItem || '').toLowerCase().includes(searchLower) ||
        (item.tipe || '').toLowerCase().includes(searchLower) ||
        (item.nomorSeri || '').toLowerCase().includes(searchLower) ||
        (item.noSertifikat || '').toLowerCase().includes(searchLower);

      const matchesJenis = filterJenis === 'All' || item.jenisPeralatan === filterJenis;
      const matchesLokasi = filterLokasi === 'All' || item.lokasi === filterLokasi;
      const matchesUser = filterUser === 'All' || item.user === filterUser;
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

      return matchesTab && matchesSearch && matchesJenis && matchesLokasi && matchesUser && matchesStatus;
    });
  }, [equipmentList, activeMainTab, searchTerm, filterJenis, filterLokasi, filterUser, filterStatus]);

  const expandedRows = useMemo(() => {
    const rows = [];
    filteredData.forEach((item) => {
      rows.push({
        rowId: `${item.id}-primary`,
        parentItem: item,
        isLinked: false,
        noSertifikat: item.noSertifikat || item.certificateNo || '-',
        jenisPeralatan: item.jenisPeralatan || item.jenisItem || 'Peralatan Pabrik',
        tanggalInspeksi: item.tanggalInspeksi || item.issueDate || '-',
        terbit: item.terbit || item.issueDate || '-',
        berakhir: item.berakhir || item.expiryDate || '-',
        keterangan: item.keterangan || item.user || 'Instansi Terkait',
        status: item.status || 'Aktif',
        documentStatus: item.documentStatus,
        exemptionNote: item.exemptionNote,
        hasPdf: item.hasCertificatePdf !== false
      });

      if (item.linkedCertificates && Array.isArray(item.linkedCertificates)) {
        item.linkedCertificates.forEach((lc, idx) => {
          rows.push({
            rowId: `${item.id}-linked-${lc.id || idx}`,
            parentItem: item,
            isLinked: true,
            noSertifikat: lc.noSertifikat || '-',
            jenisPeralatan: lc.jenisSertifikat || item.jenisPeralatan,
            tanggalInspeksi: lc.terbit || '-',
            terbit: lc.terbit || '-',
            berakhir: lc.expired || '-',
            keterangan: lc.instansi || item.keterangan,
            status: lc.status || 'Aktif',
            hasPdf: lc.hasPdf !== false
          });
        });
      }
    });
    return rows;
  }, [filteredData]);

  const handleCsvImported = () => {
    loadData();
  };

  const handleSingleAdded = async (newItem) => {
    try {
      await createMasterItem({
        title: newItem.merekItem || newItem.equipmentName || 'Unknown Item',
        code: newItem.nomorSeri || newItem.tagNumber || '-',
        categoryKey: 'peralatan-pabrik',
        unitLocation: newItem.lokasi || newItem.plantUnit || 'Umum',
        status: newItem.status || newItem.statusSertifikasi || 'Aktif',
        keterangan: newItem.keterangan || '-',
        issueDate: newItem.terbit || newItem.issueDate || undefined,
        expiryDate: newItem.berakhir || newItem.expiryDate || undefined,
      });
      loadData(); // Refresh table
    } catch (error) {
      console.error("Gagal menambahkan data:", error);
      alert("Gagal menyimpan data ke database!");
    }
  };

  const handleZipMatched = async (extractedList) => {
    try {
      const successfulItems = extractedList.filter(item => item.statusLabel !== "Gagal Ekstraksi");
      for (const item of successfulItems) {
        await createMasterItem({
          title: item.matchedTitle || item.pdfName,
          code: item.matchedCode || item.nomorSeri || "-",
          categoryKey: 'peralatan-pabrik',
          unitLocation: 'Umum',
          status: 'Aktif',
          keterangan: `Diimpor otomatis dari ZIP (${item.pdfName})`,
        });
      }
      loadData();
      alert(`Berhasil menyimpan ${successfulItems.length} data peralatan dari hasil ZIP OCR!`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan data Batch ZIP!");
    }
  };

  // Row Delete Confirmation Trigger
  const requestDeleteRow = (rowId) => {
    setPendingDeleteRowId(rowId);
    setRowConfirmModalOpen(true);
    setOpenActionRowId(null);
  };

  const confirmDeleteRow = () => {
    setEquipmentList(prev => prev.filter(item => item.id !== pendingDeleteRowId));
    setRowConfirmModalOpen(false);
    setPendingDeleteRowId(null);
  };

  // Ganti Target Sertifikat Handler
  const openReassignTargetModal = (item) => {
    setReassignCertRowItem(item);
    setSelectedNewTargetItem(equipmentList.find(e => e.id !== item.id) || equipmentList[0]);
    setSearchTargetItemTerm('');
    setOpenActionRowId(null);
  };

  const confirmReassignTargetRow = () => {
    if (!reassignCertRowItem || !selectedNewTargetItem) return;

    // Move certificate info to target equipment row
    setEquipmentList(prev =>
      prev.map(eq => {
        if (eq.id === selectedNewTargetItem.id) {
          return {
            ...eq,
            noSertifikat: reassignCertRowItem.noSertifikat,
            hasCertificatePdf: true,
            keterangan: `Sertifikat Dipindahkan dari ${reassignCertRowItem.tipe}`
          };
        }
        if (eq.id === reassignCertRowItem.id) {
          return {
            ...eq,
            noSertifikat: "BELUM_ADA_SERTIFIKAT",
            hasCertificatePdf: false,
            keterangan: "Sertifikat Dipindahkan ke Item Lain"
          };
        }
        return eq;
      })
    );

    alert(`Sertifikat ${reassignCertRowItem.noSertifikat} berhasil dipindahkan ke ${selectedNewTargetItem.merekItem} (${selectedNewTargetItem.tipe})!`);
    setReassignCertRowItem(null);
  };

  const targetSearchLower = (searchTargetItemTerm || '').toLowerCase();
  const filteredTargetEquipmentList = equipmentList.filter(eq =>
    eq.id !== reassignCertRowItem?.id &&
    ((eq.tipe || '').toLowerCase().includes(targetSearchLower) ||
     (eq.merekItem || '').toLowerCase().includes(targetSearchLower) ||
     (eq.jenisPeralatan || '').toLowerCase().includes(targetSearchLower) ||
     (eq.lokasi || '').toLowerCase().includes(targetSearchLower))
  );

  if (detailModalItem) {
    return (
      <DocumentDetailPage
        item={detailModalItem}
        onBack={() => setDetailModalItem(null)}
        onSaveUpdate={(updatedItem) => {
          setEquipmentList(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
          setDetailModalItem(prev => (prev && prev.id === updatedItem.id ? { ...prev, ...updatedItem } : prev));
        }}
        onQuickRenew={(id) => {
          alert(`Inisiasi Perpanjangan Sertifikat untuk item ${id}. Menuju menu Monitoring.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Menandai item ${id} sebagai Aset Afkir.`);
        }}
        onDeleteSuccess={() => {
          setDetailModalItem(null);
          loadData();
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Tabel Peralatan Pabrik dari Database...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-[#0F172A]">
            Perizinan Peralatan Pabrik
          </h2>
          <p className="text-xs text-[#64748B] font-mono-data">
            Daftar perizinan peralatan pabrik, nomor seri, kapasitas, lokasi, dan status sertifikat
          </p>
        </div>

        {/* UNIFIED SINGLE ACTION DROPDOWN BUTTON (+ Kelola / Impor Dokumen) */}
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
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Termasuk unggah foto / PDF sertifikat</span>
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
            placeholder="Cari Jenis Peralatan, Merek, Tipe, No Seri, atau Sertifikat..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#f8fafc] border border-[#e2e8fo] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
            {filteredData.length} data ditemukan
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

          {/* COLUMN VISIBILITY DROPDOWN WITH CHECKBOXES */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs transition-colors"
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

                <div className="pt-2 border-t border-slate-200 text-right">
                  <button
                    onClick={() => setIsColumnDropdownOpen(false)}
                    className="px-3 py-1 bg-[#005ea4] text-white text-[11px] font-bold rounded-md"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table with Inline Header Dropdown Filters & COMPLETE "AKSI" DROPDOWN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                {isVisible("no") && <th className="py-3.5 px-4 text-center font-bold whitespace-nowrap">NO.</th>}

                {/* JENIS PERALATAN PABRIK */}
                {isVisible("jenisPeralatan") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>JENIS PERALATAN PABRIK</span>
                      <select
                        value={filterJenis}
                        onChange={(e) => setFilterJenis(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs"
                      >
                        <option value="All">Semua</option>
                        {uniqueJenis.filter(j => j !== 'All').map((j, idx) => (
                          <option key={idx} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {isVisible("merekItem") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">MEREK/ITEM</th>}
                {isVisible("tipe") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">TIPE</th>}
                {isVisible("nomorSeri") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">NOMOR SERI</th>}
                {isVisible("kapasitas") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KAPASITAS</th>}

                {/* LOKASI */}
                {isVisible("lokasi") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>LOKASI</span>
                      <select
                        value={filterLokasi}
                        onChange={(e) => setFilterLokasi(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs"
                      >
                        <option value="All">Semua</option>
                        {uniqueLokasi.filter(l => l !== 'All').map((l, idx) => (
                          <option key={idx} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {/* USER */}
                {isVisible("user") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>USER</span>
                      <select
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs"
                      >
                        <option value="All">Semua</option>
                        {uniqueUser.filter(u => u !== 'All').map((u, idx) => (
                          <option key={idx} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {/* STATUS */}
                {isVisible("status") && (
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>STATUS</span>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs"
                      >
                        <option value="All">Semua</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Spare">Spare</option>
                        <option value="Rusak">Rusak</option>
                      </select>
                    </div>
                  </th>
                )}

                {isVisible("noSertifikat") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">NO. SERTIFIKAT</th>}
                {isVisible("tanggalInspeksi") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">TANGGAL INSPEKSI</th>}
                {isVisible("terbit") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">TERBIT</th>}
                {isVisible("berakhir") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">BERAKHIR</th>}
                {isVisible("keterangan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KETERANGAN</th>}
                <th className="py-3.5 px-4 font-bold text-right whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {expandedRows.length > 0 ? (
                expandedRows.map((row, index) => {
                  const item = row.parentItem;
                  const rowClass = getRowStatusStyle({ status: row.status, berakhir: row.berakhir, documentStatus: row.documentStatus });
                  const isAfkir = row.status === 'Afkir' || row.status === 'Decommissioned' || row.status === 'afkir';
                  const isExpired = row.status === 'Expired' || row.status === 'expired';
                  const isPerpanjang = row.status === 'Perpanjang' || row.status === 'In Progress' || row.status === 'perpanjang';

                  return (
                    <tr key={row.rowId} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                      {isVisible("no") && (
                        <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap">
                          {index + 1}
                        </td>
                      )}
                      {isVisible("jenisPeralatan") && (
                        <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                          <span>{row.jenisPeralatan}</span>
                        </td>
                      )}
                      {isVisible("merekItem") && (
                        <td
                          onClick={() => setDetailModalItem(item)}
                          className={`py-3.5 px-4 font-bold cursor-pointer hover:underline whitespace-nowrap ${
                            isAfkir ? 'text-white' : 'text-slate-900 hover:text-[#005ea4]'
                          }`}
                          title="Klik untuk Lihat Detail"
                        >
                          {item.merekItem}
                        </td>
                      )}
                      {isVisible("tipe") && (
                        <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                          {item.tipe}
                        </td>
                      )}
                      {isVisible("nomorSeri") && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.nomorSeri}
                        </td>
                      )}
                      {isVisible("kapasitas") && (
                        <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                          {item.kapasitas}
                        </td>
                      )}
                      {isVisible("lokasi") && (
                        <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                          {item.lokasi}
                        </td>
                      )}
                      {isVisible("user") && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.user}
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
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        )}
                      {isVisible("noSertifikat") && (
                        <td className="py-3.5 px-4 font-mono-data font-bold text-[#005ea4] whitespace-nowrap flex items-center gap-1.5">
                          {row.documentStatus === 'PENDING_DOC' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <FileWarning className="w-3 h-3 text-amber-500" />
                              Belum Upload PDF
                            </span>
                          ) : row.documentStatus === 'EXEMPT' ? (
                            <span
                              title={`Catatan Alasan: ${row.exemptionNote || 'Tanpa Sertifikat'}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-300 shadow-2xs cursor-help"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Tanpa Sertifikat</span>
                            </span>
                          ) : (
                            <>
                              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span>{row.noSertifikat}</span>
                            </>
                          )}
                        </td>
                      )}
                    {isVisible("tanggalInspeksi") && (
                      <td className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap">
                        {row.tanggalInspeksi}
                      </td>
                    )}
                    {isVisible("terbit") && (
                      <td className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap">
                        {row.terbit}
                      </td>
                    )}
                    {isVisible("berakhir") && (
                      <td className="py-3.5 px-4 font-mono-data font-bold text-rose-700 whitespace-nowrap">
                        {row.berakhir}
                      </td>
                    )}
                    {isVisible("keterangan") && (
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {row.keterangan}
                      </td>
                    )}

                    {/* LIHAT DETAIL / PERBAIKI BUTTON ON ROW */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono-data">
                      {row.documentStatus === 'PENDING_DOC' || activeMainTab === 'staging' ? (
                        <button
                          onClick={() => setResolveTargetItem(item)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <FileWarning className="w-3.5 h-3.5" />
                          <span>Perbaiki / Lengkapi</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setDetailModalItem(item)}
                          className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Detail</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
              ) : (
                <tr>
                  <td colSpan={visibleColumnKeys.length + 1} className="py-12 text-center text-[#64748B]">
                    {activeMainTab === 'staging' ? (
                      <div className="max-w-sm mx-auto space-y-2 py-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                          <Check className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 font-sans-clean">Semua Dokumen Lengkap!</h4>
                        <p className="text-xs text-slate-500 font-sans-clean">
                          Tidak ada data baru yang membutuhkan tindakan. Semua aset di modul ini sudah terverifikasi atau telah diberikan catatan penanganan.
                        </p>
                      </div>
                    ) : (
                      <span className="font-mono-data">Tidak ada peralatan yang sesuai dengan filter pencarian.</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GANTI TARGET SERTIFIKAT MODAL (IN ROW AKSI MENU) */}
      {reassignCertRowItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Ganti / Pindahkan Target Sertifikat</h4>
                <p className="text-[11px] text-blue-300 font-mono-data">Sertifikat: {reassignCertRowItem.noSertifikat} ({reassignCertRowItem.tipe})</p>
              </div>
              <button onClick={() => setReassignCertRowItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-700 font-medium">
                Pilih peralatan pabrik tujuan tempat sertifikat <b>{reassignCertRowItem.noSertifikat}</b> ini akan dipindahkan:
              </p>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTargetItemTerm}
                  onChange={(e) => setSearchTargetItemTerm(e.target.value)}
                  placeholder="Cari Tipe, Merek, Jenis, atau Lokasi Peralatan Target..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                {filteredTargetEquipmentList.map((eq) => {
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
                          <span className="font-mono-data font-bold text-xs text-[#005ea4]">{eq.tipe}</span>
                          <span className="text-[10px] font-mono-data text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {eq.nomorSeri}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-slate-900 block">{eq.merekItem}</span>
                        <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {eq.lokasi}
                        </span>
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

            {/* Modal Footer */}
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
                Apakah Anda yakin ingin menghapus baris data peralatan ini? Baris yang dihapus tidak dapat dikembalikan.
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
      <SingleEntryModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onAddSuccess={handleSingleAdded}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleCsvImported}
        categoryKey="peralatan-pabrik"
      />

      <HistoryModal
        isOpen={!!historyTargetItem}
        onClose={() => setHistoryTargetItem(null)}
        documentItem={historyTargetItem}
      />
      {/* RESOLVE DOCUMENT STAGING MODAL */}
      <ResolveDocumentModal
        isOpen={!!resolveTargetItem}
        onClose={() => setResolveTargetItem(null)}
        item={resolveTargetItem}
        onSuccess={loadData}
      />
    </div>
  );
}
