import { useState, useCallback, useEffect, useRef } from 'react';
import { updateCertificate, deleteCertificate } from '../../services/masterItemsService';
import { UPLOAD_ENDPOINT } from '../../config/api';

export function useDocumentHistory({ item, targetCert, onRefreshRequired }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryToDelete, setSelectedHistoryToDelete] = useState(null);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const [editingHistoryRow, setEditingHistoryRow] = useState(null);
  const [selectedHistoryFile, setSelectedHistoryFile] = useState(null);
  const editHistoryFileInputRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    if (!item) return;
    setIsLoadingHistory(true);
    try {
      const masterCertList = item.linkedCertificates || item.certificates || [];
      let listToProcess = masterCertList;
      
      // Jika ini adalah multi-cert item (punya linkedCertificates) dan kita sedang melihat detail 
      // sertifikat spesifik (targetCert), maka filter histori HANYA untuk sertifikat dengan nama yang sama.
      if (targetCert && targetCert.id && item.linkedCertificates) {
        const targetName = targetCert.namaSertifikat || targetCert.jenisSertifikat;
        if (targetName) {
          listToProcess = masterCertList.filter(c => (c.namaSertifikat || c.jenisSertifikat) === targetName);
        } else {
          listToProcess = masterCertList.filter(c => c.id === targetCert.id);
        }
      }

      const formatToDDMMYYYY = (rawDateStr) => {
        if (!rawDateStr || rawDateStr === '-') return '-';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDateStr)) return rawDateStr;
        try {
          const dObj = new Date(rawDateStr);
          if (!isNaN(dObj.getTime())) {
            const dd = String(dObj.getDate()).padStart(2, '0');
            const mm = String(dObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dObj.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
          }
        } catch (_) {}
        return rawDateStr;
      };

      const getYearFromStr = (dateStr) => {
        if (!dateStr || dateStr === '-') return '2024';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
          return dateStr.split('/')[2];
        }
        try {
          const dObj = new Date(dateStr);
          if (!isNaN(dObj.getTime())) {
            return String(dObj.getFullYear());
          }
        } catch (_) {}
        const match = dateStr.match(/\b\d{4}\b/);
        return match ? match[0] : '2024';
      };

      const getTimestampLocal = (dateStr) => {
        if (!dateStr || dateStr === '-') return 0;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
          const parts = dateStr.split('/');
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
        }
        const t = new Date(dateStr).getTime();
        return isNaN(t) ? 0 : t;
      };

      let activeCertId = null;
      if (targetCert && targetCert.id) {
        activeCertId = targetCert.id;
      } else {
        const validForActive = listToProcess.filter(c => {
          const s = (c.status || '').toLowerCase();
          return s !== 'diarsipkan';
        });
        if (validForActive.length > 0) {
          const sorted = validForActive.slice().sort((a, b) => getTimestampLocal(b.expired || b.expiryDate) - getTimestampLocal(a.expired || a.expiryDate));
          activeCertId = sorted[0].id;
        } else if (listToProcess.length > 0) {
          const sorted = listToProcess.slice().sort((a, b) => getTimestampLocal(b.expired || b.expiryDate) - getTimestampLocal(a.expired || a.expiryDate));
          activeCertId = sorted[0].id;
        }
      }

      const parentList = listToProcess.map(m => {
        let isCurrent = m.id === activeCertId;
        return {
          ...m,
          periode: m.periode || `${getYearFromStr(m.terbit || m.issueDate)} - ${getYearFromStr(m.expired || m.expiryDate)}`,
          noSertifikat: m.noSertifikat || m.certNo || m.certificateNo || '-',
          terbit: formatToDDMMYYYY(m.terbit || m.issueDate || '-'),
          expired: formatToDDMMYYYY(m.expired || m.expiryDate || '-'),
          status: m.status || 'Aktif',
          instansi: m.instansi || m.issuer || '-',
          fileUrl: m.fileUrl || m.pdfUrl || null,
          isCurrent
        };
      });

      setHistoryList(parentList);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [item, targetCert]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDeleteHistoryRow = async () => {
    try {
      if (!selectedHistoryToDelete?.id) return;
      setIsDeletingHistory(true);

      if (historyList.length === 1 && selectedHistoryToDelete.isCurrent) {
        // Ini adalah baris satu-satunya (child). Jangan hapus agar "slot" tidak hilang,
        // melainkan reset isinya ke kosong (Belum Ada)
        await updateCertificate(selectedHistoryToDelete.id, {
          noSertifikat: 'Tanpa Sertifikat',
          terbit: null,
          expired: null,
          fileUrl: null,
          status: 'EXEMPT',
          instansi: 'Dihapus dari histori'
        });
      } else {
        await deleteCertificate(selectedHistoryToDelete.id);
      }

      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      console.error('Failed to delete history row:', err);
      alert('Gagal menghapus baris histori: ' + (err.message || 'Error'));
    } finally {
      setIsDeletingHistory(false);
      setSelectedHistoryToDelete(null);
    }
  };

  const handleSaveHistoryRowEdit = async (updatedRow) => {
    try {
      let finalRow = { ...updatedRow };
      if (selectedHistoryFile) {
        const fd = new FormData();
        fd.append('file', selectedHistoryFile);
        const token = sessionStorage.getItem('token');
        const res = await fetch(UPLOAD_ENDPOINT, { 
          method: 'POST', 
          body: fd,
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Gagal upload file ke server');
        const json = await res.json();
        const newFileUrl = json?.data?.url || json?.data?.fileUrl;
        if (newFileUrl) {
          finalRow.fileUrl = newFileUrl;
        }
      }
      
      const payload = {
        itemId: finalRow.itemId,
        jenisSertifikat: finalRow.jenisSertifikat,
        namaSertifikat: finalRow.namaSertifikat,
        noSertifikat: finalRow.noSertifikat,
        instansi: finalRow.instansi,
        terbit: finalRow.terbit,
        expired: finalRow.expired,
        status: finalRow.status,
        fileUrl: finalRow.fileUrl
      };
      
      await updateCertificate(finalRow.id, payload);
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      console.error('Failed to update history row:', err);
      alert('Gagal mengupdate baris histori: ' + (err.message || 'Error'));
    } finally {
      setEditingHistoryRow(null);
      setSelectedHistoryFile(null);
    }
  };

  return {
    historyList, setHistoryList,
    isLoadingHistory, fetchHistory,
    selectedHistoryToDelete, setSelectedHistoryToDelete,
    isDeletingHistory,
    editingHistoryRow, setEditingHistoryRow,
    selectedHistoryFile, setSelectedHistoryFile,
    editHistoryFileInputRef,
    handleDeleteHistoryRow, handleSaveHistoryRowEdit
  };
}
