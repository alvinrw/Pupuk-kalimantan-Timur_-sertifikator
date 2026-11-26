import React, { useRef, useEffect } from 'react';
import { PlusCircle, ChevronDown, Building2, FileWarning, Loader2, ShieldAlert, FileSpreadsheet } from 'lucide-react';

import CsvImportModal from '../components/CsvImportModal';
import HistoryModal from '../components/HistoryModal';
import SingleEntryModal from '../components/SingleEntryModal';
import ResolveDocumentModal from '../components/ResolveDocumentModal'; 
import DocumentDetailPage from './DocumentDetailPage';
import { useAuth } from '../contexts/AuthContext';

import { usePeralatanPabrik } from '../hooks/usePeralatanPabrik';
import PeralatanFilterBar from '../components/peralatan-pabrik/PeralatanFilterBar';
import PeralatanTable from '../components/peralatan-pabrik/PeralatanTable';
import PeralatanModals from '../components/peralatan-pabrik/PeralatanModals';

export default function PeralatanPabrik() {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  const data = usePeralatanPabrik();

  // ─── Import menu click-outside & mutual exclusion ────────
  const importMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (importMenuRef.current && !importMenuRef.current.contains(event.target)) {
        data.setIsImportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleImportMenu = () => {
    data.setIsImportMenuOpen((prev) => !prev);
    // Also close the filter bar dropdowns
    data.setIsColumnDropdownOpen(false);
  };

  if (data.detailModalItem) {
    return (
      <DocumentDetailPage
        item={data.detailModalItem}
        onBack={() => {
          data.setDetailModalItem(null);
          data.loadData();
        }}
        onSaveUpdate={(updatedDoc) => {
          data.setDetailModalItem((prev) => (prev && prev.id === updatedDoc.id ? { ...prev, ...updatedDoc } : prev));
          data.loadData();
        }}
        onRefreshRequired={data.loadData}
        onQuickRenew={(id) => {
          alert(`Inisiasi Perpanjangan Sertifikat untuk item ${id}. Menuju menu Monitoring.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Menandai item ${id} sebagai Aset Decommissioned.`);
        }}
        onDeleteSuccess={() => {
          data.setDetailModalItem(null);
          data.loadData();
        }}
      />
    );
  }

  if (data.isLoading) {
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

          </p>
        </div>
      </div>

      {/* TAB SWITCHER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => data.setActiveMainTab('main')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${data.activeMainTab === 'main'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Data Utama</span>

          </button>
          {!isViewer && (
            <button
              onClick={() => data.setActiveMainTab('staging')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${data.activeMainTab === 'staging'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
            >
              <FileWarning className="w-4 h-4 text-amber-500" />
              <span>Menunggu Dokumen (Staging)</span>
              {data.pendingCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white font-bold rounded-full">
                  {data.pendingCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* UNIFIED SINGLE ACTION DROPDOWN BUTTON */}
        {!isViewer && (
          <div className="relative" ref={importMenuRef}>
            <button
              onClick={handleToggleImportMenu}
              className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Unggah Dokumen Peralatan Pabrik</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${data.isImportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute right-0 top-11 z-40 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-1 space-y-1 text-xs font-sans-clean transition-all duration-200 origin-top-right ${data.isImportMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}`}>
              <button
                onClick={() => { data.setIsSingleModalOpen(true); data.setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">Unggah Data Manual Peralatan Pabrik Baru</span>
                </div>
              </button>
              <button
                onClick={() => { data.setIsCsvModalOpen(true); data.setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="block">Unggah Template Peralatan Pabrik</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <PeralatanFilterBar
        searchTerm={data.searchTerm} setSearchTerm={data.setSearchTerm}
        filteredDataLength={data.filteredData.length}
        filterJenis={data.filterJenis} setFilterJenis={data.setFilterJenis}
        filterLokasi={data.filterLokasi} setFilterLokasi={data.setFilterLokasi}
        filterUser={data.filterUser} setFilterUser={data.setFilterUser}
        filterStatus={data.filterStatus} setFilterStatus={data.setFilterStatus}
        isColumnDropdownOpen={data.isColumnDropdownOpen} setIsColumnDropdownOpen={data.setIsColumnDropdownOpen}
        visibleColumnKeys={data.visibleColumnKeys}
        allColumns={data.allColumns}
        selectAllColumns={data.selectAllColumns}
        toggleColumn={data.toggleColumn}
        sortDateOrder={data.sortDateOrder}
        setSortDateOrder={data.setSortDateOrder}
      />

      {data.activeMainTab === 'staging' && data.selectedStagingIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between mt-4 shadow-2xs">
          <div className="text-amber-800 text-xs font-bold font-mono-data">
            {data.selectedStagingIds.length} item terpilih
          </div>
          <button
            onClick={() => data.setBulkExemptModalOpen(true)}
            disabled={data.isSubmittingBulkExempt}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Tandai Terpilih Tanpa Sertifikat
          </button>
        </div>
      )}

      <PeralatanTable
        activeMainTab={data.activeMainTab}
        expandedRows={data.expandedRows}
        visibleColumnKeys={data.visibleColumnKeys}
        isVisible={data.isVisible}
        selectedStagingIds={data.selectedStagingIds}
        toggleSelectStaging={data.toggleSelectStaging}
        toggleSelectAllStaging={data.toggleSelectAllStaging}
        filterJenis={data.filterJenis} setFilterJenis={data.setFilterJenis}
        filterLokasi={data.filterLokasi} setFilterLokasi={data.setFilterLokasi}
        filterUser={data.filterUser} setFilterUser={data.setFilterUser}
        filterStatus={data.filterStatus} setFilterStatus={data.setFilterStatus}
        filterHasSertifikat={data.filterHasSertifikat} setFilterHasSertifikat={data.setFilterHasSertifikat}
        uniqueJenis={data.uniqueJenis} uniqueLokasi={data.uniqueLokasi} uniqueUser={data.uniqueUser}
        setDetailModalItem={data.setDetailModalItem}
        setResolveTargetItem={data.setResolveTargetItem}
        getRowStatusStyle={data.getRowStatusStyle}
        sortKey={data.sortKey}
        sortOrder={data.sortOrder}
        toggleSort={data.toggleSort}
        allColumns={data.allColumns}
      />

      <PeralatanModals
        bulkExemptModalOpen={data.bulkExemptModalOpen} setBulkExemptModalOpen={data.setBulkExemptModalOpen}
        selectedStagingIds={data.selectedStagingIds}
        bulkExemptNote={data.bulkExemptNote} setBulkExemptNote={data.setBulkExemptNote}
        isSubmittingBulkExempt={data.isSubmittingBulkExempt} handleBulkExempt={data.handleBulkExempt}
        rowConfirmModalOpen={data.rowConfirmModalOpen} setRowConfirmModalOpen={data.setRowConfirmModalOpen}
        confirmDeleteRow={data.confirmDeleteRow}
        reassignCertRowItem={data.reassignCertRowItem} setReassignCertRowItem={data.setReassignCertRowItem}
        searchTargetItemTerm={data.searchTargetItemTerm} setSearchTargetItemTerm={data.setSearchTargetItemTerm}
        filteredTargetEquipmentList={data.filteredTargetEquipmentList}
        selectedNewTargetItem={data.selectedNewTargetItem} setSelectedNewTargetItem={data.setSelectedNewTargetItem}
        confirmReassignTargetRow={data.confirmReassignTargetRow}
      />

      {/* Other Global Modals */}
      <SingleEntryModal
        isOpen={data.isSingleModalOpen}
        onClose={() => data.setIsSingleModalOpen(false)}
        onAddSuccess={data.handleSingleAdded}
      />
      <CsvImportModal
        isOpen={data.isCsvModalOpen}
        onClose={() => data.setIsCsvModalOpen(false)}
        onImportSuccess={data.handleCsvImported}
        categoryKey="peralatan-pabrik"
      />
      <HistoryModal
        isOpen={!!data.historyTargetItem}
        onClose={() => data.setHistoryTargetItem(null)}
        documentItem={data.historyTargetItem}
      />
      <ResolveDocumentModal
        isOpen={!!data.resolveTargetItem}
        onClose={() => data.setResolveTargetItem(null)}
        item={data.resolveTargetItem}
        onSuccess={() => data.loadData()}
      />
    </div>
  );
}
