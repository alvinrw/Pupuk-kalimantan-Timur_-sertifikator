import React from 'react';
import { Loader2 } from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';

import { usePerizinanGeneric } from '../hooks/usePerizinanGeneric';
import GenericFilterBar from '../components/perizinan-generic/GenericFilterBar';
import GenericTable from '../components/perizinan-generic/GenericTable';
import GenericModals from '../components/perizinan-generic/GenericModals';

export default function PerizinanGeneric({ title, subtitle, categoryName }) {
  const data = usePerizinanGeneric({ title, subtitle, categoryName });

  if (data.detailModalItem) {
    return (
      <DocumentDetailPage
        item={data.detailModalItem}
        initialCertId={data.activeCertId}
        onBack={() => {
          data.setDetailModalItem(null);
          data.setActiveCertId(null);
        }}
        onSaveUpdate={(updatedDoc) => {
          data.setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? { ...d, ...updatedDoc, title: updatedDoc.merekItem || d.title } : d));
          data.setDetailModalItem(prev => (prev && prev.id === updatedDoc.id ? { ...prev, ...updatedDoc } : prev));
          data.loadData();
        }}
        onDeleteSuccess={() => {
          data.setDetailModalItem(null);
          data.setActiveCertId(null);
          data.loadData();
        }}
        onRefreshRequired={data.loadData}
      />
    );
  }

  if (data.isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Data Perizinan dari Database...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      <GenericFilterBar
        title={title}
        subtitle={subtitle}
        categoryName={categoryName}
        isImportMenuOpen={data.isImportMenuOpen}
        setIsImportMenuOpen={data.setIsImportMenuOpen}
        setIsSingleModalOpen={data.setIsSingleModalOpen}
        setIsCsvModalOpen={data.setIsCsvModalOpen}
        activeMainTab={data.activeMainTab}
        setActiveMainTab={data.setActiveMainTab}
        pendingCount={data.pendingCount}
        searchTerm={data.searchTerm}
        setSearchTerm={data.setSearchTerm}
        filterJenis={data.filterJenis}
        filterLokasi={data.filterLokasi}
        filterStatus={data.filterStatus}
        visibleColumnKeys={data.visibleColumnKeys}
        allColumns={data.allColumns}
        resetFilters={data.resetFilters}
        isColumnDropdownOpen={data.isColumnDropdownOpen}
        setIsColumnDropdownOpen={data.setIsColumnDropdownOpen}
        selectAllColumns={data.selectAllColumns}
        isVisible={data.isVisible}
        toggleColumn={data.toggleColumn}
      />

      <GenericTable
        activeMainTab={data.activeMainTab}
        selectedStagingIds={data.selectedStagingIds}
        setBulkExemptModalOpen={data.setBulkExemptModalOpen}
        isSubmittingBulkExempt={data.isSubmittingBulkExempt}
        toggleSelectAllStaging={data.toggleSelectAllStaging}
        masterRows={data.masterRows}
        expandedMasterIds={data.expandedMasterIds}
        toggleExpandMaster={data.toggleExpandMaster}
        expandedRows={data.expandedRows}
        isVisible={data.isVisible}
        isAsetCategory={data.isAsetCategory}
        categoryName={categoryName}
        filterJenis={data.filterJenis}
        setFilterJenis={data.setFilterJenis}
        uniqueJenis={data.uniqueJenis}
        filterLokasi={data.filterLokasi}
        setFilterLokasi={data.setFilterLokasi}
        uniqueLokasi={data.uniqueLokasi}
        filterStatus={data.filterStatus}
        setFilterStatus={data.setFilterStatus}
        uniqueStatus={data.uniqueStatus}
        filterHasSertifikat={data.filterHasSertifikat}
        setFilterHasSertifikat={data.setFilterHasSertifikat}
        getRowStatusStyle={data.getRowStatusStyle}
        toggleSelectStaging={data.toggleSelectStaging}
        setDetailModalItem={data.setDetailModalItem}
        setActiveCertId={data.setActiveCertId}
        setResolveTargetItem={data.setResolveTargetItem}
        visibleColumnKeys={data.visibleColumnKeys}
        setViewingCert={data.setViewingCert}
        setAddCertTargetMaster={data.setAddCertTargetMaster}
      />

      <GenericModals
        categoryName={categoryName}
        currentCategoryKey={data.currentCategoryKey}
        isSingleModalOpen={data.isSingleModalOpen}
        setIsSingleModalOpen={data.setIsSingleModalOpen}
        handleSingleAdded={data.handleSingleAdded}
        isCsvModalOpen={data.isCsvModalOpen}
        setIsCsvModalOpen={data.setIsCsvModalOpen}
        handleCsvImported={data.handleCsvImported}
        resolveTargetItem={data.resolveTargetItem}
        setResolveTargetItem={data.setResolveTargetItem}
        loadData={data.loadData}
        bulkExemptModalOpen={data.bulkExemptModalOpen}
        setBulkExemptModalOpen={data.setBulkExemptModalOpen}
        selectedStagingIds={data.selectedStagingIds}
        bulkExemptNote={data.bulkExemptNote}
        setBulkExemptNote={data.setBulkExemptNote}
        isSubmittingBulkExempt={data.isSubmittingBulkExempt}
        handleBulkExempt={data.handleBulkExempt}
        viewingCert={data.viewingCert}
        setViewingCert={data.setViewingCert}
        addCertTargetMaster={data.addCertTargetMaster}
        setAddCertTargetMaster={data.setAddCertTargetMaster}
        handleSaveCertEdit={data.handleSaveCertEdit}
        handleDeleteCert={data.handleDeleteCert}
        handleAddCertSuccess={data.handleAddCertSuccess}
      />
    </div>
  );
}
