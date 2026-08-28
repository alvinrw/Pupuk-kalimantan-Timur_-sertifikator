import { useState, useCallback, useEffect, useRef } from 'react';
import { updateCertificate, deleteCertificate, restoreCertificate } from '../../services/masterItemsService';
import { UPLOAD_ENDPOINT } from '../../config/api';

export function useDocumentHistory({ item, targetCert, onRefreshRequired }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryToDelete, setSelectedHistoryToDelete] = useState(null);
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
          type: 'certificate',
          periode: m.periode || `${new Date(m.terbit || m.issueDate || '2024').getFullYear()} - ${new Date(m.expired || m.expiryDate || '2024').getFullYear()}`,
          noSertifikat: m.noSertifikat || m.certNo || m.certificateNo || '-',
          terbit: m.terbit || m.issueDate || '-',
          expired: m.expired || m.expiryDate || '-',
          status: m.status || 'Aktif',
          instansi: m.instansi || m.issuer || '-',
          fileUrl: m.fileUrl || m.pdfUrl || null,
          isCurrent,
          sortDate: new Date(m.createdAt || m.terbit || 0).getTime()
        };
      });

      // Combine with Document Histories (Audit Trail)
      const auditLogs = item.documentHistories || [];
      const formattedLogs = auditLogs.map(log => ({
        ...log,
        type: 'audit_log',
        sortDate: new Date(log.createdAt || 0).getTime()
      }));

      const combinedList = [...parentList, ...formattedLogs];
      
      // Sort chronologically (newest first)
      combinedList.sort((a, b) => b.sortDate - a.sortDate);

      setHistoryList(combinedList);
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
      const deletedId = selectedHistoryToDelete.id;
      // Optimistic update: langsung hapus dari tampilan UI dan tambah log audit
      const newLog = {
        id: 'temp-del-' + Date.now(),
        action: 'DELETED_CERTIFICATE',
        description: `Sertifikat / lampiran "${selectedHistoryToDelete.namaSertifikat || selectedHistoryToDelete.jenisSertifikat || 'Sertifikat'}" telah dihapus secara permanen.`,
        changedBy: 'System / User',
        createdAt: new Date().toISOString(),
        type: 'audit_log',
        sortDate: Date.now()
      };
      
      setHistoryList(prev => {
        const filtered = prev.filter(h => h.id !== deletedId);
        return [newLog, ...filtered].sort((a, b) => b.sortDate - a.sortDate);
      });
      
      await deleteCertificate(deletedId);
      // await fetchHistory(); // Tidak perlu fetch ulang langsung karena membaca dari prop lama
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      console.error('Failed to delete history row:', err);
      // Revert jika gagal
      fetchHistory();
      alert('Gagal menghapus baris histori: ' + (err.message || 'Error'));
    } finally {
      setSelectedHistoryToDelete(null);
    }
  };

  const handleRestoreCert = async (targetId) => {
    if (!targetId) return;
    try {
      // Optimistic update
      const newLog = {
        id: 'temp-res-' + Date.now(),
        action: 'RESTORED_CERTIFICATE',
        description: `Sertifikat / lampiran berhasil dipulihkan dari tempat sampah.`,
        changedBy: 'Anda',
        createdAt: new Date().toISOString(),
        type: 'audit_log',
        sortDate: Date.now()
      };
      setHistoryList(prev => {
        return [newLog, ...prev].sort((a, b) => b.sortDate - a.sortDate);
      });

      await restoreCertificate(targetId);
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      console.error('Failed to restore cert:', err);
      fetchHistory();
      alert('Gagal memulihkan dokumen: ' + (err.message || 'Error'));
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
      
      // Optimistic update: langsung ubah di tampilan UI dan tambah log audit
      const oldRow = historyList.find(h => h.id === finalRow.id) || {};
      const changes = [];
      if (payload.namaSertifikat && payload.namaSertifikat !== oldRow.namaSertifikat) changes.push(`Nama Sertifikat`);
      if (payload.noSertifikat && payload.noSertifikat !== oldRow.noSertifikat) changes.push(`No. SK`);
      if (payload.terbit && payload.terbit !== oldRow.terbit) changes.push(`Tgl Terbit`);
      if (payload.expired && payload.expired !== oldRow.expired) changes.push(`Tgl Expired`);
      if (payload.status && payload.status !== oldRow.status) changes.push(`Status`);

      let descriptionText = `Informasi sertifikat / lampiran "${finalRow.namaSertifikat || finalRow.jenisSertifikat || 'Sertifikat'}" telah diedit.`;
      if (changes.length > 0) {
        descriptionText = `Perubahan data (${changes.join(', ')}) pada "${finalRow.namaSertifikat || finalRow.jenisSertifikat || 'Sertifikat'}".`;
      }

      const newLog = {
        id: 'temp-upd-' + Date.now(),
        action: 'UPDATED_CERTIFICATE',
        description: descriptionText,
        changedBy: 'Anda',
        createdAt: new Date().toISOString(),
        type: 'audit_log',
        sortDate: Date.now()
      };

      setHistoryList(prev => {
        const mapped = prev.map(h => h.id === finalRow.id ? { ...h, ...payload } : h);
        return [newLog, ...mapped].sort((a, b) => b.sortDate - a.sortDate);
      });
      
      await updateCertificate(finalRow.id, payload);
      // await fetchHistory(); // Baca dari UI sementara

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
    editHistoryFileInputRef,
    handleDeleteHistoryRow, handleSaveHistoryRowEdit, handleRestoreCert
  };
}
