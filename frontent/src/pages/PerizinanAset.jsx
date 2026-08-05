import React, { useState, useMemo } from 'react';
import { Search, FileSpreadsheet, FileArchive, History, Columns, PlusCircle, ChevronDown, Eye, FileCheck, Loader2, Building2, FileWarning, ShieldAlert, UploadCloud, X } from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import ZipOcrModal from '../components/ZipOcrModal';
import HistoryModal from '../components/HistoryModal';
import SingleEntryAsetModal from '../components/SingleEntryAsetModal';
import ResolveDocumentModal from '../components/ResolveDocumentModal';
import DocumentDetailPage from './DocumentDetailPage';
import { getMasterItems, createMasterItem, resolveMasterItemExemption, createCertificateForMasterItem } from '../services/masterItemsService';

export default function PerizinanAset({ title, subtitle }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('main'); // 'main' | 'staging'
  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('');
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);
  const [resolveTargetItem, setResolveTargetItem] = useState(null);
  
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  
  const [detailModalItem, setDetailModalItem] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems('perizinan-aset');
      const mapped = data.map(doc => {
        const certs = doc.certificates || [];
        return {
          id: doc.id,
          MasterId: doc.id,
          title: doc.title || "Industrial Asset",
          merekItem: doc.title,
          code: doc.code || '-',
          certificateNo: doc.certificateNo || doc.code || '-',
          unitLocation: doc.unitLocation || 'Umum',
          location: doc.unitLocation || '-',
          areaSqm: doc.areaSqm || "0",
          areaHa: doc.areaHa || "0",
          purpose: doc.title || "Industrial Asset",
          condition: doc.status || "Baik",
          status: doc.status || "Baik",
          description: doc.description || "-",
          submissionDate: doc.createdAt,
          validityPeriod: doc.expiryDate || "-",
          documentStatus: doc.documentStatus || doc.document_status || (certs.length > 0 ? 'COMPLETED' : 'PENDING_DOC'),
          exemptionNote: doc.exemptionNote || null,
          linkedCertificates: certs
        };
      });
      setDocuments(mapped);
    } catch (error) {
      console.error("Failed to load PerizinanAset", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

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

  const toggleSelectAllStaging = (currentRows) => {
    if (selectedStagingIds.length === currentRows.length && currentRows.length > 0) {
      setSelectedStagingIds([]);
    } else {
      setSelectedStagingIds(currentRows.map(r => r.parentDoc.id || r.parentDoc.MasterId));
    }
  };

  const allColumns = [
    { key: "title", label: "Nama Aset" },
    { key: "namaSertifikat", label: "Nama Sertifikat" },
    { key: "certificateNo", label: "Nomor Sertifikat" },
    { key: "location", label: "Lokasi" },
    { key: "areaSqm", label: "Luas (mÃƒâ€šÃ‚Â²)" },
    { key: "areaHa", label: "Luas (Ha)" },
    { key: "purpose", label: "Peruntukan" },
    { key: "submissionDate", label: "Tanggal Awal Pengajuan" },
    { key: "validityPeriod", label: "Masa Berlaku Produk" },
    { key: "condition", label: "Kondisi" },
    { key: "description", label: "Keterangan" },
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

  const filteredDocs = documents.filter(doc => {
    const matchesTab = activeMainTab === 'staging'
      ? doc.documentStatus === 'PENDING_DOC'
      : doc.documentStatus !== 'PENDING_DOC';

    return matchesTab;
  });

  const expandedRows = useMemo(() => {
    const rows = [];
    filteredDocs.forEach((doc) => {
      const certs = doc.linkedCertificates || [];
      if (certs.length > 0) {
        certs.forEach((cert, idx) => {
          const noCert = doc.documentStatus === 'EXEMPT'
            ? 'Tanpa Sertifikat'
            : (cert.noSertifikat || cert.noIzin || doc.code || '-');

          rows.push({
            rowId: `${doc.id}-cert-${cert.id || idx}`,
            parentDoc: doc,
            cert: cert,
            certificateNo: noCert,
            location: doc.location || doc.unitLocation || '-',
            areaSqm: doc.areaSqm || "0",
            areaHa: doc.areaHa || "0",
            purpose: cert.jenisSertifikat || doc.title || doc.purpose || "Industrial Asset",
            submissionDate: cert.terbit || doc.createdAt,
            validityPeriod: cert.expired || doc.expiryDate || '-',
            condition: cert.status || doc.status || 'Baik',
            description: cert.keterangan || cert.instansi || doc.description || '-'
          });
        });
      } else {
        const noCert = doc.documentStatus === 'EXEMPT'
          ? 'Tanpa Sertifikat'
          : (doc.certificateNo || doc.code || '-');

        rows.push({
          rowId: `${doc.id}-primary`,
          parentDoc: doc,
          cert: null,
          certificateNo: noCert,
          location: doc.location || doc.unitLocation || '-',
          areaSqm: doc.areaSqm || "0",
          areaHa: doc.areaHa || "0",
          purpose: doc.title || doc.purpose || "Industrial Asset",
          submissionDate: doc.createdAt,
          validityPeriod: doc.expiryDate || '-',
          condition: doc.status || 'Baik',
          description: doc.description || '-'
        });
      }
    });

    if (!searchTerm.trim()) return rows;

    const s = searchTerm.toLowerCase();
    return rows.filter(r =>
      (r.certificateNo || '').toLowerCase().includes(s) ||
      (r.location || '').toLowerCase().includes(s) ||
      (r.purpose || '').toLowerCase().includes(s) ||
      (r.parentDoc.title || '').toLowerCase().includes(s) ||
      (r.parentDoc.code || '').toLowerCase().includes(s)
    );
  }, [filteredDocs, searchTerm]);

  const handleCsvImported = async () => {
    setActiveMainTab('staging');
    await loadData();
    setTimeout(() => {
      loadData();
    }, 800);
  };

  const handleZipMatched = async (extractedList) => {
    try {
      const successfulItems = extractedList.filter(item => item.statusLabel !== "Gagal Ekstraksi");
      for (const item of successfulItems) {
        await createMasterItem({
          title: item.matchedTitle || item.pdfName,
          code: item.matchedCode || item.nomorSeri || "-",
          categoryKey: 'perizinan-aset',
          unitLocation: 'Umum',
          status: 'Aktif',
          keterangan: `Diimpor otomatis dari ZIP (${item.pdfName})`,
        });
      }
      loadData();
      alert(`Berhasil menyimpan ${successfulItems.length} data aset dari hasil ZIP AI!`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan data Batch ZIP!");
    }
  };

  const handleSingleAdded = async (newItem) => {
    try {
      const createdItem = await createMasterItem({
        title: newItem.title || newItem.dokumen || 'Unknown Item',
        code: newItem.code || newItem.noSertifikat || '-',
        categoryKey: 'perizinan-aset',
        unitLocation: newItem.location || newItem.lokasi || 'Umum',
        status: newItem.condition || newItem.status || 'Aktif',
        keterangan: newItem.keterangan || newItem.description || '-',
        issueDate: newItem.terbit || undefined,
        expiryDate: newItem.expired || undefined,
        luasM2: newItem.luasM2 || undefined,
        luasHa: newItem.luasHa || undefined,
        peruntukan: newItem.peruntukan || undefined,
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
          jenisSertifikat: newItem.namaSertifikat || 'Sertifikat Aset',
          namaSertifikat: newItem.namaSertifikat || undefined,
          noSertifikat: newItem.noSertifikat || 'BELUM_ADA_SERTIFIKAT',
          status: 'Aktif',
          terbit: newItem.terbit || undefined,
          expired: newItem.expired || undefined,
          fileUrl: fileUrl,
        });
      }

      setActiveMainTab('main');
      loadData();
    } catch (error) {
      console.error(error);
      alert(`Gagal menyimpan data ke database! Error: ${error?.response?.data?.message || error.message}`);
    }
  };

  if (detailModalItem) {
    return (
      <DocumentDetailPage
        item={detailModalItem}
        onBack={() => setDetailModalItem(null)}
        onSaveUpdate={(updatedDoc) => {
          setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? { ...d, ...updatedDoc } : d));
          setDetailModalItem(prev => (prev && prev.id === updatedDoc.id ? { ...prev, ...updatedDoc } : prev));
          loadData();
        }}
        onRefreshRequired={loadData}
        onQuickRenew={(id) => {
          alert(`Inisiasi Perpanjangan untuk aset ${id}.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Menandai aset ${id} sebagai Afkir.`);
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
        <p className="font-mono-data font-bold">Memuat Tabel Perizinan Aset dari Database...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Header & Workflow Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-[#0F172A]">
            {title || "Perizinan Aset"}
          </h2>
          <p className="text-xs text-[#64748B] font-mono-data">
            {subtitle || "Manajemen sertifikat aset, lokasi, luas, dan kondisi"}
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
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isImportMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Unified Popover Menu */}
          <div className={`absolute right-0 top-11 z-40 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-1 space-y-1 text-xs font-sans-clean transition-all duration-200 origin-top-right ${isImportMenuOpen ? 'scale-100 opacity-100 visible pointer-events-auto translate-y-0' : 'scale-95 opacity-0 invisible pointer-events-none -translate-y-2'}`}>
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

              <button
                onClick={() => { setIsZipModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800"
              >
                <FileArchive className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">Bulk Upload ZIP PDF (AI)</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Ekstraksi ribuan sertifikat ZIP</span>
                </div>
              </button>
            </div>
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

      {/* Search, Filter Data Count, & Column Selector */}
      <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3 relative">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707783]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan Nomer Sertifikat atau Lokasi..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
            {filteredDocs.length} data ditemukan
          </div>

          {/* COLUMN VISIBILITY */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs"
            >
              <Columns className="w-4 h-4 text-[#005ea4]" />
              <span>Pilih Kolom Tampil ({visibleColumnKeys.length}/{allColumns.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isColumnDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            <div className={`absolute right-0 top-10 z-40 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 space-y-2 text-xs font-sans-clean transition-all duration-200 origin-top-right ${isColumnDropdownOpen ? 'scale-100 opacity-100 visible pointer-events-auto translate-y-0' : 'scale-95 opacity-0 invisible pointer-events-none -translate-y-2'}`}>
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

      {/* Table */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${activeMainTab === 'staging' && selectedStagingIds.length > 0 ? 'mt-4' : 'mt-0'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none align-middle text-center">
                {activeMainTab === 'staging' && (
                  <th className="py-3.5 px-3 w-10 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={expandedRows.length > 0 && selectedStagingIds.length === expandedRows.length}
                      onChange={() => toggleSelectAllStaging(expandedRows)}
                      className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                    />
                  </th>
                )}
                {isVisible("certificateNo") && <th className="py-3.5 px-4 font-bold text-center align-middle">Nomer Sertifikat</th>}
                {isVisible("location") && <th className="py-3.5 px-4 font-bold text-center align-middle">Lokasi</th>}
                {isVisible("areaSqm") && <th className="py-3.5 px-4 font-bold text-center align-middle">Luas (mÃƒâ€šÃ‚Â²)</th>}
                {isVisible("areaHa") && <th className="py-3.5 px-4 font-bold text-center align-middle">Luas (Ha)</th>}
                {isVisible("purpose") && <th className="py-3.5 px-4 font-bold text-center align-middle">Peruntukan</th>}
                {isVisible("submissionDate") && <th className="py-3.5 px-4 font-bold text-center align-middle">Tanggal Awal Pengajuan</th>}
                {isVisible("validityPeriod") && <th className="py-3.5 px-4 font-bold text-center align-middle">Masa Berlaku Produk</th>}
                {isVisible("condition") && <th className="py-3.5 px-4 font-bold text-center align-middle">Kondisi</th>}
                {isVisible("description") && <th className="py-3.5 px-4 font-bold text-center align-middle">Keterangan</th>}
                <th className="py-3.5 px-4 font-bold text-center align-middle">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {expandedRows.map((row, index) => {
                const doc = row.parentDoc;
                return (
                  <tr key={row.rowId} className="hover:bg-slate-50/80 transition-colors font-mono-data">
                    {activeMainTab === 'staging' && (
                      <td className="py-3.5 px-3 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={selectedStagingIds.includes(doc.id || doc.MasterId)}
                          onChange={() => toggleSelectStaging(doc.id || doc.MasterId)}
                          className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                        />
                      </td>
                    )}
                    {isVisible("title") && (
                      <td
                        onClick={() => setDetailModalItem({ ...doc, currentCert: row.cert })}
                        className="py-3.5 px-4 font-mono-data font-bold text-[#005ea4] cursor-pointer hover:underline text-center align-middle"
                      >
                        <span>{doc.merekItem || doc.title}</span>
                      </td>
                    )}
                    {isVisible("location") && (
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-center align-middle">
                        {row.location}
                      </td>
                    )}
                    {isVisible("areaSqm") && (
                      <td className="py-3.5 px-4 font-mono-data text-center text-slate-700 align-middle">
                        {row.areaSqm}
                      </td>
                    )}
                    {isVisible("areaHa") && (
                      <td className="py-3.5 px-4 font-mono-data text-center text-slate-700 align-middle">
                        {row.areaHa}
                      </td>
                    )}
                    {isVisible("purpose") && (
                      <td className="py-3.5 px-4 text-center align-middle">
                        {row.purpose}
                      </td>
                    )}
                    {isVisible("submissionDate") && (
                      <td className="py-3.5 px-4 font-mono-data text-center text-slate-700 align-middle">
                        {row.submissionDate}
                      </td>
                    )}
                    {isVisible("validityPeriod") && (
                      <td className="py-3.5 px-4 font-mono-data font-bold text-rose-700 text-center align-middle">
                        {row.validityPeriod}
                      </td>
                    )}
                    {isVisible("condition") && (
                      <td className="py-3.5 px-4 text-center align-middle">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {row.condition}
                        </span>
                      </td>
                    )}
                    {isVisible("description") && (
                      <td className="py-3.5 px-4 text-slate-700 truncate max-w-[150px] text-center align-middle" title={row.description}>
                        {row.description}
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono-data align-middle">
                      {doc.documentStatus === 'PENDING_DOC' || activeMainTab === 'staging' ? (
                        <button
                          onClick={() => setResolveTargetItem(doc)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <FileWarning className="w-3.5 h-3.5" />
                          <span>Perbaiki / Lengkapi</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setDetailModalItem({ ...doc, currentCert: row.cert })}
                          className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Detail</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {expandedRows.length === 0 && (
                <tr>
                  <td colSpan={visibleColumnKeys.length + (activeMainTab === 'staging' ? 2 : 1)} className="py-8 text-center text-slate-500 font-mono-data">
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SingleEntryAsetModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onAddSuccess={handleSingleAdded}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleCsvImported}
        categoryKey="perizinan-aset"
        moduleName="Perizinan Aset & Bangunan Pabrik"
      />

      <ZipOcrModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        onMatchSuccess={handleZipMatched}
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
