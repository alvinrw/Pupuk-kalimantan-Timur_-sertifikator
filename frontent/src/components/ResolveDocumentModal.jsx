import React, { useState } from 'react';
import { X, Upload, FileCheck, FileWarning, AlertTriangle, ShieldAlert, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { resolveMasterItemExemption, createCertificateForMasterItem } from '../services/masterItemsService';

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

  // Form State Opsi B (Exempt + Catatan Alasan)
  const [exemptionNote, setExemptionNote] = useState('');

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
      await createCertificateForMasterItem({
        itemId: targetItemId,
        jenisSertifikat,
        noSertifikat: noSertifikat.trim(),
        terbit: terbit || null,
        expired: expired || null,
        status: 'Aktif'
      });
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-amber-500" />
              Perbaiki / Lengkapi Dokumen
            </h3>
            <p className="text-xs text-slate-500 font-mono-data mt-0.5">
              {itemCode} — <span className="font-bold text-slate-800">{itemTitle}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Selector Tabs */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setOption('upload'); setErrorMessage(''); }}
              className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                option === 'upload'
                  ? 'bg-white text-[#005ea4] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-[#005ea4]" />
              <span>Unggah Sertifikat PDF</span>
            </button>

            <button
              type="button"
              onClick={() => { setOption('exempt'); setErrorMessage(''); }}
              className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                option === 'exempt'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Tanpa Sertifikat (Catatan)</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Opsi A: Unggah PDF Sertifikat */}
          {option === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Nomor Sertifikat / Pengesahan <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={noSertifikat}
                  onChange={(e) => setNoSertifikat(e.target.value)}
                  placeholder="Contoh: 566/DISNAKER-KT/2024"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Jenis Sertifikat / Izin</label>
                <select
                  value={jenisSertifikat}
                  onChange={(e) => setJenisSertifikat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] bg-white font-medium"
                >
                  <option value="Riksa Uji Disnaker">Riksa Uji Disnaker</option>
                  <option value="SLF (Sertifikat Laik Fungsi)">SLF (Sertifikat Laik Fungsi)</option>
                  <option value="Lisensi K3 Depnaker">Lisensi K3 Depnaker</option>
                  <option value="Izin Lingkungan / AMDAL">Izin Lingkungan / AMDAL</option>
                  <option value="Sertifikat Hak Cipta">Sertifikat Hak Cipta</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Tanggal Terbit</label>
                  <input
                    type="date"
                    value={terbit}
                    onChange={(e) => setTerbit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Tanggal Berakhir</label>
                  <input
                    type="date"
                    value={expired}
                    onChange={(e) => setExpired(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">File PDF Sertifikat (Opsional)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#005ea4] rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/50">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="resolve-pdf-file"
                  />
                  <label htmlFor="resolve-pdf-file" className="cursor-pointer block">
                    <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-[#005ea4] block">
                      {selectedFile ? selectedFile.name : 'Pilih File PDF atau Gambar'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-data">Maksimal 10MB</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  <span>Simpan Sertifikat & Pindahkan</span>
                </button>
              </div>
            </form>
          )}

          {/* Form Opsi B: Tanpa Sertifikat + Catatan Alasan Wajib */}
          {option === 'exempt' && (
            <form onSubmit={handleExemptSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  Konfirmasi Tanpa Sertifikat
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-mono-data">
                  Data ini akan dipindahkan ke **Tab Data Utama** dengan label **"Tanpa Sertifikat"**. Wajib memberikan catatan alasan yang jelas agar data tetap transparan.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Catatan Alasan Penanganan <span className="text-rose-500">* (Wajib)</span>
                </label>
                <textarea
                  rows={4}
                  value={exemptionNote}
                  onChange={(e) => setExemptionNote(e.target.value)}
                  placeholder="Contoh: Peralatan kategori Non-Wajib K3 Depnaker / Memiliki Surat Keterangan Pabrikan / Hanya Izin Usaha Lokal..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Konfirmasi & Pindahkan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
