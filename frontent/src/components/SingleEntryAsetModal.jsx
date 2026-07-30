import React, { useState, useRef } from 'react';
import { Building2, Save, Upload, FileCheck, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { scanPdfDocument } from '../services/ocrService';
import { API_BASE } from '../config/api';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';

export default function SingleEntryAsetModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    unitLocation: 'Kawasan Industri Bontang',
    luasM2: '1500000',
    luasHa: '150.0',
    peruntukan: 'Area Industri & Kompleks Pabrik',
    status: 'Aktif',
    namaSertifikat: 'Sertifikat Hak Guna Bangunan (HGB)',
    noSertifikat: '',
    terbit: '',
    expired: '',
    keterangan: ''
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
      id: `AST-MANUAL-${Date.now()}`,
      categoryKey: 'perizinan-aset',
      merekItem: formData.title,
      jenisPeralatan: 'Aset & Bangunan',
      code: formData.noSertifikat || `HGB-BPN-${Math.floor(100 + Math.random() * 900)}`,
      lokasi: formData.unitLocation,
      unitLocation: formData.unitLocation,
      user: 'Departemen Aset & Umum',
      status: formData.status,
      namaSertifikat: formData.namaSertifikat,
      noSertifikat: sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (formData.noSertifikat || (selectedFile ? `HGB-BPN-${Math.floor(100 + Math.random() * 900)}` : "BELUM_ADA_SERTIFIKAT")),
      terbit: formData.terbit || new Date().toISOString().split('T')[0],
      expired: formData.expired || '',
      hasCertificatePdf: sertifikatMode === 'dengan' && (!!selectedFile || !!finalUrl),
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      keterangan: sertifikatMode === 'tanpa' ? "Tidak Perlu Sertifikat" : (selectedFile ? `Sertifikat Attached (${selectedFile.name})` : (formData.keterangan || "Data Manual Input"))
    });

    setFormData({
      title: '',
      unitLocation: 'Kawasan Industri Bontang',
      luasM2: '1500000',
      luasHa: '150.0',
      peruntukan: 'Area Industri & Kompleks Pabrik',
      status: 'Aktif',
      namaSertifikat: 'Sertifikat Hak Guna Bangunan (HGB)',
      noSertifikat: '',
      terbit: '',
      expired: '',
      keterangan: ''
    });
    setSelectedFile(null);
    setTempUrl(null);
    onClose();
  };

  return (
    <BaseSplitScreenUploadModal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Data Perizinan Aset & Bangunan Baru"
      subtitle="Lengkapi informasi aset beserta dokumen sertifikat HGB/Legalitas"
      headerIcon={Building2}
      formId="singleEntryAsetForm"
      onSubmit={handleSubmit}
      submitDisabled={isUploadingTemp || isScanningOcr || (sertifikatMode === 'dengan' && !selectedFile)}
      submitText="Simpan Final (Submit)"
      submitIcon={Save}
      tempUrl={tempUrl}
    >
      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setSertifikatMode('dengan')}
          className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            sertifikatMode === 'dengan' ? 'bg-white text-[#005ea4] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Dengan Sertifikat (PDF)</span>
        </button>
        <button
          type="button"
          onClick={() => setSertifikatMode('tanpa')}
          className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            sertifikatMode === 'tanpa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <X className="w-4 h-4 text-amber-600" />
          <span>Tanpa Sertifikat (Exempt)</span>
        </button>
      </div>

      {/* SECTION 1: DATA UTAMA ASET */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Bagian 1: Data Utama Aset</h4>
        
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Nama Aset & Bangunan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text" required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Sertifikat Hak Guna Bangunan (HGB) Lahan Pabrik 1-4"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Lokasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text" required
              value={formData.unitLocation}
              onChange={(e) => setFormData({ ...formData, unitLocation: e.target.value })}
              placeholder="Contoh: Kawasan Industri Bontang"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Status Operasional</label>
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Luas Lahan (m²)</label>
            <input
              type="text"
              value={formData.luasM2}
              onChange={(e) => setFormData({ ...formData, luasM2: e.target.value })}
              placeholder="Contoh: 1500000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Luas Lahan (Ha)</label>
            <input
              type="text"
              value={formData.luasHa}
              onChange={(e) => setFormData({ ...formData, luasHa: e.target.value })}
              placeholder="Contoh: 150.0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Peruntukan</label>
          <input
            type="text"
            value={formData.peruntukan}
            onChange={(e) => setFormData({ ...formData, peruntukan: e.target.value })}
            placeholder="Contoh: Area Industri & Kompleks Pabrik"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>
      </div>

      {/* SECTION 2: DATA SERTIFIKAT */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mt-6">
          Bagian 2: {sertifikatMode === 'dengan' ? 'Data Berkas Sertifikat' : 'Pengecualian Sertifikat'}
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
                            setOcrErrorMsg((!ocrData.noSertifikat && !ocrData.terbit && !ocrData.expired) ? "AI tidak mendeteksi data. Silakan isi form manual." : "");
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Sertifikat</label>
              <input
                type="text"
                value={formData.namaSertifikat}
                onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">No. Sertifikat / HGB <span className="text-rose-500">*</span></label>
              <input
                type="text" required
                value={formData.noSertifikat}
                onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                placeholder="Contoh: HGB-BPN-091"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Terbit / Pengajuan</label>
                <input
                  type="date"
                  value={formData.terbit}
                  onChange={(e) => setFormData({ ...formData, terbit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-rose-700 block mb-1">Tanggal Expired / Masa Berlaku</label>
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
    </BaseSplitScreenUploadModal>
  );
}
