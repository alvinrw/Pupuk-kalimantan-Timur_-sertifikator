import React from 'react';
import { FileCheck, FileWarning, Eye, ShieldAlert } from 'lucide-react';

export default function GenericTable({
  activeMainTab,
  selectedStagingIds,
  setBulkExemptModalOpen,
  isSubmittingBulkExempt,
  toggleSelectAllStaging,
  expandedRows,
  isVisible,
  isAsetCategory,
  categoryName,
  filterJenis,
  setFilterJenis,
  uniqueJenis,
  filterLokasi,
  setFilterLokasi,
  uniqueLokasi,
  filterStatus,
  setFilterStatus,
  uniqueStatus,
  getRowStatusStyle,
  toggleSelectStaging,
  setDetailModalItem,
  setResolveTargetItem,
  visibleColumnKeys
}) {
  return (
    <>
      {/* BULK ACTION BAR */}
      {activeMainTab === 'staging' && selectedStagingIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between mt-4 shadow-2xs font-mono-data">
          <div className="text-amber-800 text-xs font-bold">
            {selectedStagingIds.length} item terpilih
          </div>
          <button 
            onClick={() => setBulkExemptModalOpen(true)}
            disabled={isSubmittingBulkExempt}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Tandai Terpilih Tanpa Sertifikat
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${activeMainTab === 'staging' && selectedStagingIds.length > 0 ? 'mt-4' : 'mt-0'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider text-center align-middle">
                {activeMainTab === 'staging' && (
                  <th className="py-3.5 px-3 w-10 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={expandedRows.length > 0 && selectedStagingIds.length === expandedRows.length}
                      onChange={() => toggleSelectAllStaging(expandedRows)}
                      className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                    />
                  </th>
                )}
                {isVisible("no") && <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap align-middle">NO.</th>}

                {isVisible("namaItem") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap text-slate-900 text-center align-middle">
                    {isAsetCategory
                      ? 'NAMA ASET'
                      : categoryName?.toLowerCase().includes('proyek')
                      ? 'NAMA PROYEK'
                      : 'NAMA PRODUK'}
                  </th>
                )}

                {!isAsetCategory && isVisible("code") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-[#005ea4] text-center align-middle">KODE PERIZINAN</th>}

                {!isAsetCategory && isVisible("jenisItem") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle">
                    <div className="flex items-center gap-1.5">
                      <span>JENIS PERIZINAN</span>
                      <select
                        value={filterJenis}
                        onChange={(e) => setFilterJenis(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer max-w-[100px]"
                      >
                        <option value="All">Semua</option>
                        {uniqueJenis.filter(j => j !== 'All').map((j, idx) => (
                          <option key={idx} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {isVisible("certificateNo") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-[#005ea4] text-center align-middle">NOMOR SERTIFIKAT</th>}

                {isVisible("unit") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>LOKASI</span>
                      <select
                        value={filterLokasi}
                        onChange={(e) => setFilterLokasi(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer max-w-[100px]"
                      >
                        <option value="All">Semua</option>
                        {uniqueLokasi.filter(l => l !== 'All').map((l, idx) => (
                          <option key={idx} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {isAsetCategory && isVisible("luasM2") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">LUAS (MÃƒâ€šÃ‚Â²)</th>}
                {isAsetCategory && isVisible("luasHa") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">LUAS (HA)</th>}
                {isAsetCategory && isVisible("peruntukan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">PERUNTUKAN</th>}

                {!isAsetCategory && isVisible("user") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">INSTANSI / USER</th>}
                
                {isVisible("issueDate") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">{isAsetCategory ? "TANGGAL AWAL PENGAJUAN" : "TERBIT"}</th>}
                {isVisible("expiryDate") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">{isAsetCategory ? "MASA BERLAKU PRODUK" : "EXPIRED"}</th>}

                {isAsetCategory && isVisible("kondisi") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">KONDISI</th>}
                {isAsetCategory && isVisible("keterangan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">KETERANGAN</th>}

                {isVisible("status") && (
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60 align-middle">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>STATUS</span>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer max-w-[100px]"
                      >
                        <option value="All">Semua</option>
                        {uniqueStatus.filter(s => s !== 'All').map((s, idx) => (
                          <option key={idx} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {expandedRows.length > 0 ? (
                expandedRows.map((row, index) => {
                  const doc = row.parentDoc;
                  const rowClass = getRowStatusStyle({ status: row.status });
                  const statusStr = (row.status || '').toLowerCase();
                  const isAfkir = statusStr === 'afkir' || statusStr === 'decommissioned';
                  const isExpired = statusStr === 'expired';
                  const isPerpanjang = statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'proses';

                  const docCode = doc.code || doc.id || '-';
                  const docUnit = doc.unit || doc.unitPabrik || doc.lokasi || '-';
                  const docCert = row.certNo;
                  const docExpiry = row.expiryDate;
                  const docJenis = row.jenisCert;
                  const docUser = row.issuer;
                  const docIssue = row.issueDate;
                  const docNamaItem = doc.merekItem || doc.title || doc.judulCiptaan || '-';

                  const namaItemLabel = categoryName?.toLowerCase().includes('aset')
                    ? 'Nama Aset'
                    : categoryName?.toLowerCase().includes('proyek')
                    ? 'Nama Proyek'
                    : 'Nama Produk';

                  return (
                    <tr key={row.rowId} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                      {activeMainTab === 'staging' && (
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStagingIds.includes(doc.id || doc.MasterId)}
                            onChange={() => toggleSelectStaging(doc.id || doc.MasterId)}
                            className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                          />
                        </td>
                      )}
                      {isVisible("no") && (
                        <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap align-middle">
                          {index + 1}
                        </td>
                      )}

                      {isVisible("namaItem") && (
                        <td
                          onClick={() => setDetailModalItem({ ...doc, currentCert: row.cert })}
                          className={`py-3.5 px-4 font-bold cursor-pointer hover:underline font-sans text-center align-middle ${
                            isAfkir ? 'text-white' : 'text-slate-900 hover:text-[#005ea4]'
                          }`}
                          title={`Klik untuk Lihat Detail ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${namaItemLabel}`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <FileCheck className={`w-3.5 h-3.5 shrink-0 ${row.hasPdf ? (isAfkir ? 'text-slate-300' : 'text-emerald-600') : 'text-slate-400'}`} />
                            <span className="max-w-[220px] truncate block">{docNamaItem}</span>
                          </div>
                        </td>
                      )}

                      {!isAsetCategory && isVisible("code") && (
                        <td className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                          {docCode}
                        </td>
                      )}

                      {!isAsetCategory && isVisible("jenisItem") && (
                        <td className={`py-3.5 px-4 font-semibold whitespace-nowrap text-center align-middle ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                          {docJenis}
                        </td>
                      )}

                      {isVisible("certificateNo") && (
                        <td
                          onClick={() => setDetailModalItem({ ...doc, currentCert: row.cert })}
                          className={`py-3.5 px-4 font-bold whitespace-nowrap cursor-pointer hover:underline text-center align-middle ${
                            isAfkir ? 'text-slate-200' : 'text-[#005ea4]'
                          }`}
                        >
                          <div className="flex items-start justify-center gap-1.5">
                            <FileCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${row.hasPdf ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <div>
                              <span className="block">{docCert}</span>
                            </div>
                          </div>
                        </td>
                      )}

                      {isVisible("unit") && (
                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-center align-middle">
                          {docUnit}
                        </td>
                      )}

                      {isAsetCategory && isVisible("luasM2") && (
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800 text-center align-middle">
                          {doc.luasM2 || doc.kapasitas || '12.000 mÃƒâ€šÃ‚Â²'}
                        </td>
                      )}

                      {isAsetCategory && isVisible("luasHa") && (
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800 text-center align-middle">
                          {doc.luasHa || '1,2 Ha'}
                        </td>
                      )}

                      {isAsetCategory && isVisible("peruntukan") && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 text-center align-middle">
                          {doc.peruntukan || doc.title || doc.merekItem || 'Fasilitas Industrial'}
                        </td>
                      )}

                      {!isAsetCategory && isVisible("user") && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 text-center align-middle">
                          {docUser}
                        </td>
                      )}

                      {isVisible("issueDate") && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                          {docIssue}
                        </td>
                      )}

                      {isVisible("expiryDate") && (
                        <td className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle ${isAfkir ? 'text-slate-300' : 'text-rose-700'}`}>
                          {docExpiry}
                        </td>
                      )}

                      {isAsetCategory && isVisible("kondisi") && (
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700 text-center align-middle">
                          {doc.kondisi || (isAfkir ? 'Afkir / Non-Aktif' : isExpired ? 'Perlu Re-sertifikasi' : 'Baik & Layak')}
                        </td>
                      )}

                      {isAsetCategory && isVisible("keterangan") && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono-data text-[11px] max-w-[300px] truncate text-center align-middle" title={doc.documentStatus === 'EXEMPT' && doc.exemptionNote ? doc.exemptionNote : ''}>
                          {doc.documentStatus === 'EXEMPT' && doc.exemptionNote ? (
                            <span className="text-amber-700 font-semibold italic">{doc.exemptionNote}</span>
                          ) : (
                            doc.keterangan || doc.user || 'DPMPTSP / BPN Kota Bontang'
                          )}
                        </td>
                      )}

                      {isVisible("status") && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                            isAfkir
                              ? 'bg-slate-800 text-white border-slate-600'
                              : isExpired
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : isPerpanjang
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumnKeys.length + (activeMainTab === 'staging' ? 2 : 1)} className="py-8 text-center text-slate-400 font-mono-data">
                    Data perizinan tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
