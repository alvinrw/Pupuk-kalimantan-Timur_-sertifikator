import React, { useState, useRef, useEffect } from 'react';
import { X, PlusCircle, Save, Upload, FileCheck, Loader2, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { scanPdfDocument } from '../services/ocrService';
import { API_BASE } from '../config/api';

export default function SingleEntryModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    jenisPeralatan: '',
    merekItem: '',
    tipe: '',
    nomorSeri: '',
    unitPabrik: 'Pabrik 1A',
    lokasiDetail: '',
    penanggungJawab: '',
    status: 'Aktif',
    namaSertifikat: '',
    noSertifikat: '',
    terbit: '',
    expired: '',
    reminderEnabled: true,
    reminderType: 'DAYS',
    reminderDays: 30,
    reminderDate: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [sertifikatMode, setSertifikatMode] = useState('dengan'); // 'dengan' | 'tanpa'
  
  // OCR & Temp Upload States
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      setFormData({
        jenisPeralatan: '', merekItem: '', tipe: '', nomorSeri: '',
        unitPabrik: 'Pabrik 1A', lokasiDetail: '', penanggungJawab: '',
        status: 'Aktif', namaSertifikat: '', noSertifikat: '', terbit: '', expired: '',
        reminderEnabled: true, reminderType: 'DAYS', reminderDays: 30, reminderDate: ''
      });
      setSelectedFile(null);
      setTempUrl(null);
      setSertifikatMode('dengan');
      setIsScanningOcr(false);
      setIsUploadingTemp(false);
      setOcrErrorMsg('');
      setOcrSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalUrl = null;
    if (sertifikatMode === 'dengan') {
      if (tempUrl) {
        try {
          const moveRes = await fetch(`${API_BASE}/document-history/move-temp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
          const uploadRes = await fetch(`${API_BASE}/document-history/upload`, {
            method: 'POST',
            body: fd
          });
          if (uploadRes.ok) {
            const json = await uploadRes.json();
            finalUrl = json.data?.url || null;
          }
        } catch(err) {}
      }
    }

    onAddSuccess({
      ...formData,
      file: sertifikatMode === 'dengan' ? selectedFile : null,
      fileUrl: finalUrl,
      id: `EQ-MANUAL-${Date.now()}`,
      namaSertifikat: formData.namaSertifikat,
      noSertifikat: sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (formData.noSertifikat || (selectedFile ? `CERT-AUTO-${Math.floor(1000 + Math.random() * 9000)}` : "BELUM_ADA_SERTIFIKAT")),
      tanggalInspeksi: formData.terbit || new Date().toISOString().split('T')[0],
      terbit: formData.terbit || new Date().toISOString().split('T')[0],
      berakhir: formData.expired || '',
      hasCertificatePdf: sertifikatMode === 'dengan' && !!selectedFile,
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      keterangan: sertifikatMode === 'tanpa' ? "Tidak Perlu Sertifikat" : (selectedFile ? `Sertifikat Attached (${selectedFile.name})` : "Data Manual Input")
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#005ea4] text-white flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Input Data Perizinan Peralatan Baru (Human Verification)
              </h3>
              <p className="text-[11px] text-blue-300 font-mono-data mt-0.5">
                Pastikan form master data sesuai dengan dokumen yang diunggah
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
            <div className="p-4 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSertifikatMode('dengan')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${sertifikatMode === 'dengan'
                      ? 'bg-white text-[#005ea4] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Dengan Sertifikat (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSertifikatMode('tanpa')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${sertifikatMode === 'tanpa'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <X className="w-4 h-4 text-amber-600" />
                  <span>Tanpa Sertifikat</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-xs font-mono-data">
              <form id="singleEntryForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* SECTION 1: MASTER DATA */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Bagian 1: Data Utama Aset</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Merek / Nama Peralatan <span className="text-rose-500">*</span></label>
                      <input
                        type="text" required
                        value={formData.merekItem}
                        onChange={(e) => setFormData({ ...formData, merekItem: e.target.value })}
                        placeholder="Contoh: Crane Kapasitas 5T"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Jenis Peralatan <span className="text-rose-500">*</span></label>
                      <input
                        type="text" required
                        value={formData.jenisPeralatan}
                        onChange={(e) => setFormData({ ...formData, jenisPeralatan: e.target.value })}
                        placeholder="Contoh: Overhead Crane"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tipe</label>
                      <input
                        type="text"
                        value={formData.tipe}
                        onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nomor Seri</label>
                      <input
                        type="text"
                        value={formData.nomorSeri}
                        onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Unit Pabrik</label>
                      <input
                        type="text"
                        value={formData.unitPabrik}
                        onChange={(e) => setFormData({ ...formData, unitPabrik: e.target.value })}
                        placeholder="Contoh: Pabrik 1A"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Lokasi</label>
                      <input
                        type="text"
                        value={formData.lokasiDetail}
                        onChange={(e) => setFormData({ ...formData, lokasiDetail: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab</label>
                      <input
                        type="text"
                        value={formData.penanggungJawab}
                        onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-[#005ea4]"
                      >
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
                  
                  {sertifikatMode === 'tanpa' ? (
                     <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-800 font-medium">Aset ini dicatat tanpa dokumen sertifikat terlampir.</p>
                     </div>
                  ) : (
                    <>
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
                                      setFormData(prev => ({
                                        ...prev,
                                        namaSertifikat: ocrData.namaSertifikat || prev.namaSertifikat,
                                        noSertifikat: ocrData.noSertifikat || prev.noSertifikat || '',
                                        terbit: ocrData.terbit || prev.terbit || '',
                                        expired: ocrData.expired || prev.expired || '',
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
                              {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : 'Pilih File PDF Dokumen'}
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

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Nama sertifikat</label>
                        <input
                          type="text"
                          value={formData.namaSertifikat}
                          onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">No. Sertifikat <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.noSertifikat}
                          onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Terbit</label>
                          <input
                            type="date"
                            value={formData.terbit}
                            onChange={(e) => setFormData({ ...formData, terbit: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-rose-700 block mb-1">Tanggal Berakhir</label>
                          <input
                            type="date"
                            value={formData.expired}
                            onChange={(e) => setFormData({ ...formData, expired: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </form>
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
              <button
                type="submit"
                form="singleEntryForm"
                disabled={isUploadingTemp || isScanningOcr || (sertifikatMode === 'dengan' && !selectedFile)}
                className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
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
              {sertifikatMode === 'dengan' && tempUrl ? (
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
