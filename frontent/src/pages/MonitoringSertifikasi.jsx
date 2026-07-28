import React from 'react';
import { Activity, Filter, Loader2, RotateCcw, Ban, X } from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';
import { useMonitoring } from '../hooks/useMonitoring';
import SummaryCards from '../components/monitoring/SummaryCards';
import FilterModal from '../components/monitoring/FilterModal';
import MonitoringTable from '../components/monitoring/MonitoringTable';
import UploadRenewalModal from '../components/monitoring/UploadRenewalModal';
import ModalConfirm from '../components/document-detail/ModalConfirm';

export default function MonitoringSertifikasi() {
  const m = useMonitoring();

  // ============================================================
  // DETAIL VIEW — Saat item diklik, tampilkan DocumentDetailPage
  // ============================================================
  if (m.selectedDetailDoc) {
    return (
      <DocumentDetailPage
        item={m.selectedDetailDoc}
        onBack={() => {
          m.setSelectedDetailDoc(null);
          m.fetchMonitoringData();
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

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (m.isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Tabel Monitoring dari Database...</p>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
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
          {m.activeFilterCount > 0 && (
            <span className="text-xs text-slate-500 font-mono-data font-bold hidden sm:inline">
              Showing {m.filteredCertificates.length} of {m.allCertificates.length} items
            </span>
          )}
          <button
            onClick={() => m.setIsFilterModalOpen(true)}
            className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors font-mono-data cursor-pointer"
          >
            <Filter className="w-4 h-4 text-white" />
            <span>Filter Kategori & Data</span>
            {m.activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-amber-400 text-slate-900 rounded-full text-[10px] flex items-center justify-center font-extrabold ml-1 shadow-2xs">
                {m.activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 5 Summary Cards */}
      <SummaryCards
        countExpired={m.countExpired}
        countUrgent={m.countUrgent}
        countValid={m.countValid}
        countInProgress={m.countInProgress}
        countDecommissioned={m.countDecommissioned}
        expiryTab={m.expiryTab}
        setExpiryTab={m.setExpiryTab}
        customUrgentDays={m.customUrgentDays}
        setCustomUrgentDays={m.setCustomUrgentDays}
      />

      {/* Monitoring Table */}
      <MonitoringTable
        filteredCertificates={m.filteredCertificates}
        totalCount={m.allCertificates.length}
        searchTerm={m.searchTerm}
        setSearchTerm={m.setSearchTerm}
        activeFilterCount={m.activeFilterCount}
        resetFilters={m.resetFilters}
        customUrgentDays={m.customUrgentDays}
        onOpenDetail={(doc) => m.setSelectedDetailDoc(doc)}
        onCompleteModal={m.openCompleteModal}
        onCancelAction={m.handleCancelAction}
        onCancelAfkir={m.handleCancelAfkir}
        onQuickRenew={m.handleQuickRenew}
        onQuickDecommission={m.handleQuickDecommission}
      />

      {/* ======================================================
          MODALS
      ====================================================== */}

      {/* Filter Modal */}
      <FilterModal
        isOpen={m.isFilterModalOpen}
        onClose={() => m.setIsFilterModalOpen(false)}
        onReset={m.resetFilters}
        filterKategori={m.filterKategori} setFilterKategori={m.setFilterKategori}
        filterUnitPabrik={m.filterUnitPabrik} setFilterUnitPabrik={m.setFilterUnitPabrik}
        filterStatusOperasional={m.filterStatusOperasional} setFilterStatusOperasional={m.setFilterStatusOperasional}
        filterRentangHari={m.filterRentangHari} setFilterRentangHari={m.setFilterRentangHari}
        customUrgentDays={m.customUrgentDays}
        uniqueUnitPabrik={m.uniqueUnitPabrik}
        filteredCount={m.filteredCertificates.length}
        totalCount={m.allCertificates.length}
      />

      {/* Upload Renewal Modal */}
      <UploadRenewalModal
        activeModalItem={m.activeModalItem}
        onClose={() => m.setActiveModalItem(null)}
        uploadedFile={m.uploadedFile}
        isOcrScanning={m.isOcrScanning}
        ocrSuccess={m.ocrSuccess}
        handleFileSelect={m.handleFileSelect}
        newCertNumber={m.newCertNumber} setNewCertNumber={m.setNewCertNumber}
        inspectionDate={m.inspectionDate} setInspectionDate={m.setInspectionDate}
        issueDate={m.issueDate} setIssueDate={m.setIssueDate}
        newExpiryDate={m.newExpiryDate} setNewExpiryDate={m.setNewExpiryDate}
        resertifikasiNotes={m.resertifikasiNotes} setResertifikasiNotes={m.setResertifikasiNotes}
        handleConfirmUploadRenewal={m.handleConfirmUploadRenewal}
      />

      {/* Modal Konfirmasi: Afkir */}
      <ModalConfirm
        isOpen={m.isAfkirModalOpen && !!m.activeItemForAction}
        onClose={() => m.setIsAfkirModalOpen(false)}
        onConfirm={m.confirmQuickDecommission}
        isLoading={m.isProcessingAction}
        title="Tandai Sebagai Afkir?"
        description={<>Apakah Anda yakin ingin menandai <br /><strong className="text-slate-800">{m.activeItemForAction?.merekItem}</strong> sebagai Afkir/Non-Aktif?<br />Tindakan ini akan mengubah status dokumen secara permanen.</>}
        confirmLabel="Ya, Afkirkan"
        confirmClassName="bg-slate-800 hover:bg-slate-900 text-white"
        icon={<Ban className="w-6 h-6" />}
        iconBgClassName="w-12 h-12 border border-slate-200 bg-slate-100 text-slate-600"
      />

      {/* Modal Konfirmasi: Aktifkan */}
      <ModalConfirm
        isOpen={m.isAktifkanModalOpen && !!m.activeItemForAction}
        onClose={() => m.setIsAktifkanModalOpen(false)}
        onConfirm={m.confirmCancelAfkir}
        isLoading={m.isProcessingAction}
        title="Aktifkan Kembali?"
        description={<>Apakah Anda yakin ingin membatalkan afkir dan mengaktifkan kembali <br /><strong className="text-slate-800">{m.activeItemForAction?.merekItem}</strong>?<br />Dokumen ini akan kembali dipantau status aktifnya.</>}
        confirmLabel="Ya, Aktifkan"
        confirmClassName="bg-[#005ea4] hover:bg-[#004881] text-white"
        icon={<RotateCcw className="w-6 h-6" />}
        iconBgClassName="w-12 h-12 border border-blue-200 bg-blue-100 text-[#005ea4]"
      />

      {/* Modal Konfirmasi: Perpanjang */}
      <ModalConfirm
        isOpen={m.isRenewConfirmModalOpen && !!m.activeItemForAction}
        onClose={() => m.setIsRenewConfirmModalOpen(false)}
        onConfirm={m.confirmQuickRenew}
        isLoading={m.isProcessingAction}
        title="Ajukan Perpanjangan?"
        description={<>Apakah Anda yakin ingin memulai proses perpanjangan untuk <br /><strong className="text-slate-800">{m.activeItemForAction?.merekItem}</strong>?<br />Status baris akan berubah menjadi <span className="text-amber-700 font-bold">Kuning (Sedang Diproses)</span>.</>}
        confirmLabel="Ya, Mulai Perpanjangan"
        confirmClassName="bg-amber-500 hover:bg-amber-600 text-white"
        icon={<RotateCcw className="w-6 h-6" />}
        iconBgClassName="w-12 h-12 border border-amber-200 bg-amber-100 text-amber-600"
      />

      {/* Modal Konfirmasi: Batal Perpanjangan */}
      <ModalConfirm
        isOpen={m.isCancelRenewModalOpen && !!m.activeItemForAction}
        onClose={() => m.setIsCancelRenewModalOpen(false)}
        onConfirm={m.confirmCancelRenew}
        isLoading={m.isProcessingAction}
        title="Batalkan Perpanjangan?"
        description={<>Apakah Anda yakin ingin membatalkan proses perpanjangan untuk <br /><strong className="text-slate-800">{m.activeItemForAction?.merekItem}</strong>?<br />Status baris akan dikembalikan menjadi <span className="text-slate-800 font-bold">Aktif (Normal)</span>.</>}
        confirmLabel="Ya, Batalkan"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
        icon={<X className="w-6 h-6" />}
        iconBgClassName="w-12 h-12 border border-rose-200 bg-rose-100 text-rose-600"
      />
    </div>
  );
}
