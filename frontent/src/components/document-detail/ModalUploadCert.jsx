import React, { useRef, useState, useEffect } from 'react';
import { X, UploadCloud, Save, Upload, Loader2, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { scanPdfDocument } from '../../services/ocrService';
import { API_BASE } from '../../config/api';

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

  useEffect(() => {
    if (!isOpen) {
      setIsScanningOcr(false);
      setIsUploadingTemp(false);
      setOcrErrorMsg('');
      setOcrSuccess(false);
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
                Silakan verifikasi hasil pembacaan AI dengan dokumen PDF asli di sebelah kanan.
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

                          // 2. Scan OCR (Paralel)
                          try {
                            setIsScanningOcr(true);
                            const ocrData = await scanPdfDocument(file);
                            if (ocrData) {
                              setUploadData(prev => ({
                                ...prev,
                                noSertifikat: ocrData.noSertifikat || prev.noSertifikat || '',
                                terbit: ocrData.terbit || prev.terbit || '',
                                expired: ocrData.expired || prev.expired || '',
                                instansi: ocrData.instansi || prev.instansi || '',
                              }));
                              
                              setOcrSuccess(true);
                              
                              if (!ocrData.noSertifikat && !ocrData.terbit && !ocrData.expired) {
                                setOcrErrorMsg("AI tidak dapat mendeteksi informasi penting. Silakan verifikasi form secara manual.");
                              } else {
                                setOcrErrorMsg("");
                              }
                            }
                          } catch (err) {
                            console.error("Gagal scan AI:", err);
                            setOcrErrorMsg("Gagal melakukan pemindaian OCR. Anda dapat mengetik manual.");
                          } finally {
                            setIsScanningOcr(false);
                          }
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
                
                {ocrSuccess && !isScanningOcr && (
                  <div className="flex items-start gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mt-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>AI berhasil mengisi form! Harap lakukan Human Verification dengan mencocokkan data form dengan preview PDF.</span>
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
                <input
                  type="text"
                  required
                  value={uploadData.noSertifikat}
                  onChange={(e) => setUploadData({ ...uploadData, noSertifikat: e.target.value })}
                  placeholder="Contoh: SKP-2024/DISNAKER/1234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Instansi Penerbit / Penguji</label>
                <input
                  type="text"
                  value={uploadData.instansi}
                  onChange={(e) => setUploadData({ ...uploadData, instansi: e.target.value })}
                  placeholder="Contoh: Disnaker Kaltim, Sucofindo, BKI"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tgl Terbit</label>
                  <input
                    type="date"
                    value={uploadData.terbit}
                    onChange={(e) => setUploadData({ ...uploadData, terbit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired</label>
                  <input
                    type="date"
                    value={uploadData.expired}
                    onChange={(e) => setUploadData({ ...uploadData, expired: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
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
            <div className="flex-1 w-full h-full pt-10">
              {uploadData.tempUrl ? (
                <iframe
                  src={`${uploadData.tempUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Preview"
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
