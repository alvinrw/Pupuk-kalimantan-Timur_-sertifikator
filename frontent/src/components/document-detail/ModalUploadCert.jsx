/**
 * ModalUploadCert Ã¢â‚¬â€  Modal unggah / koreksi berkas PDF manual.
 * Dipisah dari DocumentDetailPage (sebelumnya ~160 baris inline).
 */
import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Save, Upload, Loader2, Crosshair, FileText } from 'lucide-react';
import { scanPdfDocument } from '../../services/ocrService';
import { API_BASE } from '../../config/api';
import PdfCanvasOcrViewer from '../common/PdfCanvasOcrViewer';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#005ea4] flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {uploadData.target === 'current' ? 'Koreksi Sertifikat Aktif (Human Verification)' : 'Unggah Arsip Berkas PDF (Human Verification)'}
              </h4>
              <p className="text-[11px] text-blue-300 font-mono-data">
                {uploadData.target === 'current'
                  ? 'Buat versi baru  -  versi lama otomatis masuk histori'
                  : 'Tambahkan riwayat berkas ke daftar histori sertifikat'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Screen */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          
          {/* Sisi Kiri: Form Input & OCR */}
          <div className="w-full md:w-[45%] flex flex-col min-h-0 border-r border-slate-200">
            <form id="uploadCertForm" onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-mono-data">
          {isSingleCertScope && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
              <strong>Mode:</strong> {uploadData.target === 'current' ? 'Koreksi (buat versi baru, versi lama → Direvisi)' : 'Arsip (tambah ke histori)'}
            </div>
          )}

          <div>
            <label className="font-bold text-slate-800 block mb-1">Berkas PDF Sertifikat</label>
            <div
              onClick={() => manualFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#005ea4] rounded-xl p-4 text-center bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
            >
              <input
                ref={manualFileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedUploadFile(file);
                    setUploadData(prev => ({ ...prev, fileName: file.name }));

                    if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
                      try {
                        setIsScanningOcr(true);
                        const ocrData = await scanPdfDocument(file);
                        if (ocrData) {
                          setUploadData(prev => ({
                            ...prev,
                            noSertifikat: ocrData.noSertifikat || prev.noSertifikat,
                            terbit: ocrData.terbit || prev.terbit,
                            expired: ocrData.expired || prev.expired,
                            instansi: ocrData.instansi || prev.instansi,
                          }));
                        }
                      } catch (error) {
                        console.error("OCR Error:", error);
                      } finally {
                        setIsScanningOcr(false);
                      }
                    }
                  }
                }}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="text-xs font-bold text-[#005ea4] block">
                {selectedUploadFile ? `✓ Terpilih: ${selectedUploadFile.name}` : 'Klik untuk Memilih File PDF'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Format: PDF, PNG, JPG (Opsional)</span>
            </div>
            {isScanningOcr && (
              <div className="flex items-center gap-2 text-xs font-bold text-[#005ea4] bg-blue-50 p-2.5 rounded-lg border border-blue-200 animate-pulse mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI OCR sedang memindai & mengunduh metadata dokumen...</span>
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
            </form>
            
            {/* Modal Footer terikat dengan Sisi Kiri */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                form="uploadCertForm"
                disabled={isUploadingTemp || isScanningOcr || !selectedUploadFile}
                className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Final (Submit)</span>
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Preview PDF */}
          <div className="hidden md:flex flex-col w-[55%] bg-slate-100 relative">
            <div className="absolute top-0 inset-x-0 h-10 bg-slate-800 flex items-center px-4 text-white font-mono-data text-xs font-bold gap-2 z-10 shadow-md">
              <FileText className="w-4 h-4" />
              Preview PDF (Live Verification)
            </div>
            <div className="flex-1 w-full h-full pt-10 flex flex-col">
              {uploadData.tempUrl ? (
                <PdfCanvasOcrViewer
                  pdfUrl={uploadData.tempUrl}
                  scanMode={scanMode}
                  onScanComplete={handleOcrResult}
                  onScanCancel={() => setScanMode(null)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 opacity-30" />
                  <div>
                    <h5 className="font-bold text-slate-600">Preview Belum Tersedia</h5>
                    <p className="text-xs mt-1 max-w-sm">
                      Silakan pilih file PDF di panel sebelah kiri untuk menampilkan preview dokumen secara langsung di sini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
