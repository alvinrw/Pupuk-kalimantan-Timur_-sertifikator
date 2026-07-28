import React from 'react';
import {
  Search, FileSpreadsheet, Columns, PlusCircle, ChevronDown,
  AlertTriangle, X, Check, Building2, Eye, Loader2, ShieldAlert,
  FileWarning, FileCheck
} from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import HistoryModal from '../components/HistoryModal';
import SingleEntryModal from '../components/SingleEntryModal';
import ResolveDocumentModal from '../components/ResolveDocumentModal';
import DocumentDetailPage from './DocumentDetailPage';
import ModalConfirm from '../components/document-detail/ModalConfirm';
import { usePeralatanPabrik } from '../hooks/usePeralatanPabrik';

export default function PeralatanPabrik() {
  const p = usePeralatanPabrik();

  // ============================================================
  // DETAIL VIEW
  // ============================================================
  if (p.detailModalItem) {
    return (
      <DocumentDetailPage
        item={p.detailModalItem}
        onBack={() => p.setDetailModalItem(null)}
        onSaveUpdate={(updatedItem) => {
          p.setEquipmentList(prev => prev.map(i => {
            const isMatch = i.MasterId === updatedItem.MasterId || (i.id === updatedItem.id && !i.MasterId);
            return isMatch ? { ...i, ...updatedItem, id: i.id } : i;
          }));
          p.setDetailModalItem(prev => {
            if (!prev) return prev;
            const isMatch = prev.MasterId === updatedItem.MasterId || (prev.id === updatedItem.id && !prev.MasterId);
            return isMatch ? { ...prev, ...updatedItem, id: prev.id } : prev;
          });
        }}
        onQuickRenew={(id) => alert(`Inisiasi Perpanjangan Sertifikat untuk item ${id}. Menuju menu Monitoring.`)}
        onQuickDecommission={(id) => alert(`Menandai item ${id} sebagai Aset Afkir.`)}
        onDeleteSuccess={() => { p.setDetailModalItem(null); p.loadData(); }}
        onRefreshRequired={() => p.loadData()}
      />
    );
  }

  if (p.isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Tabel Peralatan Pabrik dari Database...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-[#0F172A]">Perizinan Peralatan Pabrik</h2>
          <p className="text-xs text-[#64748B] font-mono-data">
            Daftar perizinan peralatan pabrik, nomor seri, kapasitas, lokasi, dan status sertifikat
          </p>
        </div>

        {/* Unified Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => p.setIsImportMenuOpen(!p.isImportMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Kelola / Impor Dokumen</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {p.isImportMenuOpen && (
            <div className="absolute right-0 top-11 z-40 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-1 space-y-1 text-xs font-sans-clean">
              <button
                onClick={() => { p.setIsSingleModalOpen(true); p.setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800"
              >
                <PlusCircle className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">+ Input 1 Data Manual</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Termasuk unggah foto / PDF sertifikat</span>
                </div>
              </button>
              <button
                onClick={() => { p.setIsCsvModalOpen(true); p.setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800"
              >
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
        <button
          onClick={() => p.setActiveMainTab('main')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${p.activeMainTab === 'main' ? 'bg-[#005ea4] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Building2 className="w-4 h-4" />
          <span>Data Utama</span>
        </button>
        <button
          onClick={() => p.setActiveMainTab('staging')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${p.activeMainTab === 'staging' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'}`}
        >
          <FileWarning className="w-4 h-4 text-amber-500" />
          <span>Menunggu Dokumen (Staging)</span>
          {p.pendingCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white font-bold rounded-full animate-pulse">{p.pendingCount}</span>
          )}
        </button>
      </div>

      {/* Search, Reset, Column Selector */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 relative">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={p.searchTerm}
            onChange={(e) => p.setSearchTerm(e.target.value)}
            placeholder="Cari Jenis Peralatan, Merek, Tipe, No Seri, atau Sertifikat..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
            {p.filteredData.length} data ditemukan
          </div>
          {(p.filterJenis !== 'All' || p.filterLokasi !== 'All' || p.filterUser !== 'All' || p.filterStatus !== 'All') && (
            <button
              onClick={() => { p.setFilterJenis('All'); p.setFilterLokasi('All'); p.setFilterUser('All'); p.setFilterStatus('All'); }}
              className="text-xs font-bold text-rose-700 hover:underline px-2.5 py-1 bg-rose-50 rounded border border-rose-200"
            >
              Reset Filter Header
            </button>
          )}

          {/* Column Visibility Dropdown */}
          <div className="relative">
            <button
              onClick={() => p.setIsColumnDropdownOpen(!p.isColumnDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs transition-colors"
            >
              <Columns className="w-4 h-4 text-[#005ea4]" />
              <span>Pilih Kolom Tampil ({p.visibleColumnKeys.length}/{p.allColumns.length})</span>
            </button>
            {p.isColumnDropdownOpen && (
              <div className="absolute right-0 top-10 z-40 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 space-y-2 text-xs font-sans-clean">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-xs">Centang Kolom yang Tampil</span>
                  <button onClick={p.selectAllColumns} className="text-[11px] font-mono-data font-bold text-[#005ea4] hover:underline">Pilih Semua</button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {p.allColumns.map((col) => {
                    const checked = p.isVisible(col.key);
                    return (
                      <label
                        key={col.key}
                        onClick={() => p.toggleColumn(col.key)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                      >
                        <input type="checkbox" checked={checked} onChange={() => {}} className="rounded border-slate-300 accent-[#005ea4]" />
                        <span className="text-xs">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-200 text-right">
                  <button onClick={() => p.setIsColumnDropdownOpen(false)} className="px-3 py-1 bg-[#005ea4] text-white text-[11px] font-bold rounded-md">Selesai</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {p.activeMainTab === 'staging' && p.selectedStagingIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between mt-4 shadow-2xs">
          <div className="text-amber-800 text-xs font-bold font-mono-data">{p.selectedStagingIds.length} item terpilih</div>
          <button
            onClick={() => p.setBulkExemptModalOpen(true)}
            disabled={p.isSubmittingBulkExempt}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Tandai Terpilih Tanpa Sertifikat
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                {p.activeMainTab === 'staging' && (
                  <th className="py-3.5 px-4 text-center whitespace-nowrap w-12">
                    <input type="checkbox" className="rounded border-slate-300 accent-amber-600 cursor-pointer"
                      checked={p.expandedRows.length > 0 && p.selectedStagingIds.length === p.expandedRows.length}
                      onChange={() => p.toggleSelectAllStaging(p.expandedRows)} />
                  </th>
                )}
                {p.isVisible("no") && <th className="py-3.5 px-4 text-center font-bold whitespace-nowrap">NO.</th>}
                {p.isVisible("jenisPeralatan") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>JENIS PERALATAN PABRIK</span>
                      <select value={p.filterJenis} onChange={(e) => p.setFilterJenis(e.target.value)} className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs">
                        <option value="All">Semua</option>
                        {p.uniqueJenis.filter(j => j !== 'All').map((j, idx) => <option key={idx} value={j}>{j}</option>)}
                      </select>
                    </div>
                  </th>
                )}
                {p.isVisible("merekItem") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">MEREK/ITEM</th>}
                {p.isVisible("tipe") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">TIPE</th>}
                {p.isVisible("nomorSeri") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">NOMOR SERI</th>}
                {p.isVisible("kapasitas") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KAPASITAS</th>}
                {p.isVisible("lokasi") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>LOKASI</span>
                      <select value={p.filterLokasi} onChange={(e) => p.setFilterLokasi(e.target.value)} className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs">
                        <option value="All">Semua</option>
                        {p.uniqueLokasi.filter(l => l !== 'All').map((l, idx) => <option key={idx} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </th>
                )}
                {p.isVisible("user") && (
                  <th className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center gap-1.5">
                      <span>USER</span>
                      <select value={p.filterUser} onChange={(e) => p.setFilterUser(e.target.value)} className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs">
                        <option value="All">Semua</option>
                        {p.uniqueUser.filter(u => u !== 'All').map((u, idx) => <option key={idx} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </th>
                )}
                {p.isVisible("status") && (
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>STATUS</span>
                      <select value={p.filterStatus} onChange={(e) => p.setFilterStatus(e.target.value)} className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea4] font-bold font-sans-clean cursor-pointer shadow-2xs">
                        <option value="All">Semua</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Spare">Spare</option>
                        <option value="Rusak">Rusak</option>
                      </select>
                    </div>
                  </th>
                )}
                {p.isVisible("noSertifikat") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">NO. SERTIFIKAT</th>}
                {p.isVisible("tanggalInspeksi") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">TANGGAL INSPEKSI</th>}
                {p.isVisible("terbit") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">TERBIT</th>}
                {p.isVisible("berakhir") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">BERAKHIR</th>}
                {p.isVisible("keterangan") && <th className="py-3.5 px-4 font-bold whitespace-nowrap">KETERANGAN</th>}
                <th className="py-3.5 px-4 font-bold text-right whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {p.expandedRows.length > 0 ? (
                p.expandedRows.map((row, index) => {
                  const item = row.parentItem;
                  const rowClass = p.getRowStatusStyle({ status: row.status, berakhir: row.berakhir, documentStatus: row.documentStatus });
                  const isAfkir = row.status === 'Afkir' || row.status === 'Decommissioned' || row.status === 'afkir';
                  const isExpired = row.status === 'Expired' || row.status === 'expired';
                  const isPerpanjang = row.status === 'Perpanjang' || row.status === 'In Progress' || row.status === 'perpanjang';

                  return (
                    <tr key={row.rowId} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                      {p.activeMainTab === 'staging' && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap w-12">
                          <input type="checkbox" className="rounded border-slate-300 accent-amber-600 cursor-pointer"
                            checked={p.selectedStagingIds.includes(item.id || item.MasterId)}
                            onChange={() => p.toggleSelectStaging(item.id || item.MasterId)} />
                        </td>
                      )}
                      {p.isVisible("no") && <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap">{index + 1}</td>}
                      {p.isVisible("jenisPeralatan") && (
                        <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                          <span>{row.jenisPeralatan}</span>
                        </td>
                      )}
                      {p.isVisible("merekItem") && (
                        <td onClick={() => p.setDetailModalItem(item)}
                          className={`py-3.5 px-4 font-bold cursor-pointer hover:underline whitespace-nowrap ${isAfkir ? 'text-white' : 'text-slate-900 hover:text-[#005ea4]'}`}
                          title="Klik untuk Lihat Detail">
                          {item.merekItem}
                        </td>
                      )}
                      {p.isVisible("tipe") && <td className="py-3.5 px-4 font-semibold whitespace-nowrap">{item.tipe}</td>}
                      {p.isVisible("nomorSeri") && <td className="py-3.5 px-4 whitespace-nowrap">{item.nomorSeri}</td>}
                      {p.isVisible("kapasitas") && <td className="py-3.5 px-4 font-medium whitespace-nowrap">{item.kapasitas}</td>}
                      {p.isVisible("lokasi") && <td className="py-3.5 px-4 font-medium whitespace-nowrap">{item.lokasi}</td>}
                      {p.isVisible("user") && <td className="py-3.5 px-4 whitespace-nowrap">{item.user}</td>}
                      {p.isVisible("status") && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${isAfkir ? 'bg-slate-800 text-white border-slate-600' : isExpired ? 'bg-rose-100 text-rose-900 border-rose-300' : isPerpanjang ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {row.status}
                          </span>
                        </td>
                      )}
                      {p.isVisible("noSertifikat") && (
                        <td className="py-3.5 px-4 font-mono-data font-bold text-[#005ea4] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {row.documentStatus === 'PENDING_DOC' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <FileWarning className="w-3 h-3 text-amber-500" />Belum Upload PDF
                              </span>
                            ) : row.documentStatus === 'EXEMPT' ? (
                              <span title={`Catatan Alasan: ${row.exemptionNote || 'Tanpa Sertifikat'}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-300 shadow-2xs cursor-help">
                                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /><span>Tanpa Sertifikat</span>
                              </span>
                            ) : (
                              <><FileCheck className="w-3.5 h-3.5 text-slate-400" /><span>{row.noSertifikat}</span></>
                            )}
                          </div>
                        </td>
                      )}
                      {p.isVisible("tanggalInspeksi") && <td className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap">{row.tanggalInspeksi}</td>}
                      {p.isVisible("terbit") && <td className="py-3.5 px-4 font-mono-data text-slate-700 whitespace-nowrap">{row.terbit}</td>}
                      {p.isVisible("berakhir") && <td className="py-3.5 px-4 font-mono-data font-bold text-rose-700 whitespace-nowrap">{row.berakhir}</td>}
                      {p.isVisible("keterangan") && <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">{row.keterangan}</td>}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono-data">
                        {row.documentStatus === 'PENDING_DOC' || p.activeMainTab === 'staging' ? (
                          <button onClick={() => p.setResolveTargetItem(item)} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                            <FileWarning className="w-3.5 h-3.5" /><span>Perbaiki / Lengkapi</span>
                          </button>
                        ) : (
                          <button onClick={() => p.setDetailModalItem(item)} className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                            <Eye className="w-3.5 h-3.5" /><span>Lihat Detail</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={p.visibleColumnKeys.length + 1} className="py-12 text-center text-slate-500">
                    {p.activeMainTab === 'staging' ? (
                      <div className="max-w-sm mx-auto space-y-2 py-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                          <Check className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 font-sans-clean">Semua Dokumen Lengkap!</h4>
                        <p className="text-xs text-slate-500 font-sans-clean">Tidak ada data baru yang membutuhkan tindakan.</p>
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

      {/* ======================================================
          MODALS
      ====================================================== */}

      {/* Reassign Cert Modal */}
      {p.reassignCertRowItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Ganti / Pindahkan Target Sertifikat</h4>
                <p className="text-[11px] text-blue-300 font-mono-data">Sertifikat: {p.reassignCertRowItem.noSertifikat} ({p.reassignCertRowItem.tipe})</p>
              </div>
              <button onClick={() => p.setReassignCertRowItem(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-700 font-medium">Pilih peralatan pabrik tujuan tempat sertifikat <b>{p.reassignCertRowItem.noSertifikat}</b> ini akan dipindahkan:</p>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={p.searchTargetItemTerm} onChange={(e) => p.setSearchTargetItemTerm(e.target.value)}
                  placeholder="Cari Tipe, Merek, Jenis, atau Lokasi Peralatan Target..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none" autoFocus />
              </div>
              <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                {p.filteredTargetEquipmentList.map((eq) => {
                  const isSelected = p.selectedNewTargetItem?.id === eq.id;
                  return (
                    <div key={eq.id} onClick={() => p.setSelectedNewTargetItem(eq)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'bg-blue-50/90 border-[#005ea4] ring-1 ring-[#005ea4]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-data font-bold text-xs text-[#005ea4]">{eq.tipe}</span>
                          <span className="text-[10px] font-mono-data text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">{eq.nomorSeri}</span>
                        </div>
                        <span className="font-bold text-xs text-slate-900 block">{eq.merekItem}</span>
                        <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1"><Building2 className="w-3 h-3 text-slate-400" />{eq.lokasi}</span>
                      </div>
                      {isSelected && <div className="p-1 rounded-full bg-[#005ea4] text-white"><Check className="w-4 h-4" /></div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => p.setReassignCertRowItem(null)} className="px-3.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300">Batal</button>
              <button type="button" onClick={p.confirmReassignTargetRow} className="px-4 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs">Pindahkan Sertifikat ke Item Ini</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Row Confirm */}
      <ModalConfirm
        isOpen={p.rowConfirmModalOpen}
        onClose={() => p.setRowConfirmModalOpen(false)}
        onConfirm={p.confirmDeleteRow}
        title="Konfirmasi Penghapusan Baris"
        description="Apakah Anda yakin ingin menghapus baris data peralatan ini? Baris yang dihapus tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus Baris Data"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
        icon={<AlertTriangle className="w-6 h-6" />}
        iconBgClassName="w-12 h-12 border border-rose-200 bg-rose-100 text-rose-600"
      />

      {/* Bulk Exempt Modal */}
      {p.bulkExemptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-amber-500" />Tandai Tanpa Sertifikat</h3>
              <button onClick={() => p.setBulkExemptModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 font-medium">Anda akan menandai <strong>{p.selectedStagingIds.length} item terpilih</strong> sebagai tidak memerlukan dokumen/sertifikat (EXEMPT).</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Alasan <span className="text-rose-500">*</span></label>
                <textarea value={p.bulkExemptNote} onChange={(e) => p.setBulkExemptNote(e.target.value)}
                  placeholder="Masukkan alasan mengapa dokumen tidak diperlukan..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] bg-slate-50 focus:bg-white resize-none" rows={3} />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button type="button" onClick={() => p.setBulkExemptModalOpen(false)} disabled={p.isSubmittingBulkExempt}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">Batal</button>
              <button type="button" onClick={p.handleBulkExempt} disabled={p.isSubmittingBulkExempt || !p.bulkExemptNote.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs">
                {p.isSubmittingBulkExempt && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ya, Tandai {p.selectedStagingIds.length} Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard Modals */}
      <SingleEntryModal isOpen={p.isSingleModalOpen} onClose={() => p.setIsSingleModalOpen(false)} onAddSuccess={p.handleSingleAdded} />
      <CsvImportModal isOpen={p.isCsvModalOpen} onClose={() => p.setIsCsvModalOpen(false)} onImportSuccess={p.handleCsvImported} categoryKey="peralatan-pabrik" />
      <HistoryModal isOpen={!!p.historyTargetItem} onClose={() => p.setHistoryTargetItem(null)} documentItem={p.historyTargetItem} />
      <ResolveDocumentModal isOpen={!!p.resolveTargetItem} onClose={() => p.setResolveTargetItem(null)} item={p.resolveTargetItem} onSuccess={p.loadData} />
    </div>
  );
}
