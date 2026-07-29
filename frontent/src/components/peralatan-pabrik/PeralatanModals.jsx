import React from 'react';
import { ShieldAlert, Search, Building2, Check, AlertTriangle, X } from 'lucide-react';

export default function PeralatanModals({
  // Bulk Exempt
  bulkExemptModalOpen, setBulkExemptModalOpen,
  selectedStagingIds,
  bulkExemptNote, setBulkExemptNote,
  isSubmittingBulkExempt, handleBulkExempt,
  
  // Row Delete Confirm
  rowConfirmModalOpen, setRowConfirmModalOpen,
  confirmDeleteRow,

  // Reassign Target Modal
  reassignCertRowItem, setReassignCertRowItem,
  searchTargetItemTerm, setSearchTargetItemTerm,
  filteredTargetEquipmentList,
  selectedNewTargetItem, setSelectedNewTargetItem,
  confirmReassignTargetRow
}) {
  return (
    <>
      {/* BULK EXEMPT MODAL */}
      {bulkExemptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Tandai Tanpa Sertifikat
              </h3>
              <button 
                onClick={() => setBulkExemptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-medium">
                Anda akan menandai <b>{selectedStagingIds.length}</b> peralatan pabrik sebagai aset yang dikecualikan (tidak butuh sertifikat atau sertifikat fisik hilang/tidak wajib).
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Catatan Pengecualian / Alasan: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={bulkExemptNote}
                  onChange={(e) => setBulkExemptNote(e.target.value)}
                  placeholder="Contoh: Dokumen fisik rusak, tidak wajib tera ulang, dll."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkExemptModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkExempt}
                disabled={isSubmittingBulkExempt || !bulkExemptNote.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs disabled:opacity-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                {isSubmittingBulkExempt ? 'Memproses...' : 'Ya, Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GANTI TARGET SERTIFIKAT MODAL (IN ROW AKSI MENU) */}
      {reassignCertRowItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Ganti / Pindahkan Target Sertifikat</h4>
                <p className="text-[11px] text-blue-300 font-mono-data">Sertifikat: {reassignCertRowItem.noSertifikat} ({reassignCertRowItem.tipe})</p>
              </div>
              <button onClick={() => setReassignCertRowItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-700 font-medium">
                Pilih peralatan pabrik tujuan tempat sertifikat <b>{reassignCertRowItem.noSertifikat}</b> ini akan dipindahkan:
              </p>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTargetItemTerm}
                  onChange={(e) => setSearchTargetItemTerm(e.target.value)}
                  placeholder="Cari Tipe, Merek, Jenis, atau Lokasi Peralatan Target..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                {filteredTargetEquipmentList.map((eq) => {
                  const isSelected = selectedNewTargetItem?.id === eq.id;
                  return (
                    <div
                      key={eq.id}
                      onClick={() => setSelectedNewTargetItem(eq)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#005ea4] ring-1 ring-[#005ea4]'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-data font-bold text-xs text-[#005ea4]">{eq.tipe}</span>
                          <span className="text-[10px] font-mono-data text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {eq.nomorSeri}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-slate-900 block">{eq.merekItem}</span>
                        <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {eq.lokasi}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="p-1 rounded-full bg-[#005ea4] text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReassignCertRowItem(null)}
                className="px-3.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReassignTargetRow}
                className="px-4 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
              >
                Pindahkan Sertifikat ke Item Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL BEFORE DELETING ROW */}
      {rowConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Konfirmasi Penghapusan Baris</h4>
              <p className="text-xs text-slate-600 font-medium">
                Apakah Anda yakin ingin menghapus baris data peralatan ini? Baris yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRowConfirmModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteRow}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Ya, Hapus Baris Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
