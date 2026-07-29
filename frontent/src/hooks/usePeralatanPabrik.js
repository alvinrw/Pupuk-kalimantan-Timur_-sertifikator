import { useState, useMemo, useEffect } from 'react';
import { getMasterItems, createMasterItem, resolveMasterItemExemption } from '../services/masterItemsService';

export function usePeralatanPabrik() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
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

  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('Tanpa Sertifikat (Massal)');
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  
  const [openActionRowId, setOpenActionRowId] = useState(null);
  const [rowConfirmModalOpen, setRowConfirmModalOpen] = useState(false);
  const [pendingDeleteRowId, setPendingDeleteRowId] = useState(null);

  // Data State
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ganti Target Sertifikat Modal State
  const [reassignCertRowItem, setReassignCertRowItem] = useState(null);
  const [searchTargetItemTerm, setSearchTargetItemTerm] = useState('');
  const [selectedNewTargetItem, setSelectedNewTargetItem] = useState(null);

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

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems('peralatan-pabrik');
      
      const mapped = data.map(item => {
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
          : (primaryCert?.noSertifikat || primaryCert?.noIzin || '-');

        const terbitVal = primaryCert?.terbit || item.issueDate || (item.createdAt ? item.createdAt.substring(0, 10) : '-');
        const expiredVal = primaryCert?.expired || item.expiryDate || '-';

        return {
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
          documentStatus: item.documentStatus || (certs.length > 0 ? 'COMPLETED' : 'EXEMPT'),
          exemptionNote: item.exemptionNote || null,
          noSertifikat: noCert,
          tanggalInspeksi: terbitVal,
          terbit: terbitVal,
          berakhir: expiredVal,
          keterangan: primaryCert?.keterangan || item.description || '-',
          fileUrl: primaryCert?.fileUrl || null,
          hasPdf: !!primaryCert?.fileUrl,
          certificates: certs,
        };
      });

      setEquipmentList(mapped);
    } catch (err) {
      console.error("Failed to fetch PeralatanPabrik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      setSelectedStagingIds(currentRows.map(r => r.parentItem.id || r.parentItem.MasterId));
    }
  };

  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map(c => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  const getRowStatusStyle = (item) => {
    const statusStr = (item.status || '').toLowerCase();
    const workflowStr = (item.workflowStatus || '').toLowerCase();
    
    if (statusStr === 'afkir' || statusStr === 'decommissioned' || workflowStr === 'decommissioned') {
      return 'bg-[#0f172a] text-white hover:bg-slate-900 border-b border-slate-700';
    }

    let isExpired = statusStr === 'expired';
    let isPerpanjang = statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'in_progress' || workflowStr === 'in_progress';

    if (isPerpanjang) return 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border-b border-amber-200';

    if (item.documentStatus === 'PENDING_DOC' || item.documentStatus === 'EXEMPT') {
      if (item.documentStatus === 'EXEMPT') {
        return 'bg-indigo-50/30 text-slate-800 hover:bg-indigo-50/60 border-b border-indigo-100 border-l-4 border-l-indigo-500';
      }
      return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
    }

    if (item.berakhir && item.berakhir !== '-') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(item.berakhir);
      expDate.setHours(0, 0, 0, 0);

      if (!isNaN(expDate.getTime())) {
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) isExpired = true;
      }
    } else {
      if (statusStr === 'aktif' || statusStr === '') isExpired = false;
    }

    if (isExpired) return 'bg-rose-50/90 text-rose-950 hover:bg-rose-100 border-b border-rose-200';
    return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
  };

  const uniqueJenis = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.jenisPeralatan))], [equipmentList]);
  const uniqueLokasi = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.lokasi))], [equipmentList]);
  const uniqueUser = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.user))], [equipmentList]);

  const pendingCount = useMemo(() => {
    return equipmentList.filter(i => i.documentStatus === 'PENDING_DOC').length;
  }, [equipmentList]);

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
      loadData();
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

  const openReassignTargetModal = (item) => {
    setReassignCertRowItem(item);
    setSelectedNewTargetItem(equipmentList.find(e => e.id !== item.id) || equipmentList[0]);
    setSearchTargetItemTerm('');
    setOpenActionRowId(null);
  };

  const confirmReassignTargetRow = () => {
    if (!reassignCertRowItem || !selectedNewTargetItem) return;

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

  return {
    searchTerm, setSearchTerm,
    filterJenis, setFilterJenis,
    filterLokasi, setFilterLokasi,
    filterUser, setFilterUser,
    filterStatus, setFilterStatus,
    isCsvModalOpen, setIsCsvModalOpen,
    isSingleModalOpen, setIsSingleModalOpen,
    historyTargetItem, setHistoryTargetItem,
    detailModalItem, setDetailModalItem,
    resolveTargetItem, setResolveTargetItem,
    activeMainTab, setActiveMainTab,
    selectedStagingIds, setSelectedStagingIds,
    isSubmittingBulkExempt, setIsSubmittingBulkExempt,
    bulkExemptModalOpen, setBulkExemptModalOpen,
    bulkExemptNote, setBulkExemptNote,
    isColumnDropdownOpen, setIsColumnDropdownOpen,
    isImportMenuOpen, setIsImportMenuOpen,
    openActionRowId, setOpenActionRowId,
    rowConfirmModalOpen, setRowConfirmModalOpen,
    pendingDeleteRowId, setPendingDeleteRowId,
    equipmentList, setEquipmentList,
    isLoading, setIsLoading,
    reassignCertRowItem, setReassignCertRowItem,
    searchTargetItemTerm, setSearchTargetItemTerm,
    selectedNewTargetItem, setSelectedNewTargetItem,
    allColumns, visibleColumnKeys, setVisibleColumnKeys,
    loadData, handleBulkExempt, toggleSelectStaging, toggleSelectAllStaging,
    toggleColumn, selectAllColumns, isVisible, getRowStatusStyle,
    uniqueJenis, uniqueLokasi, uniqueUser, pendingCount, filteredData, expandedRows,
    handleSingleAdded, handleZipMatched, requestDeleteRow, confirmDeleteRow,
    openReassignTargetModal, confirmReassignTargetRow, filteredTargetEquipmentList
  };
}
