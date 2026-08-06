import { useState, useCallback, useEffect } from 'react';
import { updateCertificate, deleteCertificate } from '../../services/masterItemsService';

export function useDocumentHistory({ item, targetCert, onRefreshRequired }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryToDelete, setSelectedHistoryToDelete] = useState(null);
  const [editingHistoryRow, setEditingHistoryRow] = useState(null);
  const [selectedHistoryFile, setSelectedHistoryFile] = useState(null);

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

      const parentList = listToProcess.map(m => {
        let isCurrent = false;
        if (targetCert && targetCert.id === m.id) {
          isCurrent = true;
        } else if (!targetCert && item.currentCert && item.currentCert.id === m.id) {
          isCurrent = true;
        } else if (!targetCert && !item.currentCert && (m.status === 'Aktif' || m.status === 'Active' || !m.status)) {
          isCurrent = true;
        }
        return {
          ...m,
          periode: m.periode || `${new Date(m.terbit || m.issueDate || '2024').getFullYear()} - ${new Date(m.expired || m.expiryDate || '2024').getFullYear()}`,
          noSertifikat: m.noSertifikat || m.certNo || m.certificateNo || '-',
          terbit: m.terbit || m.issueDate || '-',
          expired: m.expired || m.expiryDate || '-',
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
      await deleteCertificate(selectedHistoryToDelete.id);
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      console.error('Failed to delete history row:', err);
      alert('Gagal menghapus baris histori: ' + (err.message || 'Error'));
    } finally {
      setSelectedHistoryToDelete(null);
    }
  };

  const handleSaveHistoryRowEdit = async (updatedRow) => {
    try {
      await updateCertificate(updatedRow.id, updatedRow);
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
    editingHistoryRow, setEditingHistoryRow,
    selectedHistoryFile, setSelectedHistoryFile,
    handleDeleteHistoryRow, handleSaveHistoryRowEdit
  };
}
