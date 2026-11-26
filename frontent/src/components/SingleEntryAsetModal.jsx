import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Building2, Save, Upload, FileCheck, Loader2, AlertTriangle, CheckCircle, X, Crosshair, ShieldAlert } from 'lucide-react';
import { API_BASE, getFullFileUrl } from '../config/api';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';
import PdfCanvasOcrViewer from './common/PdfCanvasOcrViewer';
import StatusDropdown from './common/StatusDropdown';

export default function SingleEntryAsetModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    unitLocation: '',
    luasM2: '',
    luasHa: '',
    peruntukan: '',
    status: 'Aktif',
    namaSertifikat: '',
    noSertifikat: '',
    terbit: '',
    expired: '',
    keterangan: '',
    exemptionNote: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        unitLocation: '',
        luasM2: '',
        luasHa: '',
        peruntukan: '',
        status: 'Aktif',
        namaSertifikat: '',
        noSertifikat: '',
        terbit: '',
        expired: '',
        keterangan: ''
      });
      setSelectedFile(null);
      setTempUrl(null);
      setScanMode(null);
    }
  }, [isOpen]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [sertifikatMode, setSertifikatMode] = useState('dengan'); // 'dengan' | 'tanpa'
  
  // Temp Upload States
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);

  const fileInputRef = useRef(null);

  // ─── OCR Drag-Scan State ──────────────────────────────────────
  const [scanMode, setScanMode] = useState(null); // 'namaSertifikat' | 'noSertifikat' | null

  const handleOcrResult = useCallback(async (fieldKey, rawText) => {
    const { parseCertificateNumber } = await import('../utils/ocrTextParser');
    if (fieldKey === 'namaSertifikat') {
      const cleaned = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 100);
      if (cleaned) setFormData(prev => ({ ...prev, namaSertifikat: cleaned }));
    } else if (fieldKey === 'noSertifikat') {
      const certNo = parseCertificateNumber(rawText);
      const cleaned = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 80);
      if (certNo) setFormData(prev => ({ ...prev, noSertifikat: certNo }));
      else if (cleaned) setFormData(prev => ({ ...prev, noSertifikat: cleaned }));
    }
    setScanMode(null);
  }, []);

  // ─── ScanButton Component ─────────────────────────────────────
  const ScanButton = ({ fieldKey, label }) => {
    const isActive = scanMode === fieldKey;
    return (
      <button
        type="button"
        title={!tempUrl ? 'Upload PDF dulu' : (isActive ? 'Klik untuk batal scan' : `Scan ${label} dari PDF`)}
        onClick={() => { if (tempUrl) setScanMode(isActive ? null : fieldKey); }}
        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border-2 transition-all ${
          !tempUrl
            ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
            : isActive
              ? 'border-[#005ea4] bg-[#005ea4] text-white shadow-md shadow-[#005ea4]/30 animate-pulse'
              : 'border-slate-300 text-slate-500 hover:border-[#005ea4] hover:text-[#005ea4] hover:bg-blue-50 cursor-pointer'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M4 4h4M4 4v4M20 4h-4M20 4v4M4 20h4M4 20v-4M20 20h-4M20 20v-4" strokeLinecap="round" />
        </svg>
      </button>
    );
  };

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
            terbit: sertifikatMode === 'tanpa' ? undefined : (formData.terbit || new Date().toISOString().split('T')[0]),
      expired: sertifikatMode === 'tanpa' ? undefined : (formData.expired || ''),
      hasCertificatePdf: sertifikatMode === 'dengan' && (!!selectedFile || !!finalUrl),
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      exemptionNote: sertifikatMode === 'tanpa' ? (formData.exemptionNote || formData.keterangan || 'Dikecualikan dari kewajiban sertifikat') : undefined,
      keterangan: (formData.keterangan || '').trim() || (sertifikatMode === 'tanpa' ? (formData.exemptionNote || "Tanpa Sertifikat (EXEMPT)") : (selectedFile ? `Sertifikat Attached (${selectedFile.name})` : "Data Manual Input"))
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
      keterangan: '',
      exemptionNote: ''
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
      tempUrl={sertifikatMode === 'tanpa' ? null : tempUrl}
      hidePreview={sertifikatMode === 'tanpa'}
      rightPanelContent={
        tempUrl ? (
          <PdfCanvasOcrViewer
            pdfUrl={tempUrl ? getFullFileUrl(tempUrl) : null}
            scanMode={scanMode}
            onScanComplete={handleOcrResult}
            onScanCancel={() => setScanMode(null)}
            autoDetectPage={true}
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
            placeholder="Sertifikat Hak Guna Bangunan (HGB) Lahan Pabrik 1-4"
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
              placeholder="Kawasan Industri Bontang"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
          <div>
            <StatusDropdown
              label="Status Operasional"
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={[
                { value: 'Aktif', label: 'Aktif', desc: 'Aset beroperasi normal' },
                { value: 'Spare', label: 'Spare', desc: 'Aset cadangan' },
                { value: 'Rusak', label: 'Rusak', desc: 'Aset dalam perbaikan' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Luas Lahan (m²)</label>
            <input
              type="text"
              value={formData.luasM2}
              onChange={(e) => setFormData({ ...formData, luasM2: e.target.value })}
              placeholder="1500000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Luas Lahan (Ha)</label>
            <input
              type="text"
              value={formData.luasHa}
              onChange={(e) => setFormData({ ...formData, luasHa: e.target.value })}
              placeholder="150.0"
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
            placeholder="Area Industri & Kompleks Pabrik"
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
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-amber-900">Status: Tanpa Sertifikat (EXEMPT)</div>
                <p className="text-slate-600 leading-relaxed">
                  Aset tanah/bangunan ini didaftarkan sebagai <strong>Dikecualikan (EXEMPT)</strong> tanpa kewajiban memiliki sertifikat atau izin berkala. Sistem tidak akan melacak masa berlaku dan tidak memerlukan file PDF.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Alasan Pengecualian / Catatan Khusus (Opsional)
              </label>
              <textarea
                rows={2}
                value={formData.exemptionNote || ''}
                onChange={(e) => setFormData({ ...formData, exemptionNote: e.target.value })}
                placeholder="Contoh: Aset fasum/fasos internal atau dalam proses sertifikasi induk..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none bg-white"
              />
            </div>
          </div>
        ) : (
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
                  <span className="text-[10px] text-slate-500 mt-1">Hanya format PDF (Maks. 5 MB)</span>
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
              <label className={`text-xs font-bold block mb-1 transition-colors ${scanMode === 'namaSertifikat' ? 'text-[#005ea4]' : 'text-slate-700'}`}>
                Nama Sertifikat
                {scanMode === 'namaSertifikat' && (
                  <span className="ml-2 text-[10px] font-normal text-[#005ea4] animate-pulse">✦ Drag area teks di PDF →</span>
                )}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={formData.namaSertifikat}
                  onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                  placeholder="Sertifikat Hak Guna Bangunan (HGB)"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${
                    scanMode === 'namaSertifikat' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                  }`}
                />
                <ScanButton fieldKey="namaSertifikat" label="Nama Sertifikat" />
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1 transition-colors ${scanMode === 'noSertifikat' ? 'text-[#005ea4]' : 'text-slate-700'}`}>
                No. Sertifikat / HGB <span className="text-rose-500">*</span>
                {scanMode === 'noSertifikat' && (
                  <span className="ml-2 text-[10px] font-normal text-[#005ea4] animate-pulse">✦ Drag area teks di PDF →</span>
                )}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text" required
                  value={formData.noSertifikat}
                  onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                  placeholder="HGB-BPN-091"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${
                    scanMode === 'noSertifikat' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                  }`}
                />
                <ScanButton fieldKey="noSertifikat" label="No. Sertifikat" />
              </div>
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
