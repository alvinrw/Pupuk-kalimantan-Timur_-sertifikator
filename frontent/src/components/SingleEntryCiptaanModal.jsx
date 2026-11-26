import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, Save, Upload, FileCheck, Loader2, X } from 'lucide-react';
import { API_BASE, getFullFileUrl } from '../config/api';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';
import PdfCanvasOcrViewer from './common/PdfCanvasOcrViewer';
import { scanPdfDocument } from '../services/ocrService';

export default function SingleEntryCiptaanModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    judulCiptaan: '',
    jenisCiptaan: 'Program Komputer (Software)',
    code: '',
    unitLocation: '',
    penanggungJawab: '',
    status: 'Aktif',
    namaSertifikat: '',
    noSertifikat: '',
    terbit: '',
    expired: '',
    keterangan: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        judulCiptaan: '',
        jenisCiptaan: 'Program Komputer (Software)',
        code: '',
        unitLocation: '',
        penanggungJawab: '',
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
  const [sertifikatMode, setSertifikatMode] = useState('dengan');
  
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);

  const fileInputRef = useRef(null);

  // ─── OCR States ────────────────────────────────────────
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
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
      id: `CIPTAAN-MANUAL-${Date.now()}`,
      categoryKey: 'sertifikat-ciptaan',
      title: formData.judulCiptaan,
      merekItem: formData.judulCiptaan,
      code: formData.code || `EC-${Math.floor(100000 + Math.random() * 900000)}`,
      unitLocation: formData.unitLocation,
      user: formData.penanggungJawab,
      status: formData.status,
      namaSertifikat: formData.namaSertifikat,
      noSertifikat: formData.noSertifikat || (sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (selectedFile ? `EC-${Math.floor(100000 + Math.random() * 900000)}` : "BELUM_ADA_SERTIFIKAT")),
      terbit: formData.terbit || new Date().toISOString().split('T')[0],
      expired: formData.expired || 'Seumur Hidup + 70 Tahun',
      hasCertificatePdf: sertifikatMode === 'dengan' && (!!selectedFile || !!finalUrl),
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      keterangan: sertifikatMode === 'tanpa' ? "Tidak Perlu Sertifikat" : (selectedFile ? `Sertifikat Attached (${selectedFile.name})` : (formData.keterangan || "Data Manual Input"))
    });

    setFormData({
      judulCiptaan: '',
      jenisCiptaan: 'Program Komputer (Software)',
      code: '',
      unitLocation: 'Direksi & Departemen TI',
      penanggungJawab: 'Departemen Riset & Inovasi',
      status: 'Aktif',
      namaSertifikat: 'Surat Pencatatan Ciptaan',
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
      title="Input Data Perizinan Produk / Hak Cipta (HAKI) Baru"
      subtitle="Lengkapi informasi hak cipta/paten produk beserta dokumen sertifikat DJKI"
      headerIcon={Sparkles}
      formId="singleEntryCiptaanForm"
      onSubmit={handleSubmit}
      submitDisabled={isUploadingTemp || isScanningOcr}
      submitText="Simpan Final (Submit)"
      submitIcon={Save}
      tempUrl={sertifikatMode === 'tanpa' ? null : (tempUrl ? getFullFileUrl(tempUrl) : null)}
      hidePreview={sertifikatMode === 'tanpa'}
      rightPanelContent={
        tempUrl ? (
          <PdfCanvasOcrViewer
            pdfUrl={getFullFileUrl(tempUrl)}
            scanMode={scanMode}
            onScanComplete={handleOcrResult}
            onScanCancel={() => setScanMode(null)}
            autoDetectPage={true}
          />
        ) : null
      }
    >

      {/* SECTION 1: DATA UTAMA */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Bagian 1: Data Utama Produk / Ciptaan</h4>
        
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Nama Produk / Judul Ciptaan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text" required
            value={formData.judulCiptaan}
            onChange={(e) => setFormData({ ...formData, judulCiptaan: e.target.value })}
            placeholder="Hak Cipta Software PERISAI Monitoring K3"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Jenis Ciptaan / Produk <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.jenisCiptaan}
              onChange={(e) => setFormData({ ...formData, jenisCiptaan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            >
              <option value="Program Komputer (Software)">Program Komputer (Software)</option>
              <option value="Paten Teknologi Industri">Paten Teknologi Industri</option>
              <option value="Hak Cipta Karya Tulis & Panduan">Karya Tulis & Panduan</option>
              <option value="Merek Dagang & Logo">Merek Dagang & Logo</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Kode / Registration No.</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="EC0020260192"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Unit Pengelola <span className="text-rose-500">*</span></label>
            <input
              type="text" required
              value={formData.unitLocation}
              onChange={(e) => setFormData({ ...formData, unitLocation: e.target.value })}
              placeholder="Direksi & Departemen TI"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab</label>
            <input
              type="text"
              value={formData.penanggungJawab}
              onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
              placeholder="Departemen Riset & Inovasi"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: DATA SERTIFIKAT */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mt-6">
          Bagian 2: Data Berkas Sertifikat
        </h4>
        
        {sertifikatMode === 'dengan' && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat HAKI <span className="text-rose-500">*</span></label>
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
                  disabled={isUploadingTemp}
                />
                <Upload className="w-6 h-6 text-[#005ea4] mx-auto mb-1" />
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-[#005ea4]">
                    {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : 'Pilih File PDF Sertifikat'}
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
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${
                    scanMode === 'namaSertifikat' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                  }`}
                />
                <ScanButton fieldKey="namaSertifikat" label="Nama Sertifikat" />
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1 transition-colors ${scanMode === 'noSertifikat' ? 'text-[#005ea4]' : 'text-slate-700'}`}>
                No. Sertifikat HAKI / DJKI <span className="text-rose-500">*</span>
                {scanMode === 'noSertifikat' && (
                  <span className="ml-2 text-[10px] font-normal text-[#005ea4] animate-pulse">✦ Drag area teks di PDF →</span>
                )}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text" required
                  value={formData.noSertifikat}
                  onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                  placeholder="EC0020260192"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 font-bold text-xs transition-all ${
                    scanMode === 'noSertifikat' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/30 bg-blue-50/60' : 'border-slate-300 focus:ring-[#005ea4]'
                  }`}
                />
                <ScanButton fieldKey="noSertifikat" label="No. Sertifikat" />
              </div>
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
                <label className="text-xs font-bold text-rose-700 block mb-1">Masa Berlaku / Expired</label>
                <input
                  type="text"
                  value={formData.expired}
                  onChange={(e) => setFormData({ ...formData, expired: e.target.value })}
                  placeholder="Seumur Hidup + 70 Tahun"
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
