import { useState, useEffect, useRef, useMemo } from 'react';
import { createCertificateForMasterItem, deleteCertificate } from '../../services/masterItemsService';

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
      return s !== 'diarsipkan' && s !== 'direvisi';
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

  const prevItemIdRef = useRef(item?.id);

  useEffect(() => {
    const currentItemId = item?.id || item?.MasterId;
    const doc = item;

    // Hanya sync ulang linkedCerts dari server jika item yang ditampilkan ganti
    // (bukan sekadar re-render akibat refresh data yang sama)
    if (prevItemIdRef.current !== currentItemId || !prevItemIdRef.current) {
      prevItemIdRef.current = currentItemId;
      const targetList = doc?.linkedCertificates || doc?.certificates;
      if (targetList) {
        const certs = filterActiveCerts(targetList);
        certs.sort((a, b) => {
          const timeA = getTimestamp(a.expired) || getTimestamp(a.terbit) || new Date(a.createdAt || 0).getTime();
          const timeB = getTimestamp(b.expired) || getTimestamp(b.terbit) || new Date(b.createdAt || 0).getTime();
          return sortDateOrder === 'desc' ? timeB - timeA : timeA - timeB;
        });
        setLinkedCerts(certs);
      }
    } else {
      // item ID sama tapi sortDateOrder berubah - hanya sort ulang tanpa ganti referensi
      setLinkedCerts(prev => {
        if (!prev || prev.length === 0) return prev;
        return [...prev].sort((a, b) => {
          const timeA = getTimestamp(a.expired) || getTimestamp(a.terbit) || new Date(a.createdAt || 0).getTime();
          const timeB = getTimestamp(b.expired) || getTimestamp(b.terbit) || new Date(b.createdAt || 0).getTime();
          return sortDateOrder === 'desc' ? timeB - timeA : timeA - timeB;
        });
      });
    }
  }, [item?.id, item?.MasterId, sortDateOrder]);

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
      // Prioritize MasterId, then parentDoc.id (if item is a child-scoped view), then item.id
      const masterItemId = item?.MasterId || item?.parentDoc?.id || item?.id;
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
      setIsDeletingLinkedCert(true);
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
    handleAddLinkedCert, handleDeleteLinkedCert,
    sortDateOrder, setSortDateOrder
  };
}
