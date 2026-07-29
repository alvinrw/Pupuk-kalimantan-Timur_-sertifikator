import React from 'react';
import { History, X, Clock, FileText, ExternalLink } from 'lucide-react';

export default function MonitoringHistorySidebar({
  selectedHistoryItem,
  setSelectedHistoryItem
}) {
  if (!selectedHistoryItem) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans-clean">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setSelectedHistoryItem(null)} />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Sidebar Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Riwayat & Audit Log Perpanjangan</h3>
                <p className="text-[11px] text-slate-400 font-mono-data truncate max-w-xs">{selectedHistoryItem.merekItem}</p>
              </div>
            </div>
            <button onClick={() => setSelectedHistoryItem(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs font-mono-data">
            {/* Information Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-xs">{selectedHistoryItem.jenisItem}</span>
                <span className="px-2 py-0.5 bg-blue-50 text-[#005ea4] border border-blue-200 rounded font-bold text-[10px]">
                  {selectedHistoryItem.unitPabrik}
                </span>
              </div>
              <div className="text-slate-600 text-[11px] space-y-1">
                <div>Merek / Tipe: <span className="font-bold text-slate-900">{selectedHistoryItem.merekItem}</span></div>
                <div>No. Seri Tag: <span className="font-bold text-slate-800">{selectedHistoryItem.nomorSeriTipe}</span></div>
                <div>Instansi Penguji: <span className="font-bold text-slate-800">{selectedHistoryItem.agency}</span></div>
                <div>Sertifikat Aktif: <span className="font-bold text-[#005ea4]">{selectedHistoryItem.certificateNo}</span></div>
              </div>
            </div>

            {/* TIMELINE RIWAYAT PERPANJANGAN */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#005ea4]" />
                  <span>Timeline Rekam Jejak Perpanjangan</span>
                </span>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">
                  {(selectedHistoryItem.historyLogs || []).length} Catatan
                </span>
              </h4>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {(selectedHistoryItem.historyLogs || []).length > 0 ? (
                  selectedHistoryItem.historyLogs.map((log, idx) => (
                    <div key={idx} className="relative">
                      {/* Bullet Node */}
                      <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                        idx === 0 ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'
                      }`} />

                      <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{log.tahun} - {log.jenisTindakan}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'Berhasil / Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {log.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-0.5 font-mono-data">
                          <div>No. SK: <span className="font-bold text-slate-800">{log.noSertifikat}</span></div>
                          <div>Tgl Inspeksi: <span className="font-medium text-slate-800">{log.tglInspeksi}</span></div>
                          <div>Tgl Terbit: <span className="font-medium text-slate-800">{log.tglTerbit}</span></div>
                          <div>Tgl Expired: <span className="font-bold text-rose-600">{log.tglExpired}</span></div>
                          <div>Pelaksana: <span className="font-medium text-slate-800">{log.pelaksana}</span></div>
                          <div className="text-slate-500 italic mt-1 font-sans">"{log.catatan}"</div>
                        </div>

                        {log.fileUploaded && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-bold flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-[#005ea4]" />
                              {log.fileUploaded}
                            </span>
                            <button
                              type="button"
                              onClick={() => alert(`Membuka berkas terlampir: ${log.fileUploaded}`)}
                              className="text-[#005ea4] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Buka PDF</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic">Belum ada riwayat perpanjangan tercatat.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setSelectedHistoryItem(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer font-mono-data"
            >
              Tutup Riwayat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
