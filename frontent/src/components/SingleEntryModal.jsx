import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlusCircle, Save, Upload, FileCheck, Loader2, X } from 'lucide-react';
import { API_BASE, getFullFileUrl } from '../config/api';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';

export default function SingleEntryModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    jenisPeralatan: '', merekItem: '', tipe: '', nomorSeri: '',
    unitPabrik: 'Pabrik 1A', lokasiDetail: '', penanggungJawab: '',
    status: 'Aktif', namaSertifikat: '', noSertifikat: '', terbit: '', expired: '',
    reminderEnabled: true, reminderType: 'DAYS', reminderDays: 30, reminderDate: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [sertifikatMode, setSertifikatMode] = useState('dengan');

  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Drag-to-OCR scan mode state
  const [scanMode, setScanMode] = useState(null); // 'noSertifikat' | 'terbit' | 'expired' | null

  // Date validation errors
  const [dateErrors, setDateErrors] = useState({ terbit: false, expired: false });

  const [PdfCanvasOcrViewer, setPdfCanvasOcrViewer] = useState(null);

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const fileInputRef = useRef(null);

  // ─── Load PdfCanvasOcrViewer saat modal dibuka ─────────────────────────────
  useEffect(() => {
    if (isOpen && !PdfCanvasOcrViewer) {
      import('./common/PdfCanvasOcrViewer').then(mod => {
        setPdfCanvasOcrViewer(() => mod.default);
      });
    }
  }, [isOpen]);

  // ─── Reset state saat modal ditutup ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        jenisPeralatan: '', merekItem: '', tipe: '', nomorSeri: '',
        unitPabrik: 'Pabrik 1A', lokasiDetail: '', penanggungJawab: '',
        status: 'Aktif', namaSertifikat: '', noSertifikat: '', terbit: '', expired: '',
        reminderEnabled: true, reminderType: 'DAYS', reminderDays: 30, reminderDate: ''
      });
      setSelectedFile(null);
      setTempUrl(null);
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setSertifikatMode('dengan');
      setIsUploadingTemp(false);
      setScanMode(null);
      setDateErrors({ terbit: false, expired: false });
    }
  }, [isOpen]);

  // ─── Utility: format tanggal ──────────────────────────────────────────────
  const isoToDisplay = (iso) => {
    if (!iso || iso.length < 10) return '';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };


  // ─── Proses file PDF (Upload Temp & Ekstraksi AI Otomatis) ──────────────
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
        
        const token = sessionStorage.getItem('token');
        const uploadRes = await fetch(`${API_BASE}/document-history/upload-temp`, {
          method: 'POST', 
          body: fdTemp,
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (uploadRes.ok) {
          const json = await uploadRes.json();
          setTempUrl(json.data.url);
        }

      } catch (err) {
        console.error('Upload temp / AI Extractor error:', err);
      } finally {
        setIsUploadingTemp(false);
      }
    }
  }, []);


  // ─── Drag-and-drop file handlers ──────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // ─── Callback dari PdfCanvasOcrViewer setelah drag-select + OCR ──────────
  const handleOcrResult = useCallback(async (fieldKey, rawText) => {
    const { parseDate, parseCertificateNumber } = await import('../utils/ocrTextParser');

    if (fieldKey === 'noSertifikat') {
      const certNo = parseCertificateNumber(rawText);
      if (certNo) {
        console.log(`✅ [Frontend] Berhasil memasukkan Nomor Sertifikat: ${certNo}`);
        setFormData(prev => ({ ...prev, noSertifikat: certNo }));
      } else {
        const cleaned = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 80);
        console.warn(`⚠️ [Frontend] Nomor Sertifikat tidak valid/berantakan, dimasukkan paksa teks asli: "${cleaned}"`);
        if (cleaned) setFormData(prev => ({ ...prev, noSertifikat: cleaned }));
      }
    } else if (fieldKey === 'terbit' || fieldKey === 'expired') {
      const parsed = parseDate(rawText);
      if (parsed) {
        console.log(`✅ [Frontend] Berhasil membaca Tanggal (${fieldKey}): ${parsed.display} -> Dimasukkan ke kalender sebagai ${parsed.iso}`);
        setFormData(prev => ({ ...prev, [fieldKey]: parsed.iso }));
        
        if (parsed.isFuzzy) {
          setDateErrors(prev => ({ ...prev, [fieldKey]: `Hari tidak terbaca, diset otomatis 1 ${parsed.rawMonthYear}. Harap betulkan!` }));
        } else {
          setDateErrors(prev => ({ ...prev, [fieldKey]: false }));
        }
      } else {
        // Fallback untuk type="date"
        const cleaned = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 30);
        console.error(`❌ [Frontend] Gagal mendeteksi tanggal untuk (${fieldKey}). Teks dari AI: "${cleaned}"`);
        setDateErrors(prev => ({ ...prev, [fieldKey]: cleaned ? `Gagal OCR: "${cleaned}"` : true }));
      }
    }
    setScanMode(null);
  }, []);

  // ─── Submit handler ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const terbitValid = !!formData.terbit;
    const expiredValid = !!formData.expired;
    if (!terbitValid || !expiredValid) {
      setDateErrors({ terbit: !terbitValid, expired: !expiredValid });
      return;
    }

    try {
      const checkRes = await fetch(`${API_BASE}/master-items/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(sessionStorage.getItem('token') ? { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` } : {}) },
        body: JSON.stringify({
          title: formData.jenisPeralatan,
          code: formData.merekItem,
          unitLocation: formData.unitPabrik && formData.lokasiDetail ? `${formData.unitPabrik} - ${formData.lokasiDetail}` : (formData.lokasiDetail || formData.unitPabrik || 'Umum'),
          nomorSeri: formData.nomorSeri
        })
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.isDuplicate) {
          setDuplicateWarning(checkData);
          return;
        }
      }
    } catch (err) {
      console.error('Error checking duplicate:', err);
    }

    await proceedSubmit(false);
  };

  const proceedSubmit = async (forceUpdate, existingId = null) => {
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
        } catch (err) { console.error('Gagal move file', err); }
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
        } catch (err) {}
      }
    }

    const terbitIso = formData.terbit;
    const expiredIso = formData.expired;

    onAddSuccess({
      ...formData,
      terbit: terbitIso,
      expired: expiredIso,
      file: sertifikatMode === 'dengan' ? selectedFile : null,
      fileUrl: finalUrl,
      id: existingId || `EQ-MANUAL-${Date.now()}`,
      forceUpdate,
      existingId,
      noSertifikat: formData.noSertifikat || (sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (selectedFile ? `SN-${Math.floor(10000 + Math.random() * 90000)}` : "BELUM_ADA_SERTIFIKAT")),
      tanggalInspeksi: terbitIso || new Date().toISOString().split('T')[0],
      berakhir: expiredIso || '',
      hasCertificatePdf: sertifikatMode === 'dengan' && !!selectedFile,
      documentStatus: (sertifikatMode === 'tanpa' && (!formData.noSertifikat || !terbitIso || !expiredIso)) ? 'EXEMPT' : 'COMPLETED',
      keterangan: (sertifikatMode === 'tanpa' && (!formData.noSertifikat || !terbitIso || !expiredIso)) ? 'Tidak Perlu Sertifikat / Data Tidak Lengkap' : (selectedFile ? `Sertifikat Attached (${selectedFile.name})` : 'Data Tersedia (File Fisik Belum Diunggah)')
    });
    setDuplicateWarning(null);
    onClose();
  };

  // ─── Tombol Scan (🎯) per field ────────────────────────────────────────────
  const ScanButton = ({ fieldKey, label }) => {
    const isActive = scanMode === fieldKey;
    const baseClass = 'shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all text-xs font-bold';
    const colorMap = {
      noSertifikat: { idle: 'text-[#005ea4] bg-[#005ea4]/10 hover:bg-[#005ea4]/20 border-[#005ea4]/30', active: 'text-white bg-[#005ea4] border-[#005ea4]' },
      terbit: { idle: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200', active: 'text-white bg-emerald-600 border-emerald-600' },
      expired: { idle: 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200', active: 'text-white bg-rose-600 border-rose-600' },
    };
    const disabledClass = 'opacity-30 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400';

    return (
      <button
        type="button"
        title={!(localPreviewUrl || tempUrl) ? 'Upload PDF dulu' : (isActive ? 'Klik untuk batal scan' : `Scan area PDF untuk ${label}`)}
        onClick={() => { if (localPreviewUrl || tempUrl) setScanMode(isActive ? null : fieldKey); }}
        disabled={!(localPreviewUrl || tempUrl)}
        className={`${baseClass} ${!(localPreviewUrl || tempUrl) ? disabledClass : isActive ? colorMap[fieldKey].active : colorMap[fieldKey].idle} cursor-pointer`}
      >
        {isActive ? (
          <X className="w-3.5 h-3.5" />
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            <line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/>
          </svg>
        )}
      </button>
    );
  };

  return (
    <BaseSplitScreenUploadModal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Data Perizinan Peralatan Baru (Human Verification)"
      subtitle="Pastikan form master data sesuai dengan dokumen yang diunggah"
      headerIcon={PlusCircle}
      formId="singleEntryForm"
      onSubmit={handleSubmit}
      submitDisabled={isUploadingTemp || (sertifikatMode === 'dengan' && !selectedFile && !tempUrl)}
      submitText="Simpan Final (Submit)"
      submitIcon={Save}
      tempUrl={tempUrl}
      rightPanelContent={
        PdfCanvasOcrViewer ? (
          <PdfCanvasOcrViewer
            pdfUrl={localPreviewUrl || tempUrl}
            scanMode={scanMode}
            onScanComplete={handleOcrResult}
            onScanCancel={() => setScanMode(null)}
          />
        ) : null
      }
    >
      {duplicateWarning && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 bg-amber-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-[15px]">Data Serupa Ditemukan</h3>
                <p className="text-amber-700 text-[11px] leading-snug mt-0.5">
                  Item dengan identitas ini sudah ada di {duplicateWarning.isInStaging ? 'Staging' : 'Database'}.
                </p>
              </div>
            </div>
            
            <div className="p-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono-data mb-5">
                <div className="text-slate-500 mb-1">Item yang ditemukan:</div>
                <div className="font-bold text-slate-800">{duplicateWarning.matchedItem.title}</div>
                <div className="text-slate-600 mt-1">{duplicateWarning.matchedItem.code} • {duplicateWarning.matchedItem.unitLocation}</div>
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => proceedSubmit(true, duplicateWarning.matchedItem.id)}
                  className="w-full py-2.5 bg-[#005ea4] hover:bg-[#004e8a] text-white font-bold rounded-lg text-sm transition-colors"
                >
                  Timpa / Perbarui Data Lama
                </button>
                <button
                  type="button"
                  onClick={() => proceedSubmit(false)}
                  className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-sm transition-colors"
                >
                  Tetap Simpan sebagai Data Baru
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-700 font-bold rounded-lg text-sm transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setSertifikatMode('dengan')}
          className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${sertifikatMode === 'dengan' ? 'bg-white text-[#005ea4] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Dengan Sertifikat (PDF)</span>
        </button>
        <button
          type="button"
          onClick={() => setSertifikatMode('tanpa')}
          className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${sertifikatMode === 'tanpa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <X className="w-4 h-4 text-amber-600" />
          <span>Tanpa Sertifikat</span>
        </button>
      </div>

      {/* SECTION 1: MASTER DATA */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Bagian 1: Data Utama Aset</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Merek / Nama Peralatan <span className="text-rose-500">*</span></label>
            <input type="text" required value={formData.merekItem}
              onChange={(e) => setFormData({ ...formData, merekItem: e.target.value })}
              placeholder="Contoh: Crane Kapasitas 5T"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Jenis Peralatan <span className="text-rose-500">*</span></label>
            <input type="text" required value={formData.jenisPeralatan}
              onChange={(e) => setFormData({ ...formData, jenisPeralatan: e.target.value })}
              placeholder="Contoh: Overhead Crane"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tipe</label>
            <input type="text" value={formData.tipe}
              onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nomor Seri</label>
            <input type="text" value={formData.nomorSeri}
              onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Unit Pabrik</label>
            <input type="text" value={formData.unitPabrik}
              onChange={(e) => setFormData({ ...formData, unitPabrik: e.target.value })}
              placeholder="Contoh: Pabrik 1A"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Lokasi</label>
            <input type="text" value={formData.lokasiDetail}
              onChange={(e) => setFormData({ ...formData, lokasiDetail: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab</label>
            <input type="text" value={formData.penanggungJawab}
              onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Status</label>
            <select value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-[#005ea4]">
              <option value="Aktif">Aktif</option>
              <option value="Spare">Spare</option>
              <option value="Rusak">Rusak</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: SERTIFIKASI */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mt-6">
          Bagian 2: {sertifikatMode === 'dengan' ? 'Data Dokumen Sertifikat' : 'Pengecualian Sertifikat'}
        </h4>

        {sertifikatMode === 'dengan' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat (Wajib)</label>
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

              {tempUrl && (
                <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-1">
                  <span className="text-base leading-none">🎯</span>
                  <span>Klik <strong>🎯</strong> di samping field untuk drag-select area PDF di kanan → auto-fill.</span>
                </div>
              )}
            </div>
        )}

        {/* Data Section */}
      <div className="space-y-4">
        <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Sertifikat</label>
              <input type="text" value={formData.namaSertifikat}
                onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                placeholder="Contoh: SKP Pesawat Angkat"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold" />
            </div>

            {/* No. Sertifikat + Scan Button */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                No. Sertifikat <span className="text-rose-500">*</span>
                {scanMode === 'noSertifikat' && (
                  <span className="ml-2 text-[#005ea4] font-normal animate-pulse text-[10px]">— Drag area di PDF kanan →</span>
                )}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  required
                  value={formData.noSertifikat}
                  onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                  placeholder="Contoh: SKP-2024/DISNAKER/1234"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${
                    scanMode === 'noSertifikat'
                      ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60'
                      : 'border-slate-300 focus:ring-[#005ea4]'
                  }`}
                />
                <ScanButton fieldKey="noSertifikat" label="No. Sertifikat" />
              </div>
            </div>

            {/* Tanggal Terbit + Tanggal Berakhir + Scan Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs font-bold block mb-1 transition-colors ${
                  scanMode === 'terbit' ? 'text-emerald-700' : 'text-slate-700'
                }`}>
                  Tanggal Terbit
                  {scanMode === 'terbit' && (
                    <span className="ml-1 font-normal text-[10px] animate-pulse">← Drag di PDF →</span>
                  )}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={formData.terbit}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, terbit: e.target.value }));
                      setDateErrors(prev => ({ ...prev, terbit: false }));
                    }}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${
                      dateErrors.terbit
                        ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50'
                        : scanMode === 'terbit'
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/50'
                          : 'border-slate-300 focus:ring-[#005ea4]'
                    }`}
                  />
                  <ScanButton fieldKey="terbit" label="Tanggal Terbit" />
                </div>
                {dateErrors.terbit && (
                  <p className="text-[10px] text-rose-600 mt-1">
                    {typeof dateErrors.terbit === 'string' ? dateErrors.terbit : 'Wajib diisi'}
                  </p>
                )}
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 transition-colors ${
                  scanMode === 'expired' ? 'text-rose-600' : 'text-rose-700'
                }`}>
                  Tanggal Berakhir
                  {scanMode === 'expired' && (
                    <span className="ml-1 font-normal text-[10px] animate-pulse">← Drag di PDF →</span>
                  )}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={formData.expired}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, expired: e.target.value }));
                      setDateErrors(prev => ({ ...prev, expired: false }));
                    }}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${
                      dateErrors.expired
                        ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50'
                        : scanMode === 'expired'
                          ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/50'
                          : 'border-slate-300 focus:ring-[#005ea4]'
                    }`}
                  />
                  <ScanButton fieldKey="expired" label="Tanggal Berakhir" />
                </div>
                {dateErrors.expired && (
                  <p className="text-[10px] text-rose-600 mt-1">
                    {typeof dateErrors.expired === 'string' ? dateErrors.expired : 'Wajib diisi'}
                  </p>
                )}
              </div>
            </div>
      </div>
      </div>

      {/* SECTION 3: NOTIFIKASI & DEADLINE */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
          Bagian 3: Pengaturan Notifikasi & Deadline
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
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tipe Pemicu</label>
                <select
                  value={formData.reminderType}
                  onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                >
                  <option value="DAYS">Berdasarkan Sisa Hari (H-)</option>
                  <option value="DATE">Berdasarkan Tanggal Spesifik</option>
                </select>
              </div>
              {formData.reminderType === 'DAYS' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Pemicu H- (Hari)</label>
                  <input type="number" min="1" value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) || 30 })}
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
    </BaseSplitScreenUploadModal>
  );
}
