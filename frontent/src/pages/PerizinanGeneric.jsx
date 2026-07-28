import React from 'react';
import {
  Search, FileSpreadsheet, Columns, PlusCircle, ChevronDown,
  RotateCcw, Eye, FileCheck, Loader2, Building2, FileWarning, ShieldAlert, X
} from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import SingleEntryGenericModal from '../components/SingleEntryGenericModal';
import ResolveDocumentModal from '../components/ResolveDocumentModal';
import DocumentDetailPage from './DocumentDetailPage';
import { usePerizinanGeneric } from '../hooks/usePerizinanGeneric';

export default function PerizinanGeneric({ title, subtitle, categoryName }) {
  const g = usePerizinanGeneric({ categoryName, title });

  // ============================================================
  // DETAIL VIEW
  // ============================================================
  if (g.detailModalItem) {
    return (
      <DocumentDetailPage
        item={g.detailModalItem}
        onBack={() => g.setDetailModalItem(null)}
        onSaveUpdate={(updatedDoc) => {
          g.setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? { ...d, ...updatedDoc, title: updatedDoc.merekItem || d.title } : d));
          g.setDetailModalItem(prev => (prev && prev.id === updatedDoc.id ? { ...prev, ...updatedDoc } : prev));
        }}
        onQuickRenew={(id) => alert(`Inisiasi Perpanjangan untuk dokumen ${id}. Menuju menu Monitoring.`)}
        onQuickDecommission={(id) => alert(`Menandai dokumen ${id} sebagai Afkir.`)}
        onDeleteSuccess={() => { g.setDetailModalItem(null); g.loadData(); }}
      />
    );
  }

  if (g.isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Data Perizinan dari Database...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-900">{title}</h2>
          <p className="text-xs text-slate-600 font-mono-data">{subtitle}</p>
        </div>

        {/* Import Dropdown */}
        <div className="relative font-mono-data">
          <button
            onClick={() => g.setIsImportMenuOpen(!g.isImportMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Kelola / Impor Dokumen</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${g.isImportMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {g.isImportMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
              <button onClick={() => { g.setIsSingleModalOpen(true); g.setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer">
                <PlusCircle className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">+ Tambah Single Perizinan Baru</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Input manual 1 dokumen {categoryName}</span>
                </div>
              </button>
              <button onClick={() => { g.setIsCsvModalOpen(true); g.setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="block">Impor CSV Master</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Muat CSV gabungan multi-unit</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button onClick={() => g.setActiveMainTab('main')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${g.activeMainTab === 'main' ? 'bg-[#005ea4] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Building2 className="w-4 h-4" />
          <span>Data Utama</span>
        </button>
        <button onClick={() => g.setActiveMainTab('staging')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${g.activeMainTab === 'staging' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'}`}>
          <FileWarning className="w-4 h-4 text-amber-500" />
          <span>Menunggu Dokumen (Staging)</span>
          {g.pendingCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white font-bold rounded-full animate-pulse">{g.pendingCount}</span>
          )}
        </button>
      </div>

      {/* Search, Reset & Column Selector */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 relative">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={g.searchTerm} onChange={(e) => g.setSearchTerm(e.target.value)}
            placeholder={`Cari dokumen ${categoryName || 'perizinan'}, kode, nomor sertifikat...`}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]" />
        </div>
        <div className="flex items-center gap-2 font-mono-data">
          {(g.searchTerm || g.filterJenis !== 'All' || g.filterLokasi !== 'All' || g.filterStatus !== 'All' || g.visibleColumnKeys.length < g.allColumns.length) && (
            <button onClick={g.resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-md transition-colors cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /><span>Reset Filter</span>
            </button>
          )}
          <div className="relative">
            <button onClick={() => g.setIsColumnDropdownOpen(!g.isColumnDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
              <Columns className="w-4 h-4 text-[#005ea4]" />
              <span>Pilih Kolom ({g.visibleColumnKeys.length}/{g.allColumns.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {g.isColumnDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-40 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">Visibilitas Kolom</span>
                  <button onClick={g.selectAllColumns} className="text-[11px] text-[#005ea4] font-bold hover:underline cursor-pointer">Pilih Semua</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {g.allColumns.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer select-none">
                      <input type="checkbox" checked={g.isVisible(col.key)} onChange={() => g.toggleColumn(col.key)} className="rounded border-slate-300 text-[#005ea4] focus:ring-[#005ea4]" />
                      <span className="text-slate-700 font-medium">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {g.activeMainTab === 'staging' && g.selectedStagingIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between mt-4 shadow-2xs font-mono-data">
          <div className="text-amber-800 text-xs font-bold">{g.selectedStagingIds.length} item terpilih</div>
          <button onClick={() => g.setBulkExemptModalOpen(true)} disabled={g.isSubmittingBulkExempt}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer">
            <ShieldAlert className="w-3.5 h-3.5" />Tandai Terpilih Tanpa Sertifikat
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${g.activeMainTab === 'staging' && g.selectedStagingIds.length > 0 ? 'mt-4' : 'mt-0'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider">
                {g.activeMainTab === 'staging' && (
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input type="checkbox" checked={g.expandedRows.length > 0 && g.selectedStagingIds.length === g.expandedRows.length}
                      onChange={() => g.toggleSelectAllStaging(g.expandedRows)} className="rounded border-slate-300 accent-[#005ea4] cursor-pointer" />
                  </th>
                )}
                {g.isVisible("no") && <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">NO.</th>}
                {g.isVisible("namaItem") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap text-slate-900">
                    {g.isAsetCategory ? 'NAMA ASET' : categoryName?.toLowerCase().includes('proyek') ? 'NAMA PROYEK' : 'NAMA PRODUK'}
                  </th>
                )}
                {!g.isAsetCategory && g.isVisible("code") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-[#005ea4]">KODE PERIZINAN</th>}
                {!g.isAsetCategory && g.isVisible("jenisItem") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>JENIS PERIZINAN</span>
                      <select value={g.filterJenis} onChange={(e) => g.setFilterJenis(e.target.value)} className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer">
                        <option value="All">Semua</option>
                        {g.uniqueJenis.filter(j => j !== 'All').map((j, idx) => <option key={idx} value={j}>{j}</option>)}
                      </select>
                    </div>
                  </th>
                )}
                {g.isVisible("certificateNo") && <th className="py-3.5 px-4 font-bold whitespace-nowrap text-[#005ea4]">NOMOR SERTIFIKAT</th>}
                {g.isVisible("unit") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>LOKASI</span>
                      <select value={g.filterLokasi} onChange={(e) => g.setFilterLokasi(e.target.value)} className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer">
                        <option value="All">Semua</option>
                        {g.uniqueLokasi.filter(l => l !== 'All').map((l, idx) => <option key={idx} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </th>
                )}
                {g.isAsetCategory && g.isVisible("luasM2") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">LUAS (M²)</th>}
                {g.isAsetCategory && g.isVisible("luasHa") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">LUAS (HA)</th>}
                {g.isAsetCategory && g.isVisible("peruntukan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">PERUNTUKAN</th>}
                {!g.isAsetCategory && g.isVisible("user") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">INSTANSI / USER</th>}
                {g.isVisible("issueDate") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">{g.isAsetCategory ? "TANGGAL AWAL PENGAJUAN" : "TERBIT"}</th>}
                {g.isVisible("expiryDate") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">{g.isAsetCategory ? "MASA BERLAKU PRODUK" : "EXPIRED"}</th>}
                {g.isAsetCategory && g.isVisible("kondisi") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KONDISI</th>}
                {g.isAsetCategory && g.isVisible("keterangan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KETERANGAN</th>}
                {g.isVisible("status") && (
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>STATUS</span>
                      <select value={g.filterStatus} onChange={(e) => g.setFilterStatus(e.target.value)} className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer">
                        <option value="All">Semua</option>
                        {g.uniqueStatus.filter(s => s !== 'All').map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </th>
                )}
                <th className="py-3.5 px-4 font-bold text-right whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {g.expandedRows.length > 0 ? (
                g.expandedRows.map((row, index) => {
                  const doc = row.parentDoc;
                  const rowClass = g.getRowStatusStyle({ status: row.status });
                  const statusStr = (row.status || '').toLowerCase();
                  const isAfkir = statusStr === 'afkir' || statusStr === 'decommissioned';
                  const isExpired = statusStr === 'expired';
                  const isPerpanjang = statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'proses';
                  const docCode = doc.code || doc.id || '-';
                  const docUnit = doc.unit || doc.unitPabrik || doc.lokasi || '-';
                  const docNamaItem = doc.merekItem || doc.title || doc.judulCiptaan || '-';

                  return (
                    <tr key={row.rowId} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                      {g.activeMainTab === 'staging' && (
                        <td className="py-3.5 px-3 text-center">
                          <input type="checkbox" checked={g.selectedStagingIds.includes(doc.id || doc.MasterId)}
                            onChange={() => g.toggleSelectStaging(doc.id || doc.MasterId)} className="rounded border-slate-300 accent-[#005ea4] cursor-pointer" />
                        </td>
                      )}
                      {g.isVisible("no") && <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap">{index + 1}</td>}
                      {g.isVisible("namaItem") && (
                        <td onClick={() => g.setDetailModalItem({ ...doc, currentCert: row.cert })}
                          className={`py-3.5 px-4 font-bold cursor-pointer hover:underline font-sans ${isAfkir ? 'text-white' : 'text-slate-900 hover:text-[#005ea4]'}`}>
                          <div className="flex items-center gap-2">
                            <FileCheck className={`w-3.5 h-3.5 shrink-0 ${row.hasPdf ? (isAfkir ? 'text-slate-300' : 'text-emerald-600') : 'text-slate-400'}`} />
                            <span className="max-w-[220px] truncate block">{docNamaItem}</span>
                          </div>
                        </td>
                      )}
                      {!g.isAsetCategory && g.isVisible("code") && (
                        <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>{docCode}</td>
                      )}
                      {!g.isAsetCategory && g.isVisible("jenisItem") && (
                        <td className={`py-3.5 px-4 font-semibold whitespace-nowrap ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>{row.jenisCert}</td>
                      )}
                      {g.isVisible("certificateNo") && (
                        <td onClick={() => g.setDetailModalItem({ ...doc, currentCert: row.cert })}
                          className={`py-3.5 px-4 font-bold whitespace-nowrap cursor-pointer hover:underline ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                          <div className="flex items-start gap-1.5">
                            <FileCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${row.hasPdf ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <div><span className="block">{row.certNo}</span></div>
                          </div>
                        </td>
                      )}
                      {g.isVisible("unit") && <td className="py-3.5 px-4 whitespace-nowrap font-semibold">{docUnit}</td>}
                      {g.isAsetCategory && g.isVisible("luasM2") && <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">{doc.luasM2 || doc.kapasitas || '12.000 m²'}</td>}
                      {g.isAsetCategory && g.isVisible("luasHa") && <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">{doc.luasHa || '1,2 Ha'}</td>}
                      {g.isAsetCategory && g.isVisible("peruntukan") && <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">{doc.peruntukan || doc.title || doc.merekItem || 'Fasilitas Industrial'}</td>}
                      {!g.isAsetCategory && g.isVisible("user") && <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">{row.issuer}</td>}
                      {g.isVisible("issueDate") && <td className="py-3.5 px-4 whitespace-nowrap">{row.issueDate}</td>}
                      {g.isVisible("expiryDate") && <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isAfkir ? 'text-slate-300' : 'text-rose-700'}`}>{row.expiryDate}</td>}
                      {g.isAsetCategory && g.isVisible("kondisi") && <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">{doc.kondisi || (isAfkir ? 'Afkir / Non-Aktif' : isExpired ? 'Perlu Re-sertifikasi' : 'Baik & Layak')}</td>}
                      {g.isAsetCategory && g.isVisible("keterangan") && <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono-data text-[11px]">{doc.keterangan || doc.user || 'DPMPTSP / BPN Kota Bontang'}</td>}
                      {g.isVisible("status") && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${isAfkir ? 'bg-slate-800 text-white border-slate-600' : isExpired ? 'bg-rose-100 text-rose-900 border-rose-300' : isPerpanjang ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                            {row.status}
                          </span>
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono-data">
                        {doc.documentStatus === 'PENDING_DOC' || g.activeMainTab === 'staging' ? (
                          <button onClick={() => g.setResolveTargetItem(doc)} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                            <FileWarning className="w-3.5 h-3.5" /><span>Perbaiki / Lengkapi</span>
                          </button>
                        ) : (
                          <button onClick={() => g.setDetailModalItem({ ...doc, currentCert: row.cert })} className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors font-mono-data">
                            <Eye className="w-3.5 h-3.5" /><span>Lihat Detail</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={g.visibleColumnKeys.length + (g.activeMainTab === 'staging' ? 2 : 1)} className="py-8 text-center text-slate-400 font-mono-data">
                    Data perizinan tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          MODALS
      ====================================================== */}

      <SingleEntryGenericModal isOpen={g.isSingleModalOpen} onClose={() => g.setIsSingleModalOpen(false)} onAddSuccess={g.handleSingleAdded} categoryName={categoryName} />
      <CsvImportModal isOpen={g.isCsvModalOpen} onClose={() => g.setIsCsvModalOpen(false)} onImportSuccess={g.handleCsvImported} categoryKey={g.currentCategoryKey} />
      <ResolveDocumentModal isOpen={!!g.resolveTargetItem} onClose={() => g.setResolveTargetItem(null)} item={g.resolveTargetItem} onSuccess={g.loadData} />

      {/* Bulk Exempt Modal */}
      {g.bulkExemptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-amber-500" />Tandai Tanpa Sertifikat</h3>
              <button onClick={() => g.setBulkExemptModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 font-medium">Anda akan menandai <strong>{g.selectedStagingIds.length} item terpilih</strong> sebagai tidak memerlukan dokumen/sertifikat (EXEMPT).</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Alasan <span className="text-rose-500">*</span></label>
                <textarea value={g.bulkExemptNote} onChange={(e) => g.setBulkExemptNote(e.target.value)}
                  placeholder="Masukkan alasan mengapa dokumen tidak diperlukan..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] bg-slate-50 focus:bg-white resize-none" rows={3} />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button type="button" onClick={() => g.setBulkExemptModalOpen(false)} disabled={g.isSubmittingBulkExempt}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">Batal</button>
              <button type="button" onClick={g.handleBulkExempt} disabled={g.isSubmittingBulkExempt || !g.bulkExemptNote.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs">
                {g.isSubmittingBulkExempt && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ya, Tandai {g.selectedStagingIds.length} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
