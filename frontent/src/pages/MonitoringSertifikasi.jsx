import React, { useState } from 'react';
import { Activity, Filter, Loader2, Search } from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';
import { useMonitoring } from '../hooks/useMonitoring';
import MonitoringSummaryCards from '../components/monitoring/MonitoringSummaryCards';
import MonitoringActionModals from '../components/monitoring/MonitoringActionModals';
import MonitoringHistorySidebar from '../components/monitoring/MonitoringHistorySidebar';

export default function MonitoringSertifikasi() {
  const monitoringData = useMonitoring();
  const m = monitoringData;
  const {
    searchTerm, setSearchTerm,
    expiryTab, setExpiryTab,
    selectedDetailDoc, setSelectedDetailDoc,
    activeReminders,
    activeFilterCount,
    filteredCertificates,
    allCertificates,
    uniqueKategori,
    uniqueUnitPabrik,
    isLoading,
    fetchMonitoringData,
    resetFilters,
    openCompleteModal,
    handleCancelAction,
    handleCancelAfkir,
    handleQuickRenew,
    handleQuickDecommission,
    setAllCertificates
  } = monitoringData;

  // Inline filter state (bukan modal)
  const [filterKategori, setFilterKategoriLocal] = useState('All');

  // Custom Date Range state
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sync filterKategori ke hook
  const handleKategoriChange = (val) => {
    setFilterKategoriLocal(val);
    monitoringData.setFilterKategori(val);
  };

  const handleApplyDateFilter = () => {
    setIsDateFilterActive(!!(dateRangeStart || dateRangeEnd));
  };

  const handleResetDateFilter = () => {
    setDateRangeStart('');
    setDateRangeEnd('');
    setIsDateFilterActive(false);
  };

  // Filter by date range (applied on top of filteredCertificates from hook)
  const displayedCertificates = React.useMemo(() => {
    if (!isDateFilterActive || (!dateRangeStart && !dateRangeEnd)) return filteredCertificates;
    return filteredCertificates.filter(item => {
      if (!item.tglExpired || item.tglExpired === '-') return false;
      const expDate = new Date(item.tglExpired);
      if (isNaN(expDate)) return false;
      if (dateRangeStart) {
        const start = new Date(dateRangeStart + '-01');
        if (expDate < start) return false;
      }
      if (dateRangeEnd) {
        // end of that month
        const [ey, em] = dateRangeEnd.split('-').map(Number);
        const end = new Date(ey, em, 0); // last day of month
        if (expDate > end) return false;
      }
      return true;
    });
  }, [filteredCertificates, isDateFilterActive, dateRangeStart, dateRangeEnd]);

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['No', 'Kategori', 'Jenis', 'Unit', 'Merek/Nama', 'No Seri', 'No Sertifikat', 'Tgl Expired', 'Sisa Hari', 'Status'];
    const rows = displayedCertificates.map((doc, idx) => [
      idx + 1,
      doc.kategoriDokumen || doc.kategori || '-',
      doc.jenisItem || '-',
      doc.unitPabrik || '-',
      doc.merekItem || doc.title || '-',
      doc.nomorSeriTipe || '-',
      doc.nomorSertifikat || '-',
      doc.tglExpired !== '-' ? doc.tglExpired : '-',
      doc.sisaHari !== null ? doc.sisaHari : '-',
      doc.workflowStatus || '-'
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monitoring_sertifikasi_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(displayedCertificates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monitoring_sertifikasi_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (selectedDetailDoc) {
    return (
      <DocumentDetailPage
        item={m.selectedDetailDoc}
        onBack={() => { m.setSelectedDetailDoc(null); m.fetchMonitoringData(); }}
        onSaveUpdate={(updatedDoc) => {
          const updateItem = (d) => {
            const newStatus = updatedDoc.status || d.status;
            const lowerSt = newStatus.toLowerCase();
            const isAfkir = lowerSt === 'afkir' || lowerSt === 'decommissioned';
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

  const kategoriOptions = ['All', ...new Set(allCertificates.map(c => c.kategoriDokumen || c.categoryKey || '').filter(Boolean))];

  return (
    <div className="p-8 space-y-6 font-sans-clean max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl text-slate-900 flex items-center gap-2 tracking-tight">
            <Activity className="w-6 h-6 text-[#005ea4]" />
            Monitoring & Evaluasi
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
              value={monitoringData.filterKategori}
              onChange={(e) => handleKategoriChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005ea4] cursor-pointer shadow-xs"
            >
              {kategoriOptions.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Semua Kategori Perizinan' : cat}</option>
              ))}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { resetFilters(); setFilterKategoriLocal('All'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-lg transition-colors font-mono-data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <MonitoringSummaryCards
        counts={monitoringData.counts}
            expiryTab={monitoringData.expiryTab}
            setExpiryTab={monitoringData.setExpiryTab}
            customUrgentDays={monitoringData.customUrgentDays}
            setCustomUrgentDays={monitoringData.setCustomUrgentDays}
          />

      {/* MONITORING TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">

        {/* Table toolbar */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">

          {/* Row 1: Title + Search + Export */}
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari item, seri, nomor sertifikat..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none align-middle text-center">
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
              {displayedCertificates.length > 0 ? (
                displayedCertificates.map((doc, index) => {
                  const isInProgress = doc.workflowStatus === 'in_progress';
                  const isDecommissioned = doc.workflowStatus === 'decommissioned';
                  const isExempt = doc.workflowStatus === 'exempt';

                  let rowStyleClass = "hover:bg-slate-50/80 transition-colors";
                  if (isDecommissioned) {
                    rowStyleClass = "bg-[#0f172a] text-slate-100 transition-colors hover:bg-slate-800";
                  } else if (isInProgress) {
                    rowStyleClass = "bg-amber-50/70 hover:bg-amber-100/70 text-slate-900 transition-colors";
                  } else if (doc.sisaHari !== null && doc.sisaHari <= 0) {
                    rowStyleClass = "bg-rose-50/70 hover:bg-rose-100/70 text-slate-900 transition-colors";
                  }

                  return (
                    <tr key={doc.id} className={`${rowStyleClass} align-middle`}>
                      <td className={`py-3 px-3 text-center align-middle font-mono-data font-bold whitespace-nowrap ${isDecommissioned ? 'text-slate-400' : 'text-slate-500'}`}>
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
                        onClick={() => setSelectedDetailDoc(doc)}
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
                        ) : doc.sisaHari !== null && doc.sisaHari <= 0 ? (
                          <span className="text-rose-600">Expired</span>
                        ) : doc.sisaHari !== null && doc.sisaHari <= (parseInt(monitoringData.customUrgentDays) || 30) ? (
                          <span className="text-amber-600">&lt; {monitoringData.customUrgentDays || 30} Hari</span>
                        ) : (
                          <span className="text-emerald-600">Aktif</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono-data align-middle">
                        {isInProgress ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openCompleteModal(doc)}
                              className="px-2.5 py-1 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-md shadow-2xs cursor-pointer transition-colors"
                            >
                              Selesai &amp; Upload
                            </button>
                            <button
                              onClick={() => handleCancelAction(doc.id)}
                              className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : isDecommissioned ? (
                          <button
                            onClick={() => handleCancelAfkir(doc.id)}
                            className="text-xs text-slate-300 hover:text-white hover:underline font-medium cursor-pointer"
                          >
                            Batal Afkir
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleQuickRenew(doc.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md cursor-pointer transition-colors"
                            >
                              Perpanjang
                            </button>
                            <button
                              onClick={() => handleQuickDecommission(doc.id)}
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
                  <td colSpan={10} className="py-10 text-center text-slate-500 font-mono-data">
                    Tidak ada perizinan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MonitoringHistorySidebar
        selectedHistoryItem={monitoringData.selectedHistoryItem}
        setSelectedHistoryItem={monitoringData.setSelectedHistoryItem}
      />

      <MonitoringActionModals
        isAfkirModalOpen={monitoringData.isAfkirModalOpen}
        setIsAfkirModalOpen={monitoringData.setIsAfkirModalOpen}
        isAktifkanModalOpen={monitoringData.isAktifkanModalOpen}
        setIsAktifkanModalOpen={monitoringData.setIsAktifkanModalOpen}
        isRenewConfirmModalOpen={monitoringData.isRenewConfirmModalOpen}
        setIsRenewConfirmModalOpen={monitoringData.setIsRenewConfirmModalOpen}
        isCancelRenewModalOpen={monitoringData.isCancelRenewModalOpen}
        setIsCancelRenewModalOpen={monitoringData.setIsCancelRenewModalOpen}
        activeModalItem={monitoringData.activeModalItem}
        setActiveModalItem={monitoringData.setActiveModalItem}
        activeItemForAction={monitoringData.activeItemForAction}
        isProcessingAction={monitoringData.isProcessingAction}
        confirmQuickDecommission={monitoringData.confirmQuickDecommission}
        confirmCancelAfkir={monitoringData.confirmCancelAfkir}
        confirmQuickRenew={monitoringData.confirmQuickRenew}
        confirmCancelRenew={monitoringData.confirmCancelRenew}
        uploadedFile={monitoringData.uploadedFile}
        handleFileSelect={monitoringData.handleFileSelect}
        isOcrScanning={monitoringData.isOcrScanning}
        ocrSuccess={monitoringData.ocrSuccess}
        newCertNumber={monitoringData.newCertNumber}
        setNewCertNumber={monitoringData.setNewCertNumber}
        inspectionDate={monitoringData.inspectionDate}
        setInspectionDate={monitoringData.setInspectionDate}
        issueDate={monitoringData.issueDate}
        setIssueDate={monitoringData.setIssueDate}
        newExpiryDate={monitoringData.newExpiryDate}
        setNewExpiryDate={monitoringData.setNewExpiryDate}
        resertifikasiNotes={monitoringData.resertifikasiNotes}
        setResertifikasiNotes={monitoringData.setResertifikasiNotes}
        handleConfirmUploadRenewal={monitoringData.handleConfirmUploadRenewal}
      />
    </div>
  );
}
