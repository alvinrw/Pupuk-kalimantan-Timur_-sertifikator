import toast from 'react-hot-toast';
import React, { useState, useRef, useEffect } from 'react';
import { Edit3, CheckCircle2, Save, Upload, Loader2, AlertTriangle, FileText, Crosshair, X, ShieldAlert } from 'lucide-react';
import { API_BASE, getFullFileUrl } from '../../config/api';
import BaseSplitScreenUploadModal from '../common/BaseSplitScreenUploadModal';
import PdfCanvasOcrViewer from '../common/PdfCanvasOcrViewer';

export default function StagingEditModal({
  isOpen,
  onClose,
  item,
  onSave
}) {
  const activeItem = item?.parentDoc || item || {};
  const certObj = item?.certObj || (item?.isChild ? item : (activeItem.certs && activeItem.certs[0]) || activeItem);

  const [masterData, setMasterData] = useState({
    merekItem: '',
    kodeItem: '',
    jenisItem: '',
    unit: '',
    exemptionNote: ''
  });

  const [certData, setCertData] = useState({
    namaSertifikat: '',
    noSertifikat: '',
    terbit: '',
    expired: '',
    instansi: '',
    keterangan: '',
    status: 'Aktif'
  });

  const [sertifikatMode, setSertifikatMode] = useState('dengan'); // 'dengan' | 'tanpa'
  const [selectedFile, setSelectedFile] = useState(null);
  const [tempUrl, setTempUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');
  const [scanMode, setScanMode] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && item) {
      const parent = item.parentDoc || item || {};
      setMasterData({
        merekItem: parent.title || parent.merekItem || parent.docNamaItem || parent.namaItem || '',
        kodeItem: parent.code || parent.docCode || parent.nomorSeri || parent.kodeItem || '',
        jenisItem: parent.jenisItem || parent.docJenis || parent.jenisPeralatan || '',
        unit: parent.unit || parent.docUnit || parent.lokasi || '',
        exemptionNote: parent.exemptionNote || ''
      });

      const cert = certObj || {};
      setCertData({
        id: cert.id || null,
        namaSertifikat: cert.namaSertifikat || cert.jenisSertifikat || cert.title || '',
        noSertifikat: cert.noSertifikat || cert.noIzin || cert.certificateNo || '',
        terbit: cert.terbit || cert.tanggalInspeksi || '',
        expired: cert.expired || cert.berakhir || cert.tanggalExpired || '',
        instansi: cert.instansi || '',
        keterangan: cert.keterangan || '',
        status: cert.status || 'Aktif'
      });

      setSertifikatMode(parent.documentStatus === 'EXEMPT' || cert.status === 'EXEMPT' ? 'tanpa' : 'dengan');

      const existingFile = cert.fileUrl || parent.fileUrl || null;
      if (existingFile) {
        setPreviewUrl(getFullFileUrl(existingFile));
      } else {
        setPreviewUrl(null);
      }

      setSelectedFile(null);
      setTempUrl(null);
      setIsUploadingTemp(false);
      setUploadError(null);
      setOcrErrorMsg('');
      setOcrSuccess(false);
      setScanMode(null);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // ─── OCR Result Handler ──────────────────────────────────────────────────
  const handleOcrResult = async (fieldKey, rawText) => {
    try {
      const { parseDate, parseCertificateNumber } = await import('../../utils/ocrTextParser');

      if (fieldKey === 'noSertifikat') {
        const certNo = parseCertificateNumber(rawText);
        setCertData(prev => ({ ...prev, noSertifikat: certNo || rawText.replace(/\n+/g, ' ').trim() }));
      } else if (fieldKey === 'namaSertifikat') {
        setCertData(prev => ({ ...prev, namaSertifikat: rawText.replace(/\n+/g, ' ').trim() }));
      } else if (fieldKey === 'terbit' || fieldKey === 'expired') {
        const parsed = parseDate(rawText);
        if (parsed) {
          setCertData(prev => ({ ...prev, [fieldKey]: parsed.iso }));
        } else {
          setOcrErrorMsg(`Gagal mendeteksi tanggal untuk ${fieldKey}.`);
        }
      } else if (fieldKey === 'instansi') {
        setCertData(prev => ({ ...prev, instansi: rawText.replace(/\n+/g, ' ').trim() }));
      }

      setOcrSuccess(true);
      setScanMode(null);
    } catch (err) {
      console.error("Gagal memproses OCR:", err);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Hanya file PDF yang diperbolehkan!');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setIsUploadingTemp(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/document-history/upload-temp`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!res.ok) throw new Error('Gagal mengunggah berkas ke folder sementara.');
      const json = await res.json();
      const serverTempUrl = json.data?.tempUrl || json.url;

      setTempUrl(serverTempUrl);
      setPreviewUrl(getFullFileUrl(serverTempUrl));
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah berkas.');
    } finally {
      setIsUploadingTemp(false);
    }
  };

  const handleFormSubmit = async (e, shouldMoveToUtama = false) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      let finalFileUrl = certObj?.fileUrl || activeItem.fileUrl || null;
      if (tempUrl) {
        try {
          const moveRes = await fetch(`${API_BASE}/document-history/move-temp`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempUrl })
          });
          if (moveRes.ok) {
            const json = await moveRes.json();
            finalFileUrl = json.data?.url || json.url || finalFileUrl;
          }
        } catch (err) {
          console.error("Move temp error:", err);
        }
      }

      const updatedMaster = {
        ...activeItem,
        merekItem: masterData.merekItem,
        code: masterData.kodeItem,
        jenisItem: masterData.jenisItem,
        unit: masterData.unit,
        exemptionNote: sertifikatMode === 'tanpa' ? masterData.exemptionNote : null,
        documentStatus: shouldMoveToUtama ? 'COMPLETED' : (sertifikatMode === 'tanpa' ? 'EXEMPT' : 'PENDING_DOC')
      };

      const updatedCert = {
        ...certData,
        id: certObj.id || certData.id,
        fileUrl: finalFileUrl,
        status: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'Aktif'
      };

      if (onSave) {
        await onSave(updatedMaster, updatedCert, shouldMoveToUtama);
      }
      onClose();
    } catch (err) {
      toast.error('Gagal menyimpan data staging: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Left Panel Form Render ──────────────────────────────────────────────
  const renderLeftForm = () => (
    <div className="p-6 space-y-6 font-mono-data text-xs max-h-[80vh] overflow-y-auto">
      {/* Header Info */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 space-y-1">
        <div className="flex items-center gap-2 text-[#005ea4] font-bold text-sm">
          <Edit3 className="w-4 h-4" />
          <span>Form Edit Data Staging</span>
        </div>
        <p className="text-[11px] text-slate-600 font-sans">
          Ubah metadata master item &amp; sertifikat sebelum difiksasikan ke Data Utama.
        </p>
      </div>

      {/* Mode Sertifikat */}
      <div className="space-y-2">
        <label className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider font-sans">
          Status Persyaratan Sertifikat
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSertifikatMode('dengan')}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              sertifikatMode === 'dengan'
                ? 'bg-blue-50 border-[#005ea4] text-[#005ea4] ring-1 ring-[#005ea4]'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Memerlukan Sertifikat</span>
          </button>
          <button
            type="button"
            onClick={() => setSertifikatMode('tanpa')}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              sertifikatMode === 'tanpa'
                ? 'bg-amber-50 border-amber-600 text-amber-800 ring-1 ring-amber-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Pengecualian (Exempt)</span>
          </button>
        </div>
      </div>

      {/* SECTION A: DATA INDUK (MASTER ITEM) */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
        <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-sans border-b border-slate-200 pb-2">
          Data Induk / Master Item
        </h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">{(item?.categoryKey === 'peralatan-pabrik' || activeItem?.categoryKey === 'peralatan-pabrik') ? 'Alat' : 'Nama Item / Merek'}</label>
            <input
              type="text"
              value={masterData.merekItem}
              onChange={e => setMasterData({ ...masterData, merekItem: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              placeholder="Crane Tower 01"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nomor Seri / Kode Item</label>
            <input
              type="text"
              value={masterData.kodeItem}
              onChange={e => setMasterData({ ...masterData, kodeItem: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              placeholder="CRN-2026-X"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Jenis / Kategori</label>
            <input
              type="text"
              value={masterData.jenisItem}
              onChange={e => setMasterData({ ...masterData, jenisItem: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              placeholder="Peralatan Berat"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Lokasi</label>
            <input
              type="text"
              value={masterData.unit}
              onChange={e => setMasterData({ ...masterData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              placeholder="Amoniak 1"
            />
          </div>
        </div>
      </div>

      {/* SECTION B: DATA SERTIFIKAT / EXEMPTION */}
      {sertifikatMode === 'tanpa' ? (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3">
          <label className="font-bold text-amber-900 block text-xs font-sans">
            Catatan Alasan Pengecualian (Exemption Note)
          </label>
          <textarea
            value={masterData.exemptionNote}
            onChange={e => setMasterData({ ...masterData, exemptionNote: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-amber-300 rounded-lg text-xs text-amber-900 focus:ring-2 focus:ring-amber-600 focus:outline-none bg-white font-mono-data"
            placeholder="Jelaskan alasan mengapa item ini tidak memerlukan sertifikat..."
          />
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
          <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-sans border-b border-slate-200 pb-2">
            Data Sertifikat (Child Document)
          </h5>

          {/* Nama Sertifikat */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Nama Sertifikat / SK</label>
              <button
                type="button"
                onClick={() => setScanMode(scanMode === 'namaSertifikat' ? null : 'namaSertifikat')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                  scanMode === 'namaSertifikat'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>{scanMode === 'namaSertifikat' ? 'Batal Scan' : 'Scan OCR'}</span>
              </button>
            </div>
            <input
              type="text"
              value={certData.namaSertifikat}
              onChange={e => setCertData({ ...certData, namaSertifikat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              placeholder="Sertifikat Hak Pakai"
            />
          </div>

          {/* No. Sertifikat */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Nomor Sertifikat / SK</label>
              <button
                type="button"
                onClick={() => setScanMode(scanMode === 'noSertifikat' ? null : 'noSertifikat')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                  scanMode === 'noSertifikat'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>{scanMode === 'noSertifikat' ? 'Batal Scan' : 'Scan OCR'}</span>
              </button>
            </div>
            <input
              type="text"
              value={certData.noSertifikat}
              onChange={e => setCertData({ ...certData, noSertifikat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-[#005ea4] focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              placeholder="SK-500/PKT/2026"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Tanggal Terbit</label>
                <button
                  type="button"
                  onClick={() => setScanMode(scanMode === 'terbit' ? null : 'terbit')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                    scanMode === 'terbit'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Scan</span>
                </button>
              </div>
              <input
                type="text"
                value={certData.terbit}
                onChange={e => setCertData({ ...certData, terbit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                placeholder="YYYY-MM-DD"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Tanggal Expired</label>
                <button
                  type="button"
                  onClick={() => setScanMode(scanMode === 'expired' ? null : 'expired')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                    scanMode === 'expired'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Scan</span>
                </button>
              </div>
              <input
                type="text"
                value={certData.expired}
                onChange={e => setCertData({ ...certData, expired: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-rose-700 focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* Instansi */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Instansi Penerbit</label>
              <button
                type="button"
                onClick={() => setScanMode(scanMode === 'instansi' ? null : 'instansi')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                  scanMode === 'instansi'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>Scan</span>
              </button>
            </div>
            <input
              type="text"
              value={certData.instansi}
              onChange={e => setCertData({ ...certData, instansi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              placeholder="Disnaker"
            />
          </div>

          {/* Upload Berkas PDF */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="font-bold text-slate-700 block">File PDF Sertifikat</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-[#005ea4]" />
                <span>{selectedFile ? 'Ganti File PDF' : 'Unggah File PDF Baru'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {isUploadingTemp && <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />}
              {selectedFile && <span className="text-xs text-emerald-700 font-bold font-mono-data truncate max-w-[200px]">{selectedFile.name}</span>}
            </div>
            {uploadError && <p className="text-xs text-rose-600 font-bold mt-1">{uploadError}</p>}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={(e) => handleFormSubmit(e, false)}
          disabled={isSaving}
          className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Simpan Draf Staging</span>
        </button>

        <button
          type="button"
          onClick={(e) => handleFormSubmit(e, true)}
          disabled={isSaving}
          className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>Simpan &amp; Pindahkan ke Utama</span>
        </button>
      </div>
    </div>
  );

  // ─── Right Panel PDF Viewer ──────────────────────────────────────────────
  const renderRightViewer = () => (
    <div className="w-full h-full bg-slate-900 flex flex-col justify-between overflow-hidden">
      {previewUrl ? (
        <PdfCanvasOcrViewer
          fileUrl={previewUrl}
          scanMode={scanMode}
          onOcrResult={handleOcrResult}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-3 font-mono-data">
          <FileText className="w-12 h-12 opacity-40" />
          <p className="font-bold text-sm text-slate-300">Belum ada file PDF yang dipilih.</p>
          <p className="text-xs text-slate-400 max-w-sm">
            Unggah file PDF di panel kiri untuk melihat pratinjau dokumen dan memanfaatkan fitur OCR otomatis.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <BaseSplitScreenUploadModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Data Staging & Fiksasi Dokumentasi"
      subtitle="Periksa dan sesuaikan isian data sebelum memindahkan ke Data Utama"
      leftPanel={renderLeftForm()}
      rightPanel={renderRightViewer()}
    />
  );
}
