import toast from 'react-hot-toast';
import { useState, useEffect, useMemo } from 'react';
import { createCertificateForMasterItem, deleteCertificate, updateMasterItem } from '../../services/masterItemsService';

export function useLinkedCertificates({ item, targetCert, fetchHistory, onRefreshRequired }) {
  const getTimestamp = (dateStr) => {
    if (!dateStr || dateStr === '-') return 0;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
    }
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
  };
  const filterActiveCerts = (certsList) => {
    if (!certsList) return [];
    return certsList.filter(c => {
      const s = (c.status || '').toLowerCase();
      return s !== 'diarsipkan' && s !== 'direvisi' && c.isDeleted !== true;
    });
  };

  const [linkedCerts, setLinkedCerts] = useState(filterActiveCerts(item?.linkedCertificates || item?.certificates));
  const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
  const [deletingLinkedCertId, setDeletingLinkedCertId] = useState(null);
  const [isDeletingLinkedCert, setIsDeletingLinkedCert] = useState(false);
  
  const [newCertData, setNewCertData] = useState({
    jenisSertifikat: '', noSertifikat: '', instansi: '',
    terbit: '', expired: '', status: 'Aktif', hasPdf: false, pdfName: ''
  });

  const [sortDateOrder, setSortDateOrder] = useState('desc');

  const targetListStr = JSON.stringify(item?.linkedCertificates || item?.certificates || []);

  useEffect(() => {
    const doc = item;
    const targetList = doc?.linkedCertificates || doc?.certificates;
    if (targetList) {
      const certs = filterActiveCerts(targetList);
      certs.sort((a, b) => {
        const timeA = getTimestamp(a.expired) || getTimestamp(a.terbit) || new Date(a.createdAt || 0).getTime();
        const timeB = getTimestamp(b.expired) || getTimestamp(b.terbit) || new Date(b.createdAt || 0).getTime();
        return sortDateOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
      setLinkedCerts(certs);
    } else {
      setLinkedCerts([]);
    }
  }, [targetListStr, sortDateOrder, item]);

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
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const uploadRes = await fetch(UPLOAD_ENDPOINT, { 
          method: 'POST', 
          credentials: 'include',
          headers, 
          body: fd 
        });
        if (!uploadRes.ok) {
          const errorJson = await uploadRes.json().catch(() => ({}));
          throw new Error(errorJson.message || errorJson.error || 'Gagal upload file ke server');
        }
        const json = await uploadRes.json();
        fileUrl = json?.data?.url || json?.data?.fileUrl || null;
      }
      // Prioritize MasterId, then parentDoc.id (if item is a child-scoped view), then item.id
      const masterItemId = item?.MasterId || item?.parentDoc?.id || item?.id;
      const payload = { itemId: masterItemId, ...certPayload };
      if (fileUrl) payload.fileUrl = fileUrl;
      const saved = await createCertificateForMasterItem(payload);

      if (item.documentStatus === 'EXEMPT') {
        await updateMasterItem(item.id, { documentStatus: 'COMPLETED', exemptionNote: null });
      }

      setLinkedCerts(prev => [...prev, saved]);
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
      setIsAddCertModalOpen(false);
    } catch (err) {
      console.error('Failed to save linked certificate:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error';
      toast.error('Gagal menyimpan sertifikat terhubung: ' + errorMsg);
    }
  };

  const handleDeleteLinkedCert = async (id, activeCertId, setActiveCertId) => {
    try {
      setIsDeletingLinkedCert(true);
      if (id) {
        await deleteCertificate(id);
      }
      
      setLinkedCerts(prev => prev.filter(c => c.id !== id));
      
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
      if (activeCertId === id) {
        const remaining = linkedCerts.filter(c => c.id !== id);
        if (setActiveCertId) setActiveCertId(remaining.length > 0 ? remaining[0].id : null);
      }
      toast.success('Berhasil menghapus sertifikat terhubung');
    } catch (err) {
      console.error('Failed to delete linked certificate:', err);
      toast.error('Gagal menghapus sertifikat terhubung');
    } finally {
      setIsDeletingLinkedCert(false);
      setDeletingLinkedCertId(null);
    }
  };

  return {
    linkedCerts, setLinkedCerts,
    certStats,
    isAddCertModalOpen, setIsAddCertModalOpen,
    deletingLinkedCertId, setDeletingLinkedCertId,
    isDeletingLinkedCert,
    newCertData, setNewCertData,
    sortDateOrder, setSortDateOrder,
    handleAddLinkedCert, handleDeleteLinkedCert
  };
}
