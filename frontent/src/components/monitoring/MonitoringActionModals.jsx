import React from 'react';
import UploadRenewalModal from './UploadRenewalModal';
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
  handleConfirmUploadRenewal,
  tempUrl, isUploadingTemp
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
      <UploadRenewalModal
        activeModalItem={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        uploadedFile={uploadedFile}
        isOcrScanning={isOcrScanning}
        ocrSuccess={ocrSuccess}
        handleFileSelect={handleFileSelect}
        newCertNumber={newCertNumber}
        setNewCertNumber={setNewCertNumber}
        inspectionDate={inspectionDate}
        setInspectionDate={setInspectionDate}
        issueDate={issueDate}
        setIssueDate={setIssueDate}
        newExpiryDate={newExpiryDate}
        setNewExpiryDate={setNewExpiryDate}
        resertifikasiNotes={resertifikasiNotes}
        setResertifikasiNotes={setResertifikasiNotes}
        handleConfirmUploadRenewal={handleConfirmUploadRenewal}
        tempUrl={tempUrl}
        isUploadingTemp={isUploadingTemp}
      />
    </>
  );
}