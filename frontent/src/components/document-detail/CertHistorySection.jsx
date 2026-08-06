/**
 * CertHistorySection - Tabel riwayat sertifikat + Garis Waktu Audit.
 * Dipisah dari DocumentDetailPage agar lebih mudah dikelola dan ditest.
 */
import React from 'react';
import {
  History, UploadCloud, FileText, Edit3, Trash2, Calendar
} from 'lucide-react';
import { getFullFileUrl } from '../../config/api';

export default function CertHistorySection({
  historyList,
  isLoadingHistory,
  openUploadModal,
  setEditingHistoryRow,
  setSelectedHistoryToDelete,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-[#005ea4]" />
            <span>Histori &amp; Riwayat Dokumen Sertifikat Fisik / Digital</span>
          </h4>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            Daftar seluruh berkas SK, hasil inspeksi, dan koreksi upload manual
          </p>
        </div>
        <button
          onClick={() => openUploadModal('current')}
          className="px-3.5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-mono-data shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>+ Unggah / Koreksi Berkas PDF Manual</span>
        </button>
      </div>

      {/* History Table */}
      {isLoadingHistory ? (
        <div className="py-6 text-center text-slate-400 text-xs font-mono-data">
          Memuat riwayat sertifikat...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono-data text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-3 font-bold">PERIODE SK</th>
                <th className="py-2.5 px-3 font-bold">NO. SERTIFIKAT / SK</th>
                <th className="py-2.5 px-3 font-bold">TGL TERBIT</th>
                <th className="py-2.5 px-3 font-bold">TGL EXPIRED</th>
                <th className="py-2.5 px-3 font-bold text-center">STATUS SERTIFIKAT</th>
                <th className="py-2.5 px-3 font-bold text-right">AKSI </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {historyList
                .slice()
                .sort((a, b) => {
                  if (a.isCurrent && !b.isCurrent) return -1;
                  if (!a.isCurrent && b.isCurrent) return 1;
                  return new Date(b.expired || b.terbit || '1970-01-01') - new Date(a.expired || a.terbit || '1970-01-01');
                })
                .map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${row.isCurrent ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-900">{row.periode}</td>
                    <td className="py-3 px-3 font-bold text-[#005ea4]">{row.noSertifikat}</td>
                    <td className="py-3 px-3 text-slate-700">{row.terbit}</td>
                    <td className="py-3 px-3 font-bold text-rose-700">{row.expired}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.isCurrent
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (row.fileUrl) {
                              window.open(getFullFileUrl(row.fileUrl), '_blank');
                            } else {
                              alert('Berkas PDF belum diunggah. Gunakan tombol "+ Unggah / Koreksi Berkas PDF Manual".');
                            }
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg inline-flex items-center gap-1 transition-colors ${row.fileUrl
                              ? 'bg-[#005ea4] hover:bg-[#004881] text-white cursor-pointer'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{row.fileUrl ? 'Liat PDF' : 'Belum Ada'}</span>
                        </button>
                        <button
                          onClick={() => setEditingHistoryRow({ ...row })}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                          title="Edit Baris Sertifikat"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        </button>
                        <button
                          onClick={() => setSelectedHistoryToDelete({ ...row })}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Sertifikat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Timeline */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#005ea4]" />
          <span>Garis Waktu Audit &amp; Kronologi Resertifikasi:</span>
        </h5>
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 font-mono-data text-xs">
          {historyList.map((row) => (
            <div key={row.id} className="relative">
              <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${row.isCurrent ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'
                }`} />
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{row.periode} — No. SK: {row.noSertifikat}</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] border ${
                    row.isCurrent
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold'
                      : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}>
                    {row.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>Penerbit / Penguji: <span className="font-bold text-slate-800">{row.instansi}</span></div>
                  <div>Masa Berlaku: {row.terbit} s.d <span className="font-bold text-rose-700">{row.expired}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
