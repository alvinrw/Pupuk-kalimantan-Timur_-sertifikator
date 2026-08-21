import { useState, useRef } from 'react';
import { updateCertificate, updateMasterItem, createCertificate } from '../../services/masterItemsService';
import { UPLOAD_ENDPOINT } from '../../config/api';

export function useDocumentUpload({ item, fetchHistory, onSaveUpdate, onRefreshRequired }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const manualFileInputRef = useRef(null);

  const openUploadModal = (type, rowId = null) => {
    setUploadData({ type, rowId, namaSertifikat: '', noSertifikat: '', instansi: '', terbit: '', expired: '' });
    setSelectedUploadFile(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      let newFileUrl = null;

      if (selectedUploadFile) {
        const fd = new FormData();
        fd.append('file', selectedUploadFile);

        const token = sessionStorage.getItem('token');
        const res = await fetch(UPLOAD_ENDPOINT, { 
          method: 'POST', 
          body: fd,
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Gagal upload file ke server');

        const json = await res.json();
        newFileUrl = json?.data?.url || json?.data?.fileUrl;

        if (!newFileUrl) throw new Error('Tidak mendapatkan URL file dari server');
      }

      const masterItemId = item?.MasterId || item?.id;

      const certPayload = {
        itemId: masterItemId,
        noSertifikat: uploadData.noSertifikat || `CERT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        namaSertifikat: uploadData.namaSertifikat || 'Sertifikat Utama',
        jenisSertifikat: uploadData.namaSertifikat || 'Sertifikat Utama',
        instansi: uploadData.instansi || null,
        terbit: uploadData.terbit || undefined,
        expired: uploadData.expired || undefined,
        status: 'Aktif',
        fileUrl: newFileUrl,
      };

      if (uploadData.type === 'current') {
        if (item.currentCert && item.currentCert.id) {
          const updatePayload = {
            namaSertifikat: uploadData.namaSertifikat || undefined,
            jenisSertifikat: uploadData.namaSertifikat || undefined,
            noSertifikat: uploadData.noSertifikat || undefined,
            instansi: uploadData.instansi || undefined,
            terbit: uploadData.terbit || undefined,
            expired: uploadData.expired || undefined,
            status: 'Aktif',
          };
          if (newFileUrl) updatePayload.fileUrl = newFileUrl;
          await updateCertificate(item.currentCert.id, updatePayload);
        } else {
          await createCertificate(certPayload);
        }
      } else if (uploadData.type === 'archive') {
        // Create a new active certificate
        await createCertificate(certPayload);

        // Archive the old certificate if it exists
        if (uploadData.rowId && uploadData.rowId !== masterItemId) {
          await updateCertificate(uploadData.rowId, { status: 'Diarsipkan' });
        }

        // Update the Master Item's status and dates to match the new certificate
        if (masterItemId) {
          await updateMasterItem(masterItemId, {
            status: 'Aktif',
            issueDate: uploadData.terbit || undefined,
            expiryDate: uploadData.expired || undefined,
            documentStatus: 'COMPLETED'
          });
        }
      }

      setIsUploadModalOpen(false);
      setSelectedUploadFile(null);
      await fetchHistory();

      const updatedFields = { fileUrl: newFileUrl };
      if (uploadData.type === 'archive') {
        updatedFields.status = 'Aktif';
        if (uploadData.terbit) updatedFields.issueDate = uploadData.terbit;
        if (uploadData.expired) updatedFields.expiryDate = uploadData.expired;
        updatedFields.documentStatus = 'COMPLETED';
      }
      if (onSaveUpdate) onSaveUpdate({ ...item, ...updatedFields });
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
