import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function LayoutPreview({ columns }) {
  return (
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
                      {columns.filter(c => c.isVisible && c.fieldKey !== 'masterTitle').map(c => (
                        <div key={c.fieldKey} className="flex-1 truncate" title={c.label}>
                          {c.label}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 text-slate-300 py-1 border-b border-slate-800/40">
                      {columns.filter(c => c.isVisible && c.fieldKey !== 'masterTitle').map(c => (
                        <div key={c.fieldKey} className="flex-1 truncate">
                          {c.fieldKey === 'no' ? '1' : c.fieldKey === 'title' ? 'Kompresor Gas' : c.fieldKey === 'status' ? 'Aktif' : '...'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
  );
}
