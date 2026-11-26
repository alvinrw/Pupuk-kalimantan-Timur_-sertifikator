import toast from 'react-hot-toast';
/**
 * CertHistorySection - Tabel riwayat sertifikat + Garis Waktu Audit.
 * Dipisah dari DocumentDetailPage agar lebih mudah dikelola dan ditest.
 */
import React from 'react';
import {
  History, UploadCloud, FileText, Edit3, Trash2, Calendar, UserCheck
} from 'lucide-react';
import { getFullFileUrl } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CertHistorySection({
  historyList,
  isLoadingHistory,
  openUploadModal,
  setEditingHistoryRow,
  setSelectedHistoryToDelete,
  primaryCert,
  isMasterDecommissioned
}) {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';

  const getTimestamp = (dateStr) => {
    if (!dateStr || dateStr === '-') return 0;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
    }
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  return (
    <div id="cert-history-section" className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6 transition-all duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-[#005ea4]" />
            <span>Histori &amp; Riwayat Dokumen Sertifikat Fisik / Digital</span>
          </h4>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            Daftar seluruh berkas SK, hasil inspeksi, dan histori dokumen. Ini adalah histori dari dokumen terhubung.
          </p>
        </div>
        {!isViewer && !isMasterDecommissioned && (
        <button
          onClick={() => openUploadModal('archive', primaryCert?.id)}
          className="px-3.5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-mono-data shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>+ Unggah / Koreksi Berkas PDF Manual</span>
        </button>
        )}
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
                <th className="py-2.5 px-3 font-bold align-top">PERIODE SK</th>
                <th className="py-2.5 px-3 font-bold align-top">NAMA SERTIFIKAT</th>
                <th className="py-2.5 px-3 font-bold align-top">NO. SERTIFIKAT / SK</th>
                <th className="py-2.5 px-3 font-bold align-top whitespace-nowrap">TGL TERBIT</th>
                <th className="py-2.5 px-3 font-bold align-top whitespace-nowrap">TGL EXPIRED</th>
                <th className="py-2.5 px-3 font-bold align-top">DIINPUT OLEH</th>
                <th className="py-2.5 px-3 font-bold text-right align-top">AKSI </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {historyList
                .filter(row => row.type === 'certificate')
                .slice()
                .sort((a, b) => {
                  const timeA = getTimestamp(a.expired) || getTimestamp(a.terbit);
                  const timeB = getTimestamp(b.expired) || getTimestamp(b.terbit);
                  return timeB - timeA;
                })
                .map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${row.isCurrent ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 align-top">{row.periode}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 align-top">{row.namaSertifikat || row.jenisSertifikat || '-'}</td>
                    <td className="py-3 px-3 font-bold text-[#005ea4] align-top">{row.noSertifikat}</td>
                    <td className="py-3 px-3 text-slate-700 align-top whitespace-nowrap">{row.terbit}</td>
                    <td className="py-3 px-3 font-bold text-rose-700 align-top whitespace-nowrap">{row.expired}</td>
                    <td className="py-3 px-3 align-top">
                      {row.uploadedBy ? (
                        <div className="flex items-start gap-1.5 mt-0.5">
                          <UserCheck className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-bold text-slate-700 text-[11px] leading-tight">{row.uploadedBy}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] block mt-0.5">Tidak Tercatat</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (row.fileUrl) {
                              window.open(getFullFileUrl(row.fileUrl), '_blank');
                            } else {
                              toast('Berkas PDF belum diunggah. Gunakan tombol "+ Unggah / Koreksi Berkas PDF Manual".');
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
                        {!isViewer && !isMasterDecommissioned && (
                          <>
                            <button
                              onClick={() => {
                                if (isMasterDecommissioned) return;
                                setEditingHistoryRow({ ...row });
                              }}
                              disabled={isMasterDecommissioned}
                              className={`p-1.5 border rounded-lg transition-colors ${
                                isMasterDecommissioned
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 cursor-pointer'
                              }`}
                              title={isMasterDecommissioned ? "Item Decommissioned tidak dapat diedit" : "Edit Baris Sertifikat"}
                            >
                              <Edit3 className={`w-3.5 h-3.5 ${isMasterDecommissioned ? 'text-slate-400' : 'text-amber-700'}`} />
                            </button>
                            <button
                              onClick={() => setSelectedHistoryToDelete(row)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                              title="Hapus Baris Sertifikat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
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
              {row.type === 'audit_log' ? (
                <>
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white bg-slate-300 ring-2 ring-slate-100" />
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span className="capitalize">{(row.action || 'System Action').replace(/_/g, ' ')}</span>
                      <span className="text-slate-500 text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      {row.description || 'Tidak ada deskripsi.'}
                    </div>
                    <div className="flex items-center gap-1 pt-1 text-[10px] text-slate-400">
                      <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Oleh: <span className="font-bold text-slate-500">{row.changedBy || 'Sistem'}</span></span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                      (row.status || '').toLowerCase() === 'expired'
                        ? 'bg-rose-500 ring-2 ring-rose-200'
                        : (row.status || '').toLowerCase() === 'exempt'
                        ? 'bg-amber-500 ring-2 ring-amber-200'
                        : row.isCurrent 
                        ? 'bg-emerald-500 ring-2 ring-emerald-200' 
                        : 'bg-slate-400'
                    }`} />
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{row.periode} — {row.namaSertifikat || row.jenisSertifikat || 'Sertifikat'} {row.noSertifikat && row.noSertifikat !== '-' ? `(No. SK: ${row.noSertifikat})` : ''}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] border ${
                          (row.status || '').toLowerCase() === 'expired'
                            ? 'text-rose-700 bg-rose-50 border-rose-200 font-bold'
                            : (row.status || '').toLowerCase() === 'exempt'
                            ? 'text-amber-700 bg-amber-50 border-amber-200 font-bold'
                            : row.isCurrent
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold'
                            : 'text-slate-500 bg-slate-100 border-slate-200'
                        }`}>
                        {row.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>Instansi Penerbit: <span className="font-bold text-slate-800">{row.instansi || '-'}</span></div>
                      <div>Masa Berlaku: {row.terbit} s.d <span className="font-bold text-rose-700">{row.expired}</span></div>
                      <div className="flex items-center gap-1 pt-0.5">
                        <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Diinput oleh: </span>
                        <span className="font-bold text-slate-800">
                          {row.uploadedBy || 'Sistem / Tidak Tercatat'}
                        </span>
                        {row.createdAt && (
                          <span className="text-slate-400 ml-1">
                            — {new Date(row.createdAt).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
