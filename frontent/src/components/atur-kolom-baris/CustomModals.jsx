import React from 'react';
import { Loader2, PlusCircle, CheckCircle, AlertCircle, X, Type, DollarSign, Calendar } from 'lucide-react';

export default function CustomModals({
  isAddColOpen, setIsAddColOpen, handleAddColumn, isSaving,
  newColLabel, setNewColLabel, newColType, setNewColType,
  confirmModal, setConfirmModal
}) {
  return (
    <>
      {/* =======================================================
          MODAL 1: TAMBAH KOLOM BARU
          ======================================================= */}
      {isAddColOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm">Tambah Kolom Kustom Baru</h4>
              <button onClick={() => setIsAddColOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddColumn} className="p-6 space-y-4 text-xs font-mono-data">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Nama / Label Kolom</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kapasitas Aset"
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] outline-none text-xs font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-800 block mb-1">Tipe Data Input</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'text', label: 'Teks', icon: Type },
                    { val: 'nominal', label: 'Nominal/Angka', icon: DollarSign },
                    { val: 'date', label: 'Tanggal', icon: Calendar },
                  ].map(t => {
                    const Icon = t.icon;
                    const isSelected = newColType === t.val;
                    return (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setNewColType(t.val)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer font-bold ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200 text-[#005ea4]' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddColOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Tambah Kolom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-900">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-mono-data">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
