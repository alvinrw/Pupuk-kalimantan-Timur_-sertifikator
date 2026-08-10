/**
 * ModalEditHistoryRow - Modal edit baris sertifikat histori.
 * Dipisah dari DocumentDetailPage.
 */
import React from 'react';
import { X, Edit3, Save } from 'lucide-react';

export default function ModalEditHistoryRow({
  editingHistoryRow,
  setEditingHistoryRow,
  selectedHistoryFile,
  setSelectedHistoryFile,
  editHistoryFileInputRef,
  onSubmit,
}) {
  if (!editingHistoryRow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm">Edit Data Baris Sertifikat Histori</h4>
          </div>
          <button onClick={() => setEditingHistoryRow(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(editingHistoryRow); }} className="p-5 space-y-3.5 text-xs font-mono-data">
          {(() => {
            const formatDateForInput = (dateStr) => {
              if (!dateStr) return '';
              if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                const parts = dateStr.split('/');
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
              return dateStr;
            };

            return (
              <>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Nama Sertifikat</label>
                  <input
                    type="text" required
                    value={editingHistoryRow.namaSertifikat || editingHistoryRow.jenisSertifikat || ''}
                    onChange={(e) => setEditingHistoryRow({ ...editingHistoryRow, namaSertifikat: e.target.value, jenisSertifikat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">No. Sertifikat / SK</label>
                  <input
                    type="text" required
                    value={editingHistoryRow.noSertifikat}
                    onChange={(e) => setEditingHistoryRow({ ...editingHistoryRow, noSertifikat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Tgl Terbit</label>
                    <input
                      type="date"
                      value={formatDateForInput(editingHistoryRow.terbit)}
                      onChange={(e) => setEditingHistoryRow({ ...editingHistoryRow, terbit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired</label>
                    <input
                      type="date"
                      value={formatDateForInput(editingHistoryRow.expired)}
                      onChange={(e) => setEditingHistoryRow({ ...editingHistoryRow, expired: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                    />
                  </div>
                </div>
              </>
            );
          })()}

          <div>
            <label className="font-bold text-slate-800 block mb-1">Upload / Ganti File PDF Sertifikat</label>
            <div
              onClick={() => editHistoryFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#005ea4] rounded-xl p-3 text-center bg-slate-50 hover:bg-blue-50/50 cursor-pointer"
            >
              <input
                ref={editHistoryFileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setSelectedHistoryFile(file);
                }}
                className="hidden"
              />
              <span className="text-xs font-bold text-[#005ea4] block">
                {selectedHistoryFile
                  ? `✓ File Baru: ${selectedHistoryFile.name}`
                  : (editingHistoryRow.fileUrl ? '✓ Ada Berkas PDF (Klik untuk ganti)' : 'Klik untuk Unggah PDF')}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setEditingHistoryRow(null); setSelectedHistoryFile(null); }}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Baris</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
