import React, { useState } from 'react';
import { CheckCircle2, FileCheck, FileWarning, HelpCircle, ShieldAlert, XCircle, Search, Eye, Wrench, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const formatToDDMMYYYY = (rawDateStr) => {
  if (!rawDateStr || rawDateStr === '-') return '-';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDateStr)) return rawDateStr;
  if (/^\d{4}-\d{2}-\d{2}/.test(rawDateStr)) {
    const parts = rawDateStr.substring(0, 10).split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  try {
    const dObj = new Date(rawDateStr);
    if (!isNaN(dObj.getTime())) {
      const dd = String(dObj.getDate()).padStart(2, '0');
      const mm = String(dObj.getMonth() + 1).padStart(2, '0');
      const yyyy = dObj.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  } catch (_) {}
  return rawDateStr;
};

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
  toggleSort,
  allColumns = []
}) {
  const [isJenisDropdownOpen, setIsJenisDropdownOpen] = useState(false);
  const [isLokasiDropdownOpen, setIsLokasiDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${activeMainTab === 'staging' && selectedStagingIds.length > 0 ? 'mt-4' : 'mt-0'}`}>
      <div className="overflow-x-auto min-h-[350px]">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
              {allColumns.map((col) => {
                if (!isVisible(col.key)) return null;

                if (col.key === 'no') {
                  return (
                    <th key="no" className="py-3.5 px-3 text-center font-bold whitespace-nowrap align-middle w-16 min-w-[64px]">
                      {activeMainTab === 'staging' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          {expandedRows.length > 0 && (
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                              checked={selectedStagingIds.length === expandedRows.length && expandedRows.length > 0}
                              onChange={() => toggleSelectAllStaging(expandedRows)}
                              title="Pilih Semua"
                            />
                          )}
                          <span>NO.</span>
                        </div>
                      ) : (
                        <span>NO.</span>
                      )}
                    </th>
                  );
                }

                if (col.key === 'jenisPeralatan') {
                  return (
                    <th key={col.key} className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle overflow-visible">
                      <div className="flex items-center justify-center gap-1.5 relative z-40">
                        <span>JENIS PERALATAN PABRIK</span>
                        <div className="relative">
                          <button
                            onClick={() => {
                              setIsJenisDropdownOpen(!isJenisDropdownOpen);
                              setIsLokasiDropdownOpen(false);
                              setIsUserDropdownOpen(false);
                              setIsStatusDropdownOpen(false);
                            }}
                            className="flex items-center justify-between gap-2 px-1.5 py-0.5 border border-slate-300 rounded text-[10px] bg-white font-bold focus:outline-none min-w-[70px] text-slate-800 normal-case cursor-pointer shadow-2xs"
                          >
                            <span className="truncate max-w-[70px]">{filterJenis === 'All' ? 'Semua' : filterJenis}</span>
                            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isJenisDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`absolute left-0 top-full mt-1 min-w-[120px] w-max max-w-[200px] z-[99] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[250px] overflow-y-auto origin-top-left transition-all duration-200 ease-out ${isJenisDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'}`}>
                            <button
                              onClick={() => { setFilterJenis('All'); setIsJenisDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-1.5 text-[10px] normal-case transition-colors cursor-pointer ${filterJenis === 'All' ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50 font-normal'}`}
                            >
                              Semua
                            </button>
                            {uniqueJenis.filter(j => j !== 'All').map((j, idx) => (
                              <button
                                key={idx}
                                onClick={() => { setFilterJenis(j); setIsJenisDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 text-[10px] normal-case transition-colors cursor-pointer ${filterJenis === j ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50 font-normal'}`}
                              >
                                {j}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </th>
                  );
                }

                if (col.key === 'lokasi') {
                  return (
                    <th key={col.key} className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle overflow-visible">
                      <div className="flex items-center justify-center gap-1.5 relative z-30">
                        <span>LOKASI</span>
                        <div className="relative">
                          <button
                            onClick={() => {
                              setIsLokasiDropdownOpen(!isLokasiDropdownOpen);
                              setIsJenisDropdownOpen(false);
                              setIsUserDropdownOpen(false);
                              setIsStatusDropdownOpen(false);
                            }}
                            className="flex items-center justify-between gap-2 px-1.5 py-0.5 border border-slate-300 rounded text-[10px] bg-white font-bold focus:outline-none min-w-[70px] text-slate-800 normal-case cursor-pointer shadow-2xs"
                          >
                            <span className="truncate max-w-[70px]">{filterLokasi === 'All' ? 'Semua' : filterLokasi}</span>
                            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isLokasiDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`absolute left-0 top-full mt-1 min-w-[120px] w-max max-w-[200px] z-[99] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[250px] overflow-y-auto origin-top-left transition-all duration-200 ease-out ${isLokasiDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'}`}>
                            <button
                              onClick={() => { setFilterLokasi('All'); setIsLokasiDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-1.5 text-[10px] normal-case transition-colors cursor-pointer ${filterLokasi === 'All' ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50 font-normal'}`}
                            >
                              Semua
                            </button>
                            {uniqueLokasi.filter(l => l !== 'All').map((l, idx) => (
                              <button
                                key={idx}
                                onClick={() => { setFilterLokasi(l); setIsLokasiDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 text-[10px] normal-case transition-colors cursor-pointer ${filterLokasi === l ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50 font-normal'}`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </th>
                  );
                }

                if (col.key === 'user') {
                  return (
                    <th key={col.key} className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle overflow-visible">
                      <div className="flex items-center justify-center gap-1.5 relative z-20">
                        <span>USER</span>
                        <div className="relative">
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(!isUserDropdownOpen);
                              setIsLokasiDropdownOpen(false);
                              setIsJenisDropdownOpen(false);
                              setIsStatusDropdownOpen(false);
                            }}
                            className="flex items-center justify-between gap-2 px-1.5 py-0.5 border border-slate-300 rounded text-[10px] bg-white font-bold focus:outline-none min-w-[70px] text-slate-800 normal-case cursor-pointer shadow-2xs"
                          >
                            <span className="truncate max-w-[70px]">{filterUser === 'All' ? 'Semua' : filterUser}</span>
                            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`absolute left-0 top-full mt-1 min-w-[120px] w-max max-w-[200px] z-[99] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[250px] overflow-y-auto origin-top-left transition-all duration-200 ease-out ${isUserDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'}`}>
                            <button
                              onClick={() => { setFilterUser('All'); setIsUserDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-1.5 text-[10px] normal-case transition-colors cursor-pointer ${filterUser === 'All' ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50 font-normal'}`}
                            >
                              Semua
                            </button>
                            {uniqueUser.filter(u => u !== 'All').map((u, idx) => (
                              <button
                                key={idx}
                                onClick={() => { setFilterUser(u); setIsUserDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 text-[10px] normal-case transition-colors cursor-pointer ${filterUser === u ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50 font-normal'}`}
                              >
                                {u}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </th>
                  );
                }

                if (col.key === 'status') {
                  return (
                    <th key={col.key} className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60 align-middle overflow-visible">
                      <div className="flex items-center justify-center gap-1.5 relative z-10">
                        <span>STATUS</span>
                        <div className="relative">
                          <button
                            onClick={() => {
                              setIsStatusDropdownOpen(!isStatusDropdownOpen);
                              setIsLokasiDropdownOpen(false);
                              setIsJenisDropdownOpen(false);
                              setIsUserDropdownOpen(false);
                            }}
                            className="flex items-center justify-between gap-2 px-1.5 py-0.5 border border-slate-300 rounded text-[10px] bg-white font-bold focus:outline-none min-w-[70px] text-slate-800 normal-case cursor-pointer shadow-2xs"
                          >
                            <span className="truncate max-w-[70px]">{filterStatus === 'All' ? 'Semua' : filterStatus}</span>
                            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`absolute right-0 top-full mt-1 min-w-[120px] w-max max-w-[200px] z-[99] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[250px] overflow-y-auto origin-top-right transition-all duration-200 ease-out ${isStatusDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'}`}>
                            {['All', 'Aktif', 'Expired', 'Perpanjang', 'Non-aktif'].map((statusOption) => (
                              <button
                                key={statusOption}
                                onClick={() => { setFilterStatus(statusOption); setIsStatusDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 text-[10px] normal-case transition-colors cursor-pointer ${filterStatus === statusOption ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50 font-normal'}`}
                              >
                                {statusOption === 'All' ? 'Semua' : statusOption}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </th>
                  );
                }

                if (col.key === 'terbit' || col.key === 'berakhir') {
                  const label = col.key === 'terbit' ? 'TERBIT' : 'BERAKHIR';
                  return (
                    <th 
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle cursor-pointer transition-colors select-none ${
                        sortKey === col.key
                          ? 'bg-blue-50 text-[#005ea4] hover:bg-blue-100'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{label}</span>
                        <span className={`text-[11px] font-bold ${sortKey === col.key ? 'text-[#005ea4]' : 'text-slate-400'}`}>
                          {sortKey === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </div>
                    </th>
                  );
                }

                return (
                  <th key={col.key} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle">
                    {col.key === 'title' ? 'ALAT' : col.label.toUpperCase()}
                  </th>
                );
              })}
              <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap align-middle min-w-[160px] w-44">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {expandedRows.length > 0 ? (
              expandedRows.map((row, index) => {
                const item = row.parentItem;
                const rowClass = getRowStatusStyle({ status: row.status, berakhir: row.berakhir, documentStatus: row.documentStatus });
                const isDecommissioned = row.status === 'Decommissioned' || row.status === 'Decommissioned' || row.status === 'decommissioned';
                const isExpired = row.status === 'Expired' || row.status === 'expired';
                const isPerpanjang = row.status === 'Perpanjang' || row.status === 'In Progress' || row.status === 'perpanjang';

                return (
                  <tr key={row.rowId} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                    {allColumns.map((col) => {
                      if (!isVisible(col.key)) return null;

                      if (col.key === 'no') {
                        return (
                          <td key="no" className="py-3.5 px-3 text-center font-bold whitespace-nowrap align-middle w-16 min-w-[64px]">
                            {activeMainTab === 'staging' ? (
                              <div className="flex items-center justify-center gap-2">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-slate-300 accent-[#005ea4] cursor-pointer"
                                  checked={selectedStagingIds.includes(item.id || item.MasterId)}
                                  onChange={() => toggleSelectStaging(item.id || item.MasterId)}
                                />
                                <span className="text-slate-600 font-mono text-xs">{index + 1}</span>
                              </div>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </td>
                        );
                      }

                      if (col.key === 'title') {
                        const certs = item.certificates || item.linkedCertificates || [];
                        let issuanceCount = 1;
                        if (certs.length > 0) {
                          const primaryCert = certs[0];
                          if (Array.isArray(primaryCert?.history) && primaryCert.history.length > 0) {
                            issuanceCount = 1 + primaryCert.history.length;
                          } else if (certs.length > 1) {
                            issuanceCount = certs.length;
                          }
                        }

                        return (
                          <td
                            key="title"
                            onClick={() => {
                              if (activeMainTab !== 'staging') setDetailModalItem(item);
                            }}
                            className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle ${
                              activeMainTab === 'staging' 
                                ? 'cursor-default text-slate-800' 
                                : (isDecommissioned ? 'cursor-pointer hover:underline text-white' : 'cursor-pointer hover:underline text-slate-900 hover:text-[#005ea4]')
                            }`}
                            title={activeMainTab === 'staging' ? 'Detail tidak tersedia di mode Staging' : "Klik untuk Lihat Detail"}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span>{item.title || row.jenisPeralatan || '-'}</span>
                            </div>
                          </td>
                        );
                      }

                      if (col.key === 'code') {
                        return (
                          <td key="code" className="py-3.5 px-4 whitespace-nowrap text-center align-middle font-mono-data font-semibold">
                            {item.code || item.merekItem || '-'}
                          </td>
                        );
                      }

                      if (col.key === 'unitLocation') {
                        return (
                          <td key="unitLocation" className="py-3.5 px-4 font-medium whitespace-nowrap text-center align-middle">
                            {item.unitLocation || item.lokasi || '-'}
                          </td>
                        );
                      }

                      if (col.key === 'jenisPeralatan') {
                        const customEnt = item.additionalEntities?.find(e => e.key === col.label);
                        const displayVal = customEnt ? customEnt.value : (item.jenisPeralatan || row.jenisPeralatan || '');
                        return (
                          <td key="jenisPeralatan" className="py-3.5 px-4 font-semibold whitespace-nowrap text-center align-middle text-slate-800">
                            <span>{displayVal || '-'}</span>
                          </td>
                        );
                      }

                      if (col.key === 'merekItem') {
                        return (
                          <td
                            key="merekItem"
                            onClick={() => {
                              if (activeMainTab !== 'staging') setDetailModalItem(item);
                            }}
                            className={`py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle ${
                              activeMainTab === 'staging' 
                                ? 'cursor-default text-slate-800' 
                                : (isDecommissioned ? 'cursor-pointer hover:underline text-white' : 'cursor-pointer hover:underline text-slate-900 hover:text-[#005ea4]')
                            }`}
                            title={activeMainTab === 'staging' ? 'Detail tidak tersedia di mode Staging' : "Klik untuk Lihat Detail"}
                          >
                            {item.merekItem}
                          </td>
                        );
                      }

                      if (col.key === 'tipe') {
                        return (
                          <td key="tipe" className="py-3.5 px-4 font-semibold whitespace-nowrap text-center align-middle">
                            {item.tipe}
                          </td>
                        );
                      }

                      if (col.key === 'nomorSeri') {
                        return (
                          <td key="nomorSeri" className="py-3.5 px-4 whitespace-nowrap text-center align-middle font-mono-data">
                            {item.nomorSeri}
                          </td>
                        );
                      }

                      if (col.key === 'kapasitas') {
                        return (
                          <td key="kapasitas" className="py-3.5 px-4 font-medium whitespace-nowrap text-center align-middle">
                            {item.kapasitas}
                          </td>
                        );
                      }

                      if (col.key === 'lokasi') {
                        return (
                          <td key="lokasi" className="py-3.5 px-4 font-medium whitespace-nowrap text-center align-middle">
                            {item.lokasi}
                          </td>
                        );
                      }

                      if (col.key === 'user') {
                        return (
                          <td key="user" className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                            {item.user}
                          </td>
                        );
                      }

                      if (col.key === 'status') {
                        return (
                          <td key="status" className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                            <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                              isDecommissioned
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
                        );
                      }

                      if (col.key === 'hasSertifikat') {
                        return (
                          <td key="hasSertifikat" className="py-3.5 px-4 text-center whitespace-nowrap">
                            {item.documentStatus === 'PENDING_DOC' || (!row.hasPdf && item.documentStatus !== 'EXEMPT') ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <FileWarning className="w-3.5 h-3.5" />
                                Tidak Ada Sertifikat
                              </span>
                            ) : item.documentStatus === 'EXEMPT' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                <XCircle className="w-3.5 h-3.5" />
                                Tidak Ada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ada
                              </span>
                            )}
                          </td>
                        );
                      }

                      if (col.key === 'namaSertifikat') {
                        return (
                          <td key="namaSertifikat" className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                            {item.namaSertifikat}
                          </td>
                        );
                      }

                      if (col.key === 'noSertifikat') {
                        return (
                          <td key="noSertifikat" className="py-3.5 px-4 font-mono-data font-bold text-[#005ea4] whitespace-nowrap flex items-center justify-center gap-1.5 align-middle">
                            {item.documentStatus === 'PENDING_DOC' || (!row.hasPdf && item.documentStatus !== 'EXEMPT') ? (
                              row.noSertifikat && row.noSertifikat !== 'BELUM_ADA_SERTIFIKAT' ? (
                                <>
                                  <FileWarning className="w-3.5 h-3.5 text-amber-500" />
                                  <span>{row.noSertifikat}</span>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <FileWarning className="w-3.5 h-3.5 text-amber-500" />
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
                        );
                      }

                      if (col.key === 'tanggalInspeksi') {
                        return (
                          <td key="tanggalInspeksi" className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap text-center align-middle">
                            {row.tanggalInspeksi}
                          </td>
                        );
                      }

                      if (col.key === 'terbit') {
                        return (
                          <td key="terbit" className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap text-center align-middle">
                            {row.terbit}
                          </td>
                        );
                      }

                      if (col.key === 'berakhir') {
                        return (
                          <td key="berakhir" className="py-3.5 px-4 font-mono-data font-bold text-rose-700 whitespace-nowrap text-center align-middle">
                            {row.berakhir}
                          </td>
                        );
                      }

                      if (col.key === 'instansi') {
                        return (
                          <td key="instansi" className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap text-center align-middle">
                            {row.instansi || '-'}
                          </td>
                        );
                      }

                      if (col.key === 'keterangan') {
                        return (
                          <td key="keterangan" className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap text-center align-middle">
                            {row.keterangan}
                          </td>
                        );
                      }

                      // Dynamic custom columns cell values
                      const customEnt = item.additionalEntities?.find(e => e.key === col.label);
                      let displayVal = customEnt ? customEnt.value : '-';
                      if (displayVal && col.type === 'nominal') {
                        const num = Number(displayVal.replace(/\D/g, ''));
                        if (!isNaN(num)) displayVal = num.toLocaleString('id-ID');
                      }
                      if (displayVal && col.type === 'date') {
                        displayVal = formatToDDMMYYYY(displayVal);
                      }

                      return (
                        <td key={col.key} className="py-3.5 px-4 text-center align-middle font-bold text-slate-800 font-mono-data">
                          {displayVal || '-'}
                        </td>
                      );
                    })}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono-data align-middle min-w-[160px] w-44">
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
                <td colSpan={100} className="py-12 text-center text-[#64748B]">
                  {activeMainTab === 'staging' ? (
                    <span className="font-mono-data">Data peralatan tidak ditemukan.</span>
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
