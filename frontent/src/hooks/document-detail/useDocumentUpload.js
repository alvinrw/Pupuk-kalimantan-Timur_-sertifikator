import { useState, useRef } from 'react';
import { updateCertificate, updateMasterItem } from '../../services/masterItemsService';
import { UPLOAD_ENDPOINT } from '../../config/api';

export function useDocumentUpload({ item, fetchHistory, onSaveUpdate, onRefreshRequired }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const manualFileInputRef = useRef(null);

  const openUploadModal = (type) => {
    setUploadData({ type });
    setSelectedUploadFile(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUploadFile) {
      alert('Silakan pilih file PDF terlebih dahulu.');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('file', selectedUploadFile);

      const res = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Gagal upload file ke server');

      const json = await res.json();
      const newFileUrl = json?.data?.url || json?.data?.fileUrl;

      if (!newFileUrl) throw new Error('Tidak mendapatkan URL file dari server');

      const masterItemId = item?.MasterId || item?.id;

      if (uploadData.type === 'current') {
        if (item.currentCert && item.currentCert.id) {
          await updateCertificate(item.currentCert.id, { fileUrl: newFileUrl });
        } else {
          await updateMasterItem(masterItemId, { fileUrl: newFileUrl });
        }
      } else if (uploadData.type === 'archive') {
        if (uploadData.rowId) {
          await updateCertificate(uploadData.rowId, { fileUrl: newFileUrl });
        } else {
          await updateMasterItem(masterItemId, { fileUrl: newFileUrl, status: 'Aktif' });
        }
      }

      setIsUploadModalOpen(false);
      setSelectedUploadFile(null);
      await fetchHistory();
      if (onSaveUpdate) onSaveUpdate({ ...item, fileUrl: newFileUrl });
      if (onRefreshRequired) onRefreshRequired();
      
    } catch (err) {
      console.error('Upload fail:', err);
      alert(err.message || 'Gagal mengunggah file.');
    }
  };

  return {
    isUploadModalOpen, setIsUploadModalOpen,
    uploadData, setUploadData,
    selectedUploadFile, setSelectedUploadFile,
    manualFileInputRef,
    openUploadModal, handleUploadSubmit
  };
}
