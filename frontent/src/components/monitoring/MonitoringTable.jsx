import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

/**
 * MonitoringTable  -  Tabel utama monitoring sertifikasi.
 */
export default function MonitoringTable({
  filteredCertificates,
  totalCount,
  searchTerm, setSearchTerm,
  activeFilterCount,
  resetFilters,
  customUrgentDays,
  onOpenDetail,
  onCompleteModal,
  onCancelAction,
  onCancelAfkir,
  onQuickRenew,
  onQuickDecommission,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Top Controls & Search Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2 font-mono-data">
          <span className="text-xs font-bold text-slate-800">Daftar Dokumen Sertifikasi</span>
          <span className="text-[11px] font-bold text-[#005ea4] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            {filteredCertificates.length} Data Ditampilkan
          </span>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end min-w-[280px]">
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-rose-700 hover:underline px-2.5 py-1 bg-rose-50 rounded border border-rose-200 font-mono-data transition-colors"
            >
              Reset Filter ({activeFilterCount})
            </button>
          )}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari item, seri, nomor sertifikat..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none text-center align-middle">
              <th className="py-3 px-3 text-center font-bold whitespace-nowrap align-middle">NO.</th>
              <th className="py-3 px-3 font-bold whitespace-nowrap text-[#005ea4] text-center align-middle">KATEGORI DOKUMEN</th>
              <th className="py-3 px-3 font-bold whitespace-nowrap text-center align-middle">JENIS PERIZINAN / ALAT</th>
              <th className="py-3 px-3 font-bold whitespace-nowrap text-center align-middle">UNIT PABRIK</th>
              <th className="py-3 px-3 font-bold whitespace-nowrap text-center align-middle">MEREK / NAMA ITEM</th>
              <th className="py-3 px-3 font-bold whitespace-nowrap text-center align-middle">NOMOR SERI / TAG</th>
              <th className="py-3 px-3 font-bold whitespace-nowrap text-center align-middle">NO. SERTIFIKAT</th>
              <th className="py-3 px-3 font-bold whitespace-nowrap text-center align-middle">TGL EXPIRATION</th>
              <th className="py-3 px-3 font-bold text-center whitespace-nowrap align-middle">STATUS PERIZINAN</th>
              <th className="py-3 px-3 font-bold text-center whitespace-nowrap align-middle">AKSI WORKFLOW</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map((doc, index) => {
                const isInProgress = doc.workflowStatus === 'in_progress';
                const isDecommissioned = doc.workflowStatus === 'decommissioned';
                const isExempt = doc.workflowStatus === 'exempt';

                let rowStyleClass = "hover:bg-slate-50/80 transition-colors";
                if (isDecommissioned) {
                  rowStyleClass = "bg-[#0f172a] text-slate-100 transition-colors hover:bg-slate-800";
                } else if (isInProgress) {
                  rowStyleClass = "bg-amber-50/70 hover:bg-amber-100/70 text-slate-900 transition-colors";
                } else if (doc.sisaHari <= 0) {
                  rowStyleClass = "bg-rose-50/70 hover:bg-rose-100/70 text-slate-900 transition-colors";
                }

                return (
                  <tr key={doc.id} className={`${rowStyleClass} align-middle`}>
                    <td className={`py-3 px-3 text-center font-mono-data font-bold whitespace-nowrap align-middle ${isDecommissioned ? 'text-slate-400' : 'text-slate-500'}`}>
                      {index + 1}
                    </td>
                    <td className={`py-3 px-3 font-bold whitespace-nowrap text-center align-middle ${isDecommissioned ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                      {doc.kategoriDokumen || doc.kategori || 'Perizinan'}
                    </td>
                    <td className={`py-3 px-3 font-medium whitespace-nowrap text-center align-middle ${isDecommissioned ? 'text-slate-200' : 'text-slate-800'}`}>
                      {doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono-data font-bold whitespace-nowrap text-center align-middle">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${isDecommissioned ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                        {doc.unitPabrik || doc.unit || doc.lokasi || '-'}
                      </span>
                    </td>
                    <td
                      onClick={() => onOpenDetail(doc)}
                      className={`py-3 px-3 font-bold hover:text-[#005ea4] cursor-pointer hover:underline whitespace-nowrap text-center align-middle ${isDecommissioned ? 'text-white' : 'text-slate-900'}`}
                      title="Klik untuk Lihat Detail Penuh"
                    >
                      {doc.merekItem || doc.title || doc.judulCiptaan || '-'}
                    </td>
                    <td className={`py-3 px-3 font-mono-data font-semibold whitespace-nowrap text-center align-middle ${isDecommissioned ? 'text-slate-300' : 'text-slate-700'}`}>
                      {doc.nomorSeriTipe || doc.nomorSeri || doc.tipe || doc.code || '-'}
                    </td>
                    <td className={`py-3 px-3 font-mono-data whitespace-nowrap text-center align-middle ${isDecommissioned ? 'text-slate-300' : 'text-slate-800'}`}>
                      {isExempt ? (
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[10px]">Tanpa Sertifikat</span>
                      ) : (
                        doc.certificateNo || doc.noSertifikat || '-'
                      )}
                    </td>
                    <td className={`py-3 px-3 font-mono-data font-bold whitespace-nowrap text-center align-middle ${isDecommissioned ? 'text-slate-300' : 'text-slate-900'}`}>
                      {doc.tglExpired && doc.tglExpired !== '2030-01-01' ? doc.tglExpired : (doc.expiryDate && doc.expiryDate !== '2030-01-01' ? doc.expiryDate : '-')}
                      {doc.sisaHari !== null && doc.sisaHari !== undefined && doc.tglExpired !== '-' && (
                        <span className={`text-[10px] block font-normal font-mono-data ${isDecommissioned ? 'text-slate-400' : doc.sisaHari <= 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          ({isDecommissioned ? 'Afkir / Non-Aktif' : doc.sisaHari <= 0 ? 'Expired' : `${doc.sisaHari} hr lagi`})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap font-mono-data font-bold align-middle">
                      {isDecommissioned ? (
                        <span className="text-slate-400">Non-Aktif</span>
                      ) : isExempt ? (
                        <span className="text-indigo-600">Catatan Khusus</span>
                      ) : doc.sisaHari <= 0 ? (
                        <span className="text-rose-600">Expired</span>
                      ) : doc.sisaHari <= (parseInt(customUrgentDays) || 30) ? (
                        <span className="text-amber-600">&lt; {customUrgentDays || 30} Hari</span>
                      ) : (
                        <span className="text-emerald-600">Valid</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap font-mono-data align-middle">
                      {isInProgress ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => onCompleteModal(doc)}
                            className="px-2.5 py-1 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-md shadow-2xs cursor-pointer transition-colors"
                          >
                            Selesai & Upload
                          </button>
                          <button
                            onClick={() => onCancelAction(doc.id)}
                            className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : isDecommissioned ? (
                        <button
                          onClick={() => onCancelAfkir(doc.id)}
                          className="text-xs text-slate-300 hover:text-white hover:underline font-medium cursor-pointer"
                        >
                          Batal Afkir
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => onQuickRenew(doc.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md cursor-pointer transition-colors"
                          >
                            Perpanjang
                          </button>
                          <button
                            onClick={() => onQuickDecommission(doc.id)}
                            className="text-xs text-slate-500 hover:text-slate-900 hover:underline font-medium cursor-pointer"
                          >
                            Afkir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-10 text-center text-slate-500 font-mono-data">
                  Tidak ada perizinan yang sesuai dengan kriteria filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
