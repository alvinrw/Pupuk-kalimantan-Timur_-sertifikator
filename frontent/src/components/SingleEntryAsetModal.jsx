import React, { useState, useRef } from 'react';
import { Building2, Save, Upload, FileCheck, Loader2, AlertTriangle, CheckCircle, X, Crosshair } from 'lucide-react';
import { API_BASE, getFullFileUrl } from '../config/api';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';
import PdfCanvasOcrViewer from './common/PdfCanvasOcrViewer';

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
  
  // Temp Upload States
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalUrl = null;

    if (sertifikatMode === 'dengan') {
      if (tempUrl) {
        try {
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
        } catch(err) {
          console.error("Gagal move file", err);
        }
      } else if (selectedFile) {
        try {
          const fd = new FormData();
          fd.append('file', selectedFile);
          const token = sessionStorage.getItem('token');
          const uploadRes = await fetch(`${API_BASE}/document-history/upload`, {
            method: 'POST',
            body: fd,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
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
      noSertifikat: formData.noSertifikat || (sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (selectedFile ? `HGB-BPN-${Math.floor(100 + Math.random() * 900)}` : "BELUM_ADA_SERTIFIKAT")),
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
    setIsUploadingTemp(false);
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
      submitDisabled={isUploadingTemp}
      submitText="Simpan Final (Submit)"
      submitIcon={Save}
      tempUrl={tempUrl}
      rightPanelContent={
        tempUrl ? (
          <PdfCanvasOcrViewer
            pdfUrl={tempUrl ? getFullFileUrl(tempUrl) : null}
            scanMode={scanMode}
            onScanComplete={handleOcrResult}
            onScanCancel={() => setScanMode(null)}
          />
        ) : null
      }
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
        
        {sertifikatMode === 'dengan' && (
          <>
            <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat HGB/Legalitas (Opsional)</label>
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
                      }
                    }
                  }}
                  className="hidden"
                  disabled={isUploadingTemp}
                />
                <Upload className="w-6 h-6 text-[#005ea4] mx-auto mb-1" />
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-[#005ea4]">
                    {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : 'Pilih File PDF Dokumen'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">Hanya format PDF</span>
                </div>
              </div>

              {isUploadingTemp && (
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                    <span>Menyiapkan preview dokumen...</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Lokasi / Area</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="misal: Kawasan Industri Kaltim Zone 1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Luas (mÃƒâ€šÃ‚Â²)</label>
              <input
                type="number"
                value={formData.areaSqm}
                onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                placeholder="100000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-mono-data"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Luas (Ha)</label>
              <input
                type="number"
                step="0.01"
                value={formData.areaHa}
                onChange={(e) => setFormData({ ...formData, areaHa: e.target.value })}
                placeholder="10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-mono-data"
                required
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
