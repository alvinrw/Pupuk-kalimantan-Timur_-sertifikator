import React from 'react';
import { Columns, Rows, Plus, Eye, EyeOff, GripVertical, Trash2, Save, Loader2, Settings, HelpCircle } from 'lucide-react';
import LayoutPreview from './LayoutPreview';

export default function ColumnConfigTab({
  columns,
  setIsAddColOpen,
  handleSaveColumns,
  isSaving,
  handleColDragStart,
  handleColDragOver,
  handleColDrop,
  setDragOverColIndex,
  setDraggedColIndex,
  dragOverColIndex,
  toggleColVisibility,
  handleDeleteColumn
}) {
  return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sisi Kiri: Draggable List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Susunan & Visibilitas Kolom</span>
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAddColOpen(true)}
                        className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kolom Kustom Baru</span>
                      </button>
                      <button
                        onClick={handleSaveColumns}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-[#00a368] hover:bg-[#008f5a] disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Kolom'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    * Seret (drag-and-drop) baris di bawah menggunakan handle <GripVertical className="inline w-3.5 h-3.5 text-slate-400" /> untuk mengatur posisi kolom dari kiri ke kanan. Klik ikon mata untuk menyembunyikan atau menampilkan kolom di tabel utama.
                  </p>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
                    {columns.map((col, idx) => (
                      <div
                        key={col.fieldKey}
                        style={{ display: col.fieldKey === 'masterTitle' ? 'none' : undefined }}
                        draggable
                        onDragStart={(e) => handleColDragStart(e, idx)}
                        onDragOver={(e) => handleColDragOver(e, idx)}
                        onDrop={(e) => handleColDrop(e, idx)}
                        onDragEnd={() => {
                          setDragOverColIndex(null);
                          setDraggedColIndex(null);
                        }}
                        className={`flex items-center justify-between p-3 transition-all group cursor-grab active:cursor-grabbing border-l-4 ${
                          dragOverColIndex === idx
                            ? 'border-l-[#005ea4] bg-blue-50/40'
                            : 'border-l-transparent bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 pointer-events-none">
                          <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">{col.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono-data block">
                              Key: {col.fieldKey} • Tipe: {col.type === 'nominal' ? 'Nominal / Angka' : col.type === 'date' ? 'Tanggal' : 'Teks'}
                              {col.isCustom && <span className="ml-2 text-blue-600 font-bold bg-blue-50 px-1 rounded">Custom</span>}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleColVisibility(idx)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              col.isVisible 
                                ? 'bg-blue-50 border-blue-200 text-[#005ea4] hover:bg-blue-100' 
                                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={col.isVisible ? 'Kolom Terlihat' : 'Kolom Tersembunyi'}
                          >
                            {col.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {col.isCustom ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(col.fieldKey)}
                              className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Kolom"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 select-none">
                              Bawaan
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Preview Tampilan Tabel */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Pratinjau Tata Letak</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Visualisasi bagaimana kolom-kolom ini akan tersusun dari kiri ke kanan pada modul utama:
                  </p>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-white font-mono text-[10px] p-4 space-y-2">
                    <div className="flex border-b border-slate-700 pb-1.5 gap-2 text-slate-400 uppercase font-bold tracking-wider">
                      {columns.filter(c => c.isVisible).map(c => (
                        <div key={c.fieldKey} className="flex-1 truncate" title={c.label}>
                          {c.label}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 text-slate-300 py-1 border-b border-slate-800/40">
                      {columns.filter(c => c.isVisible).map(c => (
                        <div key={c.fieldKey} className="flex-1 truncate">
                          {c.fieldKey === 'no' ? '1' : c.fieldKey === 'title' ? 'Kompresor Gas' : c.fieldKey === 'status' ? 'Aktif' : '...'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
  );
}
