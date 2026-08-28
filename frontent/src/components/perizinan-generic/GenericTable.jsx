import React from 'react';
import { FileCheck, FileWarning, Eye, ShieldAlert, CheckCircle2, XCircle, ChevronDown, ChevronRight, FileText, Plus } from 'lucide-react';
import { getFullFileUrl } from '../../config/api';
import RoleGuard from '../RoleGuard';

const getTimestamp = (dateStr) => {
  if (!dateStr || dateStr === '-') return 0;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
  }
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? 0 : t;
};

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
  allColumns = [],
  childColumns = [],
  setViewingCert,
  setAddCertTargetMaster,
  setActiveCertId,
  sortKey,
  sortOrder,
  toggleSort
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

                {allColumns.map(col => {
                  if (!isVisible(col.key)) return null;

                  if (col.key === 'no') {
                    return <th key="no" className="py-3.5 px-4 font-bold text-center whitespace-nowrap align-middle">NO.</th>;
                  }

                  if (col.key === 'namaItem') {
                    return (
                      <th key="namaItem" className="py-3.5 px-4 font-bold whitespace-nowrap text-slate-900 text-center align-middle">
                        {col.label}
                      </th>
                    );
                  }

                  if (col.key === 'code') {
                    return (
                      <th key="code" className="py-3.5 px-4 font-bold whitespace-nowrap text-[#005ea4] text-center align-middle">
                        {col.label}
                      </th>
                    );
                  }

                  if (col.key === 'jenisItem') {
                    return (
                      <th key="jenisItem" className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle">
                        <div className="flex items-center gap-1.5 justify-center">
                          <span>{col.label}</span>
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
                    );
                  }

                  if (col.key === 'unit') {
                    return (
                      <th key="unit" className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{col.label}</span>
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
                    );
                  }

                  if (col.key === 'user') {
                    return <th key="user" className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">{col.label}</th>;
                  }

                  if (col.key === 'certCount') {
                    return <th key="certCount" className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">{col.label}</th>;
                  }

                  if (col.key === 'status') {
                    return (
                      <th key="status" className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60 align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{col.label}</span>
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
                    );
                  }

                  return (
                    <th key={col.key} className="py-3.5 px-4 font-bold text-center whitespace-nowrap align-middle">
                      {col.label}
                    </th>
                  );
                })}
                <th className="py-3.5 px-4 font-bold text-center align-middle">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {rowsToRender.length > 0 ? (
                rowsToRender.map((row, index) => {
                  const doc = row.parentDoc;
                  const rowClass = getRowStatusStyle ? getRowStatusStyle({ status: row.status, documentStatus: row.documentStatus }) : 'bg-white hover:bg-slate-50 border-b border-slate-200';
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
                      <tr className={`transition-colors font-mono-data text-xs bg-white hover:bg-slate-50 border-b border-slate-200 text-slate-800`}>
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

                        {allColumns.map(col => {
                          if (!isVisible(col.key)) return null;

                          if (col.key === 'no') {
                            return (
                              <td key="no" className="py-3.5 px-4 text-center font-bold whitespace-nowrap align-middle">
                                {index + 1}
                              </td>
                            );
                          }

                          if (col.key === 'namaItem') {
                            const certsCount = row.certs.length;
                            return (
                              <td
                                key="namaItem"
                                onClick={() => activeMainTab !== 'staging' && setDetailModalItem(doc)}
                                className={`py-3.5 px-4 font-bold font-sans text-center align-middle ${activeMainTab === 'staging' ? 'cursor-default text-slate-800' : 'cursor-pointer hover:underline text-slate-900 hover:text-[#005ea4]'}`}
                                title={activeMainTab === 'staging' ? 'Detail tidak tersedia di mode Staging' : `Klik untuk Lihat Detail - ${namaItemLabel}`}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <FileCheck className={`w-3.5 h-3.5 shrink-0 ${row.certs.some(c => c.hasPdf) ? 'text-emerald-600' : 'text-slate-400'}`} />
                                  <span className="max-w-[200px] truncate block">{row.docNamaItem}</span>
                                  {certsCount > 0 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (activeMainTab !== 'staging') {
                                          setDetailModalItem({ ...doc, _scrollToHistory: true });
                                        }
                                      }}
                                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black bg-[#005ea4] text-white border border-[#005ea4] hover:bg-[#004881] hover:border-[#004881] transition-all shadow-sm cursor-pointer shrink-0"
                                      title={`${certsCount} sertifikat terbit. Klik untuk langsung ke histori dokumen.`}
                                    >
                                      {certsCount}
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'code') {
                            return (
                              <td key="code" className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle text-[#005ea4]`}>
                                {row.docCode}
                              </td>
                            );
                          }

                          if (col.key === 'jenisItem') {
                            return (
                              <td key="jenisItem" className={`py-3.5 px-4 font-semibold whitespace-nowrap text-center align-middle text-slate-800`}>
                                {row.docJenis}
                              </td>
                            );
                          }

                          if (col.key === 'unit') {
                            return (
                              <td key="unit" className="py-3.5 px-4 whitespace-nowrap font-semibold text-center align-middle">
                                {row.docUnit}
                              </td>
                            );
                          }

                          if (col.key === 'user') {
                            return (
                              <td key="user" className="py-3.5 px-4 whitespace-nowrap text-slate-700 text-center align-middle">
                                {row.docUser}
                              </td>
                            );
                          }

                          if (col.key === 'certCount') {
                            return (
                              <td key="certCount" className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                                {row.documentStatus === 'PENDING_DOC' ? (
                                  <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <FileWarning className="w-3.5 h-3.5" />
                                    Menunggu Dokumen
                                  </span>
                                ) : row.certs.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (activeMainTab !== 'staging') {
                                        setDetailModalItem({ ...doc, _scrollToHistory: true });
                                      }
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-2xs cursor-pointer transition-colors"
                                    title="Klik untuk langsung melihat detail dan histori dokumen"
                                  >
                                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{row.certs.length} Sertifikat</span>
                                  </button>
                                ) : row.documentStatus === 'EXEMPT' ? (
                                  <button
                                    onClick={() => toggleExpandMaster && toggleExpandMaster(row.id)}
                                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Tanpa Sertifikat (Pengecualian)
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                    Belum Ada
                                  </span>
                                )}
                              </td>
                            );
                          }

                          if (col.key === 'status') {
                            return (
                              <td key="status" className="py-3.5 px-4 text-center whitespace-nowrap">
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
                            );
                          }

                          // Custom dynamic columns rendering
                          const customEnt = row.parentDoc?.additionalEntities?.find(e => e.key === col.label) || 
                                           row.additionalEntities?.find(e => e.key === col.label);
                          let displayVal = customEnt ? customEnt.value : '-';
                          if (displayVal && col.type === 'nominal') {
                            const num = Number(String(displayVal).replace(/\D/g, ''));
                            if (!isNaN(num)) displayVal = num.toLocaleString('id-ID');
                          }
                          if (displayVal && col.type === 'date') {
                            try {
                              const dObj = new Date(displayVal);
                              if (!isNaN(dObj.getTime())) {
                                const dd = String(dObj.getDate()).padStart(2, '0');
                                const mm = String(dObj.getMonth() + 1).padStart(2, '0');
                                const yyyy = dObj.getFullYear();
                                displayVal = `${dd}/${mm}/${yyyy}`;
                              }
                            } catch (_) {}
                          }

                          return (
                            <td key={col.key} className="py-3.5 px-4 text-center align-middle font-bold text-slate-800 font-mono-data">
                              {displayVal || '-'}
                            </td>
                          );
                        })}
                        
                        <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono-data align-middle">
                          {activeMainTab === 'staging' ? (
                            (() => {
                              const isReadyToMove = row.documentStatus === 'EXEMPT' || (row.certs.length > 0 && row.certs.every(c => c.hasPdf || c.status === 'EXEMPT'));
                              
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
                              <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
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
                                  <RoleGuard allowedRoles={['Super Admin', 'Admin', 'User']}>
                                    {setAddCertTargetMaster && (
                                      <button
                                        onClick={() => activeMainTab !== 'staging' && setAddCertTargetMaster(row.parentDoc || row)}
                                        disabled={activeMainTab === 'staging'}
                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1 transition-colors ${
                                          activeMainTab === 'staging'
                                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
                                            : 'bg-[#005ea4] hover:bg-[#004881] text-white cursor-pointer'
                                        }`}
                                        title={activeMainTab === 'staging' ? 'Tidak dapat menambah sertifikat di mode Staging' : 'Tambah Sertifikat'}
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>+ Tambah Sertifikat</span>
                                      </button>
                                    )}
                                  </RoleGuard>
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
                                        {childColumns.map(col => {
                                          if (col.key === 'masterTitle' || col.key === 'title' || col.label.toLowerCase() === 'item induk') return null;

                                          if (col.key === 'no') {
                                            return <th key="no" className="py-2.5 px-3 w-10 text-center">NO</th>;
                                          }

                                          if (col.key === 'namaSertifikat') {
                                            return <th key="namaSertifikat" className="py-2.5 px-4 text-left">{col.label}</th>;
                                          }

                                          if (col.key === 'noSertifikat') {
                                            return <th key="noSertifikat" className="py-2.5 px-4 text-center">{col.label}</th>;
                                          }

                                          if (col.key === 'instansi') {
                                            return <th key="instansi" className="py-2.5 px-4 text-center">{col.label}</th>;
                                          }

                                          if (col.key === 'terbit') {
                                            return (
                                              <th 
                                                key="terbit"
                                                onClick={() => toggleSort('terbit')}
                                                className="py-2.5 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                              >
                                                <div className="flex items-center justify-center gap-1">
                                                  <span>{col.label}</span>
                                                  <span className="text-[9px] text-slate-400">
                                                    {sortKey === 'terbit' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                                  </span>
                                                </div>
                                              </th>
                                            );
                                          }

                                          if (col.key === 'expired') {
                                            return (
                                              <th 
                                                key="expired"
                                                onClick={() => toggleSort('berakhir')}
                                                className="py-2.5 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                              >
                                                <div className="flex items-center justify-center gap-1">
                                                  <span>{col.label}</span>
                                                  <span className="text-[9px] text-slate-400">
                                                    {sortKey === 'berakhir' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                                  </span>
                                                </div>
                                              </th>
                                            );
                                          }

                                          if (col.key === 'status') {
                                            return <th key="status" className="py-2.5 px-4 text-center">{col.label}</th>;
                                          }

                                          if (col.key === 'keterangan') {
                                            return <th key="keterangan" className="py-2.5 px-4 text-center">{col.label}</th>;
                                          }

                                          return <th key={col.key} className="py-2.5 px-4 text-center">{col.label}</th>;
                                        })}
                                        <th className="py-2.5 px-4 text-center">AKSI</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {row.certs.map((cert, certIdx) => {
                                        const certStatusLower = (cert.status || '').toLowerCase();
                                        const certExpiredTimestamp = getTimestamp(cert.expired || cert.berakhir);
                                        const todayTimestamp = new Date().setHours(0, 0, 0, 0);
                                        
                                        const isTerbitEmpty = !cert.terbit || String(cert.terbit).trim() === '-' || String(cert.terbit).trim() === '';
                                        const isExpiredEmpty = !cert.expired || String(cert.expired).trim() === '-' || String(cert.expired).trim() === '';
                                        const isMissingBothDates = isTerbitEmpty && isExpiredEmpty;

                                        const isCertExpiredReal = certExpiredTimestamp > 0 && certExpiredTimestamp < todayTimestamp;
                                        const isCertExpired = certStatusLower === 'expired' || isCertExpiredReal || isMissingBothDates;
                                        
                                        const isCertAfkir = certStatusLower === 'afkir' || certStatusLower === 'decommissioned' || certStatusLower === 'dicabut';
                                        const isCertPerpanjang = certStatusLower === 'perpanjang' || certStatusLower === 'perpanjangan' || certStatusLower === 'in progress';

                                        const childRowClass = getRowStatusStyle 
                                          ? getRowStatusStyle({ 
                                              status: isCertExpired ? 'expired' : cert.status, 
                                              documentStatus: isCertExpired ? 'expired' : cert.status 
                                            }) 
                                          : 'bg-white hover:bg-blue-50/40';

                                        return (
                                          <tr key={cert.id || certIdx} className={`transition-colors ${childRowClass}`}>
                                            {childColumns.map(col => {
                                              if (col.key === 'masterTitle' || col.key === 'title' || col.label.toLowerCase() === 'item induk') return null;

                                              if (col.key === 'no') {
                                                return (
                                                  <td key="no" className={`py-2.5 px-3 font-bold text-center ${isCertAfkir ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {certIdx + 1}
                                                  </td>
                                                );
                                              }

                                              if (col.key === 'namaSertifikat') {
                                                return (
                                                  <td 
                                                    key="namaSertifikat"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      e.preventDefault();
                                                      if (activeMainTab === 'staging') return;
                                                      const raw = cert.certObj || cert || {};
                                                      const targetId = raw.id || cert.id;
                                                      if (setActiveCertId) setActiveCertId(targetId);
                                                      setDetailModalItem(row.parentDoc || row);
                                                    }}
                                                    className={`py-2.5 px-4 text-left font-bold ${activeMainTab === 'staging' ? 'cursor-default text-slate-800' : (isCertAfkir ? 'cursor-pointer hover:underline text-white hover:text-blue-300' : 'cursor-pointer hover:underline text-slate-900 hover:text-[#005ea4]')}`}
                                                    title={activeMainTab === 'staging' ? 'Detail tidak tersedia di mode Staging' : 'Klik untuk Lihat Detail Halaman Penuh Sertifikat'}
                                                  >
                                                    {cert.namaSertifikat || '-'}
                                                  </td>
                                                );
                                              }

                                              if (col.key === 'noSertifikat') {
                                                return (
                                                  <td key="noSertifikat" className={`py-2.5 px-4 text-center font-bold ${isCertAfkir ? 'text-blue-300' : 'text-[#005ea4]'}`}>
                                                    {cert.noSertifikat || '-'}
                                                  </td>
                                                );
                                              }

                                              if (col.key === 'instansi') {
                                                return (
                                                  <td key="instansi" className={`py-2.5 px-4 text-center ${isCertAfkir ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {cert.instansi || '-'}
                                                  </td>
                                                );
                                              }

                                              if (col.key === 'terbit') {
                                                return (
                                                  <td key="terbit" className={`py-2.5 px-4 text-center ${isCertAfkir ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {cert.terbit || '-'}
                                                  </td>
                                                );
                                              }

                                              if (col.key === 'expired') {
                                                return (
                                                  <td key="expired" className={`py-2.5 px-4 text-center font-bold ${isCertExpired ? 'text-rose-600' : (isCertAfkir ? 'text-slate-200' : 'text-slate-800')}`}>
                                                    {cert.expired || '-'}
                                                  </td>
                                                );
                                              }

                                              if (col.key === 'status') {
                                                const rawStatus = (cert.status || '').toLowerCase();
                                                const isStatusExpired = rawStatus === 'expired' || isCertExpiredReal || isMissingBothDates;
                                                const isStatusAfkir = rawStatus === 'afkir' || rawStatus === 'decommissioned' || rawStatus === 'dicabut';
                                                const isStatusPerpanjang = rawStatus === 'perpanjang' || rawStatus === 'perpanjangan' || rawStatus === 'in progress' || rawStatus === 'proses';
                                                return (
                                                  <td key="status" className="py-2.5 px-4 text-center whitespace-nowrap">
                                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                                      isStatusAfkir
                                                        ? 'bg-slate-800 text-white border-slate-600'
                                                        : isStatusExpired
                                                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                                                        : isStatusPerpanjang
                                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                    }`}>
                                                      {cert.status || 'Aktif'}
                                                    </span>
                                                  </td>
                                                );
                                              }

                                              if (col.key === 'keterangan') {
                                                return (
                                                  <td key="keterangan" className={`py-2.5 px-4 text-center ${isCertAfkir ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {cert.keterangan || '-'}
                                                  </td>
                                                );
                                              }

                                              const customEnt = cert.additionalEntities?.find(e => e.key === col.label);
                                              let displayVal = customEnt ? customEnt.value : '-';
                                              if (displayVal && col.type === 'nominal') {
                                                const num = Number(String(displayVal).replace(/\D/g, ''));
                                                if (!isNaN(num)) displayVal = num.toLocaleString('id-ID');
                                              }
                                              if (displayVal && col.type === 'date') {
                                                try {
                                                  const dObj = new Date(displayVal);
                                                  if (!isNaN(dObj.getTime())) {
                                                    const dd = String(dObj.getDate()).padStart(2, '0');
                                                    const mm = String(dObj.getMonth() + 1).padStart(2, '0');
                                                    const yyyy = dObj.getFullYear();
                                                    displayVal = `${dd}/${mm}/${yyyy}`;
                                                  }
                                                } catch (_) {}
                                              }

                                              return (
                                                <td key={col.key} className="py-2.5 px-4 text-center align-middle font-bold text-slate-800 font-mono-data">
                                                  {displayVal || '-'}
                                                </td>
                                              );
                                            })}

                                            <td className="py-2.5 px-4 text-center whitespace-nowrap font-mono-data">
                                              <div className="flex items-center justify-center gap-1.5">
                                                {activeMainTab === 'staging' ? (
                                                  certStatusLower === 'exempt' ? (
                                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-md border border-amber-300 inline-flex items-center gap-1">
                                                      <ShieldAlert className="w-3.5 h-3.5" />
                                                      <span>Tidak Perlu</span>
                                                    </span>
                                                  ) : cert.hasPdf ? (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        if (setActiveCertId) setActiveCertId(null);
                                                        const raw = cert.certObj || cert || {};
                                                        setViewingCert(raw);
                                                      }}
                                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md border border-emerald-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
                                                    >
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                      <span>Sudah Lengkap</span>
                                                    </button>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        const raw = cert.certObj || cert || {};
                                                        setResolveTargetItem({ ...raw, isChild: true });
                                                      }}
                                                      className={`px-2.5 py-1 text-white text-[11px] font-bold rounded-md border inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                                        cert.noSertifikat && cert.noSertifikat !== '-' && cert.noSertifikat !== 'BELUM_ADA_SERTIFIKAT' 
                                                        ? 'bg-blue-600 hover:bg-blue-700 border-blue-600'
                                                        : 'bg-amber-600 hover:bg-amber-700 border-amber-600'
                                                      }`}
                                                    >
                                                      <FileWarning className="w-3.5 h-3.5" />
                                                      <span>
                                                        {cert.noSertifikat && cert.noSertifikat !== '-' && cert.noSertifikat !== 'BELUM_ADA_SERTIFIKAT' 
                                                          ? 'Upload PDF' 
                                                          : 'Lengkapi'}
                                                      </span>
                                                    </button>
                                                  )
                                                ) : (
                                                  <>
                                                    {activeMainTab !== 'staging' && (
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
                                                    )}
                                                    {cert.hasPdf && cert.fileUrl && (
                                                      <a
                                                        href={getFullFileUrl(cert.fileUrl)}
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
                                  <RoleGuard allowedRoles={['Super Admin', 'Admin', 'User']}>
                                    {setAddCertTargetMaster && (
                                      <button
                                        onClick={() => setAddCertTargetMaster(row.parentDoc || row)}
                                        className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors not-italic"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>+ Tambah Sertifikat Sekarang</span>
                                      </button>
                                    )}
                                  </RoleGuard>
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
