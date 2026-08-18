import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle2, Loader2, AlertTriangle, CheckCircle, FileCheck, Save, Sparkles, Crosshair } from 'lucide-react';
import { API_BASE, getFullFileUrl } from '../config/api';
import { resolveMasterItemExemption, createCertificateForMasterItem, updateNotificationSetting, updateCertificate } from '../services/masterItemsService';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';
import PdfCanvasOcrViewer from './common/PdfCanvasOcrViewer';

export default function ResolveDocumentModal({ isOpen, onClose, doc, item, onResolveSuccess, onSuccess }) {
  const activeDoc = doc || item;
  const isValidVal = (val) => val && val !== '-' && String(val).trim() !== '';
  const hasExistingCertDetails = activeDoc ? (
    isValidVal(activeDoc.noSertifikat || activeDoc.certificateNo) && 
    isValidVal(activeDoc.terbit || activeDoc.tanggalInspeksi) && 
    isValidVal(activeDoc.expired || activeDoc.tanggalExpired || activeDoc.berakhir)
  ) : false;

  const [formData, setFormData] = useState({
    namaSertifikat: '',
    noSertifikat: '',
    terbit: '',
    expired: '',
    instansi: '',
    keterangan: '',
    reminderEnabled: true,
    reminderType: 'DAYS',
    reminderDays: 30,
    reminderDate: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [sertifikatMode, setSertifikatMode] = useState('dengan'); // 'dengan' | 'tanpa'
  
  const [tempUrl, setTempUrl] = useState(null);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [scanMode, setScanMode] = useState(null);

  // ─── Handler untuk hasil OCR dari Canvas ─────────────────────────────────
  const handleOcrResult = async (fieldKey, rawText) => {
    try {
      const { parseDate, parseCertificateNumber } = await import('../utils/ocrTextParser');
      
      if (fieldKey === 'noSertifikat') {
        const certNo = parseCertificateNumber(rawText);
        setFormData(prev => ({ ...prev, noSertifikat: certNo || rawText.replace(/\n+/g, ' ').trim() }));
      } else if (fieldKey === 'terbit' || fieldKey === 'expired') {
        const parsed = parseDate(rawText);
        if (parsed) {
          setFormData(prev => ({ ...prev, [fieldKey]: parsed.iso }));
        } else {
          setOcrErrorMsg(`Gagal mendeteksi tanggal untuk ${fieldKey}.`);
        }
      } else if (fieldKey === 'instansi') {
        setFormData(prev => ({ ...prev, instansi: rawText.replace(/\n+/g, ' ').trim() }));
      }
      
      setOcrSuccess(true);
      setScanMode(null);
    } catch (err) {
      console.error("Gagal memproses hasil OCR:", err);
    }
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeDoc) {
      setFormData({
        namaSertifikat: activeDoc.namaSertifikat || activeDoc.title || '',
        noSertifikat: activeDoc.noSertifikat || activeDoc.nomorSertifikat || '',
        terbit: activeDoc.terbit || activeDoc.tanggalInspeksi || '',
        expired: activeDoc.expired || activeDoc.tanggalExpired || activeDoc.berakhir || '',
        instansi: activeDoc.instansi || '',
        keterangan: activeDoc.keterangan || '',
        reminderEnabled: activeDoc.notificationSetting ? activeDoc.notificationSetting.isEnabled !== false : (activeDoc.reminderEnabled !== undefined ? activeDoc.reminderEnabled : true),
        reminderType: activeDoc.notificationSetting ? (activeDoc.notificationSetting.triggerType || 'DAYS') : 'DAYS',
        reminderDays: activeDoc.notificationSetting ? (activeDoc.notificationSetting.triggerDays ?? 30) : 30,
        reminderDate: activeDoc.notificationSetting && activeDoc.notificationSetting.triggerDate ? activeDoc.notificationSetting.triggerDate.substring(0, 10) : ''
      });
      setSelectedFile(null);
      setTempUrl(null);
      setSertifikatMode(activeDoc.documentStatus === 'EXEMPT' ? 'tanpa' : 'dengan');
      setIsUploadingTemp(false);
      setOcrErrorMsg('');
      setOcrSuccess(false);
      setScanMode(null);
    }
  }, [isOpen, activeDoc]);

  if (!isOpen || !activeDoc) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalUrl = activeDoc.fileUrl || activeDoc.url || null;
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

    const targetId = activeDoc.itemId || activeDoc.masterItemId || activeDoc.MasterId || activeDoc.id;

    try {
      if (activeDoc.isChild || activeDoc.certId || activeDoc.masterItemId) {
        // Update existing child certificate
        const isExempt = sertifikatMode === 'tanpa';
        await updateCertificate(activeDoc.id || activeDoc.certId, {
          namaSertifikat: formData.namaSertifikat || activeDoc.namaSertifikat,
          noSertifikat: isExempt ? (formData.noSertifikat || 'EXEMPT') : formData.noSertifikat,
          instansi: formData.instansi,
          terbit: formData.terbit,
          expired: formData.expired,
          fileUrl: isExempt ? null : finalUrl,
          status: isExempt ? 'EXEMPT' : 'Aktif'
        });

        // If exempt mode, also resolve the master item
        if (isExempt) {
          const masterItemId = activeDoc.itemId || activeDoc.masterItemId || activeDoc.MasterId;
          if (masterItemId) {
            try {
              await resolveMasterItemExemption(masterItemId, formData.keterangan || 'Tanpa Sertifikat (Input Manual)');
            } catch (err) {
              console.error("Exemption resolve error (child):", err);
            }
          }
        }
      } else {
        // Create new certificate for master item
        await createCertificateForMasterItem({
          itemId: targetId,
          jenisSertifikat: activeDoc.jenisSertifikat || activeDoc.jenisPeralatan || activeDoc.jenisCiptaan || activeDoc.categoryKey || activeDoc.title || "Sertifikat",
          namaSertifikat: formData.namaSertifikat || activeDoc.namaSertifikat || "Sertifikat Baru",
          noSertifikat: formData.noSertifikat,
          instansi: formData.instansi,
          terbit: formData.terbit,
          expired: formData.expired,
          fileUrl: finalUrl,
          status: 'Aktif'
        });

        if (sertifikatMode === 'tanpa') {
          try {
            await resolveMasterItemExemption(targetId, formData.keterangan || 'Tanpa Sertifikat (Input Manual)');
          } catch (err) {
            console.error("Exemption resolve error:", err);
          }
        }
      }
    } catch (err) {
      console.error("Certificate resolve error:", err);
    }

    try {
      await updateNotificationSetting(targetId, {
        isEnabled: formData.reminderEnabled,
        triggerType: formData.reminderType,
        triggerDays: parseInt(formData.reminderDays) || 30,
        triggerDate: formData.reminderType === 'DATE' ? formData.reminderDate : null
      });
    } catch (err) {
      console.error("Notification setting update error:", err);
    }

    const isExemptMode = sertifikatMode === 'tanpa';
    const updatedData = {
      ...activeDoc,
      ...formData,
      file: sertifikatMode === 'dengan' ? selectedFile : null,
      fileUrl: isExemptMode ? null : finalUrl,
      status: isExemptMode ? 'EXEMPT' : 'Aktif',
      documentStatus: isExemptMode ? 'EXEMPT' : 'COMPLETED',
      hasCertificatePdf: !isExemptMode && (!!selectedFile || !!finalUrl),
      hasPdf: !isExemptMode && (!!selectedFile || !!finalUrl),
      noSertifikat: formData.noSertifikat || (isExemptMode ? 'EXEMPT' : 'BELUM_ADA_SERTIFIKAT'),
      notificationSetting: {
        isEnabled: formData.reminderEnabled,
        triggerType: formData.reminderType,
        triggerDays: parseInt(formData.reminderDays) || 30,
        triggerDate: formData.reminderType === 'DATE' ? formData.reminderDate : null
      }
    };

    if (onResolveSuccess) onResolveSuccess(updatedData);
    if (onSuccess) onSuccess(updatedData);

    onClose();
  };

  return (
    <BaseSplitScreenUploadModal
      isOpen={isOpen}
      onClose={onClose}
      title="Selesaikan Tugas (Human Verification)"
      subtitle={`Lengkapi & verifikasi dokumen perizinan untuk: ${activeDoc.merekItem || activeDoc.namaPeralatan || activeDoc.title || 'Item'}`}
      headerIcon={CheckCircle2}
      formId="resolveDocumentForm"
      onSubmit={handleSubmit}
      submitDisabled={isUploadingTemp || isScanningOcr || !!uploadError || (sertifikatMode === 'dengan' && !selectedFile && !tempUrl && !activeDoc.fileUrl)}
      submitText="Simpan & Selesaikan"
      submitIcon={Save}
      tempUrl={tempUrl || activeDoc.fileUrl}
      rightPanelContent={
        (tempUrl || activeDoc.fileUrl) ? (
          <PdfCanvasOcrViewer
            pdfUrl={(tempUrl || activeDoc.fileUrl) ? getFullFileUrl(tempUrl || activeDoc.fileUrl) : null}
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
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Tanpa Sertifikat (Exempt)</span>
        </button>
      </div>

      {sertifikatMode === 'dengan' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat Baru (Wajib)</label>
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
                    setUploadError(null);

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
                          if (json.data?.url) {
                            setTempUrl(json.data.url);
                          } else {
                            setUploadError('Server tidak mengembalikan URL file. Coba lagi.');
                          }
                        } else {
                          let errMsg = `Upload gagal (status ${uploadRes.status})`;
                          try {
                            const errJson = await uploadRes.json();
                            errMsg = errJson?.message || errMsg;
                          } catch(_) {}
                          setUploadError(errMsg);
                          console.error('Upload temp error:', errMsg);
                        }
                      } catch (err) {
                        const msg = err?.message || 'Koneksi gagal. Pastikan server backend berjalan.';
                        setUploadError(msg);
                        console.error('Upload temp error:', err);
                      } finally {
                        setIsUploadingTemp(false);
                      }
                    } else {
                      setUploadError('Format file tidak didukung. Harap pilih file PDF.');
                    }
                  }
                }}
                className="hidden"
                disabled={isUploadingTemp}
              />
              <Upload className="w-6 h-6 text-[#005ea4] mx-auto mb-1" />
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#005ea4]">
                  {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : 'Pilih / Ganti File PDF'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Hanya format PDF</span>
              </div>
            </div>

            {isUploadingTemp && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200 animate-pulse mt-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                <span>Menyiapkan preview dokumen...</span>
              </div>
            )}

            {uploadError && !isUploadingTemp && (
              <div className="flex items-start gap-2 text-xs font-bold text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 mt-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div>Upload gagal: {uploadError}</div>
                  <div className="font-normal mt-0.5 text-red-500">Pastikan backend &amp; MinIO berjalan, lalu coba pilih file lagi.</div>
                </div>
              </div>
            )}

            {tempUrl && !isUploadingTemp && !uploadError && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mt-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>File berhasil diunggah ke server. Siap disimpan.</span>
              </div>
            )}

            {ocrErrorMsg && (
              <div className="flex items-start gap-2 text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{ocrErrorMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Data */}
      {hasExistingCertDetails ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detail Sertifikat Terdaftar</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">No. Sertifikat</span>
                  <span className="font-bold text-[#005ea4]">{formData.noSertifikat || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Nama Sertifikat</span>
                  <span className="font-bold text-slate-800">{formData.namaSertifikat || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Tanggal Terbit</span>
                  <span className="font-bold text-slate-800">{formData.terbit || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Tanggal Expired</span>
                  <span className="font-bold text-rose-700">{formData.expired || '-'}</span>
                </div>
                {formData.instansi && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Instansi Penerbit</span>
                    <span className="font-bold text-slate-800">{formData.instansi}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Sertifikat</label>
                <input
                  type="text"
                  value={formData.namaSertifikat}
                  onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                  placeholder="Contoh: SKP Pesawat Angkat"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">No. Sertifikat <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.noSertifikat}
                    onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#005ea4]"
                  />
                  {sertifikatMode === 'dengan' && (
                  <button
                    type="button"
                    onClick={() => setScanMode(scanMode === 'noSertifikat' ? null : 'noSertifikat')}
                    className={`p-2 rounded-lg border shrink-0 transition-all ${
                      scanMode === 'noSertifikat' 
                      ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                      : 'bg-blue-50 border-blue-200 text-[#005ea4] hover:bg-blue-100'
                    }`}
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Terbit</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={formData.terbit}
                      onChange={(e) => setFormData({ ...formData, terbit: e.target.value })}
                      className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#005ea4]"
                    />
                    {sertifikatMode === 'dengan' && (
                    <button
                      type="button"
                      onClick={() => setScanMode(scanMode === 'terbit' ? null : 'terbit')}
                      className={`p-2 rounded-lg border shrink-0 transition-all ${
                        scanMode === 'terbit' 
                        ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-700 block mb-1">Tanggal Expired</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      value={formData.expired}
                      onChange={(e) => setFormData({ ...formData, expired: e.target.value })}
                      className="w-full px-2 py-2 bg-white border border-rose-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                    />
                    {sertifikatMode === 'dengan' && (
                    <button
                      type="button"
                      onClick={() => setScanMode(scanMode === 'expired' ? null : 'expired')}
                      className={`p-2 rounded-lg border shrink-0 transition-all ${
                        scanMode === 'expired' 
                        ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                        : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Instansi Penerbit</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.instansi}
                    onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#005ea4]"
                  />
                  {sertifikatMode === 'dengan' && (
                  <button
                    type="button"
                    onClick={() => setScanMode(scanMode === 'instansi' ? null : 'instansi')}
                    className={`p-2 rounded-lg border shrink-0 transition-all ${
                      scanMode === 'instansi' 
                      ? 'bg-rose-100 border-rose-300 text-rose-700 shadow-inner' 
                      : 'bg-blue-50 border-blue-200 text-[#005ea4] hover:bg-blue-100'
                    }`}
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Keterangan / Catatan Tambahan</label>
                <textarea
                  rows="2"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#005ea4] font-mono-data resize-none"
                />
              </div>
            </div>
          )}

      {/* SECTION NOTIFIKASI & DEADLINE */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-2 uppercase tracking-wider font-mono-data">
          Pengaturan Notifikasi & Deadline
        </h4>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono-data">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="resolveReminderEnabled"
              checked={formData.reminderEnabled}
              onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
              className="rounded border-slate-300 accent-[#005ea4] h-4 w-4 cursor-pointer"
            />
            <label htmlFor="resolveReminderEnabled" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
              Aktifkan Pengingat / Notifikasi Reminder
            </label>
          </div>

          {formData.reminderEnabled && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tipe Pemicu</label>
                <select
                  value={formData.reminderType}
                  onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                >
                  <option value="DAYS">Berdasarkan Sisa Hari (H-)</option>
                  <option value="DATE">Berdasarkan Tanggal Spesifik</option>
                </select>
              </div>
              {formData.reminderType === 'DAYS' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Pemicu H- (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tanggal Pemicu</label>
                  <input
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseSplitScreenUploadModal>
  );
}
