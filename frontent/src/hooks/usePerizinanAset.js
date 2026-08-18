// hooks/usePerizinanAset.js
// Business logic hook untuk halaman Perizinan Aset & Bangunan Pabrik
// Diekstrak dari pages/PerizinanAset.jsx untuk memisahkan logic dari UI

import { useState, useMemo, useEffect } from 'react';
import {
  getMasterItems,
  createMasterItem,
  resolveMasterItemExemption,
  createCertificateForMasterItem,
} from '../services/masterItemsService';

const CATEGORY_KEY = 'perizinan-aset';
const UPLOAD_URL = `${import.meta.env.VITE_API_BASE_URL}/document-history/upload`;

export default function usePerizinanAset() {
  // ─── Search & Tab State ──────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('main'); // 'main' | 'staging'

  // ─── Staging & Bulk Action State ─────────────────────────────
  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('');
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);

  // ─── Modal Visibility State ──────────────────────────────────
  const [resolveTargetItem, setResolveTargetItem] = useState(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState(null);

  // ─── Column Selection State ──────────────────────────────────
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const allColumns = [
    { key: 'title', label: 'Nama Aset' },
    { key: 'namaSertifikat', label: 'Nama Sertifikat' },
    { key: 'certificateNo', label: 'Nomor Sertifikat' },
    { key: 'location', label: 'Lokasi' },
    { key: 'areaSqm', label: 'Luas (m²)' },
    { key: 'areaHa', label: 'Luas (Ha)' },
    { key: 'purpose', label: 'Peruntukan' },
    { key: 'submissionDate', label: 'Tanggal Awal Pengajuan' },
    { key: 'validityPeriod', label: 'Masa Berlaku Produk' },
    { key: 'condition', label: 'Kondisi' },
    { key: 'description', label: 'Keterangan' },
  ];
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allColumns.map((c) => c.key));

  const toggleColumn = (key) => {
    setVisibleColumnKeys((prev) =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter((k) => k !== key) : prev) : [...prev, key]
    );
  };
  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map((c) => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  // ─── Main Data State ─────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems(CATEGORY_KEY);
      const mapped = data.map((doc) => {
        const certs = doc.certificates || [];
        return {
          id: doc.id,
          MasterId: doc.id,
          title: doc.title || 'Industrial Asset',
          merekItem: doc.title,
          code: doc.code || '-',
          certificateNo: doc.certificateNo || doc.code || '-',
          unitLocation: doc.unitLocation || 'Umum',
          location: doc.unitLocation || '-',
          areaSqm: doc.areaSqm || '0',
          areaHa: doc.areaHa || '0',
          purpose: doc.title || 'Industrial Asset',
          condition: doc.status || 'Baik',
          status: doc.status || 'Baik',
          description: doc.description || '-',
          submissionDate: doc.createdAt,
          validityPeriod: doc.expiryDate || '-',
          documentStatus:
            doc.documentStatus || doc.document_status || (certs.length > 0 ? 'COMPLETED' : 'PENDING_DOC'),
          exemptionNote: doc.exemptionNote || null,
          linkedCertificates: certs,
        };
      });
      setDocuments(mapped);

      // Auto-update detailModalItem to reflect changes (e.g. deleted linked certificates)
      setDetailModalItem(prev => {
        if (!prev) return null;
        const updated = mapped.find(m => m.id === prev.id || m.MasterId === prev.MasterId);
        return updated ? updated : prev;
      });
    } catch (error) {
      console.error('Failed to load PerizinanAset', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Derived Calculations ────────────────────────────────────
  const pendingCount = useMemo(() => {
    return documents.filter((doc) => doc.documentStatus === 'PENDING_DOC').length;
  }, [documents]);

  const [sortDateOrder, setSortDateOrder] = useState('desc');

  const filteredDocs = useMemo(() => {
    let result = documents.filter((doc) => {
      return activeMainTab === 'staging'
        ? doc.documentStatus === 'PENDING_DOC'
        : doc.documentStatus !== 'PENDING_DOC';
    });

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(d => 
        (d.title || '').toLowerCase().includes(lower) || 
        (d.certificateNo || '').toLowerCase().includes(lower) ||
        (d.location || '').toLowerCase().includes(lower) ||
        (d.code || '').toLowerCase().includes(lower)
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.submissionDate || a.createdAt || 0).getTime();
      const timeB = new Date(b.submissionDate || b.createdAt || 0).getTime();
      return sortDateOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [documents, activeMainTab, searchTerm, sortDateOrder]);

  const expandedRows = useMemo(() => {
    const rows = [];
    filteredDocs.forEach((doc) => {
      const certs = doc.linkedCertificates || [];
      if (certs.length > 0) {
        const chains = [];
        certs.forEach(c => {
          const isActive = c.status?.toLowerCase() === 'aktif' || c.status?.toLowerCase() === 'active';
          if (isActive) {
            chains.push({ head: c, history: [] });
          }
        });

        certs.forEach(c => {
          const isActive = c.status?.toLowerCase() === 'aktif' || c.status?.toLowerCase() === 'active';
          if (!isActive) {
            const jenis = c.jenisSertifikat || 'Sertifikat Terhubung';
            const matchingChain = chains.find(ch => (ch.head.jenisSertifikat || 'Sertifikat Terhubung') === jenis);
            if (matchingChain) {
              matchingChain.history.push(c);
            } else {
              const existingExpiredChain = chains.find(ch => (ch.head.jenisSertifikat || 'Sertifikat Terhubung') === jenis);
              if (existingExpiredChain) {
                const existingDate = new Date(existingExpiredChain.head.terbit || '1970-01-01');
                const newDate = new Date(c.terbit || '1970-01-01');
                if (newDate > existingDate) {
                  existingExpiredChain.history.push(existingExpiredChain.head);
                  existingExpiredChain.head = c;
                } else {
                  existingExpiredChain.history.push(c);
                }
              } else {
                chains.push({ head: c, history: [] });
              }
            }
          }
        });
        const uniqueCerts = chains.map(ch => ch.head);

        uniqueCerts.forEach((cert, idx) => {
          const noCert =
            doc.documentStatus === 'EXEMPT'
              ? 'Tanpa Sertifikat'
              : cert.noSertifikat || cert.noIzin || doc.code || '-';

          rows.push({
            rowId: `${doc.id}-cert-${cert.id || idx}`,
            parentDoc: doc,
            cert,
            certificateNo: noCert,
            location: doc.location || doc.unitLocation || '-',
            areaSqm: doc.areaSqm || '0',
            areaHa: doc.areaHa || '0',
            purpose: cert.jenisSertifikat || doc.title || doc.purpose || 'Industrial Asset',
            submissionDate: cert.terbit || doc.createdAt,
            validityPeriod: cert.expired || doc.expiryDate || '-',
            condition: cert.status || doc.status || 'Baik',
            description: cert.keterangan || cert.instansi || doc.description || '-',
          });
        });
      } else {
        const noCert =
          doc.documentStatus === 'EXEMPT'
            ? 'Tanpa Sertifikat'
            : doc.certificateNo || doc.code || '-';

        rows.push({
          rowId: `${doc.id}-primary`,
          parentDoc: doc,
          cert: null,
          certificateNo: noCert,
          location: doc.location || doc.unitLocation || '-',
          areaSqm: doc.areaSqm || '0',
          areaHa: doc.areaHa || '0',
          purpose: doc.title || doc.purpose || 'Industrial Asset',
          submissionDate: doc.createdAt,
          validityPeriod: doc.expiryDate || '-',
          condition: doc.status || 'Baik',
          description: doc.description || '-',
        });
      }
    });

    if (!searchTerm.trim()) return rows;

    const s = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        (r.certificateNo || '').toLowerCase().includes(s) ||
        (r.location || '').toLowerCase().includes(s) ||
        (r.purpose || '').toLowerCase().includes(s) ||
        (r.parentDoc.title || '').toLowerCase().includes(s) ||
        (r.parentDoc.code || '').toLowerCase().includes(s)
    );
  }, [filteredDocs, searchTerm]);

  // ─── Actions & Handlers ──────────────────────────────────────
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
      setSelectedStagingIds(currentRows.map((r) => r.parentDoc.id || r.parentDoc.MasterId));
    }
  };

  const handleCsvImported = async () => {
    setActiveMainTab('staging');
    await loadData();
    setTimeout(() => loadData(), 800);
  };

  const handleZipMatched = async (extractedList) => {
    try {
      const successfulItems = extractedList.filter((item) => item.statusLabel !== 'Gagal Ekstraksi');
      for (const item of successfulItems) {
        await createMasterItem({
          title: item.matchedTitle || item.pdfName,
          code: item.matchedCode || item.nomorSeri || '-',
          categoryKey: CATEGORY_KEY,
          unitLocation: 'Umum',
          status: 'Aktif',
          keterangan: `Diimpor otomatis dari ZIP (${item.pdfName})`,
        });
      }
      loadData();
      alert(`Berhasil menyimpan ${successfulItems.length} data aset dari hasil ZIP AI!`);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data Batch ZIP!');
    }
  };

  const handleSingleAdded = async (newItem) => {
    try {
      const createdItem = await createMasterItem({
        title: newItem.title || newItem.dokumen || 'Unknown Item',
        code: newItem.code || newItem.noSertifikat || '-',
        categoryKey: CATEGORY_KEY,
        unitLocation: newItem.location || newItem.lokasi || 'Umum',
        status: newItem.condition || newItem.status || 'Aktif',
        keterangan: newItem.keterangan || newItem.description || '-',
        issueDate: newItem.terbit || undefined,
        expiryDate: newItem.expired || undefined,
        luasM2: newItem.luasM2 || undefined,
        luasHa: newItem.luasHa || undefined,
        peruntukan: newItem.peruntukan || undefined,
        documentStatus: newItem.documentStatus,
      });

      const targetItemId = createdItem?.id || createdItem?.MasterId;

      if (targetItemId) {
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
          jenisSertifikat: newItem.namaSertifikat || 'Sertifikat Aset',
          namaSertifikat: newItem.namaSertifikat || undefined,
          noSertifikat: newItem.noSertifikat || 'BELUM_ADA_SERTIFIKAT',
          status: 'Aktif',
          terbit: newItem.terbit || undefined,
          expired: newItem.expired || undefined,
          fileUrl,
        });

        if (newItem.documentStatus === 'EXEMPT') {
          await resolveMasterItemExemption(targetItemId, newItem.keterangan || 'Tidak memerlukan sertifikat');
        }
      }

      setActiveMainTab('main');
      loadData();
    } catch (error) {
      console.error(error);
      alert(`Gagal menyimpan data ke database! Error: ${error?.response?.data?.message || error.message}`);
    }
  };

  return {
    // Data state
    documents,
    setDocuments,
    isLoading,
    pendingCount,
    filteredDocs,
    expandedRows,

    // Controls state
    searchTerm,
    setSearchTerm,
    activeMainTab,
    setActiveMainTab,
    selectedStagingIds,
    setSelectedStagingIds,
    bulkExemptModalOpen,
    setBulkExemptModalOpen,
    bulkExemptNote,
    setBulkExemptNote,
    isSubmittingBulkExempt,
    resolveTargetItem,
    setResolveTargetItem,
    isCsvModalOpen,
    setIsCsvModalOpen,
    isZipModalOpen,
    setIsZipModalOpen,
    isSingleModalOpen,
    setIsSingleModalOpen,
    isImportMenuOpen,
    setIsImportMenuOpen,
    detailModalItem,
    setDetailModalItem,

    // Column visibility
    allColumns,
    visibleColumnKeys,
    isColumnDropdownOpen,
    setIsColumnDropdownOpen,
    toggleColumn,
    selectAllColumns,
    isVisible,

    // Handlers
    loadData,
    handleBulkExempt,
    toggleSelectStaging,
    toggleSelectAllStaging,
    handleCsvImported,
    handleZipMatched,
    handleSingleAdded,
    sortDateOrder,
    setSortDateOrder,
  };
}
