import React, { useState } from 'react';
import { Activity, Filter, Loader2, Search, RotateCcw, Calendar, X } from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';
import { useAuth } from '../contexts/AuthContext';
import { useMonitoring } from '../hooks/useMonitoring';
import MonitoringSummaryCards from '../components/monitoring/MonitoringSummaryCards';
import MonitoringActionModals from '../components/monitoring/MonitoringActionModals';
import MonitoringHistorySidebar from '../components/monitoring/MonitoringHistorySidebar';
import MonitoringTable from '../components/monitoring/MonitoringTable';

export default function MonitoringSertifikasi() {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  const m = useMonitoring();

  // Custom Date Range state (UI-only, applied on top of hook filters)
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  // Sync kategori filter ke hook sekaligus local state
  const handleKategoriChange = (val) => {
    m.setFilterKategori(val);
  };

  const handleApplyDateFilter = () => {
    setIsDateFilterActive(!!(dateRangeStart || dateRangeEnd));
  };

  const handleResetDateFilter = () => {
    setDateRangeStart('');
    setDateRangeEnd('');
    setIsDateFilterActive(false);
  };

  // Filter by date range applied on top of filteredCertificates dari hook
  const displayedCertificates = React.useMemo(() => {
    if (!isDateFilterActive || (!dateRangeStart && !dateRangeEnd)) return m.filteredCertificates;
    return m.filteredCertificates.filter(item => {
      if (!item.tglExpired || item.tglExpired === '-') return false;
      const expDate = new Date(item.tglExpired);
      if (isNaN(expDate)) return false;
      if (dateRangeStart) {
        const start = new Date(dateRangeStart + '-01');
        if (expDate < start) return false;
      }
      if (dateRangeEnd) {
        const [ey, em] = dateRangeEnd.split('-').map(Number);
        const end = new Date(ey, em, 0);
        if (expDate > end) return false;
      }
      return true;
    });
  }, [m.filteredCertificates, isDateFilterActive, dateRangeStart, dateRangeEnd]);

  // === Early Returns ===
  if (m.selectedDetailDoc) {
    return (
      <DocumentDetailPage
        item={m.selectedDetailDoc}
        onBack={() => { m.setSelectedDetailDoc(null); m.fetchMonitoringData(); }}
        onSaveUpdate={(updatedDoc) => {
          const updateItem = (d) => {
            const newStatus = updatedDoc.status || d.status;
            const lowerSt = newStatus.toLowerCase();
            const isAfkir = lowerSt === 'afkir' || lowerSt === 'nonaktif' || lowerSt === 'decommissioned';
            const isPerpanjang = lowerSt === 'perpanjang' || lowerSt === 'perpanjangan' || lowerSt === 'in progress' || lowerSt === 'in_progress';
            const isExempt = d.documentStatus === 'EXEMPT' || updatedDoc.documentStatus === 'EXEMPT';
            let calcWf = d.workflowStatus;
            if (isAfkir) calcWf = 'decommissioned';
            else if (isPerpanjang) calcWf = 'in_progress';
            else if (lowerSt === 'aktif' || lowerSt === 'completed') calcWf = isExempt ? 'exempt' : 'completed';
            return { ...d, ...updatedDoc, status: newStatus, statusOperasional: newStatus, workflowStatus: calcWf, id: d.id };
          };
          m.setAllCertificates(prev => prev.map(d => {
            const isMatch = d.MasterId === updatedDoc.MasterId || (d.id === updatedDoc.id && !d.MasterId);
            return isMatch ? updateItem(d) : d;
          }));
          m.setSelectedDetailDoc(prev => {
            if (!prev) return prev;
            const isMatch = prev.MasterId === updatedDoc.MasterId || (prev.id === updatedDoc.id && !prev.MasterId);
            return isMatch ? updateItem(prev) : prev;
          });
        }}
        onQuickRenew={(id) => m.handleQuickRenew(id)}
        onQuickDecommission={(id) => m.handleQuickDecommission(id)}
        onDeleteSuccess={() => {
          m.setAllCertificates(prev => prev.filter(c => c.MasterId !== m.selectedDetailDoc.MasterId && c.id !== (m.selectedDetailDoc.MasterId || m.selectedDetailDoc.id)));
          m.setSelectedDetailDoc(null);
        }}
        onRefreshRequired={() => m.fetchMonitoringData()}
      />
    );
  }

  if (m.isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Tabel Monitoring dari Database...</p>
      </div>
    );
  }

  const kategoriOptions = ['All', ...new Set(m.allCertificates.map(c => c.kategoriDokumen || c.categoryKey || '').filter(Boolean))];

  return (
    <div className="p-8 space-y-6 font-sans-clean max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl text-slate-900 flex items-center gap-2 tracking-tight">
            <Activity className="w-6 h-6 text-[#005ea4]" />
            Monitoring &amp; Evaluasi
          </h2>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            Rekapitulasi tenggat perpanjangan sertifikat dan anggaran
          </p>
        </div>

        {/* Inline Filter Kategori */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={m.filterKategori}
              onChange={(e) => handleKategoriChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005ea4] cursor-pointer shadow-xs"
            >
              {kategoriOptions.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Semua Kategori Perizinan' : cat}</option>
              ))}
            </select>
          </div>

          {m.activeFilterCount > 0 && (
            <button
              onClick={m.resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-lg transition-colors font-mono-data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ({m.activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <MonitoringSummaryCards
        counts={m.counts}
        expiryTab={m.expiryTab}
        setExpiryTab={m.setExpiryTab}
        customUrgentDays={m.customUrgentDays}
        setCustomUrgentDays={m.setCustomUrgentDays}
      />

      {/* DATE RANGE FILTER + EXPORT TOOLBAR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">

          {/* Row 1: Title + count badge + export */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono-data">
              <span className="text-xs font-bold text-slate-800">Daftar Dokumen Sertifikasi</span>
              <span className="text-[11px] font-bold text-[#005ea4] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {displayedCertificates.length} Data Ditampilkan
              </span>
              {isDateFilterActive && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Filter Tanggal Aktif
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={m.searchTerm}
                  onChange={(e) => m.setSearchTerm(e.target.value)}
                  placeholder="Cari item, seri, nomor sertifikat..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>
              {/* Export */}
              {!isViewer && (
                <>
                  <button
                    onClick={() => m.handleExportCSV(displayedCertificates)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-colors font-mono-data"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => m.handleExportJSON(displayedCertificates)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-colors font-mono-data"
                  >
                    Export JSON
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Custom Date Range Filter */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-600 font-mono-data">Rentang Bulan Expired:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 font-mono-data font-bold mb-0.5">Dari (Bulan/Tahun)</label>
                <input
                  type="month"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
                />
              </div>
              <span className="text-slate-400 text-xs mt-4">s.d.</span>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 font-mono-data font-bold mb-0.5">Sampai (Bulan/Tahun)</label>
                <input
                  type="month"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-4">
                <button
                  onClick={handleApplyDateFilter}
                  className="px-3 py-1 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-lg transition-colors font-mono-data"
                >
                  Terapkan
                </button>
                {isDateFilterActive && (
                  <button
                    onClick={handleResetDateFilter}
                    className="px-2 py-1 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MONITORING TABLE */}
        <MonitoringTable
          filteredCertificates={displayedCertificates}
          customUrgentDays={m.customUrgentDays}
          onOpenDetail={(doc) => m.setSelectedDetailDoc(doc)}
          onCompleteModal={m.openCompleteModal}
          onCancelAction={m.handleCancelAction}
          onCancelAfkir={m.handleCancelAfkir}
          onQuickRenew={m.handleQuickRenew}
          onQuickDecommission={m.handleQuickDecommission}
        />
      </div>

      <MonitoringHistorySidebar
        selectedHistoryItem={m.selectedHistoryItem}
        setSelectedHistoryItem={m.setSelectedHistoryItem}
      />

      <MonitoringActionModals
        isAfkirModalOpen={m.isAfkirModalOpen}
        setIsAfkirModalOpen={m.setIsAfkirModalOpen}
        isAktifkanModalOpen={m.isAktifkanModalOpen}
        setIsAktifkanModalOpen={m.setIsAktifkanModalOpen}
        isRenewConfirmModalOpen={m.isRenewConfirmModalOpen}
        setIsRenewConfirmModalOpen={m.setIsRenewConfirmModalOpen}
        isCancelRenewModalOpen={m.isCancelRenewModalOpen}
        setIsCancelRenewModalOpen={m.setIsCancelRenewModalOpen}
        activeModalItem={m.activeModalItem}
        setActiveModalItem={m.setActiveModalItem}
        activeItemForAction={m.activeItemForAction}
        isProcessingAction={m.isProcessingAction}
        confirmQuickDecommission={m.confirmQuickDecommission}
        confirmCancelAfkir={m.confirmCancelAfkir}
        confirmQuickRenew={m.confirmQuickRenew}
        confirmCancelRenew={m.confirmCancelRenew}
        uploadedFile={m.uploadedFile}
        handleFileSelect={m.handleFileSelect}
        isOcrScanning={m.isOcrScanning}
        ocrSuccess={m.ocrSuccess}
        newCertNumber={m.newCertNumber}
        setNewCertNumber={m.setNewCertNumber}
        issueDate={m.issueDate}
        setIssueDate={m.setIssueDate}
        newExpiryDate={m.newExpiryDate}
        setNewExpiryDate={m.setNewExpiryDate}
        resertifikasiNotes={m.resertifikasiNotes}
        setResertifikasiNotes={m.setResertifikasiNotes}
        handleConfirmUploadRenewal={m.handleConfirmUploadRenewal}
      />
    </div>
  );
}
