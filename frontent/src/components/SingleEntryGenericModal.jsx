import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, Save, FileCheck, X, Upload, Loader2, PlusCircle, ShieldAlert } from 'lucide-react';
import { API_BASE, getFullFileUrl } from '../config/api';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';
import PdfCanvasOcrViewer from './common/PdfCanvasOcrViewer';
import StatusDropdown from './common/StatusDropdown';
import CustomSelect from './common/CustomSelect';

export default function SingleEntryGenericModal({ isOpen, onClose, onAddSuccess, categoryName }) {
  const isAset = categoryName?.toLowerCase().includes('aset');
  const isProduk = categoryName?.toLowerCase().includes('produk');
  const isHaki = categoryName?.toLowerCase().includes('administrasi') || categoryName?.toLowerCase().includes('cipta') || categoryName?.toLowerCase().includes('paten');
  const isPaten = categoryName?.toLowerCase().includes('paten');
  const isHakCipta = categoryName?.toLowerCase().includes('cipta') || (isHaki && !isPaten);
  const isProyek = !isAset && !isProduk && !isHaki;

  const [formData, setFormData] = useState({
    title: '',
    tipe: '',
    code: '',
    unitLocation: '',
    penanggungJawab: '',
    status: 'Aktif',
    keterangan: '',
    exemptionNote: '',
    namaSertifikat: '',
    noSertifikat: '',
    terbit: '',
    expired: '',
    reminderEnabled: true,
    reminderType: 'DAYS',
    reminderDays: 30,
    reminderDate: '',
    instansi: ''
  });

  const [sertifikatMode, setSertifikatMode] = useState('dengan');
  const [selectedFile, setSelectedFile] = useState(null);
  const [tempUrl, setTempUrl] = useState(null);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [scanMode, setScanMode] = useState(null);
  const [dateErrors, setDateErrors] = useState({ terbit: false, expired: false });
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        tipe: '',
        code: '',
        unitLocation: '',
        penanggungJawab: '',
        status: 'Aktif',
        keterangan: '',
        exemptionNote: '',
        namaSertifikat: '',
        noSertifikat: '',
        terbit: '',
        expired: '',
        reminderEnabled: true,
        reminderType: 'DAYS',
        reminderDays: 30,
        reminderDate: '',
        instansi: ''
      });
      setSertifikatMode('dengan');
      setSelectedFile(null);
      setTempUrl(null);
      setLocalPreviewUrl(null);
      setIsUploadingTemp(false);
      setScanMode(null);
      setDateErrors({ terbit: false, expired: false });
      setIsDragging(false);
    }
  }, [isOpen, isAset, isProduk, isHakCipta, isPaten]);

  // Handle OCR
  const handleOcrResult = useCallback(async (fieldKey, rawText) => {
    const { parseDate, parseCertificateNumber } = await import('../utils/ocrTextParser');
    
    if (fieldKey === 'noSertifikat') {
      const certNo = parseCertificateNumber(rawText);
      setFormData(prev => ({ ...prev, noSertifikat: certNo || rawText.replace(/\n+/g, ' ').trim().substring(0, 80) }));
    } else if (fieldKey === 'namaSertifikat' || fieldKey === 'title') {
      const cleanTitle = rawText.replace(/\n+/g, ' ').trim().substring(0, 150);
      setFormData(prev => ({ ...prev, title: cleanTitle, namaSertifikat: cleanTitle }));
    } else if (fieldKey === 'instansi') {
      setFormData(prev => ({ ...prev, instansi: rawText.replace(/\n+/g, ' ').trim().substring(0, 100) }));
    } else if (fieldKey === 'terbit' || fieldKey === 'expired') {
      const parsed = parseDate(rawText);
      if (parsed) {
        setFormData(prev => ({ ...prev, [fieldKey]: parsed.iso }));
        setDateErrors(prev => ({ ...prev, [fieldKey]: parsed.isFuzzy ? `Hari tidak terbaca, diset otomatis 1 ${parsed.rawMonthYear}.` : false }));
      } else {
        setDateErrors(prev => ({ ...prev, [fieldKey]: true }));
      }
    }
    setScanMode(null);
  }, []);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setTempUrl(null);
    setScanMode(null);

    if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        setIsUploadingTemp(true);
        const fdTemp = new FormData();
        fdTemp.append('file', file);
        
        const fdOcr = new FormData();
        fdOcr.append('file', file);

        const token = sessionStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [uploadRes, ocrRes] = await Promise.all([
          fetch(`${API_BASE}/document-history/upload-temp`, {
            method: 'POST', body: fdTemp, headers
          }),
          fetch(`${API_BASE}/ocr/scan-pdf`, {
            method: 'POST', body: fdOcr, headers
          }).catch(() => null)
        ]);

        if (uploadRes.ok) {
          const json = await uploadRes.json();
          setTempUrl(json.data.url);
        }

        if (ocrRes && ocrRes.ok) {
          const ocrJson = await ocrRes.json();
          if (ocrJson.success && ocrJson.data) {
            const data = ocrJson.data;
            setFormData(prev => ({
              ...prev,
              noSertifikat: data.noSertifikat || prev.noSertifikat || '',
              terbit: data.terbit || prev.terbit || '',
              expired: data.expired || prev.expired || '',
            }));
          }
        }
      } catch (err) {
        console.error('Upload temp error:', err);
      } finally {
        setIsUploadingTemp(false);
      }
    }
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const displayCatName = categoryName === 'administrasi-lainnya' ? (isPaten ? 'Hak Paten' : 'Hak Cipta') : (categoryName || 'Perizinan');

  const labels = {
    title: `Input Data ${displayCatName} Baru`,
    subtitle: '', // Sesuai format baru
    nameLabel: isAset ? 'Nama Aset' : isProduk ? 'Nama Produk' : isPaten ? 'Judul Invensi Paten' : isHakCipta ? 'Judul Ciptaan' : 'Nama Proyek',
    namePlaceholder: isAset 
      ? 'Gedung Kantor Pusat Bontang' 
      : isProduk 
      ? 'Pupuk NPK 16-16-16' 
      : isPaten
      ? 'Metode Formulasi Pupuk NPK Slow Release'
      : isHakCipta
      ? 'Sistem PERISAI AI'
      : 'Izin Amdal Ekspansi Pabrik',
    jenisLabel: isAset 
      ? 'Jenis Aset' 
      : isProduk 
      ? 'Jenis Produk' 
      : isPaten 
      ? 'Kategori Paten' 
      : isHakCipta 
      ? 'Jenis Ciptaan' 
      : 'Kategori Proyek',
    jenisPlaceholder: isAset 
      ? 'Tanah' 
      : isProduk 
      ? 'Pupuk NPK' 
      : isPaten
      ? 'Paten Biasa (Invensi)'
      : isHakCipta
      ? 'Program Komputer (Software)'
      : 'Amdal',
    codeLabel: isAset ? 'Nomor Seri' : isProduk ? 'Kode Produk' : isPaten ? 'Nomor Paten / Pendaftaran' : isHakCipta ? 'Kode Ciptaan / No. EC' : 'Kode Proyek',
    codePlaceholder: isAset 
      ? 'AST-BPN-001' 
      : isProduk 
      ? 'PRD-NPK-001' 
      : isPaten
      ? 'IDP00088192A'
      : isHakCipta
      ? 'EC00202400192'
      : 'PRJ-ENV-001',
    locationLabel: isAset ? 'Lokasi' : isProduk ? 'Unit Pabrik' : isPaten ? 'Inventor / Unit Riset' : isHakCipta ? 'Owner Departemen' : 'Lokasi / Area',
    locationPlaceholder: isAset 
      ? 'Kawasan Industri Bontang' 
      : isProduk 
      ? 'Pabrik 5' 
      : isPaten
      ? 'Dept. Riset & Inovasi'
      : isHakCipta
      ? 'Dept. IT Central'
      : 'Area Pabrik NPK',
    userLabel: isPaten ? 'Penanggung Jawab / Inventor' : 'Penanggung Jawab',
    userPlaceholder: isAset 
      ? 'Departemen Aset & Umum' 
      : isProduk 
      ? 'Departemen Penjaminan Mutu' 
      : isPaten
      ? 'Tim Riset & Inovasi'
      : isHakCipta
      ? 'Departemen IT'
      : 'Departemen Proyek',
    statusLabel: 'Status',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isHaki && !selectedFile && !tempUrl) {
      alert('Dokumen Hak Cipta dan Hak Paten wajib melampirkan file PDF sertifikat resmi dari Ditjen KI Kemenkumham RI.');
      return;
    }

    let finalUrl = null;

    if (sertifikatMode === 'dengan') {
      if (tempUrl) {
        try {
          const token = sessionStorage.getItem('token');
          const moveRes = await fetch(`${API_BASE}/document-history/move-temp`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ tempUrl })
          });
          if (moveRes.ok) {
            const json = await moveRes.json();
            finalUrl = json.data?.url || null;
          }
        } catch(err) {
          console.error("Gagal move file", err);
        }
      } else if (selectedFile) {
        try {
          const fd = new FormData();
          fd.append('file', selectedFile);
          const token = sessionStorage.getItem('token');
          const uploadRes = await fetch(`${API_BASE}/document-history/upload`, {
            method: 'POST',
            body: fd,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (uploadRes.ok) {
            const json = await uploadRes.json();
            finalUrl = json.data?.url || null;
          }
        } catch(err) {}
      }
    }

      // Map to correct ID format
    const idPrefix = isHaki ? (isPaten ? 'PTN' : 'HKI') : isAset ? 'AST' : isProduk ? 'PRD' : 'PRJ';
    const systemCategoryKey = isHaki ? 'administrasi-lainnya' : isProduk ? 'perizinan-produk' : isAset ? 'perizinan-aset' : 'perizinan-proyek';

    onAddSuccess({
      ...formData,
      file: sertifikatMode === 'dengan' ? selectedFile : null,
      fileUrl: finalUrl,
      id: `${idPrefix}-MANUAL-${Date.now()}`,
      categoryKey: systemCategoryKey,
      title: formData.title,
      merekItem: formData.title,
      jenisPeralatan: formData.tipe || (isPaten ? 'Paten Biasa (Invensi)' : isHakCipta ? 'Program Komputer (Software)' : isAset ? 'Aset & Bangunan' : isProduk ? 'Sertifikasi Produk' : 'Perizinan Proyek'),
      code: formData.code || (isHaki ? formData.noSertifikat : null) || `${idPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      unitLocation: formData.unitLocation,
      user: formData.penanggungJawab,
      status: formData.status,
      keterangan: (formData.keterangan || '').trim() || (sertifikatMode === 'tanpa' ? (formData.exemptionNote || "Tanpa Sertifikat (EXEMPT)") : "-"),
      exemptionNote: sertifikatMode === 'tanpa' ? (formData.exemptionNote || formData.keterangan || 'Dikecualikan dari kewajiban sertifikat') : undefined,
      instansi: (formData.instansi || '').trim() || '-',
      instansiPenerbit: (formData.instansi || '').trim() || '-',
      
      // Certificate fields
      namaSertifikat: formData.namaSertifikat || (isPaten ? `Sertifikat Paten - ${formData.title}` : isHakCipta ? `Surat Pencatatan Ciptaan - ${formData.title}` : `Sertifikat ${formData.title}`),
      noSertifikat: formData.noSertifikat || (sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (selectedFile ? (isPaten ? `IDP-${Math.floor(100000 + Math.random() * 900000)}` : isHakCipta ? `EC-${Math.floor(100000 + Math.random() * 900000)}` : `CERT-${Math.floor(100 + Math.random() * 900)}`) : "BELUM_ADA_SERTIFIKAT")),
      terbit: sertifikatMode === 'tanpa' ? undefined : (formData.terbit || new Date().toISOString().split('T')[0]),
      expired: sertifikatMode === 'tanpa' ? undefined : (formData.expired || ''),
      hasCertificatePdf: sertifikatMode === 'dengan' && (!!selectedFile || !!finalUrl),
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      reminderEnabled: sertifikatMode === 'tanpa' ? false : formData.reminderEnabled,
      reminderType: formData.reminderType,
      reminderDays: formData.reminderDays,
      reminderDate: formData.reminderDate
    });

    onClose();
  };

  const ScanButton = ({ fieldKey, label }) => {
    const isActive = scanMode === fieldKey;
    const baseClass = 'shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer';
    const colorMap = {
      title: { idle: 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200', active: 'text-white bg-indigo-600 border-indigo-600' },
      namaSertifikat: { idle: 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200', active: 'text-white bg-violet-600 border-violet-600' },
      noSertifikat: { idle: 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200', active: 'text-white bg-blue-600 border-blue-600' },
      terbit: { idle: 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200', active: 'text-white bg-emerald-600 border-emerald-600' },
      expired: { idle: 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200', active: 'text-white bg-rose-600 border-rose-600' },
      instansi: { idle: 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200', active: 'text-white bg-amber-600 border-amber-600' },
    };
    const disabledClass = 'opacity-30 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-300';

    return (
      <button
        type="button"
        title={!(localPreviewUrl || tempUrl) ? 'Upload PDF dulu' : (isActive ? 'Klik untuk batal scan' : `Scan area PDF untuk ${label}`)}
        onClick={() => { if (localPreviewUrl || tempUrl) setScanMode(isActive ? null : fieldKey); }}
        disabled={!(localPreviewUrl || tempUrl)}
        className={`${baseClass} ${!(localPreviewUrl || tempUrl) ? disabledClass : isActive ? colorMap[fieldKey].active : colorMap[fieldKey].idle}`}
      >
        {isActive ? (
          <X className="w-4 h-4" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
          </svg>
        )}
      </button>
    );
  };

  return (
    <BaseSplitScreenUploadModal
      isOpen={isOpen}
      onClose={onClose}
      title={labels.title}
      subtitle={labels.subtitle}
      headerIcon={PlusCircle}
      formId="singleEntryGenericForm"
      onSubmit={handleSubmit}
      submitDisabled={isUploadingTemp}
      submitText="Simpan Final (Submit)"
      submitIcon={Save}
      tempUrl={sertifikatMode === 'tanpa' ? null : tempUrl}
      hidePreview={sertifikatMode === 'tanpa'}
      rightPanelContent={
        (localPreviewUrl || tempUrl) ? (
          <PdfCanvasOcrViewer
            pdfUrl={tempUrl ? getFullFileUrl(tempUrl) : localPreviewUrl}
            scanMode={scanMode}
            onScanComplete={handleOcrResult}
            onScanCancel={() => setScanMode(null)}
          />
        ) : null
      }
    >
      {/* Mode Toggle: Khusus Hak Cipta & Hak Paten harus memiliki sertifikat, sehingga opsi 'Tanpa Sertifikat' dihilangkan */}
      {!isHaki && (
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setSertifikatMode('dengan')}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              sertifikatMode === 'dengan' ? 'bg-white text-[#005ea4] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Dengan Sertifikat (PDF)</span>
          </button>
          <button
            type="button"
            onClick={() => setSertifikatMode('tanpa')}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              sertifikatMode === 'tanpa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4 text-amber-600" />
            <span>Tanpa Sertifikat</span>
          </button>
        </div>
      )}

      {isHaki ? (
        <div className="space-y-6">
          {/* Bagian 1: Identitas Karya & Kepemilikan Internal */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">
                {isPaten ? 'Bagian 1: Identitas Invensi & Kepemilikan Internal' : 'Bagian 1: Identitas Ciptaan & Kepemilikan Internal'}
              </h4>
            </div>

            {/* Judul Ciptaan / Judul Invensi */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {labels.nameLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={labels.namePlaceholder}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${
                    scanMode === 'title' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                  }`}
                />
                <ScanButton fieldKey="title" label={labels.nameLabel} />
              </div>
            </div>

            {/* Jenis Ciptaan & Owner Departemen */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{labels.jenisLabel}</label>
                <input
                  type="text"
                  value={formData.tipe}
                  onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                  placeholder={
                    isHakCipta 
                      ? 'Program Komputer, Buku Panduan, Karya Tulis, dll.' 
                      : 'Paten Biasa, Paten Sederhana, dll.'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs bg-white font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{labels.locationLabel}</label>
                <input
                  type="text"
                  value={formData.unitLocation}
                  onChange={(e) => setFormData({ ...formData, unitLocation: e.target.value })}
                  placeholder={labels.locationPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>
            </div>

            {/* Penanggung Jawab / Pencipta */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{labels.userLabel}</label>
              <input
                type="text"
                value={formData.penanggungJawab}
                onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                placeholder={labels.userPlaceholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>
          </div>

          {/* Bagian 2: Legalitas Sertifikat */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">
                Bagian 2: Legalitas Sertifikat
              </h4>
            </div>

            {/* Upload File PDF */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                File PDF Sertifikat Resmi (Wajib)
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => { if (!isUploadingTemp) fileInputRef.current?.click(); }}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                  isDragging ? 'border-[#005ea4] bg-blue-50' : 'border-slate-300 hover:border-[#005ea4] bg-slate-50 hover:bg-blue-50/50'
                } ${isUploadingTemp ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf"
                  onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                  className="hidden" disabled={isUploadingTemp} />
                <Upload className="w-6 h-6 text-[#005ea4] mx-auto mb-1" />
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-[#005ea4]">
                    {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : 'Pilih / Drop File PDF Sertifikat'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">Format PDF</span>
                </div>
              </div>

              {isUploadingTemp && (
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                    <span>Menyiapkan preview dokumen...</span>
                  </div>
                </div>
              )}
            </div>

            {/* No. Sertifikat & Instansi Penerbit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  No. Sertifikat <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text" required
                    value={formData.noSertifikat}
                    onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                    placeholder={
                      isHakCipta 
                        ? 'EC00202400192 atau 000281940' 
                        : 'IDP000089123'
                    }
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${
                      scanMode === 'noSertifikat' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                    }`}
                  />
                  <ScanButton fieldKey="noSertifikat" label="No. Sertifikat" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Instansi Penerbit
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={formData.instansi}
                    onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                    placeholder={isHakCipta ? "Ditjen KI Kemenkumham RI" : isPaten ? "DJKI Kemenkumham / WIPO" : "DPMPTSP / Disnaker"}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${
                      scanMode === 'instansi' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                    }`}
                  />
                  <ScanButton fieldKey="instansi" label="Instansi Penerbit" />
                </div>
              </div>
            </div>

            {/* Tanggal Terbit & Masa Berlaku */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isHakCipta ? 'Tanggal Terbit' : 'Tanggal Pemberian Paten'}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date" required
                    value={formData.terbit}
                    onChange={(e) => {
                      setFormData({ ...formData, terbit: e.target.value });
                      setDateErrors({ ...dateErrors, terbit: false });
                    }}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${
                      dateErrors.terbit ? 'border-rose-400 bg-rose-50 text-rose-700' : scanMode === 'terbit' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300'
                    }`}
                  />
                  <ScanButton fieldKey="terbit" label="Tanggal Terbit" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-rose-600 block mb-1">
                  {isHakCipta ? 'Masa Berlaku Perlindungan' : 'Masa Berlaku Paten'}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date" required
                    value={formData.expired}
                    onChange={(e) => {
                      setFormData({ ...formData, expired: e.target.value });
                      setDateErrors({ ...dateErrors, expired: false });
                    }}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${
                      dateErrors.expired ? 'border-rose-400 bg-rose-50 text-rose-700' : scanMode === 'expired' ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  <ScanButton fieldKey="expired" label="Tanggal Berakhir" />
                </div>
              </div>
            </div>

            {/* Keterangan Tambahan */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Keterangan Tambahan (Opsional)</label>
              <textarea
                rows={2}
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Tambahkan catatan khusus, nomor publikasi, atau informasi penting lainnya..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Bagian 1: Data Utama {categoryName}</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {labels.codeLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text" required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={labels.codePlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {labels.nameLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={labels.namePlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{labels.jenisLabel}</label>
                <input
                  type="text"
                  value={formData.tipe}
                  onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                  placeholder={labels.jenisPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs bg-white font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{labels.locationLabel}</label>
                <input
                  type="text"
                  value={formData.unitLocation}
                  onChange={(e) => setFormData({ ...formData, unitLocation: e.target.value })}
                  placeholder={labels.locationPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{labels.userLabel}</label>
                <input
                  type="text"
                  value={formData.penanggungJawab}
                  onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                  placeholder={labels.userPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>
              <div>
                <StatusDropdown
                  label={labels.statusLabel}
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={
                    isProyek
                      ? [
                          { value: 'Aktif', label: 'Aktif', desc: 'Proyek sedang berjalan' },
                          { value: 'Selesai', label: 'Selesai', desc: 'Proyek rampung' },
                          { value: 'Ditunda', label: 'Ditunda', desc: 'Proyek dipending' },
                        ]
                      : [
                          { value: 'Aktif', label: 'Aktif', desc: 'Beroperasi normal' },
                          { value: 'Spare', label: 'Spare', desc: 'Cadangan' },
                          { value: 'Rusak', label: 'Rusak', desc: 'Perlu perbaikan' },
                        ]
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              Bagian 2: Data Dokumen Sertifikat
            </h4>
            
            {sertifikatMode === 'tanpa' ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-amber-900">Status: Tanpa Sertifikat (EXEMPT)</div>
                    <p className="text-slate-600 leading-relaxed">
                      Dokumen ini didaftarkan sebagai <strong>Dikecualikan (EXEMPT)</strong> tanpa kewajiban memiliki sertifikat atau izin berkala. Sistem tidak akan melacak masa kedaluwarsa.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Alasan Pengecualian / Catatan Khusus (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.exemptionNote || ''}
                    onChange={(e) => setFormData({ ...formData, exemptionNote: e.target.value })}
                    placeholder="Dokumen tidak memerlukan perpanjangan izin berkala..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none bg-white"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">File PDF Sertifikat (Wajib)</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => { if (!isUploadingTemp) fileInputRef.current?.click(); }}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                      isDragging ? 'border-[#005ea4] bg-blue-50' : 'border-slate-300 hover:border-[#005ea4] bg-slate-50 hover:bg-blue-50/50'
                    } ${isUploadingTemp ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf"
                      onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                      className="hidden" disabled={isUploadingTemp} />
                    <Upload className="w-6 h-6 text-[#005ea4] mx-auto mb-1" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-[#005ea4]">
                        {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : 'Pilih / Drop File PDF Dokumen'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">Hanya format PDF</span>
                    </div>
                  </div>

                  {isUploadingTemp && (
                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                        <span>Menyiapkan preview dokumen...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`text-xs font-bold block mb-1 transition-colors ${scanMode === 'namaSertifikat' ? 'text-[#005ea4]' : 'text-slate-700'}`}>
                    Nama Sertifikat
                    {scanMode === 'namaSertifikat' && (
                      <span className="ml-2 text-[10px] font-normal text-[#005ea4] animate-pulse">
                        ✦ Drag area teks di PDF →
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text" required={sertifikatMode === 'dengan'}
                      value={formData.namaSertifikat}
                      onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                      placeholder="SKP Pesawat Angkat"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${
                        scanMode === 'namaSertifikat' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                      }`}
                    />
                    <ScanButton fieldKey="namaSertifikat" label="Nama Sertifikat" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    No. Sertifikat <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text" required={sertifikatMode === 'dengan'}
                      value={formData.noSertifikat}
                      onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                      placeholder="SKP-2024/DISNAKER/1234"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${
                        scanMode === 'noSertifikat' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                      }`}
                    />
                    <ScanButton fieldKey="noSertifikat" label="No. Sertifikat" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Terbit</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date" required={sertifikatMode === 'dengan'}
                        value={formData.terbit}
                        onChange={(e) => {
                          setFormData({ ...formData, terbit: e.target.value });
                          setDateErrors({ ...dateErrors, terbit: false });
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${
                          dateErrors.terbit ? 'border-rose-400 bg-rose-50 text-rose-700' : scanMode === 'terbit' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300'
                        }`}
                      />
                      <ScanButton fieldKey="terbit" label="Tanggal Terbit" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-rose-600 block mb-1">Tanggal Berakhir</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date" required={sertifikatMode === 'dengan'}
                        value={formData.expired}
                        onChange={(e) => {
                          setFormData({ ...formData, expired: e.target.value });
                          setDateErrors({ ...dateErrors, expired: false });
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${
                          dateErrors.expired ? 'border-rose-400 bg-rose-50 text-rose-700' : scanMode === 'expired' ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                        }`}
                      />
                      <ScanButton fieldKey="expired" label="Tanggal Berakhir" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {sertifikatMode === 'dengan' && (
        <div className="space-y-4 pt-4 mt-6 border-t border-slate-200">
          <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
            {isHaki ? 'Bagian 3: Pengaturan Notifikasi & Pengingat Masa Berlaku' : 'Bagian 3: Pengaturan Notifikasi & Deadline'}
          </h4>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono-data">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="modalReminderEnabled"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                className="rounded border-slate-300 accent-[#005ea4] h-4 w-4 cursor-pointer"
              />
              <label htmlFor="modalReminderEnabled" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                Aktifkan Pengingat / Notifikasi Reminder
              </label>
            </div>

            {formData.reminderEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <CustomSelect
                  label="Tipe Reminder"
                  value={formData.reminderType}
                  onChange={(val) => setFormData({ ...formData, reminderType: val })}
                  options={[
                    { value: 'DAYS', label: 'Berdasarkan Sisa Hari (H-)' },
                    { value: 'DATE', label: 'Berdasarkan Tanggal Spesifik' },
                  ]}
                />
                {formData.reminderType === 'DAYS' ? (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Pemicu H- (Hari)</label>
                    <input type="number" min="1" value={formData.reminderDays}
                      onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value === '' ? '' : parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Tanggal Pemicu</label>
                    <input type="date" value={formData.reminderDate}
                      onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </BaseSplitScreenUploadModal>
  );
}
