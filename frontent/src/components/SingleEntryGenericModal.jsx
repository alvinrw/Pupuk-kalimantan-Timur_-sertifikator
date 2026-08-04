import React, { useState, useRef, useEffect } from 'react';
import { FolderGit2, Building2, ClipboardList, Save, Upload, FileCheck, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { scanPdfDocument } from '../services/ocrService';
import { API_BASE } from '../config/api';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';

export default function SingleEntryGenericModal({ isOpen, onClose, onAddSuccess, categoryName }) {
  const [formData, setFormData] = useState({
    title: '',
    tipe: '',
    code: '',
    unitLocation: '',
    luasM2: '',
    luasHa: '',
    peruntukan: '',
    penanggungJawab: '',
    status: 'Aktif',
    namaSertifikat: '',
    noSertifikat: '',
    terbit: '',
    expired: '',
    keterangan: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [sertifikatMode, setSertifikatMode] = useState('dengan');
  
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);

  const fileInputRef = useRef(null);

  const isAset = categoryName?.toLowerCase().includes('aset');
  const isProduk = categoryName?.toLowerCase().includes('produk');
  const isProyek = !isAset && !isProduk;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        tipe: '',
        code: '',
        unitLocation: isAset 
          ? 'Kawasan Industri Bontang' 
          : isProduk 
          ? 'Pabrik 5 Fertilizer' 
          : 'Area Pabrik NPK Cluster 2',
        luasM2: isAset ? '1500000' : '',
        luasHa: isAset ? '150.0' : '',
        peruntukan: isAset 
          ? 'Area Industri & Kompleks Pabrik' 
          : isProduk 
          ? 'Sertifikasi SNI & Halal Produk Komersil' 
          : 'Izin Lingkungan AMDAL & Pertek Wastewater',
        penanggungJawab: isAset 
          ? 'Departemen Aset & Umum' 
          : isProduk 
          ? 'Departemen Penjaminan Mutu' 
          : 'Departemen Proyek & Lingkungan',
        status: 'Aktif',
        namaSertifikat: isAset 
          ? 'Sertifikat Hak Guna Bangunan (HGB)' 
          : isProduk 
          ? 'Sertifikat Standar Nasional Indonesia (SNI)' 
          : 'Surat Keputusan (SK) AMDAL / Pertek',
        noSertifikat: '',
        terbit: '',
        expired: '',
        keterangan: ''
      });
      setSelectedFile(null);
      setTempUrl(null);
      setOcrSuccess(false);
      setOcrErrorMsg('');
    }
  }, [isOpen, categoryName]);

  if (!isOpen) return null;

  const labels = {
    title: `Input Data ${categoryName || 'Perizinan'} Baru`,
    subtitle: isAset 
      ? 'Lengkapi informasi aset beserta dokumen sertifikat kepemilikan/HGB' 
      : isProduk 
      ? 'Lengkapi informasi produk beserta dokumen sertifikat SNI/Halal' 
      : 'Lengkapi informasi proyek beserta dokumen SK / Sertifikat Izin Lingkungan',
    nameLabel: isAset ? 'Nama Aset' : isProduk ? 'Nama Produk' : 'Nama Proyek',
    namePlaceholder: isAset 
      ? 'Contoh: Gedung Kantor Pusat Bontang' 
      : isProduk 
      ? 'Contoh: Pupuk NPK 16-16-16' 
      : 'Contoh: Izin Amdal Ekspansi Pabrik NPK Cluster 2',
    jenisLabel: isAset ? 'Jenis Aset' : isProduk ? 'Jenis Produk' : 'Kategori Proyek',
    jenisPlaceholder: isAset 
      ? 'Contoh: Tanah / Bangunan' 
      : isProduk 
      ? 'Contoh: Pupuk / Bahan Chemical' 
      : 'Contoh: Amdal / Pertek Lingkungan',
    codeLabel: isAset ? 'Nomor Seri Asset' : isProduk ? 'Kode Produk' : 'Kode Proyek',
    codePlaceholder: isAset 
      ? 'Contoh: AST-BPN-001' 
      : isProduk 
      ? 'Contoh: PRD-NPK-001' 
      : 'Contoh: PRJ-ENV-001',
    locationLabel: isAset ? 'Lokasi Aset' : isProduk ? 'Unit Pengelola' : 'Lokasi / Area Proyek',
    locationPlaceholder: isAset 
      ? 'Contoh: Kawasan Industri Bontang' 
      : isProduk 
      ? 'Contoh: Pabrik 5 Fertilizer' 
      : 'Contoh: Area Pabrik NPK Cluster 2',
    userLabel: 'Penanggung Jawab',
    userPlaceholder: isAset 
      ? 'Contoh: Departemen Aset & Umum' 
      : isProduk 
      ? 'Contoh: Departemen Penjaminan Mutu' 
      : 'Contoh: Departemen Proyek & Lingkungan',
    statusLabel: isAset ? 'Status Aset' : isProduk ? 'Status Produk' : 'Status Proyek',
    statusOptionSpare: isProyek ? 'Selesai' : 'Spare',
    statusOptionRusak: isProyek ? 'Ditunda' : 'Rusak',
    pdfLabel: isAset ? 'File PDF Sertifikat Aset' : isProduk ? 'File PDF Sertifikat Produk' : 'File PDF SK / Sertifikat Proyek',
    noPdfMessage: isAset 
      ? 'Aset ini dicatat tanpa dokumen sertifikat terlampir.' 
      : isProduk 
      ? 'Produk ini dicatat tanpa dokumen sertifikat terlampir.' 
      : 'Proyek ini dicatat tanpa dokumen sertifikat terlampir.'
  };

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

    const systemCategoryKey = isProduk ? 'perizinan-produk' : isAset ? 'perizinan-aset' : 'perizinan-proyek';
    const idPrefix = isAset ? 'AST' : isProduk ? 'PRD' : 'PRJ';

    onAddSuccess({
      ...formData,
      file: sertifikatMode === 'dengan' ? selectedFile : null,
      fileUrl: finalUrl,
      id: `${idPrefix}-MANUAL-${Date.now()}`,
      categoryKey: systemCategoryKey,
      title: formData.title,
      merekItem: formData.title,
      jenisPeralatan: categoryName || (isAset ? 'Aset & Bangunan' : isProduk ? 'Sertifikasi Produk' : 'Perizinan Proyek'),
      code: formData.code || `${idPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      unitLocation: formData.unitLocation,
      user: formData.penanggungJawab,
      status: formData.status,
      namaSertifikat: formData.namaSertifikat,
      noSertifikat: sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (formData.noSertifikat || (selectedFile ? `${idPrefix}-KLHK-${Math.floor(100 + Math.random() * 900)}` : "BELUM_ADA_SERTIFIKAT")),
      terbit: formData.terbit || new Date().toISOString().split('T')[0],
      expired: formData.expired || '',
      hasCertificatePdf: sertifikatMode === 'dengan' && (!!selectedFile || !!finalUrl),
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      keterangan: sertifikatMode === 'tanpa' ? "Tidak Perlu Sertifikat" : (selectedFile ? `Sertifikat Attached (${selectedFile.name})` : (formData.keterangan || "Data Manual Input"))
    });

    onClose();
  };

  return (
    <BaseSplitScreenUploadModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Input Data ${categoryName || 'Perizinan Proyek'} Baru`}
      subtitle="Lengkapi informasi proyek beserta dokumen SK / Sertifikat Izin Lingkungan"
      headerIcon={isAset ? Building2 : isProduk ? ClipboardList : FolderGit2}
      formId="singleEntryGenericForm"
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

      {/* SECTION 1: DATA UTAMA */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Bagian 1: Data Utama</h4>
        
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            {labels.nameLabel} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text" required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={labels.namePlaceholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">{labels.jenisLabel} <span className="text-rose-500">*</span></label>
            <input
              type="text" required
              value={formData.tipe}
              onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
              placeholder={labels.jenisPlaceholder}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">{labels.codeLabel}</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder={labels.codePlaceholder}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">{labels.locationLabel} <span className="text-rose-500">*</span></label>
            <input
              type="text" required
              value={formData.unitLocation}
              onChange={(e) => setFormData({ ...formData, unitLocation: e.target.value })}
              placeholder={labels.locationPlaceholder}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">{labels.userLabel}</label>
            <input
              type="text"
              value={formData.penanggungJawab}
              onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
              placeholder={labels.userPlaceholder}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
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
              placeholder="Contoh: 15000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Luas Lahan (Ha)</label>
            <input
              type="text"
              value={formData.luasHa}
              onChange={(e) => setFormData({ ...formData, luasHa: e.target.value })}
              placeholder="Contoh: 1.5"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Peruntukan Lahan / Area</label>
          <input
            type="text"
            value={formData.peruntukan}
            onChange={(e) => setFormData({ ...formData, peruntukan: e.target.value })}
            placeholder="Contoh: Izin Lingkungan AMDAL & Pertek Wastewater"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">{labels.statusLabel}</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-[#005ea4]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Spare">{labels.statusOptionSpare}</option>
            <option value="Rusak">{labels.statusOptionRusak}</option>
          </select>
        </div>
      </div>

      {/* SECTION 2: DATA SERTIFIKAT / SK */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mt-6">
          Bagian 2: {sertifikatMode === 'dengan' ? 'Data Berkas Sertifikat / SK' : 'Pengecualian Sertifikat'}
        </h4>
        
        {sertifikatMode === 'tanpa' ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800 font-medium">{labels.noPdfMessage}</p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">{labels.pdfLabel} <span className="text-rose-500">*</span></label>
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
                    {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : `Pilih ${labels.pdfLabel}`}
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
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Sertifikat / SK</label>
              <input
                type="text"
                value={formData.namaSertifikat}
                onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">No. Sertifikat / SK <span className="text-rose-500">*</span></label>
              <input
                type="text" required
                value={formData.noSertifikat}
                onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                placeholder={isAset ? "Contoh: HGB-BPN-123" : isProduk ? "Contoh: SNI-123-2026" : "Contoh: SK-KLHK-881"}
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
                <label className="text-xs font-bold text-rose-700 block mb-1">Tanggal Expired / Berakhir</label>
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
