import React from 'react';
import { Trash2, AlertTriangle, Ban, RotateCcw, RefreshCw, Loader2 } from 'lucide-react';
import ModalConfirm from './ModalConfirm';
import ModalUploadCert from './ModalUploadCert';
import ModalAddLinkedCert from './ModalAddLinkedCert';
import ModalEditHistoryRow from './ModalEditHistoryRow';

export default function DocumentModals({ hook, item }) {
  const {
    formData,
    isUploadModalOpen, setIsUploadModalOpen,
    uploadData, setUploadData,
    selectedUploadFile, setSelectedUploadFile,
    manualFileInputRef, handleUploadSubmit, isSingleCertScope,
    isAddCertModalOpen, setIsAddCertModalOpen, handleAddLinkedCert,
    editingHistoryRow, setEditingHistoryRow,
    selectedHistoryFile, setSelectedHistoryFile,
    editHistoryFileInputRef, handleSaveHistoryRowEdit,
    deletingLinkedCertId, setDeletingLinkedCertId, handleDeleteLinkedCert,
    selectedHistoryToDelete, setSelectedHistoryToDelete, handleDeleteHistoryRow,
    isDeleteDialogOpen, setIsDeleteDialogOpen, isDeleting, handleDeleteMasterItem,
    isAfkirModalOpen, setIsAfkirModalOpen, isAfkiring, confirmAfkir,
    isAktifkanModalOpen, setIsAktifkanModalOpen, isAktifkaning, confirmAktifkan,
    isConfirmRenewHeaderModalOpen, setIsConfirmRenewHeaderModalOpen, isRenewingHeader, confirmRenewHeader,
    isConfirmCancelHeaderModalOpen, setIsConfirmCancelHeaderModalOpen, isCancelingHeader, confirmCancelHeader,
    isRenewExemptModalOpen, setIsRenewExemptModalOpen,
    renewExemptDate, setRenewExemptDate, isRenewingExempt, confirmRenewExempt,
  } = hook;

  return (
    <>
      <ModalUploadCert
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadData={uploadData}
        setUploadData={setUploadData}
        selectedUploadFile={selectedUploadFile}
        setSelectedUploadFile={setSelectedUploadFile}
        manualFileInputRef={manualFileInputRef}
        onSubmit={handleUploadSubmit}
        isSingleCertScope={isSingleCertScope}
      />

      <ModalAddLinkedCert
        isOpen={isAddCertModalOpen}
        onClose={() => setIsAddCertModalOpen(false)}
        onSave={handleAddLinkedCert}
      />

      <ModalEditHistoryRow
        editingHistoryRow={editingHistoryRow}
        setEditingHistoryRow={setEditingHistoryRow}
        selectedHistoryFile={selectedHistoryFile}
        setSelectedHistoryFile={setSelectedHistoryFile}
        editHistoryFileInputRef={editHistoryFileInputRef}
        onSubmit={handleSaveHistoryRowEdit}
      />

      {/* Hapus Sertifikat Terhubung */}
      <ModalConfirm
        isOpen={!!deletingLinkedCertId}
        onClose={() => setDeletingLinkedCertId(null)}
        onConfirm={() => handleDeleteLinkedCert(deletingLinkedCertId)}
        title="Hapus Sertifikat Terhubung?"
        description="Sertifikat ini akan dihapus dari daftar. Data lainnya tidak terpengaruh."
        confirmLabel="Ya, Hapus"
        icon={<Trash2 className="w-6 h-6" />}
        iconBgClassName="bg-rose-100 text-rose-600"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
      />

      {/* Hapus Histori Sertifikat */}
      <ModalConfirm
        isOpen={!!selectedHistoryToDelete}
        onClose={() => setSelectedHistoryToDelete(null)}
        onConfirm={() => handleDeleteHistoryRow(selectedHistoryToDelete.id)}
        title="Konfirmasi Hapus Sertifikat"
        description={<>Hapus berkas sertifikat <b>{selectedHistoryToDelete?.noSertifikat}</b> ({selectedHistoryToDelete?.periode}) dari histori?</>}
        confirmLabel="Ya, Hapus Sertifikat"
        icon={<Trash2 className="w-6 h-6" />}
        iconBgClassName="bg-rose-100 text-rose-600"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
      />

      {/* Hapus Master Item */}
      <ModalConfirm
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteMasterItem}
        isLoading={isDeleting}
        title="Konfirmasi Hapus Seluruh Data Induk"
        description={<>Apakah Anda yakin ingin menghapus seluruh entitas data untuk <br /><strong className="text-slate-800">{formData.merekItem}</strong>?<br /><br /><span className="text-rose-600 font-bold">PERINGATAN: Tindakan ini akan menghapus entitas induk beserta seluruh histori dan dokumen/sertifikat terhubung di dalamnya secara permanen!</span></>}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus Seluruh Data & Dokumen'}
        icon={<AlertTriangle className="w-6 h-6" />}
        iconBgClassName="bg-rose-100 text-rose-600"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
      />

      {/* Afkir */}
      <ModalConfirm
        isOpen={isAfkirModalOpen}
        onClose={() => setIsAfkirModalOpen(false)}
        onConfirm={confirmAfkir}
        isLoading={isAfkiring}
        title="Tandai Sebagai Afkir?"
        description={<>Apakah Anda yakin ingin menandai <br /><strong className="text-slate-800">{formData.merekItem || item?.title}</strong> sebagai Afkir/Non-Aktif?</>}
        confirmLabel={isAfkiring ? 'Memproses...' : 'Ya, Afkirkan'}
        icon={<Ban className="w-6 h-6" />}
        iconBgClassName="bg-slate-100 text-slate-600 border border-slate-200"
        confirmClassName="bg-slate-800 hover:bg-slate-900 text-white"
      />

      {/* Aktifkan Kembali */}
      <ModalConfirm
        isOpen={isAktifkanModalOpen}
        onClose={() => setIsAktifkanModalOpen(false)}
        onConfirm={confirmAktifkan}
        isLoading={isAktifkaning}
        title="Aktifkan Kembali?"
        description={<>Apakah Anda yakin ingin mengaktifkan kembali <br /><strong className="text-slate-800">{formData.merekItem || item?.title}</strong>?</>}
        confirmLabel={isAktifkaning ? 'Memproses...' : 'Ya, Aktifkan'}
        icon={<RotateCcw className="w-6 h-6" />}
        iconBgClassName="bg-blue-100 text-[#005ea4] border border-blue-200"
        confirmClassName="bg-[#005ea4] hover:bg-[#004881] text-white"
      />

      {/* Perpanjang */}
      <ModalConfirm
        isOpen={isConfirmRenewHeaderModalOpen}
        onClose={() => setIsConfirmRenewHeaderModalOpen(false)}
        onConfirm={confirmRenewHeader}
        isLoading={isRenewingHeader}
        title="Ajukan Perpanjangan?"
        description={<>Status <strong className="text-slate-800">{formData.merekItem || item?.title}</strong> akan berubah menjadi <span className="text-amber-700 font-bold">Sedang Diproses</span>.</>}
        confirmLabel={isRenewingHeader ? 'Memproses...' : 'Ya, Ajukan Perpanjangan'}
        icon={<RotateCcw className="w-6 h-6" />}
        iconBgClassName="bg-amber-100 text-amber-600 border border-amber-200"
        confirmClassName="bg-amber-500 hover:bg-amber-600 text-white"
      />

      {/* Batal Perpanjang */}
      <ModalConfirm
        isOpen={isConfirmCancelHeaderModalOpen}
        onClose={() => setIsConfirmCancelHeaderModalOpen(false)}
        onConfirm={confirmCancelHeader}
        isLoading={isCancelingHeader}
        title="Batalkan Perpanjangan?"
        description={<>Status <strong className="text-slate-800">{formData.merekItem || item?.title}</strong> akan dikembalikan menjadi <span className="text-slate-800 font-bold">Aktif (Normal)</span>.</>}
        confirmLabel={isCancelingHeader ? 'Memproses...' : 'Ya, Batalkan'}
        icon={<Ban className="w-6 h-6" />}
        iconBgClassName="bg-rose-100 text-rose-600 border border-rose-200"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
      />

      {/* Perpanjangan Exempt */}
      {isRenewExemptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Ajukan Perpanjangan</h4>
                  <p className="text-[11px] text-slate-500 font-mono-data">Tanpa Upload Sertifikat Baru</p>
                </div>
              </div>
              <div className="space-y-3 font-mono-data">
                <p className="text-xs text-slate-600">Masukkan estimasi tanggal jatuh tempo baru untuk: <br /><strong className="text-slate-900 text-sm">{formData.merekItem || item?.title}</strong></p>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Tanggal Expired Baru</label>
                  <input type="date" value={renewExemptDate} onChange={(e) => setRenewExemptDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setIsRenewExemptModalOpen(false)} disabled={isRenewingExempt} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">Batal</button>
                <button onClick={confirmRenewExempt} disabled={isRenewingExempt || !renewExemptDate}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRenewingExempt ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Simpan Perpanjangan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
