// hooks/useAdministrasiLainnya.js
// Business logic hook untuk halaman Administrasi & Perizinan Ciptaan (HAKI)
// Diekstrak dari pages/AdministrasiLainnya.jsx untuk memisahkan logic dari UI

import { useState, useMemo, useEffect } from 'react';
import {
  getMasterItems,
  createMasterItem,
  resolveMasterItemExemption,
  createCertificateForMasterItem,
  deleteMasterItem,
} from '../services/masterItemsService';

const CATEGORY_KEY = 'administrasi-lainnya';
const UPLOAD_URL = `${import.meta.env.VITE_API_BASE_URL}/document-history/upload`;

/**
 * Memetakan satu item dari API ke format yang digunakan UI tabel ciptaan.
 */
function mapItemToRow(item, idx) {
  const certs = item.certificates || [];
  const activeCerts = certs.filter(
    (c) => c.status === 'Aktif' || c.status === 'Active' || !c.status
  );

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

  const noCert =
    item.documentStatus === 'EXEMPT'
      ? 'Tanpa Sertifikat'
      : primaryCert?.noSertifikat || primaryCert?.noIzin || item.certificateNo || item.code || '-';

  const expiryVal = primaryCert?.expired || item.expiryDate || '-';
  const issueVal = primaryCert?.terbit || item.issueDate || item.createdAt;

  return {
    id: item.id,
    MasterId: item.id,
    no: idx + 1,
    judulCiptaan: item.title || 'Administrasi Lainnya',
    jenisCiptaan: item.categoryKey || 'Administrasi',
    tanggalCiptaan: issueVal,
    masaBerlaku: item.areaSqm || 'Selamanya',
    kapanBerakhir: expiryVal,
    noSertifikat: noCert,
    documentStatus:
      item.documentStatus ||
      item.document_status ||
      (certs.length > 0 ? 'COMPLETED' : 'PENDING_DOC'),
    exemptionNote: item.exemptionNote || null,
    hasCertificatePdf: !!primaryCert?.fileUrl,
    fileUrl: primaryCert?.fileUrl || null,
    status: item.status || 'Aktif',
    merekItem: item.title,
    notificationSetting: item.notificationSetting || null,
    reminderEnabled: item.notificationSetting ? item.notificationSetting.isEnabled : true,
    jenisPeralatan: item.categoryKey,
    linkedCertificates: certs,
  };
}

