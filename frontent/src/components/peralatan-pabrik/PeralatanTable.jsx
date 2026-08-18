import React from 'react';
import { CheckCircle2, FileCheck, FileWarning, HelpCircle, ShieldAlert, XCircle, Search, Eye, Wrench, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function PeralatanTable({
  activeMainTab,
  expandedRows,
  visibleColumnKeys,
  isVisible,
  selectedStagingIds,
  toggleSelectStaging,
  toggleSelectAllStaging,
  filterJenis, setFilterJenis,
  filterLokasi, setFilterLokasi,
  filterUser, setFilterUser,
  filterStatus, setFilterStatus,
  filterHasSertifikat, setFilterHasSertifikat,
  uniqueJenis, uniqueLokasi, uniqueUser,
  setDetailModalItem,
  setResolveTargetItem,
  getRowStatusStyle,
  sortKey,
  sortOrder,
  toggleSort
}) {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${activeMainTab === 'staging' && selectedStagingIds.length > 0 ? 'mt-4' : 'mt-0'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
              {activeMainTab === 'staging' && (
                <th className="py-3.5 px-4 text-center whitespace-nowrap w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 accent-amber-600 cursor-pointer"
                    checked={expandedRows.length > 0 && selectedStagingIds.length === expandedRows.length}
                    onChange={() => toggleSelectAllStaging(expandedRows)}
                  />
                </th>
              )}
              {isVisible("no") && <th className="py-3.5 px-4 text-center font-bold whitespace-nowrap align-middle">NO.</th>}

              {/* JENIS PERALATAN PABRIK */}
              {isVisible("jenisPeralatan") && (
                <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>JENIS PERALATAN PABRIK</span>
                    <select
                      value={filterJenis}
                      onChange={(e) => setFilterJenis(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs max-w-[100px]"
                    >
                      <option value="All">Semua</option>
                      {uniqueJenis.filter(j => j !== 'All').map((j, idx) => (
                        <option key={idx} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </th>
              )}

              {isVisible("merekItem") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">MEREK/ITEM</th>}
              {isVisible("tipe") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">TIPE</th>}
              {isVisible("nomorSeri") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">NOMOR SERI</th>}
              {isVisible("kapasitas") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">KAPASITAS</th>}

              {isVisible("lokasi") && (
                <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>LOKASI</span>
                    <select
                      value={filterLokasi}
                      onChange={(e) => setFilterLokasi(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs max-w-[100px]"
                    >
                      <option value="All">Semua</option>
                      {uniqueLokasi.filter(l => l !== 'All').map((l, idx) => (
                        <option key={idx} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </th>
              )}

              {isVisible("user") && (
                <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>USER</span>
                    <select
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs max-w-[100px]"
                    >
                      <option value="All">Semua</option>
                      {uniqueUser.filter(u => u !== 'All').map((u, idx) => (
                        <option key={idx} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </th>
              )}

              {isVisible("status") && (
                <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60 align-middle">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>STATUS</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs max-w-[100px]"
                    >
                      <option value="All">Semua</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Spare">Spare</option>
                      <option value="Rusak">Rusak</option>
                    </select>
                  </div>
                </th>
              )}

              {isVisible("hasSertifikat") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">FILE PDF</th>}
              {isVisible("namaSertifikat") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">NAMA SERTIFIKAT</th>}
              {isVisible("noSertifikat") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">NO. SERTIFIKAT</th>}
              {isVisible("tanggalInspeksi") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">TANGGAL INSPEKSI</th>}
              {isVisible("terbit") && (
                <th 
                  onClick={() => toggleSort('terbit')}
                  className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle cursor-pointer transition-colors select-none ${
                    sortKey === 'terbit'
                      ? 'bg-blue-50 text-[#005ea4] hover:bg-blue-100'
                      : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>TERBIT</span>
                    <span className={`text-[11px] font-bold ${sortKey === 'terbit' ? 'text-[#005ea4]' : 'text-slate-400'}`}>
                      {sortKey === 'terbit' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>
              )}
              {isVisible("berakhir") && (
                <th 
                  onClick={() => toggleSort('berakhir')}
                  className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle cursor-pointer transition-colors select-none ${
                    sortKey === 'berakhir'
                      ? 'bg-blue-50 text-[#005ea4] hover:bg-blue-100'
                      : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>BERAKHIR</span>
                    <span className={`text-[11px] font-bold ${sortKey === 'berakhir' ? 'text-[#005ea4]' : 'text-slate-400'}`}>
                      {sortKey === 'berakhir' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>
              )}
              {isVisible("keterangan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">KETERANGAN</th>}
              <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap align-middle">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {expandedRows.length > 0 ? (
              expandedRows.map((row, index) => {
                const item = row.parentItem;
                const rowClass = getRowStatusStyle({ status: row.status, berakhir: row.berakhir, documentStatus: row.documentStatus });
                const isAfkir = row.status === 'Afkir' || row.status === 'Decommissioned' || row.status === 'afkir';
                const isExpired = row.status === 'Expired' || row.status === 'expired';
                const isPerpanjang = row.status === 'Perpanjang' || row.status === 'In Progress' || row.status === 'perpanjang';

                return (
                  <tr key={row.rowId} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                    {activeMainTab === 'staging' && (
                      <td className="py-3.5 px-4 text-center whitespace-nowrap w-12">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 accent-amber-600 cursor-pointer"
                          checked={selectedStagingIds.includes(item.id || item.MasterId)}
                          onChange={() => toggleSelectStaging(item.id || item.MasterId)}
                        />
                      </td>
                    )}
                    {isVisible("no") && (
                      <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap">
                        {index + 1}
                      </td>
                    )}
                    {isVisible("jenisPeralatan") && (
                      <td className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                        <span>{row.jenisPeralatan}</span>
                      </td>
                    )}
                    {isVisible("merekItem") && (
                      <td
                        onClick={() => {
                          if (activeMainTab !== 'staging') setDetailModalItem(item);
                        }}
                        className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle ${
                          activeMainTab === 'staging' 
                            ? 'cursor-default text-slate-800' 
                            : (isAfkir ? 'cursor-pointer hover:underline text-white' : 'cursor-pointer hover:underline text-slate-900 hover:text-[#005ea4]')
                        }`}
                        title={activeMainTab === 'staging' ? 'Detail tidak tersedia di mode Staging' : "Klik untuk Lihat Detail"}
                      >
                        {item.merekItem}
                      </td>
                    )}
                    {isVisible("tipe") && (
                      <td className="py-3.5 px-4 font-semibold whitespace-nowrap text-center align-middle">
                        {item.tipe}
                      </td>
                    )}
                    {isVisible("nomorSeri") && (
                      <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                        {item.nomorSeri}
                      </td>
                    )}
                    {isVisible("kapasitas") && (
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap text-center align-middle">
                        {item.kapasitas}
                      </td>
                    )}
                    {isVisible("lokasi") && (
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap text-center align-middle">
                        {item.lokasi}
                      </td>
                    )}
                    {isVisible("user") && (
                      <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                        {item.user}
                      </td>
                    )}
                    {isVisible("status") && (
                      <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                            isAfkir
                              ? 'bg-slate-800 text-white border-slate-600'
                              : isExpired
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : isPerpanjang
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      )}
                    {isVisible("hasSertifikat") && (
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.documentStatus === 'PENDING_DOC' || (!row.hasPdf && item.documentStatus !== 'EXEMPT') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <FileWarning className="w-3 h-3" />
                            Tidak Ada Sertifikat
                          </span>
                        ) : item.documentStatus === 'EXEMPT' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <XCircle className="w-3 h-3" />
                            Tidak Ada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Ada
                          </span>
                        )}
                      </td>
                    )}
                    {isVisible("namaSertifikat") && (
                      <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                        {item.namaSertifikat}
                      </td>
                    )}
                    {isVisible("noSertifikat") && (
                      <td className="py-3.5 px-4 font-mono-data font-bold text-[#005ea4] whitespace-nowrap flex items-center justify-center gap-1.5 align-middle">
                        {item.documentStatus === 'PENDING_DOC' || (!row.hasPdf && item.documentStatus !== 'EXEMPT') ? (
                          row.noSertifikat && row.noSertifikat !== 'BELUM_ADA_SERTIFIKAT' ? (
                            <>
                              <FileWarning className="w-3.5 h-3.5 text-amber-500" />
                              <span>{row.noSertifikat}</span>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <FileWarning className="w-3 h-3 text-amber-500" />
                              Tidak Ada Sertifikat
                            </span>
                          )
                        ) : item.documentStatus === 'EXEMPT' ? (
                          <span
                            title={`Catatan Alasan: ${row.exemptionNote || 'Tanpa Sertifikat'}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-300 shadow-2xs cursor-help"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{row.noSertifikat}</span>
                          </span>
                        ) : (
                          <>
                            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{row.noSertifikat}</span>
                          </>
                        )}
                      </td>
                    )}
                  {isVisible("tanggalInspeksi") && (
                    <td className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap text-center align-middle">
                      {row.tanggalInspeksi}
                    </td>
                  )}
                  {isVisible("terbit") && (
                    <td className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap text-center align-middle">
                      {row.terbit}
                    </td>
                  )}
                  {isVisible("berakhir") && (
                    <td className="py-3.5 px-4 font-mono-data font-bold text-rose-700 whitespace-nowrap text-center align-middle">
                      {row.berakhir}
                    </td>
                  )}
                  {isVisible("keterangan") && (
                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap text-center align-middle">
                      {row.keterangan}
                    </td>
                  )}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono-data align-middle">
                    {(!isViewer && (row.documentStatus === 'PENDING_DOC' || activeMainTab === 'staging')) ? (
                      <button
                        onClick={() => setResolveTargetItem(item)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <FileWarning className="w-3.5 h-3.5" />
                        <span>Perbaiki / Lengkapi</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setDetailModalItem(item)}
                        className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Detail</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
            ) : (
              <tr>
                <td colSpan={visibleColumnKeys.length + (activeMainTab === 'staging' ? 1 : 0)} className="py-12 text-center text-[#64748B]">
                  {activeMainTab === 'staging' ? (
                    <div className="max-w-sm mx-auto space-y-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 font-sans-clean">Semua Dokumen Lengkap!</h4>
                      <p className="text-xs text-slate-500 font-sans-clean">
                        Tidak ada data baru yang membutuhkan tindakan. Semua aset di modul ini sudah terverifikasi atau telah diberikan catatan penanganan.
                      </p>
                    </div>
                  ) : (
                    <span className="font-mono-data">Tidak ada peralatan yang sesuai dengan filter pencarian.</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
