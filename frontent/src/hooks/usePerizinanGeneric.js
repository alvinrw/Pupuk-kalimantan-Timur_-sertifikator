import { useState, useMemo, useEffect } from 'react';
import { getMasterItems, createMasterItem, resolveMasterItemExemption, createCertificateForMasterItem } from '../services/masterItemsService';

/**
 * usePerizinanGeneric — Custom hook untuk semua state & business logic PerizinanGeneric.
 */
export function usePerizinanGeneric({ categoryName, title }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('main');
  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('');
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);
  const [resolveTargetItem, setResolveTargetItem] = useState(null);

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

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAsetCategory = useMemo(() => categoryName?.toLowerCase().includes('aset'), [categoryName]);

  const currentCategoryKey = useMemo(() => {
    const catLower = (categoryName || title || '').toLowerCase();
    if (catLower.includes('aset')) return 'perizinan-aset';
    if (catLower.includes('proyek')) return 'perizinan-proyek';
    if (catLower.includes('produk')) return 'perizinan-produk';
    if (catLower.includes('ciptaan')) return 'sertifikat-ciptaan';
    return '';
  }, [categoryName, title]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems(currentCategoryKey);
      const mapped = data.map(doc => {
        const certs = doc.certificates || [];
        return {
          id: doc.id,
          MasterId: doc.id,
          title: doc.title || '-',
          categoryKey: doc.categoryKey,
          kategoriDokumen: doc.categoryKey,
          jenisItem: doc.title || '-',
          namaItem: doc.title || '-',
          merekItem: doc.title,
          code: doc.code || '-',
          certificateNo: doc.certificateNo || doc.code || '-',
          unitLocation: doc.unitLocation || '-',
          unit: doc.unitLocation || '-',
          luasM2: doc.areaSqm || "0",
          luasHa: doc.areaHa || "0",
          peruntukan: doc.peruntukan || "-",
          issueDate: doc.createdAt,
          expiryDate: doc.expiryDate || "-",
          kondisi: doc.status || "Baik",
          description: doc.description || "-",
          keterangan: doc.description || "-",
          status: doc.status || "Aktif",
          user: "Umum",
          documentStatus: doc.documentStatus || (certs.length > 0 ? 'COMPLETED' : 'EXEMPT'),
          exemptionNote: doc.exemptionNote || null,
          linkedCertificates: certs
        };
      });
      setDocuments(mapped);
    } catch (error) {
      console.error("Failed to load generic permissions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [categoryName]);

  // Columns Configuration
  const defaultColumns = [
    { key: "no", label: "No." },
    { key: "namaItem", label: "Nama Produk / Proyek" },
    { key: "code", label: "Kode / Tag Perizinan" },
    { key: "jenisItem", label: "Jenis Perizinan" },
    { key: "certificateNo", label: "No. Sertifikat" },
    { key: "unit", label: "Unit Pabrik / Lokasi" },
    { key: "user", label: "User / Instansi" },
    { key: "issueDate", label: "Terbit" },
    { key: "expiryDate", label: "Expired" },
    { key: "status", label: "Status" }
  ];

  const asetColumns = [
    { key: "no", label: "NO." },
    { key: "namaItem", label: "NAMA ASET" },
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

  const pendingCount = useMemo(() => documents.filter(doc => doc.documentStatus === 'PENDING_DOC').length, [documents]);

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
    setSelectedStagingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAllStaging = (currentRows) => {
    if (selectedStagingIds.length === currentRows.length && currentRows.length > 0) {
      setSelectedStagingIds([]);
    } else {
      setSelectedStagingIds(currentRows.map(r => r.parentDoc.id || r.parentDoc.MasterId));
    }
  };

  const uniqueJenis = useMemo(() => ['All', ...new Set(documents.map(i => i.jenisItem || i.jenisPeralatan || i.jenisCiptaan || 'General'))], [documents]);
  const uniqueLokasi = useMemo(() => ['All', ...new Set(documents.map(i => i.unitPabrik || i.unit || i.lokasi || 'Kantor Pusat'))], [documents]);
  const uniqueStatus = useMemo(() => ['All', ...new Set(documents.map(i => i.status || 'Aktif'))], [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesTab = activeMainTab === 'staging'
        ? doc.documentStatus === 'PENDING_DOC'
        : doc.documentStatus !== 'PENDING_DOC';

      const titleStr = doc.title || doc.merekItem || doc.judulCiptaan || doc.namaItem || '';
      const codeStr = doc.code || doc.id || doc.noSertifikat || '';
      const unitStr = doc.unit || doc.unitPabrik || doc.lokasi || '';
      const certStr = doc.certificateNo || doc.noSertifikat || '';
      const jenisStr = doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || '';
      const statusStr = doc.status || 'Aktif';

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        titleStr.toLowerCase().includes(searchLower) ||
        codeStr.toLowerCase().includes(searchLower) ||
        unitStr.toLowerCase().includes(searchLower) ||
        certStr.toLowerCase().includes(searchLower) ||
        jenisStr.toLowerCase().includes(searchLower);

      const matchesJenis = filterJenis === 'All' || jenisStr === filterJenis;
      const matchesLokasi = filterLokasi === 'All' || unitStr === filterLokasi;
      const matchesStatus = filterStatus === 'All' || statusStr === filterStatus;

      return matchesTab && matchesSearch && matchesJenis && matchesLokasi && matchesStatus;
    });
  }, [documents, searchTerm, filterJenis, filterLokasi, filterStatus, activeMainTab]);

  const expandedRows = useMemo(() => {
    const rows = [];
    filteredDocs.forEach((doc) => {
      const certs = doc.linkedCertificates || [];
      if (certs.length > 0) {
        const certGroups = {};
        certs.forEach(cert => {
          const jenis = cert.jenisSertifikat || doc.title || categoryName || 'Generic';
          if (!certGroups[jenis]) certGroups[jenis] = [];
          certGroups[jenis].push(cert);
        });
        Object.values(certGroups).forEach((group, idx) => {
          const sortedGroup = [...group].sort((a, b) => {
            if (a.status === 'Aktif' && b.status !== 'Aktif') return -1;
            if (b.status === 'Aktif' && a.status !== 'Aktif') return 1;
            const dateA = new Date(a.createdAt || a.terbit || 0);
            const dateB = new Date(b.createdAt || b.terbit || 0);
            return dateB - dateA;
          });
          const cert = sortedGroup[0];
          const noCert = doc.documentStatus === 'EXEMPT' ? 'Tanpa Sertifikat' : (cert.noSertifikat || cert.noIzin || doc.code || '-');
          rows.push({
            rowId: `${doc.id}-cert-${cert.id || idx}`,
            parentDoc: doc, cert,
            certNo: noCert,
            jenisCert: cert.jenisSertifikat || doc.title || categoryName || 'Generic',
            issuer: cert.instansi || cert.keterangan || doc.user || 'Umum',
            issueDate: cert.terbit || doc.createdAt,
            expiryDate: cert.expired || doc.expiryDate || '-',
            status: cert.status || doc.status || 'Aktif',
            hasPdf: !!cert.fileUrl, fileUrl: cert.fileUrl || null
          });
        });
      } else {
        const noCert = doc.documentStatus === 'EXEMPT' ? 'Tanpa Sertifikat' : (doc.certificateNo || doc.code || '-');
        rows.push({
          rowId: `${doc.id}-primary`,
          parentDoc: doc, cert: null,
          certNo: noCert,
          jenisCert: doc.title || categoryName || 'Generic',
          issuer: doc.user || doc.description || 'Umum',
          issueDate: doc.createdAt,
          expiryDate: doc.expiryDate || '-',
          status: doc.status || 'Aktif',
          hasPdf: !!doc.fileUrl, fileUrl: doc.fileUrl || null
        });
      }
    });
    return rows;
  }, [filteredDocs, categoryName]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterJenis('All');
    setFilterLokasi('All');
    setFilterStatus('All');
    selectAllColumns();
  };

  const handleCsvImported = () => { loadData(); };
  const handleSingleAdded = async (newItem) => {
    try {
      const createdItem = await createMasterItem({
        title: newItem.title || newItem.merekItem || 'Unknown Item',
        code: newItem.code || newItem.certificateNo || '-',
        categoryKey: currentCategoryKey,
        unitLocation: newItem.unit || newItem.unitPabrik || 'Umum',
        status: newItem.status || 'Aktif',
        keterangan: newItem.keterangan || 'Data Manual Input',
        issueDate: newItem.issueDate || undefined,
        expiryDate: newItem.expiryDate || newItem.berakhir || undefined,
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
          jenisSertifikat: newItem.jenisPeralatan || categoryName || 'Sertifikat Perizinan',
          noSertifikat: newItem.certificateNo || 'BELUM_ADA_SERTIFIKAT',
          status: 'Aktif',
          terbit: newItem.issueDate || undefined,
          expired: newItem.expiryDate || newItem.berakhir || undefined,
          fileUrl: fileUrl,
        });
      }

      loadData();
    } catch (error) {
      console.error(error);
      alert(`Gagal menyimpan data ke database! Error: ${error?.response?.data?.message || error.message}`);
    }
  };

  const getRowStatusStyle = (doc) => {
    const statusStr = (doc.status || '').toLowerCase();
    if (statusStr === 'afkir' || statusStr === 'decommissioned') return 'bg-[#0f172a] text-white hover:bg-slate-900 border-b border-slate-700';
    if (statusStr === 'expired') return 'bg-rose-50/90 text-rose-950 hover:bg-rose-100 border-b border-rose-200';
    if (statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'proses') return 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border-b border-amber-200';
    return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
  };

  return {
    // Data
    documents, setDocuments,
    filteredDocs, expandedRows,
    isLoading, loadData,
    isAsetCategory, currentCategoryKey,
    // UI State
    searchTerm, setSearchTerm,
    activeMainTab, setActiveMainTab,
    pendingCount,
    // Filters
    filterJenis, setFilterJenis,
    filterLokasi, setFilterLokasi,
    filterStatus, setFilterStatus,
    uniqueJenis, uniqueLokasi, uniqueStatus,
    // Modals
    isCsvModalOpen, setIsCsvModalOpen,
    isSingleModalOpen, setIsSingleModalOpen,
    historyTargetItem, setHistoryTargetItem,
    detailModalItem, setDetailModalItem,
    resolveTargetItem, setResolveTargetItem,
    isColumnDropdownOpen, setIsColumnDropdownOpen,
    isImportMenuOpen, setIsImportMenuOpen,
    // Column visibility
    allColumns, visibleColumnKeys, toggleColumn, selectAllColumns, isVisible,
    // Bulk exempt
    selectedStagingIds, setSelectedStagingIds,
    isSubmittingBulkExempt,
    bulkExemptModalOpen, setBulkExemptModalOpen,
    bulkExemptNote, setBulkExemptNote,
    handleBulkExempt,
    toggleSelectStaging, toggleSelectAllStaging,
    // Handlers
    handleCsvImported, handleSingleAdded, resetFilters,
    // Style
    getRowStatusStyle,
  };
}
