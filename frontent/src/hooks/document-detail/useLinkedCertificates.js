import { useState, useEffect, useMemo } from 'react';
import { createCertificateForMasterItem, deleteCertificate } from '../../services/masterItemsService';

export function useLinkedCertificates({ item, targetCert, fetchHistory, onRefreshRequired }) {
  const [linkedCerts, setLinkedCerts] = useState(item?.linkedCertificates || []);
  const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
  const [deletingLinkedCertId, setDeletingLinkedCertId] = useState(null);
  
  const [newCertData, setNewCertData] = useState({
    jenisSertifikat: '', noSertifikat: '', instansi: '',
    terbit: '', expired: '', status: 'Aktif', hasPdf: false, pdfName: ''
  });

  useEffect(() => {
    const doc = item;
    if (doc && doc.linkedCertificates) {
      setLinkedCerts(doc.linkedCertificates);
    }
  }, [item]);

  const certStats = useMemo(() => {
    return (linkedCerts && linkedCerts.length > 0 ? linkedCerts : (targetCert ? [targetCert] : [])).reduce((acc, c) => {
      const s = (c.status || '').toLowerCase();
      let sisa = null;
      if (c.expired) {
        sisa = Math.ceil((new Date(c.expired) - new Date()) / (1000 * 60 * 60 * 24));
      }
      if (s === 'expired' || (sisa !== null && sisa <= 0)) {
        acc.expired += 1;
      } else if (s === 'perpanjang' || s === 'perpanjangan' || (sisa !== null && sisa <= 30)) {
        acc.expiring += 1;
      } else {
        acc.active += 1;
      }
      return acc;
    }, { active: 0, expiring: 0, expired: 0 });
  }, [linkedCerts, targetCert]);

  const handleAddLinkedCert = async ({ certPayload, pdfFile, UPLOAD_ENDPOINT }) => {
    try {
      let fileUrl = null;
      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        const uploadRes = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const json = await uploadRes.json();
          fileUrl = json?.data?.url || json?.data?.fileUrl || null;
        }
      }
      const masterItemId = item?.MasterId || item?.id;
      const payload = { itemId: masterItemId, ...certPayload };
      if (fileUrl) payload.fileUrl = fileUrl;
      const saved = await createCertificateForMasterItem(payload);
      setLinkedCerts(prev => [...prev, saved]);
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
      setIsAddCertModalOpen(false);
    } catch (err) {
      console.error('Failed to save linked certificate:', err);
      alert('Gagal menyimpan sertifikat terhubung: ' + (err.message || 'Error'));
    }
  };

  const handleDeleteLinkedCert = async (id, activeCertId, setActiveCertId) => {
    try {
      if (id) {
        await deleteCertificate(id);
      }
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
      if (activeCertId === id) {
        setActiveCertId(null);
      }
    } catch (err) {
      console.error('Failed to delete linked certificate:', err);
      alert('Gagal menghapus sertifikat terhubung: ' + (err.message || 'Error'));
    } finally {
      setDeletingLinkedCertId(null);
    }
  };

  return {
    linkedCerts, setLinkedCerts,
    certStats,
    isAddCertModalOpen, setIsAddCertModalOpen,
    deletingLinkedCertId, setDeletingLinkedCertId,
    newCertData, setNewCertData,
    handleAddLinkedCert, handleDeleteLinkedCert
  };
}
