import { useState, useMemo, useEffect } from 'react';
import { getMasterItems, resolveMasterItemExemption } from '../services/masterItemsService';

export function usePerizinanGeneric({ title, subtitle, categoryName }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('main'); // 'main' | 'staging'
  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('');
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);
  const [resolveTargetItem, setResolveTargetItem] = useState(null);
  
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterLokasi, setFilterLokasi] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterHasSertifikat, setFilterHasSertifikat] = useState('All'); // 'All' | 'ada' | 'tidak'

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAsetCategory = useMemo(() => {
    return categoryName?.toLowerCase().includes('aset');
  }, [categoryName]);

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

        let meta = {};
        try {
          if (doc.keterangan && doc.keterangan.startsWith('{')) {
            meta = JSON.parse(doc.keterangan);
          } else {
            meta = { keteranganAsli: doc.keterangan };
          }
        } catch (e) {
          meta = { keteranganAsli: doc.keterangan };
        }

        const actualJenisAset = meta.tipe || doc.jenisPeralatan || meta.jenisAset || doc.categoryKey || (categoryName?.toLowerCase().includes('aset') ? 'Perizinan Aset' : categoryName?.toLowerCase().includes('proyek') ? 'Perizinan Proyek' : 'Perizinan Produk');

        return {
          id: doc.id,
          MasterId: doc.id,
          title: doc.title || '-',
          categoryKey: doc.categoryKey,
          kategoriDokumen: doc.categoryKey,
          jenisItem: actualJenisAset,
          jenisPeralatan: actualJenisAset,
          namaItem: doc.title || '-',
          merekItem: doc.title,
          code: doc.code || '-',
          certificateNo: primaryCert?.noSertifikat || meta.noSertifikat || '-',
          unitLocation: doc.unitLocation || '-',
          unit: doc.unitLocation || '-',
          luasM2: doc.luasM2 || "0",
          luasHa: doc.luasHa || "0",
          peruntukan: doc.peruntukan || "-",
          issueDate: primaryCert?.terbit || doc.issueDate || (doc.createdAt ? doc.createdAt.substring(0, 10) : '-'),
          expiryDate: primaryCert?.expired || doc.expiryDate || "-",
          kondisi: doc.status || "Baik",
          description: primaryCert?.keterangan || meta.keteranganAsli || doc.keterangan || "-",
          keterangan: primaryCert?.keterangan || meta.keteranganAsli || doc.keterangan || "-",
          namaSertifikat: primaryCert?.namaSertifikat || meta.namaSertifikat || '-',
          status: doc.status || "Aktif",
          user: primaryCert?.instansi || meta.penanggungJawab || "Umum",
          documentStatus: doc.documentStatus || doc.document_status || (certs.length > 0 ? 'COMPLETED' : 'PENDING_DOC'),
          exemptionNote: doc.exemptionNote || null,
          linkedCertificates: certs,
          notificationSetting: doc.notificationSetting || null,
          reminderEnabled: doc.notificationSetting ? doc.notificationSetting.isEnabled : true
        };
      });
      setDocuments(mapped);
    } catch (error) {
      console.error("Failed to load generic permissions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryName]);

  const isProyek = categoryName?.toLowerCase().includes('proyek');
  const isProduk = categoryName?.toLowerCase().includes('produk') || categoryName?.toLowerCase().includes('ciptaan');

  const defaultColumns = [
    { key: "no", label: "NO." },
    { key: "namaItem", label: isProyek ? "NAMA PROYEK" : isProduk ? "NAMA PRODUK" : "NAMA ITEM" },
    { key: "jenisItem", label: isProyek ? "KATEGORI PROYEK" : isProduk ? "JENIS PRODUK" : "JENIS ITEM" },
    { key: "code", label: isProyek ? "KODE PROYEK" : isProduk ? "KODE PRODUK" : "KODE REGISTRASI" },
    { key: "hasSertifikat", label: "ADA SERTIFIKAT" },
    { key: "namaSertifikat", label: "NAMA SERTIFIKAT" },
    { key: "certificateNo", label: "NOMOR SERTIFIKAT" },
    { key: "unit", label: isProyek ? "LOKASI PROYEK" : isProduk ? "UNIT PENGELOLA" : "LOKASI" },
    { key: "user", label: "PENANGGUNG JAWAB" },
    { key: "status", label: "STATUS" }
  ];

  const asetColumns = [
    { key: "no", label: "NO." },
    { key: "namaItem", label: "NAMA ASET" },
    { key: "code", label: "NOMOR SERI ASSET" },
    { key: "jenisItem", label: "JENIS ASET" },
    { key: "namaSertifikat", label: "NAMA SERTIFIKAT" },
    { key: "certificateNo", label: "NOMOR SERTIFIKAT" },
    { key: "hasSertifikat", label: "ADA SERTIFIKAT" },
    { key: "unit", label: "LOKASI" },
    { key: "user", label: "PENANGGUNG JAWAB" },
    { key: "status", label: "STATUS" }
  ];

  const allColumns = isAsetCategory ? asetColumns : defaultColumns;

  const pendingCount = useMemo(() => {
    return documents.filter(doc => doc.documentStatus === 'PENDING_DOC').length;
  }, [documents]);

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

  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allColumns.map(c => c.key));

  useEffect(() => {
    setVisibleColumnKeys(allColumns.map(c => c.key));
  }, [isAsetCategory, categoryName, title]);

  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map(c => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  const categoryFilteredDocs = useMemo(() => {
    return documents;
  }, [documents, categoryName]);

  const uniqueJenis = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.jenisItem || i.jenisPeralatan || i.jenisCiptaan || 'General'))], [categoryFilteredDocs]);
  const uniqueLokasi = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.unitPabrik || i.unit || i.lokasi || 'Kantor Pusat'))], [categoryFilteredDocs]);
  const uniqueStatus = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.status || 'Aktif'))], [categoryFilteredDocs]);

  const filteredDocs = useMemo(() => {
    return categoryFilteredDocs.filter(doc => {
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
      const matchesHasSertifikat = filterHasSertifikat === 'All'
        ? true
        : filterHasSertifikat === 'ada'
        ? doc.documentStatus !== 'EXEMPT'
        : doc.documentStatus === 'EXEMPT';

      return matchesTab && matchesSearch && matchesJenis && matchesLokasi && matchesStatus && matchesHasSertifikat;
    });
  }, [categoryFilteredDocs, searchTerm, filterJenis, filterLokasi, filterStatus, filterHasSertifikat, activeMainTab]);

  const expandedRows = useMemo(() => {
    const rows = [];
    filteredDocs.forEach((doc) => {
      const certs = doc.linkedCertificates || [];
      const assetCategory = doc.jenisPeralatan || doc.categoryKey || categoryName || 'Perizinan Aset';

      if (certs.length > 0) {
        certs.forEach((cert, idx) => {
          const noCert = doc.documentStatus === 'EXEMPT'
            ? 'Tanpa Sertifikat'
            : (cert.noSertifikat || cert.noIzin || '-');

          rows.push({
            rowId: `${doc.id}-cert-${cert.id || idx}`,
            parentDoc: doc,
            cert: cert,
            certNo: noCert,
            jenisCert: assetCategory,
            issuer: cert.instansi || cert.keterangan || doc.user || 'Umum',
            issueDate: cert.terbit || doc.createdAt || '-',
            expiryDate: cert.expired || doc.expiryDate || '-',
            status: cert.status || doc.status || 'Aktif',
            hasPdf: !!cert.fileUrl,
            fileUrl: cert.fileUrl || null,
            namaSertifikat: cert.namaSertifikat || cert.jenisSertifikat || '-'
          });
        });
      } else {
        const noCert = doc.documentStatus === 'EXEMPT'
          ? 'Tanpa Sertifikat'
          : (doc.certificateNo || '-');

        rows.push({
          rowId: `${doc.id}-primary`,
          parentDoc: doc,
          cert: null,
          certNo: noCert,
          jenisCert: assetCategory,
          issuer: doc.user || doc.description || 'Umum',
          issueDate: doc.createdAt || '-',
          expiryDate: doc.expiryDate || '-',
          status: doc.status || 'Aktif',
          hasPdf: !!doc.fileUrl,
          fileUrl: doc.fileUrl || null,
          namaSertifikat: '-'
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

  const handleCsvImported = async () => {
    setActiveMainTab('staging');
    await loadData();
    setTimeout(() => {
      loadData();
    }, 800);
  };

  const handleSingleAdded = async () => {
    setIsSingleModalOpen(false);
    await loadData();
  };

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

  return {
    searchTerm, setSearchTerm,
    activeMainTab, setActiveMainTab,
    selectedStagingIds, setSelectedStagingIds,
    bulkExemptModalOpen, setBulkExemptModalOpen,
    bulkExemptNote, setBulkExemptNote,
    isSubmittingBulkExempt, setIsSubmittingBulkExempt,
    resolveTargetItem, setResolveTargetItem,
    filterJenis, setFilterJenis,
    filterLokasi, setFilterLokasi,
    filterStatus, setFilterStatus,
    filterHasSertifikat, setFilterHasSertifikat,
    isCsvModalOpen, setIsCsvModalOpen,
    isSingleModalOpen, setIsSingleModalOpen,
    historyTargetItem, setHistoryTargetItem,
    detailModalItem, setDetailModalItem,
    isColumnDropdownOpen, setIsColumnDropdownOpen,
    isImportMenuOpen, setIsImportMenuOpen,
    documents, setDocuments,
    isLoading, setIsLoading,
    isAsetCategory, currentCategoryKey,
    loadData, allColumns, pendingCount,
    handleBulkExempt, toggleSelectStaging,
    visibleColumnKeys, toggleColumn, selectAllColumns, isVisible,
    uniqueJenis, uniqueLokasi, uniqueStatus, expandedRows,
    resetFilters, handleCsvImported, handleSingleAdded,
    getRowStatusStyle
  };
}
