import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, Loader2, Sparkles, AlertTriangle, CheckCircle, Crosshair } from 'lucide-react';
import { API_BASE } from '../../config/api';
import PdfCanvasOcrViewer from '../common/PdfCanvasOcrViewer';

/**
 * UploadRenewalModal ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Modal "Selesai & Upload Sertifikat Baru" untuk MonitoringSertifikasi.
 */
export default function UploadRenewalModal({
  activeModalItem, onClose,
  uploadedFile, isOcrScanning, ocrSuccess, ocrErrorMsg,
  handleFileSelect,
  newCertNumber, setNewCertNumber,
  inspectionDate, setInspectionDate,
  issueDate, setIssueDate,
  newExpiryDate, setNewExpiryDate,
  resertifikasiNotes, setResertifikasiNotes,
  handleConfirmUploadRenewal
}) {
  if (!activeModalItem) return null;

  // Local state for temp uploading
  const [tempUrl, setTempUrl] = useState(null);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scanMode, setScanMode] = useState(null);

  const handleOcrResult = async (fieldKey, rawText) => {
    try {
      const { parseDate, parseCertificateNumber } = await import('../../utils/ocrTextParser');
      
      if (fieldKey === 'noSertifikat') {
        const certNo = parseCertificateNumber(rawText);
        setNewCertNumber(certNo || rawText.replace(/\n+/g, ' ').trim());
      } else if (fieldKey === 'terbit') {
        const parsed = parseDate(rawText);
        if (parsed) setIssueDate(parsed.iso);
      } else if (fieldKey === 'expired') {
        const parsed = parseDate(rawText);
        if (parsed) setNewExpiryDate(parsed.iso);
      }
      
      setScanMode(null);
    } catch (err) {
      console.error("Gagal memproses hasil OCR:", err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploadingTemp || isOcrScanning) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploadingTemp || isOcrScanning) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Mock event object for onFileChange
      onFileChange({ target: { files: [file] } });
    }
  };

  // Intercept file selection to upload to temp bucket
  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // call parent's handleFileSelect first to update their state (if they do anything)
      handleFileSelect(e);
      
      setTempUrl(null);
      if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          setIsUploadingTemp(true);
          const fd = new FormData();
          fd.append('file', file);
          const uploadRes = await fetch(`${API_BASE}/document-history/upload-temp`, {
            method: 'POST',
            body: fd
          });
          if (uploadRes.ok) {
            const json = await uploadRes.json();
            setTempUrl(json.data.url);
          }
        } catch (err) {
          console.error('Upload temp error:', err);
        } finally {
          setIsUploadingTemp(false);
        }
      }
    }
  };

  const onSubmitWrap = async (e) => {
    e.preventDefault();
    if (tempUrl) {
      try {
        await fetch(`${API_BASE}/document-history/move-temp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempUrl })
        });
      } catch (err) {
        console.error('Move temp error:', err);
      }
    }
    handleConfirmUploadRenewal(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h4 className="font-bold text-sm">Konfirmasi Selesai & Upload Sertifikat Baru (Human Verification)</h4>
            <p className="text-[11px] text-blue-300 font-mono-data mt-0.5">{activeModalItem.merekItem}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Screen */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          
          {/* Sisi Kiri: Form Input & OCR */}
          <div className="w-full md:w-[45%] flex flex-col min-h-0 border-r border-slate-200">
            <form id="uploadRenewalForm" onSubmit={onSubmitWrap} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-mono-data">
              
              <div>
                <label className="font-bold text-slate-900 block mb-1.5">
                  1. Upload File Sertifikat Baru (Wajib) <span className="text-rose-500">*</span>
                </label>
                <div
                  onDragEnter={handleDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (isUploadingTemp || isOcrScanning) return;
                    document.getElementById('cert-file-input-monitoring').click();
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    (isUploadingTemp || isOcrScanning) 
                      ? 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-70' 
                      : isDragging
                      ? 'border-[#005ea4] bg-blue-50'
                      : 'border-slate-300 hover:border-[#005ea4] bg-slate-50 hover:bg-blue-50/50 cursor-pointer'
                  }`}
                >
                  <input
                    type="file"
                    id="cert-file-input-monitoring"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={onFileChange}
                    className="hidden"
                    disabled={isUploadingTemp || isOcrScanning}
                  />
                  <UploadCloud className="w-6 h-6 text-[#005ea4] mx-auto mb-1 pointer-events-none" />
                  <div className="flex flex-col items-center pointer-events-none">
                    <span className="text-xs font-bold text-[#005ea4]">
                      {isDragging ? 'Lepaskan file di sini...' : (uploadedFile ? `✅ Terpilih: ${uploadedFile.name}` : 'Klik atau Drag & Drop File Sertifikat')}
                    </span>
                    {uploadedFile ? (
                      <span className="text-[10px] text-slate-500 mt-1">Klik atau Drag & Drop file lain untuk mengganti</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 mt-1">Format: PDF, PNG, JPG (Maks. 10MB)</span>
                    )}
                  </div>
                </div>

                {(isUploadingTemp || isOcrScanning) && (
                  <div className="flex flex-col gap-2 mt-3">
                    {isUploadingTemp && (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                        <span>Menyiapkan preview dokumen...</span>
                      </div>
                    )}
                    {isOcrScanning && (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#005ea4] bg-blue-50 p-2.5 rounded-lg border border-blue-200 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                        <span>AI sedang mengekstrak data dari dokumen...</span>
                      </div>
                    )}
                  </div>
                )}
                
              <div>
              <label className="font-bold text-slate-900 block mb-1">
                2. Nomor Sertifikat Baru <span className="text-[10px] font-normal text-slate-500">(Auto-OCR / Editable)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCertNumber}
                  onChange={(e) => setNewCertNumber(e.target.value)}
                  placeholder="Nomor SK / Sertifikat baru..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">3. Tgl Terbit SK</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date" required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
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
                  <label className="font-bold text-slate-900 block mb-1 text-rose-700">4. Tgl Expired Baru</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date" required
                      value={newExpiryDate}
                      onChange={(e) => setNewExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
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

              <div>
                <label className="font-bold text-slate-900 block mb-1">6. Catatan Verifikasi</label>
                <textarea
                  rows="2" required
                  value={resertifikasiNotes}
                  onChange={(e) => setResertifikasiNotes(e.target.value)}
                  placeholder="Misal: Perpanjangan selesai..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>

            </form>
            
            {/* Modal Footer terikat dengan Sisi Kiri */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                form="uploadRenewalForm"
                disabled={!uploadedFile || isUploadingTemp || isOcrScanning}
                className="px-5 py-2 bg-[#00a368] hover:bg-[#008f5a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Konfirmasi & Simpan Sertifikat Baru</span>
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Preview PDF */}
          <div className="hidden md:flex flex-col w-[55%] bg-slate-100 relative">
            <div className="absolute top-0 inset-x-0 h-10 bg-slate-800 flex items-center px-4 text-white font-mono-data text-xs font-bold gap-2 z-10 shadow-md">
              <FileText className="w-4 h-4" />
              Preview PDF (Live Verification)
            </div>
            <div className="flex-1 w-full h-full pt-10">
              {tempUrl ? (
                <PdfCanvasOcrViewer
                  pdfUrl={tempUrl}
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
