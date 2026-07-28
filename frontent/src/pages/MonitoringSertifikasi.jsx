import React from 'react';
import { Activity, Filter, Loader2, Search } from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';
import { useMonitoring } from '../hooks/useMonitoring';
import MonitoringSummaryCards from '../components/monitoring/MonitoringSummaryCards';
import MonitoringFilterModal from '../components/monitoring/MonitoringFilterModal';
import MonitoringActionModals from '../components/monitoring/MonitoringActionModals';
import MonitoringHistorySidebar from '../components/monitoring/MonitoringHistorySidebar';

export default function MonitoringSertifikasi() {
  const monitoringData = useMonitoring();
  const {
    // Basic state
    searchTerm, setSearchTerm,
    expiryTab, setExpiryTab,
    selectedDetailDoc, setSelectedDetailDoc,
    
    // Derived state
    activeFilterCount,
    filteredCertificates,
    allCertificates,
    uniqueKategori,
    uniqueUnitPabrik,
    isLoading,
    
    // Handlers
    fetchMonitoringData,
    resetFilters,
    openCompleteModal,
    handleCancelAction,
    handleCancelAfkir,
    handleQuickRenew,
    handleQuickDecommission,
    setAllCertificates
  } = monitoringData;

  if (selectedDetailDoc) {
    return (
      <DocumentDetailPage
        item={selectedDetailDoc}
        onBack={() => {
          setSelectedDetailDoc(null);
          fetchMonitoringData();
        }}
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

            return { 
              ...d, 
              ...updatedDoc, 
              status: newStatus,
              statusOperasional: newStatus,
              workflowStatus: calcWf,
              id: d.id 
            };
          };

          setAllCertificates(prev => prev.map(d => {
            const isMatch = d.MasterId === updatedDoc.MasterId || (d.id === updatedDoc.id && !d.MasterId);
            return isMatch ? updateItem(d) : d;
          }));

          setSelectedDetailDoc(prev => {
            if (!prev) return prev;
            const isMatch = prev.MasterId === updatedDoc.MasterId || (prev.id === updatedDoc.id && !prev.MasterId);
            return isMatch ? updateItem(prev) : prev;
          });
        }}
        onQuickRenew={(id) => {
          handleQuickRenew(id);
        }}
        onQuickDecommission={(id) => {
          handleQuickDecommission(id);
        }}
        onDeleteSuccess={() => {
          setAllCertificates(prev => prev.filter(c => c.MasterId !== selectedDetailDoc.MasterId && c.id !== (selectedDetailDoc.MasterId || selectedDetailDoc.id)));
          setSelectedDetailDoc(null);
        }}
        onRefreshRequired={() => {
          fetchMonitoringData();
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Tabel Monitoring dari Database...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans-clean max-w-7xl mx-auto">
      {/* Header Title & Top Filter Button */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl text-slate-900 flex items-center gap-2 tracking-tight">
            <Activity className="w-6 h-6 text-[#005ea4]" />
            Monitoring & Evaluasi Perpanjangan Sertifikat
          </h2>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            Rekapitulasi tenggat expired, status perpanjangan, dan pemantauan sertifikat perizinan
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <span className="text-xs text-slate-500 font-mono-data font-bold hidden sm:inline">
              Showing {filteredCertificates.length} of {allCertificates.length} items
            </span>
          )}
          <button
            onClick={() => monitoringData.setIsFilterModalOpen(true)}
            className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors font-mono-data cursor-pointer"
          >
            <Filter className="w-4 h-4 text-white" />
            <span>Filter Kategori & Data</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-amber-400 text-slate-900 rounded-full text-[10px] flex items-center justify-center font-extrabold ml-1 shadow-2xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <MonitoringSummaryCards
        counts={monitoringData.counts}
        expiryTab={monitoringData.expiryTab}
        setExpiryTab={monitoringData.setExpiryTab}
        customUrgentDays={monitoringData.customUrgentDays}
        setCustomUrgentDays={monitoringData.setCustomUrgentDays}
      />

      {/* MONITORING TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 font-mono-data">
            <span className="text-xs font-bold text-slate-800">Daftar Dokumen Sertifikasi</span>
            <span className="text-[11px] font-bold text-[#005ea4] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {filteredCertificates.length} Data Ditampilkan
            </span>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end min-w-[280px]">
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-700 hover:underline px-2.5 py-1 bg-rose-50 rounded border border-rose-200 font-mono-data transition-colors"
              >
                Reset Filter ({activeFilterCount})
              </button>
            )}

            <div className="relative w-64">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                <th className="py-3 px-3 text-center font-bold whitespace-nowrap">NO.</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap text-[#005ea4]">KATEGORI DOKUMEN</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">JENIS PERIZINAN / ALAT</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">UNIT PABRIK</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">MEREK / NAMA ITEM</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">NOMOR SERI / TAG</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">NO. SERTIFIKAT</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">TGL EXPIRATION</th>
                <th className="py-3 px-3 font-bold text-center whitespace-nowrap">STATUS PERIZINAN</th>
                <th className="py-3 px-3 font-bold text-center whitespace-nowrap">AKSI WORKFLOW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((doc, index) => {
                  const isInProgress = doc.workflowStatus === 'in_progress';
                  const isDecommissioned = doc.workflowStatus === 'decommissioned';
                  const isExempt = doc.workflowStatus === 'exempt';

                  let rowStyleClass = "hover:bg-slate-50/80 transition-colors";
                  if (isDecommissioned) {
                    rowStyleClass = "bg-[#0f172a] text-slate-100 transition-colors hover:bg-slate-800";
                  } else if (isExempt) {
                    rowStyleClass = "bg-indigo-50/40 text-indigo-900 border-l-4 border-l-indigo-500 hover:bg-indigo-50/70 transition-colors";
                  } else if (isInProgress) {
                    rowStyleClass = "bg-amber-50/70 hover:bg-amber-100/70 text-slate-900 transition-colors";
                  } else if (doc.sisaHari !== null && doc.sisaHari <= 0) {
                    rowStyleClass = "bg-rose-50/70 hover:bg-rose-100/70 text-slate-900 transition-colors";
                  }

                  return (
                    <tr key={doc.id} className={rowStyleClass}>
                      <td className={`py-3 px-3 text-center font-mono-data font-bold whitespace-nowrap ${isDecommissioned ? 'text-slate-400' : 'text-slate-500'}`}>
                        {index + 1}
                      </td>

                      <td className={`py-3 px-3 font-bold whitespace-nowrap ${isDecommissioned ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                        {doc.kategoriDokumen || doc.kategori || 'Perizinan'}
                      </td>

                      <td className={`py-3 px-3 font-medium whitespace-nowrap ${isDecommissioned ? 'text-slate-200' : 'text-slate-800'}`}>
                        {doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || '-'}
                      </td>

                      <td className="py-3 px-3 font-mono-data font-bold whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${isDecommissioned ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                          {doc.unitPabrik || doc.unit || doc.lokasi || '-'}
                        </span>
                      </td>

                      <td
                        onClick={() => setSelectedDetailDoc(doc)}
                        className={`py-3 px-3 font-bold hover:text-[#005ea4] cursor-pointer hover:underline whitespace-nowrap ${isDecommissioned ? 'text-white' : 'text-slate-900'}`}
                        title="Klik untuk Lihat Detail Penuh"
                      >
                        {doc.merekItem || doc.title || doc.judulCiptaan || '-'}
                      </td>

                      <td className={`py-3 px-3 font-mono-data font-semibold whitespace-nowrap ${isDecommissioned ? 'text-slate-300' : 'text-slate-700'}`}>
                        {doc.nomorSeriTipe || doc.nomorSeri || doc.tipe || doc.code || '-'}
                      </td>

                      <td className={`py-3 px-3 font-mono-data whitespace-nowrap ${isDecommissioned ? 'text-slate-300' : 'text-slate-800'}`}>
                        {isExempt ? (
                          <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[10px]">Tanpa Sertifikat</span>
                        ) : (
                          doc.certificateNo || doc.noSertifikat || '-'
                        )}
                      </td>

                      <td className={`py-3 px-3 font-mono-data font-bold whitespace-nowrap ${isDecommissioned ? 'text-slate-300' : 'text-slate-900'}`}>
                        {doc.tglExpired && doc.tglExpired !== '2030-01-01' ? doc.tglExpired : (doc.expiryDate && doc.expiryDate !== '2030-01-01' ? doc.expiryDate : '-')}
                        {doc.sisaHari !== null && doc.sisaHari !== undefined && doc.tglExpired !== '-' && (
                          <span className={`text-[10px] block font-normal font-mono-data ${isDecommissioned ? 'text-slate-400' : doc.sisaHari <= 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                            ({isDecommissioned ? 'Afkir / Non-Aktif' : doc.sisaHari <= 0 ? 'Expired' : `${doc.sisaHari} hr lagi`})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono-data font-bold">
                        {isDecommissioned ? (
                          <span className="text-slate-400">Non-Aktif</span>
                        ) : isExempt ? (
                          <span className="text-indigo-600">Catatan Khusus</span>
                        ) : doc.sisaHari !== null && doc.sisaHari <= 0 ? (
                          <span className="text-rose-600">Expired</span>
                        ) : doc.sisaHari !== null && doc.sisaHari <= (parseInt(monitoringData.customUrgentDays) || 30) ? (
                          <span className="text-amber-600">&lt; {monitoringData.customUrgentDays || 30} Hari</span>
                        ) : (
                          <span className="text-emerald-600">Valid</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono-data">
                        {isInProgress ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openCompleteModal(doc)}
                              className="px-2.5 py-1 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-md shadow-2xs cursor-pointer transition-colors"
                            >
                              Selesai & Upload
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

      <MonitoringFilterModal
        isOpen={monitoringData.isFilterModalOpen}
        onClose={() => monitoringData.setIsFilterModalOpen(false)}
        filterKategori={monitoringData.filterKategori}
        setFilterKategori={monitoringData.setFilterKategori}
        filterUnitPabrik={monitoringData.filterUnitPabrik}
        setFilterUnitPabrik={monitoringData.setFilterUnitPabrik}
        filterStatusOperasional={monitoringData.filterStatusOperasional}
        setFilterStatusOperasional={monitoringData.setFilterStatusOperasional}
        filterRentangHari={monitoringData.filterRentangHari}
        setFilterRentangHari={monitoringData.setFilterRentangHari}
        allCertificates={allCertificates}
        uniqueUnitPabrik={uniqueUnitPabrik}
        customUrgentDays={monitoringData.customUrgentDays}
        filteredCertificatesCount={filteredCertificates.length}
        resetFilters={resetFilters}
      />

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
