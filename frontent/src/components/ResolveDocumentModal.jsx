import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle2, Loader2, AlertTriangle, CheckCircle, FileCheck, Save, Sparkles } from 'lucide-react';
import { scanPdfDocument } from '../services/ocrService';
import { API_BASE } from '../config/api';
import { resolveMasterItemExemption, createCertificateForMasterItem, updateNotificationSetting } from '../services/masterItemsService';
import BaseSplitScreenUploadModal from './common/BaseSplitScreenUploadModal';

export default function ResolveDocumentModal({ isOpen, onClose, doc, item, onResolveSuccess, onSuccess }) {
  const activeDoc = doc || item;

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
  
  // OCR & Temp Storage States
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [isUploadingTemp, setIsUploadingTemp] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [tempUrl, setTempUrl] = useState(null);

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
      setIsScanningOcr(false);
      setIsUploadingTemp(false);
      setOcrErrorMsg('');
      setOcrSuccess(false);
    }
  }, [isOpen, activeDoc]);

  if (!isOpen || !activeDoc) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalUrl = activeDoc.fileUrl || activeDoc.url || null;
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

    const targetId = activeDoc.MasterId || activeDoc.id;

    if (sertifikatMode === 'tanpa') {
      try {
        await resolveMasterItemExemption(targetId, formData.keterangan || "Tidak Perlu Sertifikat");
      } catch (err) {
        console.error("Exemption resolve error:", err);
      }
    } else {
      try {
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
      } catch (err) {
        console.error("Certificate resolve error:", err);
      }
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

    const updatedData = {
      ...activeDoc,
      ...formData,
      file: sertifikatMode === 'dengan' ? selectedFile : null,
      fileUrl: finalUrl,
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      hasCertificatePdf: sertifikatMode === 'dengan' && (!!selectedFile || !!finalUrl),
      noSertifikat: sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (formData.noSertifikat || "BELUM_ADA_SERTIFIKAT"),
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
      submitDisabled={isUploadingTemp || isScanningOcr || (sertifikatMode === 'dengan' && !selectedFile && !activeDoc.fileUrl)}
      submitText="Simpan & Selesaikan"
      submitIcon={Save}
      tempUrl={tempUrl || activeDoc.fileUrl}
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

      {sertifikatMode === 'tanpa' ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <p className="text-xs text-amber-800 font-medium">Dokumen ini ditandai pengecualian (tidak membutuhkan lampiran berkas fisik PDF).</p>
          <div>
            <label className="text-xs font-bold text-amber-900 block mb-1">Catatan Pengecualian / Alasan <span className="text-rose-500">*</span></label>
            <textarea
              rows={2}
              required
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Contoh: Tidak membutuhkan izin sesuai peraturan..."
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat Baru <span className="text-rose-500">*</span></label>
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
                            instansi: ocrData.instansi || prev.instansi || ''
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
                  {selectedFile ? `✓ Terpilih: ${selectedFile.name}` : 'Pilih / Ganti File PDF'}
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
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>AI berhasil mengekstrak data! Verifikasi kembali dengan preview PDF di sebelah kanan.</span>
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
            <label className="text-xs font-bold text-slate-700 block mb-1">No. Sertifikat <span className="text-rose-500">*</span></label>
            <input
              type="text" required
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
              <label className="text-xs font-bold text-rose-700 block mb-1">Tanggal Expired</label>
              <input
                type="date"
                value={formData.expired}
                onChange={(e) => setFormData({ ...formData, expired: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Instansi Penerbit</label>
            <input
              type="text"
              value={formData.instansi}
              onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
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
