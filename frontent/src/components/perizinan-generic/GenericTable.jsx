import React from 'react';
import { FileCheck, FileWarning, Eye, ShieldAlert, CheckCircle2, XCircle, ChevronDown, ChevronRight, FileText, Plus } from 'lucide-react';

export default function GenericTable({
  activeMainTab,
  selectedStagingIds,
  setBulkExemptModalOpen,
  isSubmittingBulkExempt,
  toggleSelectAllStaging,
  masterRows,
  expandedRows,
  expandedMasterIds = [],
  toggleExpandMaster,
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
  filterHasSertifikat,
  setFilterHasSertifikat,
  getRowStatusStyle,
  toggleSelectStaging,
  setDetailModalItem,
  setResolveTargetItem,
  visibleColumnKeys,
  setViewingCert,
  setAddCertTargetMaster,
  setActiveCertId
}) {
  const rowsToRender = masterRows || expandedRows || [];

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
                      checked={rowsToRender.length > 0 && selectedStagingIds.length === rowsToRender.length}
                      onChange={() => toggleSelectAllStaging(rowsToRender)}
                      className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3.5 px-2 w-10 text-center align-middle"></th>

                <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap align-middle">NO.</th>

                {isVisible("namaItem") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap text-slate-900 text-center align-middle">
                    {isAsetCategory
                      ? 'NAMA ASET'
                      : categoryName?.toLowerCase().includes('proyek')
                      ? 'NAMA PROYEK'
                      : 'NAMA PRODUK'}
                  </th>
                )}

                {isVisible("code") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap text-[#005ea4] text-center align-middle">
                    {isAsetCategory ? "NOMOR SERI ASSET" : categoryName?.toLowerCase().includes('proyek') ? "KODE PROYEK" : "KODE PERIZINAN"}
                  </th>
                )}

                {isVisible("jenisItem") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span>
                        {isAsetCategory
                          ? "JENIS ASET"
                          : categoryName?.toLowerCase().includes('proyek')
                          ? "KATEGORI PROYEK"
                          : "JENIS PRODUK"}
                      </span>
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

                {isVisible("user") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">PENANGGUNG JAWAB</th>}
                
                {isVisible("certCount") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">SERTIFIKAT TERHUBUNG</th>
                )}

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
                <th className="py-3.5 px-4 font-bold text-center align-middle">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {rowsToRender.length > 0 ? (
                rowsToRender.map((row, index) => {
                  const doc = row.parentDoc;
                  const rowClass = getRowStatusStyle({ status: row.status });
                  const statusStr = (row.status || '').toLowerCase();
                  const isAfkir = statusStr === 'afkir' || statusStr === 'decommissioned';
                  const isExpired = statusStr === 'expired';
                  const isPerpanjang = statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'proses';

                  const isExpanded = expandedMasterIds.includes(row.id);
                  const hasCertsOrExempt = row.certs.length > 0 || row.documentStatus === 'EXEMPT';

                  const namaItemLabel = categoryName?.toLowerCase().includes('aset')
                    ? 'Nama Aset'
                    : categoryName?.toLowerCase().includes('proyek')
                    ? 'Nama Proyek'
                    : 'Nama Produk';

                  return (
                    <React.Fragment key={row.id || index}>
                      {/* Master Row */}
                      <tr className={`transition-colors font-mono-data text-xs ${rowClass}`}>
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

                        <td className="py-3.5 px-2 text-center align-middle">
                          {hasCertsOrExempt ? (
                            <button
                              onClick={() => toggleExpandMaster && toggleExpandMaster(row.id)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isExpanded
                                  ? 'bg-blue-100 text-[#005ea4] border-blue-300 shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                              }`}
                              title={isExpanded ? 'Sembunyikan Sertifikat' : 'Lihat Sertifikat Terhubung'}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          ) : (
                            <span className="text-slate-300 font-bold text-xs">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap align-middle">
                          {index + 1}
                        </td>

                        {isVisible("namaItem") && (
                          <td
                            onClick={() => setDetailModalItem(doc)}
                            className={`py-3.5 px-4 font-bold cursor-pointer hover:underline font-sans text-center align-middle ${
                              isAfkir ? 'text-white' : 'text-slate-900 hover:text-[#005ea4]'
                            }`}
                            title={`Klik untuk Lihat Detail - ${namaItemLabel}`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <FileCheck className={`w-3.5 h-3.5 shrink-0 ${row.certs.some(c => c.hasPdf) ? (isAfkir ? 'text-slate-300' : 'text-emerald-600') : 'text-slate-400'}`} />
                              <span className="max-w-[240px] truncate block">{row.docNamaItem}</span>
                            </div>
                          </td>
                        )}

                        {isVisible("code") && (
                          <td className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                            {row.docCode}
                          </td>
                        )}

                        {isVisible("jenisItem") && (
                          <td className={`py-3.5 px-4 font-semibold whitespace-nowrap text-center align-middle ${isAfkir ? 'text-slate-200' : 'text-slate-800'}`}>
                            {row.docJenis}
                          </td>
                        )}

                        {isVisible("unit") && (
                          <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-center align-middle">
                            {row.docUnit}
                          </td>
                        )}

                        {isVisible("user") && (
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 text-center align-middle">
                            {row.docUser}
                          </td>
                        )}

                        {isVisible("certCount") && (
                          <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                            {row.documentStatus === 'PENDING_DOC' ? (
                              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <FileWarning className="w-3.5 h-3.5" />
                                Menunggu Dokumen
                              </span>
                            ) : row.documentStatus === 'EXEMPT' ? (
                              <button
                                onClick={() => toggleExpandMaster && toggleExpandMaster(row.id)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Tanpa Sertifikat (Pengecualian)
                              </button>
                            ) : row.certs.length > 0 ? (
                              <button
                                onClick={() => toggleExpandMaster && toggleExpandMaster(row.id)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-2xs cursor-pointer transition-colors"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>{row.certs.length} Sertifikat</span>
                                {isExpanded ? <ChevronDown className="w-3 h-3 ml-0.5" /> : <ChevronRight className="w-3 h-3 ml-0.5" />}
                              </button>
                            ) : (
                              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                Belum Ada
                              </span>
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
                        
                        <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono-data align-middle">
                          {activeMainTab === 'staging' ? (
                            (() => {
                              const isReadyToMove = row.documentStatus === 'EXEMPT' || (row.certs.length > 0 && row.certs.every(c => c.hasPdf));
                              
                              if (isReadyToMove) {
                                return (
                                  <button
                                    onClick={() => window.handleMoveToUtama && window.handleMoveToUtama(doc.id || doc.MasterId)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Pindah ke Utama</span>
                                  </button>
                                );
                              } else {
                                return (
                                  <button
                                    disabled
                                    title="Lengkapi semua sertifikat (child) terlebih dahulu"
                                    className="px-3 py-1.5 bg-slate-200 text-slate-500 text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-not-allowed"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Pindah ke Utama</span>
                                  </button>
                                );
                              }
                            })()
                          ) : doc.documentStatus === 'PENDING_DOC' ? (
                            <button
                              onClick={() => setResolveTargetItem(doc)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <FileWarning className="w-3.5 h-3.5" />
                              <span>Perbaiki / Lengkapi</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (setActiveCertId) setActiveCertId(null);
                                setDetailModalItem(doc.parentDoc || doc);
                              }}
                              className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Detail</span>
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Sub-table Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b-2 border-slate-300 shadow-inner">
                          <td colSpan={100} className="p-4 text-left font-sans">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                              {/* Sub-table Header */}
                              <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-[#005ea4]" />
                                  <span className="font-bold text-xs text-slate-800 font-mono-data uppercase tracking-wide">
                                    Daftar Sertifikat / Izin Terhubung ({row.certs.length})
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-slate-500 font-mono-data">
                                    Master: <strong className="text-slate-800">{row.docNamaItem}</strong> ({row.docCode})
                                  </span>
                                  {setAddCertTargetMaster && (
                                    <button
                                      onClick={() => setAddCertTargetMaster(row.parentDoc || row)}
                                      className="px-2.5 py-1 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Tambah Sertifikat</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {row.documentStatus === 'EXEMPT' && row.certs.length === 0 ? (
                                <div className="p-4 bg-slate-50 text-slate-700 text-xs flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>Item ini ditandai <strong>Pengecualian (Tidak Memerlukan Sertifikat)</strong>. Catatan: <em className="text-amber-700 font-semibold">{row.exemptionNote || 'Tidak ada catatan'}</em></span>
                                </div>
                              ) : row.certs.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-center border-collapse font-mono-data text-xs">
                                    <thead>
                                      <tr className="bg-slate-50 text-[10px] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                                        <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                        <th className="py-2.5 px-4 text-left">NAMA SERTIFIKAT</th>
                                        <th className="py-2.5 px-4 text-center">NOMOR SERTIFIKAT</th>
                                        <th className="py-2.5 px-4 text-center">TANGGAL TERBIT</th>
                                        <th className="py-2.5 px-4 text-center">MASA BERLAKU (EXPIRED)</th>
                                        <th className="py-2.5 px-4 text-center">STATUS</th>
                                        <th className="py-2.5 px-4 text-center">DOKUMEN PDF</th>
                                        <th className="py-2.5 px-4 text-center">AKSI</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {row.certs.map((cert, certIdx) => {
                                        const certStatusLower = (cert.status || '').toLowerCase();
                                        const isCertExpired = certStatusLower === 'expired';
                                        const isCertPerpanjang = certStatusLower === 'perpanjang' || certStatusLower === 'perpanjangan' || certStatusLower === 'in progress';

                                        return (
                                          <tr key={cert.id || certIdx} className="hover:bg-blue-50/40 transition-colors">
                                            <td className="py-2.5 px-3 font-bold text-slate-500 text-center">{certIdx + 1}</td>
                                            <td 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const raw = cert.certObj || cert || {};
                                                const targetId = raw.id || cert.id;
                                                if (setActiveCertId) setActiveCertId(targetId);
                                                setDetailModalItem(row.parentDoc || row);
                                              }}
                                              className="py-2.5 px-4 text-left font-bold text-slate-900 cursor-pointer hover:text-[#005ea4] hover:underline"
                                              title="Klik untuk Lihat Detail Halaman Penuh Sertifikat"
                                            >
                                              {cert.namaSertifikat}
                                            </td>
                                            <td className="py-2.5 px-4 text-center font-bold text-[#005ea4]">{cert.noSertifikat}</td>
                                            <td className="py-2.5 px-4 text-center text-slate-600">{cert.terbit}</td>
                                            <td className={`py-2.5 px-4 text-center font-bold ${isCertExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                                              {cert.expired}
                                            </td>
                                            <td className="py-2.5 px-4 text-center">
                                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                                isCertExpired 
                                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                                  : isCertPerpanjang 
                                                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                              }`}>
                                                {cert.status}
                                              </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-center">
                                              {cert.hasPdf && cert.fileUrl ? (
                                                <a
                                                  href={cert.fileUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#005ea4] text-[11px] font-bold rounded-md border border-blue-200 transition-colors"
                                                >
                                                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                  <span>Lihat PDF</span>
                                                </a>
                                              ) : (
                                                <span className="text-slate-400 text-[11px] italic">Tidak Ada File</span>
                                              )}
                                            </td>
                                            <td className="py-2.5 px-4 text-center whitespace-nowrap font-mono-data">
                                              <div className="flex items-center justify-center gap-1.5">
                                                {activeMainTab === 'staging' ? (
                                                  cert.hasPdf ? (
                                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md border border-emerald-300 inline-flex items-center gap-1">
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                      <span>Sudah</span>
                                                    </span>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        const raw = cert.certObj || cert || {};
                                                        setResolveTargetItem({ ...raw, isChild: true });
                                                      }}
                                                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-md border border-amber-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
                                                      title="Upload dokumen PDF"
                                                    >
                                                      <FileWarning className="w-3.5 h-3.5" />
                                                      <span>Lengkapi</span>
                                                    </button>
                                                  )
                                                ) : (
                                                  <>
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        const raw = cert.certObj || cert || {};
                                                        const targetId = raw.id || cert.id;
                                                        if (setActiveCertId) setActiveCertId(targetId);
                                                        setDetailModalItem(row.parentDoc || row);
                                                      }}
                                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-md border border-slate-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                                                      title="Lihat Detail Halaman Penuh Sertifikat"
                                                    >
                                                      <Eye className="w-3.5 h-3.5 text-[#005ea4]" />
                                                      <span>Lihat Detail</span>
                                                    </button>
                                                    {cert.hasPdf && cert.fileUrl && (
                                                      <a
                                                        href={cert.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-200 inline-flex items-center gap-1 transition-colors"
                                                        title="Buka Dokumen PDF"
                                                      >
                                                        <FileCheck className="w-3.5 h-3.5" />
                                                        <span>PDF</span>
                                                      </a>
                                                    )}
                                                  </>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-6 text-center text-slate-400 italic text-xs flex flex-col items-center justify-center gap-2">
                                  <span>Belum ada sertifikat terhubung ke Master ini.</span>
                                  {setAddCertTargetMaster && (
                                    <button
                                      onClick={() => setAddCertTargetMaster(row.parentDoc || row)}
                                      className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors not-italic"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Tambah Sertifikat Sekarang</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumnKeys.length + (activeMainTab === 'staging' ? 2 : 2)} className="py-8 text-center text-slate-400 font-mono-data">
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
