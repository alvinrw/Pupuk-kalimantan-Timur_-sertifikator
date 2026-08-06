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
  if (!item) return null;

  let hook = {};
  let hookVars = {};
  try {
    hook = useDocumentDetail({
      item,
      onBack,
      onSaveUpdate,
      onDeleteSuccess,
      onRefreshRequired,
      initialCertId,
    });
    
    hookVars = {
      isEditing: hook.isEditing,
      isMultiCertItem: hook.isMultiCertItem,
      linkedCerts: hook.linkedCerts,
      activeCertId: hook.activeCertId,
      setActiveCertId: hook.setActiveCertId,
      setIsAddCertModalOpen: hook.setIsAddCertModalOpen,
      setDeletingLinkedCertId: hook.setDeletingLinkedCertId,
    };
  } catch (err) {
    alert("Crash in useDocumentDetail: " + err.message + "\n\n" + err.stack);
    return <div className="p-10 text-red-500 font-bold">Error Loading Page! {err.message}</div>;
  }

  const {
    isEditing,
    isMultiCertItem,
    linkedCerts,
    activeCertId, setActiveCertId,
    setIsAddCertModalOpen,
    setDeletingLinkedCertId,
  } = hookVars;

  return (
    <ErrorBoundary>
      <div className="p-8 space-y-6 font-sans-clean max-w-7xl mx-auto animate-in fade-in duration-200">

        {/* TOP NAVIGATION + AKSI DROPDOWN */}
        <DocumentHeader hook={hook} item={item} onBack={onBack} />

        {/* STATUS BAR */}
        <DocumentStatusBar hook={hook} item={item} />

        {/* FORM EDIT (mode editing) */}
        <DocumentFormFields hook={hook} item={item} />

        {/* READ-ONLY DETAIL VIEW (spec, notifikasi, legalitas, histori) */}
        {!isEditing && <DocumentReadView hook={hook} item={item} />}

        {/* MULTI-CERT HUB: Sertifikat Terhubung */}
        {!isEditing && isMultiCertItem && !hideLinkedCertificates && (
          <CertificateNavCards
            linkedCerts={linkedCerts}
            activeCertId={activeCertId}
            onSelectCert={setActiveCertId}
            onAddCert={() => setIsAddCertModalOpen(true)}
            onDeleteCert={(id) => setDeletingLinkedCertId(id)}
          />
        )}

        {/* ALL MODALS */}
        <DocumentModals hook={hook} item={item} />

      </div>
    </ErrorBoundary>
  );
}