export default function useAdministrasiLainnya() {
  // ─── Data State ─────────────────────────────────────────────
  const [ciptaanList, setCiptaanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Tab & Filter State ──────────────────────────────────────
  const [activeMainTab, setActiveMainTab] = useState('main'); // 'main' | 'staging'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterMasa, setFilterMasa] = useState('All');
  const [filterHasSertifikat, setFilterHasSertifikat] = useState('All'); // 'All' | 'ada' | 'tidak'

  // ─── UI Popover State ────────────────────────────────────────
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);

  // ─── Modal State ─────────────────────────────────────────────
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [resolveTargetItem, setResolveTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);

  // ─── Row Delete Confirmation State ──────────────────────────
  const [rowConfirmModalOpen, setRowConfirmModalOpen] = useState(false);
  const [pendingDeleteRowId, setPendingDeleteRowId] = useState(null);
  const [openActionRowId, setOpenActionRowId] = useState(null);

  // ─── Bulk Exempt State ───────────────────────────────────────
  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('');
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);

  // ─── Reassign Sertifikat State ───────────────────────────────
  const [reassignCertRowItem, setReassignCertRowItem] = useState(null);
  const [searchTargetItemTerm, setSearchTargetItemTerm] = useState('');
  const [selectedNewTargetItem, setSelectedNewTargetItem] = useState(null);

  // ─── Column Visibility State ─────────────────────────────────
  const allColumns = [
    { key: 'no', label: 'No.' },
    { key: 'judulCiptaan', label: 'Judul Ciptaan' },
    { key: 'jenisCiptaan', label: 'Jenis Ciptaan' },
    { key: 'hasSertifikat', label: 'Ada Sertifikat' },
    { key: 'tanggalCiptaan', label: 'Tanggal Ciptaan' },
    { key: 'masaBerlaku', label: 'Masa Berlaku' },
    { key: 'kapanBerakhir', label: 'Kapan Berakhir' },
  ];
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allColumns.map((c) => c.key));

  // ─── Data Loading ─────────────────────────────────────────────
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems(CATEGORY_KEY);
      setCiptaanList(data.map(mapItemToRow));
    } catch (error) {
      console.error('Failed to load AdministrasiLainnya', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Derived / Computed Values ────────────────────────────────
  const pendingCount = useMemo(
    () => ciptaanList.filter((item) => item.documentStatus === 'PENDING_DOC').length,
    [ciptaanList]
  );

  const uniqueJenis = useMemo(
    () => ['All', ...new Set(ciptaanList.map((i) => i.jenisCiptaan || i.jenisItem).filter(Boolean))],
    [ciptaanList]
  );

  const uniqueMasa = useMemo(
    () => ['All', ...new Set(ciptaanList.map((i) => i.masaBerlaku).filter(Boolean))],
    [ciptaanList]
  );

  const filteredData = useMemo(() => {
    return ciptaanList.filter((item) => {
      const matchesTab =
        activeMainTab === 'staging'
          ? item.documentStatus === 'PENDING_DOC'
          : item.documentStatus !== 'PENDING_DOC';

      const judul = item.judulCiptaan || item.merekItem || '';
      const jenis = item.jenisCiptaan || item.jenisItem || '';
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        judul.toLowerCase().includes(searchLower) || jenis.toLowerCase().includes(searchLower);
      const matchesJenis = filterJenis === 'All' || jenis === filterJenis;
      const matchesMasa = filterMasa === 'All' || (item.masaBerlaku || '') === filterMasa;
      const matchesHasSertifikat =
        filterHasSertifikat === 'All'
          ? true
          : filterHasSertifikat === 'ada'
          ? item.documentStatus !== 'EXEMPT'
          : item.documentStatus === 'EXEMPT';

      return matchesTab && matchesSearch && matchesJenis && matchesMasa && matchesHasSertifikat;
    });
  }, [ciptaanList, searchTerm, filterJenis, filterMasa, filterHasSertifikat, activeMainTab]);

  const filteredTargetList = useMemo(
    () =>
      ciptaanList.filter(
        (eq) =>
          eq.id !== reassignCertRowItem?.id &&
          (eq.judulCiptaan.toLowerCase().includes(searchTargetItemTerm.toLowerCase()) ||
            eq.jenisCiptaan.toLowerCase().includes(searchTargetItemTerm.toLowerCase()))
      ),
    [ciptaanList, reassignCertRowItem, searchTargetItemTerm]
  );

  // ─── Row Status Style Helper ──────────────────────────────────
  const getRowStatusStyle = (item) => {
    const statusStr = (item.status || '').toLowerCase();
    if (statusStr === 'afkir' || statusStr === 'decommissioned')
      return 'bg-[#0f172a] text-white hover:bg-slate-900 border-b border-slate-700';
    if (statusStr === 'expired')
      return 'bg-rose-50/90 text-rose-950 hover:bg-rose-100 border-b border-rose-200';
    if (['perpanjang', 'perpanjangan', 'in progress', 'proses'].includes(statusStr))
      return 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border-b border-amber-200';
    return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
  };

  // ─── Column Visibility Helpers ────────────────────────────────
  const toggleColumn = (key) => {
    setVisibleColumnKeys((prev) =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter((k) => k !== key) : prev) : [...prev, key]
    );
  };
  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map((c) => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  // ─── Bulk Exempt Handlers ─────────────────────────────────────
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
      alert('Gagal melakukan bulk action.');
    } finally {
      setIsSubmittingBulkExempt(false);
    }
  };

  const toggleSelectStaging = (id) => {
    setSelectedStagingIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllStaging = (currentRows) => {
    if (selectedStagingIds.length === currentRows.length && currentRows.length > 0) {
      setSelectedStagingIds([]);
    } else {
      setSelectedStagingIds(currentRows.map((r) => r.id || r.MasterId));
    }
  };

  // ─── Import Handlers ──────────────────────────────────────────
  const handleCsvImported = async () => {
    setActiveMainTab('staging');
    await loadData();
    setTimeout(() => loadData(), 800);
  };

  const handleSingleAdded = async (newItem) => {
    try {
      const createdItem = await createMasterItem({
        title: newItem.judulCiptaan || 'Unknown Item',
        code: newItem.noSertifikat || '-',
        categoryKey: CATEGORY_KEY,
        unitLocation: 'Umum',
        status: 'Aktif',
        keterangan: 'Data Manual Input',
        issueDate: newItem.tanggalCiptaan || undefined,
        expiryDate: newItem.expiryDate || undefined,
        documentStatus: newItem.documentStatus,
      });

      const targetItemId = createdItem?.id || createdItem?.MasterId;

      if (newItem.documentStatus === 'COMPLETED' && targetItemId) {
        let fileUrl = null;
        if (newItem.file) {
          const formData = new FormData();
          formData.append('file', newItem.file);
          try {
            const uploadRes = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
            if (uploadRes.ok) {
              const uploadJson = await uploadRes.json();
              fileUrl =
                uploadJson?.data?.url || uploadJson?.data?.fileUrl || uploadJson?.data?.path || null;
            }
          } catch (uploadErr) {
            console.error('Gagal mengunggah file:', uploadErr);
          }
        }

        await createCertificateForMasterItem({
          itemId: targetItemId,
          jenisSertifikat: newItem.jenisCiptaan || 'Sertifikat Pencatatan',
          namaSertifikat: newItem.namaSertifikat || undefined,
          noSertifikat: newItem.noSertifikat || 'BELUM_ADA_SERTIFIKAT',
          status: 'Aktif',
          terbit: newItem.tanggalCiptaan || undefined,
          expired: newItem.expiryDate || undefined,
          fileUrl,
        });
      }

      setIsSingleModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert(`Gagal menyimpan data ke database! Error: ${error?.response?.data?.message || error.message}`);
    }
  };

  // ─── Row Delete Handlers ──────────────────────────────────────
  const requestDeleteRow = (rowId) => {
    setPendingDeleteRowId(rowId);
    setRowConfirmModalOpen(true);
    setOpenActionRowId(null);
  };

  const confirmDeleteRow = async () => {
    if (!pendingDeleteRowId) return;
    try {
      await deleteMasterItem(pendingDeleteRowId);
      setCiptaanList((prev) => prev.filter((item) => item.id !== pendingDeleteRowId));
      alert('Baris berhasil dihapus dari database.');
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus baris dari database.');
    } finally {
      setRowConfirmModalOpen(false);
      setPendingDeleteRowId(null);
    }
  };

  // ─── Reassign Sertifikat Handlers ─────────────────────────────
  const openReassignTargetModal = (item) => {
    setReassignCertRowItem(item);
    setSelectedNewTargetItem(ciptaanList.find((e) => e.id !== item.id) || ciptaanList[0]);
    setSearchTargetItemTerm('');
    setOpenActionRowId(null);
  };

  const confirmReassignTargetRow = () => {
    if (!reassignCertRowItem || !selectedNewTargetItem) return;
    setCiptaanList((prev) =>
      prev.map((eq) => {
        if (eq.id === selectedNewTargetItem.id)
          return { ...eq, noSertifikat: reassignCertRowItem.noSertifikat, hasCertificatePdf: true };
        if (eq.id === reassignCertRowItem.id)
          return { ...eq, noSertifikat: '-', hasCertificatePdf: false };
        return eq;
      })
    );
    alert(
      `Sertifikat ${reassignCertRowItem.noSertifikat} berhasil dipindahkan ke ${selectedNewTargetItem.judulCiptaan}!`
    );
    setReassignCertRowItem(null);
    loadData();
  };

  return {
    // Data
    ciptaanList,
    isLoading,
    filteredData,
    pendingCount,
    uniqueJenis,
    uniqueMasa,
    filteredTargetList,

    // Tab & Filter
    activeMainTab,
    setActiveMainTab,
    searchTerm,
    setSearchTerm,
    filterJenis,
    setFilterJenis,
    filterMasa,
    setFilterMasa,
    filterHasSertifikat,
    setFilterHasSertifikat,

    // UI Popovers
    isColumnDropdownOpen,
    setIsColumnDropdownOpen,
    isImportMenuOpen,
    setIsImportMenuOpen,

    // Modals
    isCsvModalOpen,
    setIsCsvModalOpen,
    isSingleModalOpen,
    setIsSingleModalOpen,
    resolveTargetItem,
    setResolveTargetItem,
    detailModalItem,
    setDetailModalItem,
    historyTargetItem,
    setHistoryTargetItem,

    // Row Delete
    rowConfirmModalOpen,
    setRowConfirmModalOpen,
    openActionRowId,
    setOpenActionRowId,
    requestDeleteRow,
    confirmDeleteRow,

    // Bulk Exempt
    selectedStagingIds,
    bulkExemptModalOpen,
    setBulkExemptModalOpen,
    bulkExemptNote,
    setBulkExemptNote,
    isSubmittingBulkExempt,
    toggleSelectStaging,
    toggleSelectAllStaging,
    handleBulkExempt,

    // Reassign Sertifikat
    reassignCertRowItem,
    setReassignCertRowItem,
    searchTargetItemTerm,
    setSearchTargetItemTerm,
    selectedNewTargetItem,
    setSelectedNewTargetItem,
    openReassignTargetModal,
    confirmReassignTargetRow,

    // Column Visibility
    allColumns,
    visibleColumnKeys,
    toggleColumn,
    selectAllColumns,
    isVisible,

    // Handlers
    loadData,
    handleCsvImported,
    handleSingleAdded,
    getRowStatusStyle,
  };
}
