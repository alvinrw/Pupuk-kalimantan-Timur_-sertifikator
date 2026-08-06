import React from 'react';
import { ShieldAlert, X, Loader2 } from 'lucide-react';
import SingleEntryGenericModal from '../SingleEntryGenericModal';
import CsvImportModal from '../CsvImportModal';
import ResolveDocumentModal from '../ResolveDocumentModal';
import CertDetailModal from './CertDetailModal';
import ModalAddLinkedCert from '../document-detail/ModalAddLinkedCert';

export default function GenericModals({
  categoryName,
  currentCategoryKey,
  isSingleModalOpen,
  setIsSingleModalOpen,
  handleSingleAdded,
  isCsvModalOpen,
  setIsCsvModalOpen,
  handleCsvImported,
  resolveTargetItem,
  setResolveTargetItem,
  loadData,
  bulkExemptModalOpen,
  setBulkExemptModalOpen,
  selectedStagingIds,
  bulkExemptNote,
  setBulkExemptNote,
  isSubmittingBulkExempt,
  handleBulkExempt,
  viewingCert,
  setViewingCert,
  addCertTargetMaster,
  setAddCertTargetMaster,
  handleSaveCertEdit,
  handleDeleteCert,
  handleAddCertSuccess
}) {
  return (
    <>
      <SingleEntryGenericModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onAddSuccess={handleSingleAdded}
        categoryName={categoryName}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleCsvImported}
        categoryKey={currentCategoryKey}
      />

      <ResolveDocumentModal
        isOpen={!!resolveTargetItem}
        onClose={() => setResolveTargetItem(null)}
        item={resolveTargetItem}
        onSuccess={loadData}
      />

      <CertDetailModal
        isOpen={!!viewingCert}
        onClose={() => setViewingCert(null)}
        cert={viewingCert?.cert}
        masterItem={viewingCert?.masterItem}
        onSaveCert={handleSaveCertEdit}
        onDeleteCert={handleDeleteCert}
      />

      <ModalAddLinkedCert
        isOpen={!!addCertTargetMaster}
        onClose={() => setAddCertTargetMaster(null)}
        onSave={handleAddCertSuccess}
      />

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
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 font-medium">
                  Anda akan menandai <strong>{selectedStagingIds.length} item terpilih</strong> sebagai tidak memerlukan dokumen/sertifikat (EXEMPT).
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Alasan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={bulkExemptNote}
                  onChange={(e) => setBulkExemptNote(e.target.value)}
                  placeholder="Masukkan alasan mengapa dokumen tidak diperlukan..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] bg-slate-50 focus:bg-white resize-none"
                  rows={3}
                ></textarea>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkExemptModalOpen(false)}
                disabled={isSubmittingBulkExempt}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkExempt}
                disabled={isSubmittingBulkExempt || !bulkExemptNote.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
              >
                {isSubmittingBulkExempt && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ya, Tandai {selectedStagingIds.length} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
