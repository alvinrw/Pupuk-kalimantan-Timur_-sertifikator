/**
 * ModalAddLinkedCert - Modal tambah sertifikat terhubung baru.
 * Dipisah dari DocumentDetailPage (sebelumnya ~200 baris inline).
 */
import React, { useState, useRef, useEffect } from 'react';
import { X, Link2, CheckSquare, Upload, CheckCircle, Loader2, AlertTriangle, FileText, ShieldAlert, Crosshair } from 'lucide-react';
import { UPLOAD_ENDPOINT, API_BASE } from '../../config/api';
import { scanPdfDocument } from '../../services/ocrService';
import PdfCanvasOcrViewer from '../common/PdfCanvasOcrViewer';

export default function ModalAddLinkedCert({ isOpen, onClose, onSave }) {
  const [certData, setCertData] = useState({
    jenisSertifikat: '', noSertifikat: '', instansi: '',
    terbit: '', expired: '', status: 'Aktif', pdfName: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sertifikatMode, setSertifikatMode] = useState('dengan'); // 'dengan' | 'tanpa'
  
  // OCR & Temp Storage
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);
  const [scanMode, setScanMode] = useState(null);

  const fileInputRef = useRef(null);

  const handleOcrResult = (text) => {
    if (!text || !scanMode) {
      setScanMode(null);
      return;
    }
    setCertData(prev => ({
      ...prev,
      [scanMode]: text.trim()
    }));
    setScanMode(null);
  };

  useEffect(() => {
    if (!isOpen) {
      setCertData({ jenisSertifikat: '', noSertifikat: '', instansi: '', terbit: '', expired: '', status: 'Aktif', pdfName: '' });
      setPdfFile(null);
      setTempUrl(null);
      setSertifikatMode('dengan');
      setIsScanningOcr(false);
      setIsUploadingTemp(false);
      setOcrErrorMsg('');
      setOcrSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalUrl = null;
      if (sertifikatMode === 'dengan' && tempUrl) {
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
      }

      await onSave({
        certPayload: {
          jenisSertifikat: certData.jenisSertifikat,
          noSertifikat: certData.noSertifikat || (sertifikatMode === 'tanpa' ? 'Tanpa Sertifikat' : `CERT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`),
          instansi: certData.instansi || null,
          terbit: certData.terbit || undefined,
          expired: certData.expired || undefined,
          status: certData.status || 'Aktif',
          fileUrl: finalUrl // pass this if needed by parent hook
        },
        pdfFile: sertifikatMode === 'dengan' && !finalUrl ? pdfFile : null, // fallback if tempUrl failed
      });
      handleClose();
    } catch (err) {
      // Error handled by parent hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#005ea4] flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Tambah Sertifikat Terhubung (Human Verification)</h4>
              <p className="text-[11px] text-blue-300 font-mono-data">Hubungkan jenis perizinan / sertifikat baru ke item ini</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Screen */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          
          {/* Sisi Kiri: Form Input & OCR */}
          <div className="w-full md:w-[45%] flex flex-col min-h-0 border-r border-slate-200">
            <div className="p-4 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSertifikatMode('dengan')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    sertifikatMode === 'dengan'
                      ? 'bg-[#005ea4] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Dengan Berkas (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSertifikatMode('tanpa')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    sertifikatMode === 'tanpa'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Tanpa Sertifikat</span>
                </button>
              </div>
            </div>

            <form id="addLinkedCertForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-mono-data">
              {sertifikatMode === 'dengan' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat <span className="text-rose-500">*</span></label>
                  <div
                    onClick={() => {
                      if (isUploadingTemp || isScanningOcr) return;
                      fileInputRef.current?.click();
                    }}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                      (isUploadingTemp || isScanningOcr) 
                        ? 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-70' 
                        : 'border-slate-300 hover:border-[#005ea4] bg-slate-50 hover:bg-blue-50/50 cursor-pointer'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setPdfFile(file);
                          setCertData(prev => ({ ...prev, pdfName: file.name }));
                          setTempUrl(null);
                          setOcrSuccess(false);

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
                              console.error('Upload temp error:', err);
                            } finally {
                              setIsUploadingTemp(false);
                            }

                            try {
                              setIsScanningOcr(true);
                              const ocrData = await scanPdfDocument(file);
                              if (ocrData) {
                                setCertData(prev => ({
                                  ...prev,
                                  jenisSertifikat: ocrData.jenisSertifikat || prev.jenisSertifikat || '',
                                  noSertifikat: ocrData.noSertifikat || prev.noSertifikat || '',
                                  terbit: ocrData.terbit || prev.terbit || '',
                                  expired: ocrData.expired || prev.expired || '',
                                  instansi: ocrData.instansi || prev.instansi || '',
                                }));
                                
                                setOcrSuccess(true);
                                
                                if (!ocrData.noSertifikat && !ocrData.terbit && !ocrData.expired) {
                                  setOcrErrorMsg("AI tidak mendeteksi data. Silakan isi form manual.");
                                } else {
                                  setOcrErrorMsg("");
                                }
                              }
                            } catch (err) {
                              setOcrErrorMsg("Gagal memindai OCR. Anda dapat mengetik manual.");
                            } finally {
                              setIsScanningOcr(false);
                            }
                          }
                        }
                      }}
                      className="hidden"
                      disabled={isUploadingTemp || isScanningOcr}
                    />
                    <Upload className="w-6 h-6 text-[#005ea4] mx-auto mb-1" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-[#005ea4]">
                        {pdfFile ? `✓ Terpilih: ${pdfFile.name}` : 'Pilih File PDF Dokumen'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">Hanya format PDF</span>
                    </div>
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
                          <span>AI sedang mengekstrak data...</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {ocrSuccess && !isScanningOcr && (
                    <div className="flex items-start gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mt-2">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>AI berhasil mengisi form! Verifikasi kembali dengan preview PDF.</span>
                    </div>
                  )}

                  {ocrErrorMsg && (
                    <div className="flex items-start gap-2 text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{ocrErrorMsg}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Jenis / Nama Sertifikat <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text" required
                    value={certData.jenisSertifikat}
                    onChange={(e) => setCertData({ ...certData, jenisSertifikat: e.target.value })}
                    placeholder="Contoh: PBG, SLF, HGB, Amdal"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                  />
                  <button
                    type="button"
                    onClick={() => setScanMode(scanMode === 'jenisSertifikat' ? null : 'jenisSertifikat')}
                    className={`p-2 rounded-lg border shrink-0 transition-all ${
                      scanMode === 'jenisSertifikat' 
                      ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                      : 'bg-blue-50 border-blue-200 text-[#005ea4] hover:bg-blue-100'
                    }`}
                    title="Drag-select Jenis Sertifikat"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  No. SK / Sertifikat (Opsional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={certData.noSertifikat}
                    onChange={(e) => setCertData({ ...certData, noSertifikat: e.target.value })}
                    placeholder="Contoh: PBG-64.74/DPMPTSP/2024"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-[#005ea4] font-bold"
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
                <label className="font-bold text-slate-800 block mb-1">Instansi Penerbit</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={certData.instansi}
                    onChange={(e) => setCertData({ ...certData, instansi: e.target.value })}
                    placeholder="Contoh: DPMPTSP Kota Bontang, BPN"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
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
                      value={certData.terbit}
                      onChange={(e) => setCertData({ ...certData, terbit: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
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
                      value={certData.expired}
                      onChange={(e) => setCertData({ ...certData, expired: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                    />
                    <button
                      type="button"
                      onClick={() => setScanMode(scanMode === 'expired' ? null : 'expired')}
                      className={`p-2 rounded-lg border shrink-0 transition-all ${
                        scanMode === 'expired' 
                        ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title="Drag-select Tgl Expired"
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Status</label>
                <select
                  value={certData.status}
                  onChange={(e) => setCertData({ ...certData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-slate-800"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Diperpanjang">Diperpanjang</option>
                  <option value="Habis Masa Berlaku">Habis Masa Berlaku</option>
                  <option value="Dicabut">Dicabut / Dibatalkan</option>
                </select>
              </div>
            </form>
            
            {/* Modal Footer terikat dengan Sisi Kiri */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                form="addLinkedCertForm"
                disabled={isSubmitting || isUploadingTemp || isScanningOcr || (sertifikatMode === 'dengan' && !pdfFile)}
                className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Sertifikat'}
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
              {sertifikatMode === 'dengan' && tempUrl ? (
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
                    <h5 className="font-bold text-slate-600">
                      {sertifikatMode === 'dengan' ? 'Preview Belum Tersedia' : 'Mode Tanpa Sertifikat Aktif'}
                    </h5>
                    <p className="text-xs mt-1 max-w-sm">
                      {sertifikatMode === 'dengan' 
                        ? 'Silakan pilih file PDF di panel sebelah kiri untuk menampilkan preview dokumen secara langsung di sini.'
                        : 'Tidak ada dokumen yang diunggah untuk pratinjau.'}
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
