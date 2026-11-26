import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlusCircle, Save, Upload, FileCheck, Loader2, X, ShieldAlert } from 'lucide-react';
import { API_BASE, getFullFileUrl } from '../config/api';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';
import StatusDropdown from './common/StatusDropdown';
import CustomSelect from './common/CustomSelect';

export default function SingleEntryModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    jenisPeralatan: '', merekItem: '', tipe: '', nomorSeri: '',
    unitPabrik: '', lokasiDetail: '', penanggungJawab: '',
    status: 'Aktif', namaSertifikat: '', noSertifikat: '', terbit: '', expired: '',
    reminderEnabled: true, reminderType: 'DAYS', reminderDays: 30, reminderDate: '',
    instansi: '', keterangan: '', exemptionNote: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [sertifikatMode, setSertifikatMode] = useState('dengan');

  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        unitPabrik: '', lokasiDetail: '', penanggungJawab: '',
        status: 'Aktif', namaSertifikat: '', noSertifikat: '', terbit: '', expired: '',
        reminderEnabled: true, reminderType: 'DAYS', reminderDays: 30, reminderDate: '',
        instansi: '', keterangan: '', exemptionNote: ''
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
      setIsSubmitting(false);
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
        
        const fdOcr = new FormData();
        fdOcr.append('file', file);

        const token = sessionStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [uploadRes, ocrRes] = await Promise.all([
          fetch(`${API_BASE}/document-history/upload-temp`, {
            method: 'POST',
            body: fdTemp,
            headers,
            credentials: 'include'
          }),
          fetch(`${API_BASE}/ocr/scan-pdf`, {
            method: 'POST',
            body: fdOcr,
            headers,
            credentials: 'include'
          }).catch(err => {
            console.error('OCR API error:', err);
            return null;
          })
        ]);

        if (uploadRes.ok) {
          const json = await uploadRes.json();
          setTempUrl(json.data.url);
        }

        if (ocrRes && ocrRes.ok) {
          const ocrJson = await ocrRes.json();
          if (ocrJson.success && ocrJson.data) {
            const data = ocrJson.data;
            console.log('📄 OCR Data Result:', data);
            
            if (!data.noSertifikat && !data.terbit && !data.expired) {
              const { toast } = await import('react-hot-toast');
              toast.error("AI (PaddleOCR) belum menemukan data sertifikat otomatis. Silakan gunakan fitur Drag & Drop OCR.");
            } else {
              const { toast } = await import('react-hot-toast');
              toast.success("AI OCR (PaddleOCR) berhasil mengekstrak sebagian data!");
            }
            
            setFormData(prev => ({
              ...prev,
              noSertifikat: data.noSertifikat || prev.noSertifikat || '',
              terbit: data.terbit || prev.terbit || '',
              expired: data.expired || prev.expired || '',
              jenisPeralatan: data.namaPeralatan || prev.jenisPeralatan || '',
              namaSertifikat: data.namaPeralatan || data.namaSertifikat || prev.namaSertifikat || ''
            }));
          }
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

    if (fieldKey === 'namaSertifikat') {
      const cleaned = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 100);
      if (cleaned) {
        console.log(`✅ [Frontend] Berhasil membaca Nama Sertifikat: "${cleaned}"`);
        setFormData(prev => ({ ...prev, namaSertifikat: cleaned }));
      }
    } else if (fieldKey === 'noSertifikat') {
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

    if (sertifikatMode === 'dengan') {
      const terbitValid = !!formData.terbit;
      const expiredValid = !!formData.expired;
      if (!terbitValid || !expiredValid) {
        setDateErrors({ terbit: !terbitValid, expired: !expiredValid });
        return;
      }
    }

    const isMinus = (val) => (val || '').trim() === '-';
    if (isMinus(formData.jenisPeralatan) && isMinus(formData.item || formData.merekItem) && isMinus(formData.nomorSeri)) {
      alert("⚠️ Penolakan Sistem: Isian wajib (Alat, Jenis Peralatan, dan Nomor Seri) tidak boleh semuanya diisi dengan karakter '-' (strip). Minimal harus ada data valid pada salah satu kolom.");
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const checkRes = await fetch(`${API_BASE}/master-items/check-duplicate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: formData.item || formData.merekItem || formData.jenisPeralatan || '',
          code: formData.nomorSeri || '-',
          unitLocation: formData.lokasi || formData.lokasiDetail || 'Umum',
          nomorSeri: formData.nomorSeri || ''
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
    setIsSubmitting(true);
    try {
      let finalUrl = null;
      if (sertifikatMode === 'dengan') {
        if (tempUrl) {
          try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const moveRes = await fetch(`${API_BASE}/document-history/move-temp`, {
              method: 'POST',
              credentials: 'include',
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
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const uploadRes = await fetch(`${API_BASE}/document-history/upload`, {
              method: 'POST',
              body: fd,
              credentials: 'include',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (uploadRes.ok) {
              const json = await uploadRes.json();
              finalUrl = json.data?.url || null;
            }
          } catch (err) { console.error('Gagal upload file', err); }
        }
      }

      const isTanpa = sertifikatMode === 'tanpa';
      const terbitIso = !isTanpa && formData.terbit ? formData.terbit : undefined;
      const expiredIso = !isTanpa && formData.expired ? formData.expired : undefined;

      await onAddSuccess({
        ...formData,
        item: formData.item || formData.merekItem,
        terbit: terbitIso,
        expired: expiredIso,
        file: !isTanpa ? selectedFile : null,
        fileUrl: finalUrl,
        id: existingId || `EQ-MANUAL-${Date.now()}`,
        forceUpdate,
        existingId,
        namaSertifikat: isTanpa ? (formData.namaSertifikat || 'Tanpa Sertifikat') : formData.namaSertifikat,
        noSertifikat: isTanpa ? (formData.noSertifikat || 'Tanpa Sertifikat') : (formData.noSertifikat || (selectedFile ? `SN-${Math.floor(10000 + Math.random() * 90000)}` : "BELUM_ADA_SERTIFIKAT")),
        tanggalInspeksi: terbitIso || new Date().toISOString().split('T')[0],
        berakhir: expiredIso || undefined,
        hasCertificatePdf: !isTanpa && !!selectedFile,
        documentStatus: isTanpa ? 'EXEMPT' : 'COMPLETED',
        exemptionNote: isTanpa ? (formData.exemptionNote || formData.keterangan || 'Dikecualikan dari kewajiban sertifikat') : undefined,
        keterangan: (formData.keterangan || '').trim() || (isTanpa ? (formData.exemptionNote || 'Tidak Perlu Sertifikat (EXEMPT)') : '-'),
        reminderEnabled: isTanpa ? false : formData.reminderEnabled
      });

      setDuplicateWarning(null);
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

    // ─── Tombol Scan (🎯) field ────────────────────────────────────────────
  const ScanButton = ({ fieldKey, label }) => {
    const isActive = scanMode === fieldKey;
    const baseClass = 'shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all text-xs font-bold';
    const colorMap = {
      namaSertifikat: { idle: 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200', active: 'text-white bg-purple-600 border-purple-600' },
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
            <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="8" x2="12" y2="16" />
          </svg>
        )}
      </button>
    );
  };

  return (
    <BaseSplitScreenUploadModal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Data Baru "
      subtitle=""
      headerIcon={PlusCircle}
      formId="singleEntryForm"
      onSubmit={handleSubmit}
      submitDisabled={isSubmitting || isUploadingTemp || (sertifikatMode === 'dengan' && !selectedFile && !tempUrl)}
      submitText={isSubmitting ? "Menyimpan Data..." : "Simpan Final (Submit)"}
      submitIcon={isSubmitting ? Loader2 : Save}
      tempUrl={sertifikatMode === 'tanpa' ? null : tempUrl}
      hidePreview={sertifikatMode === 'tanpa'}
      rightPanelContent={
        PdfCanvasOcrViewer ? (
          <PdfCanvasOcrViewer
            pdfUrl={localPreviewUrl || tempUrl}
            scanMode={scanMode}
            onScanComplete={handleOcrResult}
            onScanCancel={() => setScanMode(null)}
            autoDetectPage={true}
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
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Bagian 1: Data Utama Peralatan</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Alat <span className="text-rose-500">*</span></label>
            <input type="text" required value={formData.item !== undefined ? formData.item : formData.merekItem}
              onChange={(e) => setFormData({ ...formData, item: e.target.value, merekItem: e.target.value })}
              placeholder="Fire Water Tank FWT-01"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Jenis Peralatan Pabrik <span className="text-rose-500">*</span></label>
            <input type="text" required value={formData.jenisPeralatan}
              onChange={(e) => setFormData({ ...formData, jenisPeralatan: e.target.value })}
              placeholder="Tangki Timbun / Penyalur Petir"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tipe</label>
            <input type="text" value={formData.tipe}
              onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
              placeholder="Double Girder"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nomor Seri</label>
            <input type="text" value={formData.nomorSeri}
              onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })}
              placeholder="SN-CR020-0060"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Lokasi</label>
            <input type="text" value={formData.lokasi !== undefined ? formData.lokasi : formData.lokasiDetail}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value, lokasiDetail: e.target.value })}
              placeholder="Area Workshop"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">User</label>
            <input type="text" value={formData.penanggungJawab}
              onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
              placeholder="Dept. Operasi"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <StatusDropdown
              label="Status"
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={[
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Spare', label: 'Spare' },
                { value: 'Rusak', label: 'Rusak' },
              ]}
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Instansi Penerbit</label>
            <input type="text" value={formData.instansi || ''}
              onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
              placeholder="Disnaker"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
          </div>
        </div>

        <div className="mt-3">
          <label className="font-bold text-slate-700 block mb-1">Keterangan</label>
          <input type="text" value={formData.keterangan || ''}
            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
            placeholder="Tambahkan keterangan jika diperlukan..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]" />
        </div>
      </div>

      {/* SECTION 2: SERTIFIKASI */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mt-6">
          Bagian 2: {sertifikatMode === 'dengan' ? 'Data Dokumen Sertifikat' : 'Pengecualian Sertifikat'}
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
                  Peralatan ini didaftarkan tanpa kewajiban memiliki lampiran sertifikat atau izin berkala. Sistem tidak akan melacak masa kedaluwarsa dokumen ini dan tidak membutuhkan file PDF.
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
                placeholder="Contoh: Alat bantu internal non-kritis / dalam masa tunggu regulasi baru..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none bg-white"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat (Wajib)</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => { if (!isUploadingTemp) fileInputRef.current?.click(); }}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isDragging ? 'border-[#005ea4] bg-blue-50' : 'border-slate-300 hover:border-[#005ea4] bg-slate-50 hover:bg-blue-50/50'
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
                  <div className="flex items-center gap-3 text-sm font-bold text-[#005ea4] bg-blue-50/80 p-3 rounded-lg border border-[#005ea4]/20 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin text-[#005ea4]" />
                    <div className="flex flex-col">
                      <span>Memproses Dokumen dengan AI (PaddleOCR)...</span>
                      <span className="text-[10px] text-slate-500 font-normal">Mengekstrak data dari halaman PDF</span>
                    </div>
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

            {/* Data Section */}
            <div className="space-y-4">
              {/* Nama Sertifikat + Scan Button */}
              <div>
                <label className={`text-xs font-bold block mb-1 transition-colors ${scanMode === 'namaSertifikat' ? 'text-purple-700' : 'text-slate-700'}`}>
                  Nama Sertifikat
                  {scanMode === 'namaSertifikat' && (
                    <span className="ml-2 font-normal animate-pulse text-[10px]">— Drag area di PDF kanan →</span>
                  )}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={formData.namaSertifikat}
                    onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                    placeholder="SKP Pesawat Angkat"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${scanMode === 'namaSertifikat'
                      ? 'border-purple-600 ring-2 ring-purple-600/30 bg-purple-50/60'
                      : 'border-slate-300 focus:ring-[#005ea4]'
                      }`}
                  />
                  <ScanButton fieldKey="namaSertifikat" label="Nama Sertifikat" />
                </div>
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
                    placeholder="SKP-2024/DISNAKER/1234"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${scanMode === 'noSertifikat'
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
                  <label className={`text-xs font-bold block mb-1 transition-colors ${scanMode === 'terbit' ? 'text-emerald-700' : 'text-slate-700'
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
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${dateErrors.terbit
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
                  <label className={`text-xs font-bold block mb-1 transition-colors ${scanMode === 'expired' ? 'text-rose-600' : 'text-rose-700'
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
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-xs transition-all ${dateErrors.expired
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
          </>
        )}
      </div>

      {/* SECTION 3: NOTIFIKASI & DEADLINE */}
      {sertifikatMode === 'dengan' && (
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
      )}
    </BaseSplitScreenUploadModal>
  );
}
