import React, { useRef, useState, useEffect } from 'react';
import { X, UploadCloud, Save, Upload, Loader2, AlertTriangle, FileText, CheckCircle, Crosshair } from 'lucide-react';
import { scanPdfDocument } from '../../services/ocrService';
import { API_BASE } from '../../config/api';
import PdfCanvasOcrViewer from '../common/PdfCanvasOcrViewer';
import BaseSplitScreenUploadModal from '../common/BaseSplitScreenUploadModal';
export default function ModalUploadCert({
  isOpen,
  onClose,
  uploadData,
  setUploadData,
  selectedUploadFile,
  setSelectedUploadFile,
  manualFileInputRef,
  onSubmit,
  isSingleCertScope,
}) {
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [scanMode, setScanMode] = useState(null);

  // ─── Handler untuk hasil OCR dari Canvas ─────────────────────────────────
  const handleOcrResult = async (fieldKey, rawText) => {
    try {
      const { parseDate, parseCertificateNumber } = await import('../../utils/ocrTextParser');
      
      if (fieldKey === 'noSertifikat') {
        const certNo = parseCertificateNumber(rawText);
        setUploadData(prev => ({ ...prev, noSertifikat: certNo || rawText.replace(/\n+/g, ' ').trim() }));
      } else if (fieldKey === 'terbit' || fieldKey === 'expired') {
        const parsed = parseDate(rawText);
        if (parsed) {
          setUploadData(prev => ({ ...prev, [fieldKey]: parsed.iso }));
        } else {
          setOcrErrorMsg(`Gagal mendeteksi tanggal untuk ${fieldKey}.`);
        }
      } else if (fieldKey === 'instansi') {
        setUploadData(prev => ({ ...prev, instansi: rawText.replace(/\n+/g, ' ').trim() }));
      }
      
      setOcrSuccess(true);
      setScanMode(null);
    } catch (err) {
      console.error("Gagal memproses hasil OCR:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsScanningOcr(false);
      setIsUploadingTemp(false);
      setOcrErrorMsg('');
      setOcrSuccess(false);
      setScanMode(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <BaseSplitScreenUploadModal
      isOpen={isOpen}
      onClose={onClose}
      title={uploadData.target === 'current' ? 'Koreksi Sertifikat Aktif (Human Verification)' : 'Unggah Arsip Berkas PDF (Human Verification)'}
      subtitle="Silakan verifikasi hasil pembacaan AI dengan dokumen PDF asli di sebelah kanan."
      headerIcon={UploadCloud}
      formId="uploadCertForm"
      onSubmit={onSubmit}
      submitDisabled={isUploadingTemp || isScanningOcr || !selectedUploadFile}
      submitText="Simpan Final (Submit)"
      submitIcon={Save}
      tempUrl={uploadData.tempUrl}
      rightPanelContent={
        uploadData.tempUrl ? (
          <PdfCanvasOcrViewer
            pdfUrl={uploadData.tempUrl}
            scanMode={scanMode}
            onScanComplete={handleOcrResult}
            onScanCancel={() => setScanMode(null)}
          />
        ) : null
      }
    >
      <div className="space-y-4">
              {isSingleCertScope && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs mb-2">
                  <strong>Mode:</strong> {uploadData.target === 'current' ? 'Koreksi (buat versi baru, versi lama → Direvisi)' : 'Arsip (tambah ke histori)'}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1">Berkas PDF Sertifikat</label>
                <div
                  onClick={() => {
                    if (isUploadingTemp || isScanningOcr) return;
                    manualFileInputRef.current?.click();
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    (isUploadingTemp || isScanningOcr) 
                      ? 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-70' 
                      : 'border-slate-300 hover:border-[#005ea4] bg-slate-50 hover:bg-blue-50/50 cursor-pointer'
                  }`}
                >
                  <input
                    ref={manualFileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedUploadFile(file);
                        setUploadData(prev => ({ ...prev, fileName: file.name, tempUrl: null }));
                        setOcrSuccess(false);

                        if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
                          try {
                            // 1. Upload Temporary ke MinIO
                            setIsUploadingTemp(true);
                            const fdTemp = new FormData();
                            fdTemp.append('file', file);
                            const uploadRes = await fetch(`${API_BASE}/document-history/upload-temp`, {
                              method: 'POST',
                              body: fdTemp
                            });
                            if (uploadRes.ok) {
                              const json = await uploadRes.json();
                              setUploadData(prev => ({ ...prev, tempUrl: json.data.url }));
                            } else {
                              console.error('Failed to upload temp file');
                            }
                          } catch (err) {
                            console.error('Upload temp error:', err);
                          } finally {
                            setIsUploadingTemp(false);
                          }
                          // Fitur AI Auto-Extract keseluruhan saat upload kita matikan
                          // agar Preview instan muncul. User akan pakai tombol 🎯 per field.
                        }
                      }
                    }}
                    className="hidden"
                    disabled={isUploadingTemp || isScanningOcr}
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#005ea4] block">
                    {selectedUploadFile ? `✓ Terpilih: ${selectedUploadFile.name}` : 'Ganti / Pilih File PDF'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Hanya menerima format PDF</span>
                </div>

                {(isUploadingTemp || isScanningOcr) && (
                  <div className="flex flex-col gap-2 mt-3">
                    {isUploadingTemp && (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                        <span>Menyiapkan preview dokumen...</span>
                      </div>
                    )}
                    {isScanningOcr && (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#005ea4] bg-blue-50 p-2.5 rounded-lg border border-blue-200 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                        <span>AI sedang memindai & mengekstrak data dari dokumen...</span>
                      </div>
                    )}
                  </div>
                )}
                


                {ocrErrorMsg && (
                  <div className="flex items-start gap-2 text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{ocrErrorMsg}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  No. Sertifikat / SK Baru <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={uploadData.noSertifikat}
                    onChange={(e) => setUploadData({ ...uploadData, noSertifikat: e.target.value })}
                    placeholder="Contoh: SKP-2024/DISNAKER/1234"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setScanMode(scanMode === 'noSertifikat' ? null : 'noSertifikat')}
                    className={`p-2 rounded-lg border shrink-0 transition-all ${
                      scanMode === 'noSertifikat' 
                      ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                      : 'bg-blue-50 border-blue-200 text-[#005ea4] hover:bg-blue-100'
                    }`}
                    title="Drag-select No. Sertifikat"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Instansi Penerbit / Penguji</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={uploadData.instansi}
                    onChange={(e) => setUploadData({ ...uploadData, instansi: e.target.value })}
                    placeholder="Contoh: Disnaker Kaltim, Sucofindo, BKI"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setScanMode(scanMode === 'instansi' ? null : 'instansi')}
                    className={`p-2 rounded-lg border shrink-0 transition-all ${
                      scanMode === 'instansi' 
                      ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                      : 'bg-blue-50 border-blue-200 text-[#005ea4] hover:bg-blue-100'
                    }`}
                    title="Drag-select Instansi"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tgl Terbit</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={uploadData.terbit}
                      onChange={(e) => setUploadData({ ...uploadData, terbit: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setScanMode(scanMode === 'terbit' ? null : 'terbit')}
                      className={`p-2 rounded-lg border shrink-0 transition-all ${
                        scanMode === 'terbit' 
                        ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title="Drag-select Tgl Terbit"
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={uploadData.expired}
                      onChange={(e) => setUploadData({ ...uploadData, expired: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setScanMode(scanMode === 'expired' ? null : 'expired')}
                      className={`p-2 rounded-lg border shrink-0 transition-all ${
                        scanMode === 'expired' 
                        ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                        : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                      title="Drag-select Tgl Expired"
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
      </div>
    </BaseSplitScreenUploadModal>
  );
}
