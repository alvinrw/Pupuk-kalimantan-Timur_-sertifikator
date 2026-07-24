import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Save,
  Clock,
  ShieldAlert,
  Calendar,
  Layers,
  Edit3,
  Activity,
  CheckCircle2,
  Filter,
  RotateCcw,
  Check,
  Ban,
  UploadCloud,
  FileCheck,
  FileText,
  Sparkles,
  Loader2,
  History,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';
import { masterCertificatesData } from '../data/masterDataset';

export default function MonitoringSertifikasi() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryTab, setExpiryTab] = useState('all'); // 'all' | 'expired' | 'urgent' | 'valid' | 'in_progress' | 'decommissioned'
  const [selectedDetailDoc, setSelectedDetailDoc] = useState(null);

  // Global & Multi-Parameter Dropdown Filter States
  const [filterKategori, setFilterKategori] = useState('All');
  const [filterUnitPabrik, setFilterUnitPabrik] = useState('All');
  const [filterStatusOperasional, setFilterStatusOperasional] = useState('All');
  const [filterRentangHari, setFilterRentangHari] = useState('All');
  const [customUrgentDays, setCustomUrgentDays] = useState(30);

  // Pop-up Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Workflow Modal State
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [resertifikasiModalOpen, setResertifikasiModalOpen] = useState(false);
  const [afkirModalOpen, setAfkirModalOpen] = useState(false);
  const [resertifikasiNotes, setResertifikasiNotes] = useState('');

  // Upload Form & OCR Simulation States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  
  // Master List of all Documents connected from masterDataset
  const [allCertificates, setAllCertificates] = useState(masterCertificatesData);
  
  // OCR Extracted & Editable Fields
  const [newCertNumber, setNewCertNumber] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  // Dynamic Options for Dropdowns
  const uniqueKategori = useMemo(() => ['All', ...new Set(allCertificates.map(i => i.kategoriDokumen || i.categoryKey || ''))], [allCertificates]);
  const uniqueUnitPabrik = useMemo(() => ['All', ...new Set(allCertificates.map(i => i.unitPabrik || i.unit || i.lokasi || ''))], [allCertificates]);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterKategori !== 'All') count++;
    if (filterUnitPabrik !== 'All') count++;
    if (filterStatusOperasional !== 'All') count++;
    if (filterRentangHari !== 'All') count++;
    if (searchTerm !== '') count++;
    return count;
  }, [filterKategori, filterUnitPabrik, filterStatusOperasional, filterRentangHari, searchTerm]);

  // Filtering Logic
  const filteredCertificates = useMemo(() => {
    return allCertificates.filter((item) => {
      const merekStr = (item.merekItem || item.title || item.judulCiptaan || '');
      const jenisStr = (item.jenisItem || item.jenisPeralatan || item.jenisCiptaan || '');
      const seriStr = (item.nomorSeriTipe || item.nomorSeri || item.code || '');
      const katStr = (item.kategoriDokumen || item.categoryKey || '');
      const certStr = (item.certificateNo || item.noSertifikat || '');
      const unitStr = (item.unitPabrik || item.unit || item.lokasi || '');

      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        merekStr.toLowerCase().includes(searchLower) ||
        jenisStr.toLowerCase().includes(searchLower) ||
        seriStr.toLowerCase().includes(searchLower) ||
        katStr.toLowerCase().includes(searchLower) ||
        certStr.toLowerCase().includes(searchLower) ||
        unitStr.toLowerCase().includes(searchLower);

      const matchesKategori = filterKategori === 'All' || katStr === filterKategori;
      const matchesUnitPabrik = filterUnitPabrik === 'All' || unitStr === filterUnitPabrik;
      const matchesStatusFisik = filterStatusOperasional === 'All' || item.statusOperasional === filterStatusOperasional || item.status === filterStatusOperasional;

      let matchesRentangHari = true;
      if (filterRentangHari === 'expired') {
        matchesRentangHari = item.sisaHari <= 0;
      } else if (filterRentangHari === 'urgent') {
        matchesRentangHari = item.sisaHari > 0 && item.sisaHari <= (parseInt(customUrgentDays) || 30);
      } else if (filterRentangHari === '60') {
        matchesRentangHari = item.sisaHari > 0 && item.sisaHari <= 60;
      } else if (filterRentangHari === '90') {
        matchesRentangHari = item.sisaHari > 0 && item.sisaHari <= 90;
      } else if (filterRentangHari === '180') {
        matchesRentangHari = item.sisaHari > 0 && item.sisaHari <= 180;
      } else if (filterRentangHari === '365') {
        matchesRentangHari = item.sisaHari > 0 && item.sisaHari <= 365;
      }

      let matchesTab = true;
      if (expiryTab === 'expired') {
        matchesTab = item.sisaHari <= 0 && item.workflowStatus !== 'decommissioned';
      } else if (expiryTab === 'urgent') {
        matchesTab = item.sisaHari > 0 && item.sisaHari <= (parseInt(customUrgentDays) || 30) && item.workflowStatus !== 'decommissioned';
      } else if (expiryTab === 'valid') {
        matchesTab = item.sisaHari > (parseInt(customUrgentDays) || 30) && item.workflowStatus !== 'decommissioned';
      } else if (expiryTab === 'in_progress') {
        matchesTab = item.workflowStatus === 'in_progress';
      } else if (expiryTab === 'decommissioned') {
        matchesTab = item.workflowStatus === 'decommissioned';
      }

      return matchesSearch && matchesKategori && matchesUnitPabrik && matchesStatusFisik && matchesRentangHari && matchesTab;
    });
  }, [allCertificates, searchTerm, filterKategori, filterUnitPabrik, filterStatusOperasional, filterRentangHari, customUrgentDays, expiryTab]);

  // Quick Action: Perpanjang
  const handleQuickRenew = (id) => {
    setAllCertificates(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            workflowStatus: "in_progress",
            currentStage: "Proses Perpanjangan"
          };
        }
        return item;
      })
    );
  };

  // Quick Action: Afkir
  const handleQuickDecommission = (id) => {
    setAllCertificates(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            workflowStatus: "decommissioned",
            currentStage: "Aset Afkir"
          };
        }
        return item;
      })
    );
  };

  // Quick Action: Batal Status / Reset ke Normal
  const handleCancelAction = (id) => {
    setAllCertificates(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            workflowStatus: "not_started",
            currentStage: "-"
          };
        }
        return item;
      })
    );
  };

  // Open Complete & Upload Certificate Modal
  const openCompleteModal = (item) => {
    setActiveModalItem(item);
    setModalMode('complete_upload');
    setUploadedFile(null);
    setIsOcrScanning(false);
    setOcrSuccess(false);

    setNewCertNumber(item.certificateNo);
    setInspectionDate(item.inspectionDate || "2026-04-10");
    setIssueDate(item.issueDate || "2026-04-15");
    setNewExpiryDate("2028-04-15");
    setResertifikasiNotes("Perpanjangan selesai. File sertifikat baru telah diunggah dan terverifikasi oleh OCR.");
  };

  // Simulated OCR Scan Event Handler
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsOcrScanning(true);
    setOcrSuccess(false);

    setTimeout(() => {
      const randomCertNum = "500.15.18.2 / " + Math.floor(2000 + Math.random() * 8000) + " / DTKT-2026";
      const todayStr = new Date().toISOString().split('T')[0];
      
      setNewCertNumber(randomCertNum);
      setInspectionDate("2026-04-10");
      setIssueDate(todayStr);
      setNewExpiryDate("2028-04-15");
      
      setIsOcrScanning(false);
      setOcrSuccess(true);
    }, 1200);
  };

  // Confirm Complete Renewal with Uploaded File & OCR Data
  const handleConfirmUploadRenewal = (e) => {
    e.preventDefault();
    if (!activeModalItem) return;

    if (!uploadedFile) {
      alert("Harap pilih/upload file sertifikat baru terlebih dahulu!");
      return;
    }

    const newLog = {
      tahun: new Date().getFullYear().toString(),
      jenisTindakan: "Perpanjangan & Resertifikasi Baru",
      noSertifikat: newCertNumber || activeModalItem.certificateNo,
      tglInspeksi: inspectionDate,
      tglTerbit: issueDate,
      tglExpired: newExpiryDate,
      pelaksana: activeModalItem.agency,
      status: "Berhasil / Active",
      catatan: resertifikasiNotes,
      fileUploaded: uploadedFile.name
    };

    setAllCertificates(prev =>
      prev.map(item => {
        if (item.id === activeModalItem.id) {
          const updatedLogs = [newLog, ...(item.historyLogs || [])];
          return {
            ...item,
            workflowStatus: "completed",
            certificateNo: newCertNumber || item.certificateNo,
            inspectionDate: inspectionDate || item.inspectionDate,
            issueDate: issueDate || item.issueDate,
            expiryDate: newExpiryDate || item.expiryDate,
            sisaHari: 730,
            currentStage: "Sertifikat Terbit",
            notes: resertifikasiNotes,
            historyLogs: updatedLogs
          };
        }
        return item;
      })
    );

    setActiveModalItem(null);
  };

  const resetFilters = () => {
    setFilterKategori('All');
    setFilterUnitPabrik('All');
    setFilterStatusOperasional('All');
    setFilterRentangHari('All');
    setSearchTerm('');
    setExpiryTab('all');
  };

  // 5 Core Summary Cards Counts
  const countExpired = allCertificates.filter(c => c.sisaHari <= 0 && c.workflowStatus !== 'decommissioned').length;
  const countUrgent = allCertificates.filter(c => c.sisaHari > 0 && c.sisaHari <= (parseInt(customUrgentDays) || 30) && c.workflowStatus !== 'decommissioned').length;
  const countValid = allCertificates.filter(c => c.sisaHari > (parseInt(customUrgentDays) || 30) && c.workflowStatus !== 'decommissioned').length;
  const countInProgress = allCertificates.filter(c => c.workflowStatus === 'in_progress').length;
  const countDecommissioned = allCertificates.filter(c => c.workflowStatus === 'decommissioned').length;

  if (selectedDetailDoc) {
    return (
      <DocumentDetailPage
        item={selectedDetailDoc}
        onBack={() => setSelectedDetailDoc(null)}
        onSaveUpdate={(updatedDoc) => {
          setCertificateList(prev => prev.map(d => d.id === updatedDoc.id ? { ...d, ...updatedDoc } : d));
        }}
        onQuickRenew={(id) => {
          handleExtendAction(id);
        }}
        onQuickDecommission={(id) => {
          handleDecommissionAction(id);
        }}
      />
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans-clean max-w-7xl mx-auto">
      {/* Header Title & Top Filter Button */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl text-slate-900 flex items-center gap-2 tracking-tight">
            <Activity className="w-6 h-6 text-[#005ea4]" />
            Monitoring & Evaluasi Perpanjangan Sertifikat
          </h2>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            Rekapitulasi tenggat expired, status perpanjangan, dan pemantauan sertifikat perizinan
          </p>
        </div>

        {/* POP-UP FILTER BUTTON */}
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <span className="text-xs text-slate-500 font-mono-data font-bold hidden sm:inline">
              Showing {filteredCertificates.length} of {allCertificates.length} items
            </span>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors font-mono-data cursor-pointer"
          >
            <Filter className="w-4 h-4 text-white" />
            <span>Filter Kategori & Data</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-amber-400 text-slate-900 rounded-full text-[10px] flex items-center justify-center font-extrabold ml-1 shadow-2xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* 5 SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Inventaris Expired */}
        <div
          onClick={() => setExpiryTab(expiryTab === 'expired' ? 'all' : 'expired')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
            expiryTab === 'expired' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Inventaris Expired</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-rose-600">{countExpired}</span>
            <span className="text-[10px] text-slate-500 block font-mono-data mt-0.5">Expired (Kadaluarsa)</span>
          </div>
        </div>

        {/* Card 2: Urgent Expiring */}
        <div
          onClick={() => setExpiryTab(expiryTab === 'urgent' ? 'all' : 'urgent')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
            expiryTab === 'urgent' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Urgent &lt;</span>
              <input
                type="number"
                value={customUrgentDays}
                onChange={(e) => {
                  e.stopPropagation();
                  setCustomUrgentDays(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-10 px-1 py-0.5 text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-[#005ea4]"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Hr</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-slate-700" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-600">{countUrgent}</span>
            <span className="text-[10px] text-slate-500 block font-mono-data mt-0.5">Tenggat Dekat</span>
          </div>
        </div>

        {/* Card 3: Sertifikat Valid */}
        <div
          onClick={() => setExpiryTab(expiryTab === 'valid' ? 'all' : 'valid')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
            expiryTab === 'valid' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Sertifikat Valid</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-600">{countValid}</span>
            <span className="text-[10px] text-slate-500 block font-mono-data mt-0.5">Masa Berlaku Aman</span>
          </div>
        </div>

        {/* Card 4: Proses Perpanjangan */}
        <div
          onClick={() => setExpiryTab(expiryTab === 'in_progress' ? 'all' : 'in_progress')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
            expiryTab === 'in_progress' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Proses Perpanjangan</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-600">{countInProgress}</span>
            <span className="text-[10px] text-slate-500 block font-mono-data mt-0.5">Sedang Diperpanjang</span>
          </div>
        </div>

        {/* Card 5: Aset Afkir / Non-Aktif */}
        <div
          onClick={() => setExpiryTab(expiryTab === 'decommissioned' ? 'all' : 'decommissioned')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-[#0f172a] text-white shadow-xs ${
            expiryTab === 'decommissioned' ? 'border-black ring-2 ring-slate-400' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Aset Afkir / Non-Aktif</span>
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white border border-slate-700 flex items-center justify-center">
              <Ban className="w-3.5 h-3.5 text-slate-200" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">{countDecommissioned}</span>
            <span className="text-[10px] text-slate-400 block font-mono-data mt-0.5">Tidak Diperpanjang</span>
          </div>
        </div>
      </div>

      {/* MONITORING TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Top Controls & Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 font-mono-data">
            <span className="text-xs font-bold text-slate-800">Daftar Dokumen Sertifikasi</span>
            <span className="text-[11px] font-bold text-[#005ea4] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {filteredCertificates.length} Data Ditampilkan
            </span>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end min-w-[280px]">
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-700 hover:underline px-2.5 py-1 bg-rose-50 rounded border border-rose-200 font-mono-data transition-colors"
              >
                Reset Filter ({activeFilterCount})
              </button>
            )}

            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari item, seri, nomor sertifikat..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                <th className="py-3 px-3 text-center font-bold whitespace-nowrap">NO.</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap text-[#005ea4]">KATEGORI DOKUMEN</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">JENIS PERIZINAN / ALAT</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">UNIT PABRIK</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">MEREK / NAMA ITEM</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">NOMOR SERI / TAG</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">NO. SERTIFIKAT</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">TGL EXPIRATION</th>
                <th className="py-3 px-3 font-bold text-center whitespace-nowrap">STATUS PERIZINAN</th>
                <th className="py-3 px-3 font-bold text-center whitespace-nowrap">AKSI WORKFLOW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((doc, index) => {
                  const isInProgress = doc.workflowStatus === 'in_progress';
                  const isDecommissioned = doc.workflowStatus === 'decommissioned';

                  let rowStyleClass = "hover:bg-slate-50/80 transition-colors";
                  if (isDecommissioned) {
                    rowStyleClass = "bg-[#0f172a] text-slate-100 transition-colors hover:bg-slate-800";
                  } else if (isInProgress) {
                    rowStyleClass = "bg-amber-50/70 hover:bg-amber-100/70 text-slate-900 transition-colors";
                  } else if (doc.sisaHari <= 0) {
                    rowStyleClass = "bg-rose-50/70 hover:bg-rose-100/70 text-slate-900 transition-colors";
                  }

                  return (
                    <tr key={doc.id} className={rowStyleClass}>
                      <td className={`py-3 px-3 text-center font-mono-data font-bold whitespace-nowrap ${isDecommissioned ? 'text-slate-400' : 'text-slate-500'}`}>
                        {index + 1}
                      </td>

                      {/* Kategori Dokumen */}
                      <td className={`py-3 px-3 font-bold whitespace-nowrap ${isDecommissioned ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                        {doc.kategoriDokumen || doc.kategori || 'Perizinan'}
                      </td>

                      {/* Jenis Item */}
                      <td className={`py-3 px-3 font-medium whitespace-nowrap ${isDecommissioned ? 'text-slate-200' : 'text-slate-800'}`}>
                        {doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || '-'}
                      </td>

                      {/* Unit Pabrik */}
                      <td className="py-3 px-3 font-mono-data font-bold whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${isDecommissioned ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                          {doc.unitPabrik || doc.unit || doc.lokasi || '-'}
                        </span>
                      </td>

                      {/* Merek / Nama Item */}
                      <td
                        onClick={() => setSelectedDetailDoc(doc)}
                        className={`py-3 px-3 font-bold hover:text-[#005ea4] cursor-pointer hover:underline whitespace-nowrap ${isDecommissioned ? 'text-white' : 'text-slate-900'}`}
                        title="Klik untuk Lihat Detail Penuh"
                      >
                        {doc.merekItem || doc.title || doc.judulCiptaan || '-'}
                      </td>

                      {/* Nomor Seri / Tipe */}
                      <td className={`py-3 px-3 font-mono-data font-semibold whitespace-nowrap ${isDecommissioned ? 'text-slate-300' : 'text-slate-700'}`}>
                        {doc.nomorSeriTipe || doc.nomorSeri || doc.tipe || doc.code || '-'}
                      </td>

                      {/* No Sertifikat */}
                      <td className={`py-3 px-3 font-mono-data whitespace-nowrap ${isDecommissioned ? 'text-slate-300' : 'text-slate-800'}`}>
                        {doc.certificateNo || doc.noSertifikat || '-'}
                      </td>

                      {/* Tanggal Expiration */}
                      <td className={`py-3 px-3 font-mono-data font-bold whitespace-nowrap ${isDecommissioned ? 'text-slate-300' : 'text-slate-900'}`}>
                        {doc.expiryDate || doc.berakhir || doc.kapanBerakhir || '-'}
                        <span className={`text-[10px] block font-normal font-mono-data ${isDecommissioned ? 'text-slate-400' : doc.sisaHari <= 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          ({isDecommissioned ? 'Afkir / Non-Aktif' : doc.sisaHari <= 0 ? 'Expired' : `${doc.sisaHari} hr lagi`})
                        </span>
                      </td>

                      {/* Legal Permit Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono-data font-bold">
                        {isDecommissioned ? (
                          <span className="text-slate-400">Non-Aktif</span>
                        ) : doc.sisaHari <= 0 ? (
                          <span className="text-rose-600">Expired</span>
                        ) : doc.sisaHari <= (parseInt(customUrgentDays) || 30) ? (
                          <span className="text-amber-600">&lt; {customUrgentDays || 30} Hari</span>
                        ) : (
                          <span className="text-emerald-600">Valid</span>
                        )}
                      </td>

                      {/* ULTRA-CLEAN SIMPLE ACTION BUTTONS */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono-data">
                        {isInProgress ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openCompleteModal(doc)}
                              className="px-2.5 py-1 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-md shadow-2xs cursor-pointer transition-colors"
                            >
                              Selesai & Upload
                            </button>
                            <button
                              onClick={() => handleCancelAction(doc.id)}
                              className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : isDecommissioned ? (
                          <button
                            onClick={() => handleCancelAction(doc.id)}
                            className="text-xs text-slate-300 hover:text-white hover:underline font-medium cursor-pointer"
                          >
                            Batal Afkir
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleQuickRenew(doc.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md cursor-pointer transition-colors"
                            >
                              Perpanjang
                            </button>
                            <button
                              onClick={() => handleQuickDecommission(doc.id)}
                              className="text-xs text-slate-500 hover:text-slate-900 hover:underline font-medium cursor-pointer"
                            >
                              Afkir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500 font-mono-data">
                    Tidak ada perizinan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP FILTER MODAL SYSTEM */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">Filter Kategori & Data Monitoring</h3>
                  <p className="text-xs text-slate-400 font-mono-data">Sesuaikan kriteria pencarian dan rentang sisa hari perizinan</p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-mono-data">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Kategori Perizinan Utama
                </label>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
                >
                  <option value="All">Semua Jenis Perizinan ({allCertificates.length})</option>
                  <option value="Perizinan Peralatan Pabrik">Perizinan Peralatan Pabrik</option>
                  <option value="Perizinan Aset">Perizinan Aset & Lahan</option>
                  <option value="Perizinan Produk">Perizinan Produk (SNI/Halal)</option>
                  <option value="Perizinan Proyek">Perizinan Proyek (SLF/PUPR)</option>
                  <option value="Administrasi Lainnya">Administrasi Lainnya (Software/HAKI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  2. Unit Pabrik / Area Operasional
                </label>
                <select
                  value={filterUnitPabrik}
                  onChange={(e) => setFilterUnitPabrik(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
                >
                  {uniqueUnitPabrik.map((u, idx) => (
                    <option key={idx} value={u}>{u === 'All' ? 'Semua Unit Pabrik' : u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  3. Status Fisik Peralatan
                </label>
                <select
                  value={filterStatusOperasional}
                  onChange={(e) => setFilterStatusOperasional(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
                >
                  <option value="All">Semua Status Fisik Operasional</option>
                  <option value="Aktif">Aktif (Operasional Normal)</option>
                  <option value="Repair">Repair (Dalam Perbaikan/Overhaul)</option>
                  <option value="Rusak">Rusak (Out of Service / Tidak Laik)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  4. Sisa Hari Expired
                </label>
                <select
                  value={filterRentangHari}
                  onChange={(e) => setFilterRentangHari(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs cursor-pointer"
                >
                  <option value="All">Semua Rentang Hari</option>
                  <option value="expired">Expired (&le; 0 Hari)</option>
                  <option value="urgent">Urgent (&le; {customUrgentDays || 30} Hari)</option>
                  <option value="60">2 Bulan (&le; 60 Hari)</option>
                  <option value="90">3 Bulan (&le; 90 Hari)</option>
                  <option value="180">6 Bulan (&le; 180 Hari)</option>
                  <option value="365">1 Tahun (&le; 365 Hari)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold font-mono-data">Hasil Filter Data:</span>
                <span className="text-xs font-extrabold text-[#005ea4] bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                  {filteredCertificates.length} of {allCertificates.length} items
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors font-mono-data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors font-mono-data cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER SIDEBAR: RIWAYAT PERPANJANGAN */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans-clean">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setSelectedHistoryItem(null)} />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
              {/* Sidebar Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <History className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">Riwayat & Audit Log Perpanjangan</h3>
                    <p className="text-[11px] text-slate-400 font-mono-data truncate max-w-xs">{selectedHistoryItem.merekItem}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedHistoryItem(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs font-mono-data">
                {/* Information Summary Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-xs">{selectedHistoryItem.jenisItem}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-[#005ea4] border border-blue-200 rounded font-bold text-[10px]">
                      {selectedHistoryItem.unitPabrik}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div>Merek / Tipe: <span className="font-bold text-slate-900">{selectedHistoryItem.merekItem}</span></div>
                    <div>No. Seri Tag: <span className="font-bold text-slate-800">{selectedHistoryItem.nomorSeriTipe}</span></div>
                    <div>Instansi Penguji: <span className="font-bold text-slate-800">{selectedHistoryItem.agency}</span></div>
                    <div>Sertifikat Aktif: <span className="font-bold text-[#005ea4]">{selectedHistoryItem.certificateNo}</span></div>
                  </div>
                </div>

                {/* TIMELINE RIWAYAT PERPANJANGAN */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#005ea4]" />
                      <span>Timeline Rekam Jejak Perpanjangan</span>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">
                      {(selectedHistoryItem.historyLogs || []).length} Catatan
                    </span>
                  </h4>

                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {(selectedHistoryItem.historyLogs || []).length > 0 ? (
                      selectedHistoryItem.historyLogs.map((log, idx) => (
                        <div key={idx} className="relative">
                          {/* Bullet Node */}
                          <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                            idx === 0 ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'
                          }`} />

                          <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">{log.tahun} - {log.jenisTindakan}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'Berhasil / Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {log.status}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 space-y-0.5 font-mono-data">
                              <div>No. SK: <span className="font-bold text-slate-800">{log.noSertifikat}</span></div>
                              <div>Tgl Inspeksi: <span className="font-medium text-slate-800">{log.tglInspeksi}</span></div>
                              <div>Tgl Terbit: <span className="font-medium text-slate-800">{log.tglTerbit}</span></div>
                              <div>Tgl Expired: <span className="font-bold text-rose-600">{log.tglExpired}</span></div>
                              <div>Pelaksana: <span className="font-medium text-slate-800">{log.pelaksana}</span></div>
                              <div className="text-slate-500 italic mt-1 font-sans">"{log.catatan}"</div>
                            </div>

                            {log.fileUploaded && (
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="text-slate-600 font-bold flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-[#005ea4]" />
                                  {log.fileUploaded}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => alert(`Membuka berkas terlampir: ${log.fileUploaded}`)}
                                  className="text-[#005ea4] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>Buka PDF</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">Belum ada riwayat perpanjangan tercatat.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer font-mono-data"
                >
                  Tutup Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE RENEWAL & UPLOAD CERTIFICATE MODAL WITH OCR AUTO-EXTRACT */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Konfirmasi Selesai & Upload Sertifikat Baru</h4>
                <p className="text-[11px] text-slate-400 font-mono-data">{activeModalItem.merekItem}</p>
              </div>
              <button onClick={() => setActiveModalItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmUploadRenewal} className="p-5 space-y-4 text-xs font-mono-data">
              {/* FILE UPLOAD & OCR EXTRACTION STATUS BOX */}
              <div>
                <label className="font-bold text-slate-900 block mb-1.5">
                  1. Upload File Sertifikat Baru (Wajib) <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    id="cert-file-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="cert-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <UploadCloud className="w-8 h-8 text-[#005ea4]" />
                    {uploadedFile ? (
                      <div className="text-slate-800 font-bold flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>{uploadedFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-[#005ea4]">Klik untuk Pilih File Sertifikat</span>
                        <span className="text-[10px] text-slate-500 block">Format: PDF, PNG, JPG (Maks. 10MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* LIVE OCR SCANNING / SUCCESS INDICATOR */}
                {isOcrScanning && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center gap-2 text-[11px] animate-pulse">
                    <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>⚡ <b>AI OCR Engine:</b> Mengekstrak data nomor, tanggal pengecekan, & expired dari dokumen...</span>
                  </div>
                )}

                {ocrSuccess && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2 text-[11px]">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ <b>OCR Berhasil:</b> Data di bawah telah otomatis terisi dari hasil pemindaian sertifikat! (Dapat Anda edit manual).</span>
                  </div>
                )}
              </div>

              {/* NOMOR SERTIFIKAT BARU */}
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  2. Nomor Sertifikat Baru <span className="text-[10px] font-normal text-slate-500">(Auto-OCR / Editable)</span>
                </label>
                <input
                  type="text"
                  value={newCertNumber}
                  onChange={(e) => setNewCertNumber(e.target.value)}
                  placeholder="Nomor SK / Sertifikat baru..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
                />
              </div>

              {/* GRID UNTUK 3 TANGGAL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    3. Tgl Pengecekan
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    4. Tgl Terbit SK
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1 text-rose-700">
                    5. Tgl Expired Baru
                  </label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* CATATAN VERIFIKASI */}
              <div>
                <label className="font-bold text-slate-900 block mb-1">6. Catatan Verifikasi</label>
                <textarea
                  value={resertifikasiNotes}
                  onChange={(e) => setResertifikasiNotes(e.target.value)}
                  placeholder="Catatan hasil verifikasi atau keterangan instansi..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer font-mono-data"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Konfirmasi & Simpan Sertifikat Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
