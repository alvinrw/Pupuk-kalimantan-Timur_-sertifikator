import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileWarning, AlertTriangle, ShieldAlert, FileText, Loader2, CheckCircle } from 'lucide-react';
import { resolveMasterItemExemption, createCertificateForMasterItem } from '../services/masterItemsService';
import { scanPdfDocument } from '../services/ocrService';
import { API_BASE } from '../config/api';

export default function ResolveDocumentModal({ isOpen, onClose, item, onSuccess }) {
  const [option, setOption] = useState('upload'); // 'upload' | 'exempt'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State Opsi A (Upload PDF / Input Sertifikat)
  const [noSertifikat, setNoSertifikat] = useState('');
  const [jenisSertifikat, setJenisSertifikat] = useState('Riksa Uji Disnaker');
  const [terbit, setTerbit] = useState('');
  const [expired, setExpired] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // OCR & Temp Storage
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);

  const fileInputRef = useRef(null);

  // Form State Opsi B (Exempt + Catatan Alasan)
  const [exemptionNote, setExemptionNote] = useState('');

  // Form State Notifikasi Pengingat (Staging/Resolve)
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [triggerType, setTriggerType] = useState('DAYS');
  const [reminderDays, setReminderDays] = useState(30);
  const [triggerDate, setTriggerDate] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNoSertifikat('');
      setTerbit('');
      setExpired('');
      setSelectedFile(null);
      setTempUrl(null);
      setIsScanningOcr(false);
      setIsUploadingTemp(false);
      setOcrErrorMsg('');
      setOcrSuccess(false);
      setOption('upload');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const targetItemId = item.MasterId || item.id;
  const itemTitle = item.jenisPeralatan || item.title || 'Aset';
  const itemCode = item.merekItem || item.code || '-';

  const handleExemptSubmit = async (e) => {
    e.preventDefault();
    if (!exemptionNote.trim()) {
      setErrorMessage('Wajib mengisi catatan alasan mengapa aset ini tidak memerlukan sertifikat!');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await resolveMasterItemExemption(targetItemId, exemptionNote.trim());

      await fetch(`${API_BASE}/master-items/${targetItemId}/notification-setting`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: reminderEnabled,
          triggerType: triggerType,
          triggerDays: parseInt(reminderDays) || 30,
          triggerDate: triggerType === 'DATE' ? triggerDate : null
        })
      }).catch(err => console.error('Error saving notification setting:', err));

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error resolving exemption:', err);
      setErrorMessage(err.message || 'Gagal menyimpan catatan penanganan dokumen.');
      setIsSubmitting(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!noSertifikat.trim()) {
      setErrorMessage('Nomor Sertifikat wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      let fileUrl = null;
      
      if (tempUrl) {
        const moveRes = await fetch(`${API_BASE}/document-history/move-temp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempUrl })
        });
        if (moveRes.ok) {
          const moveJson = await moveRes.json();
          fileUrl = moveJson?.data?.url || null;
        } else {
          throw new Error('Gagal memindahkan file dari temporary ke final storage');
        }
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch(`${API_BASE}/document-history/upload`, {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          fileUrl = uploadJson?.data?.url || uploadJson?.data?.fileUrl || uploadJson?.data?.path || null;
        }
      }

      const payload = {
        itemId: targetItemId,
        jenisSertifikat: item.jenisPeralatan || item.jenisCiptaan || item.title || 'Sertifikat Perizinan',
        noSertifikat: noSertifikat.trim(),
        status: 'Aktif',
      };
      if (terbit) payload.terbit = terbit;
      if (expired) payload.expired = expired;
      if (fileUrl) payload.fileUrl = fileUrl;

      await createCertificateForMasterItem(payload);

      await fetch(`${API_BASE}/master-items/${targetItemId}/notification-setting`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: reminderEnabled,
          triggerType: triggerType,
          triggerDays: parseInt(reminderDays) || 30,
          triggerDate: triggerType === 'DATE' ? triggerDate : null
        })
      }).catch(err => console.error('Error saving notification setting:', err));

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error uploading certificate:', err);
      setErrorMessage(err.message || 'Gagal menambahkan sertifikat.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-amber-500" />
              Selesaikan Tugas (Human Verification)
            </h3>
            <p className="text-[11px] text-blue-300 font-mono-data mt-0.5">
              {itemCode} — <span className="font-bold text-white">{itemTitle}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Screen */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          
          {/* Sisi Kiri: Form Input & OCR */}
          <div className="w-full md:w-[45%] flex flex-col min-h-0 border-r border-slate-200">
            <div className="p-4 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setOption('upload'); setErrorMessage(''); }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${option === 'upload'
                      ? 'bg-white text-[#005ea4] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Unggah Sertifikat PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setOption('exempt'); setErrorMessage(''); }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${option === 'exempt'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Tanpa Sertifikat</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-xs font-mono-data">
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Opsi A: Unggah PDF Sertifikat */}
              {option === 'upload' && (
                <form id="resolveFormUpload" onSubmit={handleUploadSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat</label>
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
                            setSelectedFile(file);
                            setTempUrl(null);
                            setOcrSuccess(false);

                            if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
                              try {
                                setIsUploadingTemp(true);
                                const fdTemp = new FormData();
                                fdTemp.append('file', file);
                                const uploadRes = await fetch(`${API_BASE}/document-history/upload-temp`, {
                                  method: 'POST',
                                  body: fdTemp
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
                                  setNoSertifikat(ocrData.noSertifikat || noSertifikat || '');
                                  setTerbit(ocrData.terbit || terbit || '');
                                  setExpired(ocrData.expired || expired || '');
                                  
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
                      <Upload className="w-6 h-6 text-[#005ea4] mx-auto mb-1" />
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-[#005ea4]">
                          {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : 'Pilih File PDF Dokumen'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          Hanya menerima format PDF
                        </span>
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
                            <span>AI sedang memindai & mengekstrak data dari dokumen...</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {ocrSuccess && !isScanningOcr && (
                      <div className="flex items-start gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mt-2">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>AI berhasil mengisi form! Harap verifikasi data dengan preview PDF.</span>
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nomor Sertifikat / SK <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={noSertifikat}
                      onChange={(e) => setNoSertifikat(e.target.value)}
                      placeholder="Contoh: SKP-2024/1234"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Terbit</label>
                      <input
                        type="date"
                        value={terbit}
                        onChange={(e) => setTerbit(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-rose-700 block mb-1">Tanggal Expired</label>
                      <input
                        type="date"
                        value={expired}
                        onChange={(e) => setExpired(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* Form Opsi B: Exempt */}
              {option === 'exempt' && (
                <form id="resolveFormExempt" onSubmit={handleExemptSubmit} className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      Gunakan opsi ini jika dokumen perizinan tersebut sudah tidak diwajibkan lagi, aset sudah afkir, atau ada kondisi khusus yang menyebabkan item ini tidak memerlukan sertifikat.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Catatan / Alasan Pengecualian <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={exemptionNote}
                      onChange={(e) => setExemptionNote(e.target.value)}
                      placeholder="Contoh: Mesin ini sudah tidak beroperasi sejak bulan lalu..."
                      rows="4"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                    ></textarea>
                  </div>
                </form>
              )}
            </div>
            
            {/* Modal Footer terikat dengan Sisi Kiri */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 cursor-pointer text-xs"
              >
                Batal
              </button>
              {option === 'upload' ? (
                <button
                  type="submit"
                  form="resolveFormUpload"
                  disabled={isSubmitting || isUploadingTemp || isScanningOcr || !selectedFile}
                  className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Simpan Final (Submit)</span>
                </button>
              ) : (
                <button
                  type="submit"
                  form="resolveFormExempt"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>Tandai Selesai (Tanpa Sertifikat)</span>
                </button>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Preview PDF */}
          <div className="hidden md:flex flex-col w-[55%] bg-slate-100 relative">
            <div className="absolute top-0 inset-x-0 h-10 bg-slate-800 flex items-center px-4 text-white font-mono-data text-xs font-bold gap-2 z-10 shadow-md">
              <FileText className="w-4 h-4" />
              Preview PDF (Live Verification)
            </div>
            <div className="flex-1 w-full h-full pt-10">
              {option === 'upload' && tempUrl ? (
                <iframe
                  src={`${tempUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 opacity-30" />
                  <div>
                    <h5 className="font-bold text-slate-600">
                      {option === 'upload' ? 'Preview Belum Tersedia' : 'Opsi Tanpa Sertifikat'}
                    </h5>
                    <p className="text-xs mt-1 max-w-sm">
                      {option === 'upload' 
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
