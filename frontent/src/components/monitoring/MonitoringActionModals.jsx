import React from 'react';
import { Ban, RotateCcw, X, UploadCloud, FileText, Loader2, Sparkles, FileCheck } from 'lucide-react';

export default function MonitoringActionModals({
  // Modal states
  isAfkirModalOpen,
  setIsAfkirModalOpen,
  isAktifkanModalOpen,
  setIsAktifkanModalOpen,
  isRenewConfirmModalOpen,
  setIsRenewConfirmModalOpen,
  isCancelRenewModalOpen,
  setIsCancelRenewModalOpen,
  activeModalItem,
  setActiveModalItem,

  // Action states
  activeItemForAction,
  isProcessingAction,

  // Handlers for quick actions
  confirmQuickDecommission,
  confirmCancelAfkir,
  confirmQuickRenew,
  confirmCancelRenew,

  // Handlers & states for Complete Upload
  uploadedFile,
  handleFileSelect,
  isOcrScanning,
  ocrSuccess,
  newCertNumber,
  setNewCertNumber,
  inspectionDate,
  setInspectionDate,
  issueDate,
  setIssueDate,
  newExpiryDate,
  setNewExpiryDate,
  resertifikasiNotes,
  setResertifikasiNotes,
  handleConfirmUploadRenewal
}) {
  return (
    <>
      {/* AFKIR CONFIRMATION MODAL */}
      {isAfkirModalOpen && activeItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center mb-4 border border-slate-200">
                <Ban className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Tandai Sebagai Afkir?</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin menandai <br /><strong className="text-slate-800">{activeItemForAction.merekItem}</strong> sebagai Afkir/Non-Aktif?<br />
                Tindakan ini akan mengubah status dokumen secara permanen.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAfkirModalOpen(false)}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmQuickDecommission}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessingAction ? 'Memproses...' : 'Ya, Afkirkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AKTIFKAN CONFIRMATION MODAL */}
      {isAktifkanModalOpen && activeItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#005ea4] mx-auto flex items-center justify-center mb-4 border border-blue-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Aktifkan Kembali?</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin membatalkan afkir dan mengaktifkan kembali <br /><strong className="text-slate-800">{activeItemForAction.merekItem}</strong>?<br />
                Dokumen ini akan kembali dipantau status aktifnya.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAktifkanModalOpen(false)}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmCancelAfkir}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessingAction ? 'Memproses...' : 'Ya, Aktifkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERPANJANG CONFIRMATION MODAL */}
      {isRenewConfirmModalOpen && activeItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4 border border-amber-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Ajukan Perpanjangan?</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin memulai proses perpanjangan untuk <br /><strong className="text-slate-800">{activeItemForAction.merekItem}</strong>?<br />
                Status baris akan berubah menjadi <span className="text-amber-700 font-bold">Kuning (Sedang Diproses)</span>.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRenewConfirmModalOpen(false)}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmQuickRenew}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingAction ? 'Memproses...' : 'Ya, Mulai Perpanjangan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BATAL PERPANJANGAN CONFIRMATION MODAL */}
      {isCancelRenewModalOpen && activeItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4 border border-rose-200">
                <X className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Batalkan Perpanjangan?</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin membatalkan proses perpanjangan untuk <br /><strong className="text-slate-800">{activeItemForAction.merekItem}</strong>?<br />
                Status baris akan dikembalikan menjadi <span className="text-slate-800 font-bold">Aktif (Normal)</span>.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCancelRenewModalOpen(false)}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmCancelRenew}
                  disabled={isProcessingAction}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingAction ? 'Memproses...' : 'Ya, Batalkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE RENEWAL & UPLOAD CERTIFICATE MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Konfirmasi Selesai & Upload Sertifikat Baru</h4>
                <p className="text-[11px] text-slate-400 font-mono-data">{activeModalItem.merekItem}</p>
              </div>
              <button onClick={() => setActiveModalItem(null)} className="text-slate-400 hover:text-white">
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
                    id="cert-file-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="cert-file-input" className="cursor-pointer flex flex-col items-center gap-2">
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
                    <span>ÃƒÂ¢Ã…Â¡Ã‚Â¡ <b>AI OCR Engine:</b> Mengekstrak data nomor, tanggal pengecekan, & expired dari dokumen...</span>
                  </div>
                )}

                {ocrSuccess && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2 text-[11px]">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ <b>OCR Berhasil:</b> Data di bawah telah otomatis terisi dari hasil pemindaian sertifikat! (Dapat Anda edit manual).</span>
                  </div>
                )}
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    3. Tgl Pengecekan
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    4. Tgl Terbit SK
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1 text-rose-700">
                    5. Tgl Expired Baru
                  </label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>

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
                  onClick={() => setActiveModalItem(null)}
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
      )}
    </>
  );
}
