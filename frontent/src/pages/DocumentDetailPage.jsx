/**
 * DocumentDetailPage - Orchestrator utama halaman detail dokumen/sertifikat.
 *
 * Semua state & business logic ada di: hooks/useDocumentDetail.js
 * Semua sub-komponen UI ada di: components/document-detail/
 *
 * Refactored dari ~990 baris → ~80 baris.
 */
import React from 'react';
import { useDocumentDetail } from '../hooks/useDocumentDetail';

// Sub-components
import ErrorBoundary from '../components/ErrorBoundary';
import DocumentHeader from '../components/document-detail/DocumentHeader';
import DocumentStatusBar from '../components/document-detail/DocumentStatusBar';
import DocumentFormFields from '../components/document-detail/DocumentFormFields';
import DocumentReadView from '../components/document-detail/DocumentReadView';
import CertificateNavCards from '../components/document-detail/CertificateNavCards';
import CertHistorySection from '../components/document-detail/CertHistorySection';
import DocumentModals from '../components/document-detail/DocumentModals';

export default function DocumentDetailPage({
  item,
  onBack,
  onSaveUpdate,
  onDeleteSuccess,
  onRefreshRequired,
  hideLinkedCertificates,
  initialCertId,
}) {
  // PENTING: hook HARUS dipanggil tanpa kondisi apapun sebelumnya (Rules of Hooks)
  // `if (!item) return null` dipindah ke SETELAH semua hooks dipanggil
  const hook = useDocumentDetail({
    item: item || {},
    onBack,
    onSaveUpdate,
    onDeleteSuccess,
    onRefreshRequired,
    initialCertId,
    hideLinkedCertificates,
  });

  // Null-guard setelah hooks
  if (!item) return null;

  const {
    isEditing,
    isMultiCertItem,
    isMasterView,
    linkedCerts,
    activeCertId, setActiveCertId,
    setIsAddCertModalOpen,
    setDeletingLinkedCertId,
    sortDateOrder, setSortDateOrder,
    effectiveCategoryKey
  } = hook;

  return (
    <ErrorBoundary>
      <div className="p-8 space-y-6 font-sans-clean max-w-7xl mx-auto animate-in fade-in duration-200">

        {/* TOP NAVIGATION + AKSI DROPDOWN */}
        <DocumentHeader hook={hook} item={item} onBack={onBack} />

        {/* FORM EDIT (mode editing) */}
        <DocumentFormFields hook={hook} item={item} />

        {/* READ-ONLY DETAIL VIEW (spec, notifikasi, legalitas, histori) */}
        {!isEditing && <DocumentReadView hook={hook} item={item} hideLinkedCertificates={hideLinkedCertificates} />}

        {/* MULTI-CERT HUB: Sertifikat Terhubung */}
        {!isEditing && isMultiCertItem && !hideLinkedCertificates && effectiveCategoryKey !== 'peralatan-pabrik' && effectiveCategoryKey !== 'administrasi-lainnya' && (
          <CertificateNavCards
            linkedCerts={linkedCerts}
            activeCertId={activeCertId}
            onSelectCert={setActiveCertId}
            onAddCert={() => setIsAddCertModalOpen(true)}
            onDeleteCert={(id) => setDeletingLinkedCertId(id)}
            sortDateOrder={sortDateOrder}
            setSortDateOrder={setSortDateOrder}
            categoryKey={effectiveCategoryKey}
          />
        )}

        {/* HISTORY SECTION (Moved to bottom) */}
        {!isEditing && !(isMasterView && effectiveCategoryKey !== 'peralatan-pabrik' && !hook.isHaki) && (
          <CertHistorySection
            historyList={hook.historyList}
            isLoadingHistory={hook.isLoadingHistory}
            openUploadModal={hook.openUploadModal}
            setEditingHistoryRow={hook.setEditingHistoryRow}
            setSelectedHistoryToDelete={hook.setSelectedHistoryToDelete}
            handleRestoreCert={hook.handleRestoreCert}
            isDecommissionedStatus={hook.isDecommissionedStatus}
            primaryCert={hook.primaryCert}
            isMasterDecommissioned={hook.isDecommissionedStatus}
          />
        )}

        {/* ALL MODALS */}
        <DocumentModals hook={hook} item={item} />

      </div>
    </ErrorBoundary>
  );
}
