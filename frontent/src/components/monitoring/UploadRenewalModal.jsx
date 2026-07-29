import React from 'react';
import { X, UploadCloud, FileText, Sparkles, Loader2, FileCheck } from 'lucide-react';

/**
 * UploadRenewalModal — Modal "Selesai & Upload Sertifikat Baru" untuk MonitoringSertifikasi.
 */
export default function UploadRenewalModal({
  activeModalItem, onClose,
  uploadedFile, isOcrScanning, ocrSuccess,
  handleFileSelect,
  newCertNumber, setNewCertNumber,
  inspectionDate, setInspectionDate,
  issueDate, setIssueDate,
  newExpiryDate, setNewExpiryDate,
  resertifikasiNotes, setResertifikasiNotes,
  handleConfirmUploadRenewal
}) {
  if (!activeModalItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">Konfirmasi Selesai & Upload Sertifikat Baru</h4>
            <p className="text-[11px] text-slate-400 font-mono-data">{activeModalItem.merekItem}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirmUploadRenewal} className="p-5 space-y-4 text-xs font-mono-data">
          {/* FILE UPLOAD & OCR EXTRACTION STATUS BOX */}
          <div>
            <label className="font-bold text-slate-900 block mb-1.5">
              1. Upload File Sertifikat Baru (Wajib) <span className="text-rose-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100 transition-colors">
              <input
                type="file"
                id="cert-file-input-monitoring"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="cert-file-input-monitoring" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-[#005ea4]" />
                {uploadedFile ? (
                  <div className="text-slate-800 font-bold flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{uploadedFile.name}</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-[#005ea4]">Klik untuk Pilih File Sertifikat</span>
                    <span className="text-[10px] text-slate-500 block">Format: PDF, PNG, JPG (Maks. 10MB)</span>
                  </div>
                )}
              </label>
            </div>

            {isOcrScanning && (
              <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center gap-2 text-[11px] animate-pulse">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                <span>⚡ <b>AI OCR Engine:</b> Mengekstrak data nomor, tanggal pengecekan, & expired dari dokumen...</span>
              </div>
            )}

            {ocrSuccess && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2 text-[11px]">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✓ <b>OCR Berhasil:</b> Data di bawah telah otomatis terisi dari hasil pemindaian sertifikat! (Dapat Anda edit manual).</span>
              </div>
            )}
          </div>

          {/* NOMOR SERTIFIKAT BARU */}
          <div>
            <label className="font-bold text-slate-900 block mb-1">
              2. Nomor Sertifikat Baru <span className="text-[10px] font-normal text-slate-500">(Auto-OCR / Editable)</span>
            </label>
            <input
              type="text"
              value={newCertNumber}
              onChange={(e) => setNewCertNumber(e.target.value)}
              placeholder="Nomor SK / Sertifikat baru..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
            />
          </div>

          {/* GRID 3 TANGGAL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">3. Tgl Pengecekan</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-900 block mb-1">4. Tgl Terbit SK</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-900 block mb-1 text-rose-700">5. Tgl Expired Baru</label>
              <input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
              />
            </div>
          </div>

          {/* CATATAN VERIFIKASI */}
          <div>
            <label className="font-bold text-slate-900 block mb-1">6. Catatan Verifikasi</label>
            <textarea
              value={resertifikasiNotes}
              onChange={(e) => setResertifikasiNotes(e.target.value)}
              placeholder="Catatan hasil verifikasi atau keterangan instansi..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer font-mono-data"
            >
              <FileCheck className="w-4 h-4" />
              <span>Konfirmasi & Simpan Sertifikat Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
