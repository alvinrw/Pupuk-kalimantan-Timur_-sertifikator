import { useState, useRef } from 'react';
import { updateCertificate, updateMasterItem, createCertificate } from '../../services/masterItemsService';
import { UPLOAD_ENDPOINT } from '../../config/api';
import toast from 'react-hot-toast';

export function useDocumentUpload({ item, fetchHistory, onSaveUpdate, onRefreshRequired }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const manualFileInputRef = useRef(null);

  const openUploadModal = (type) => {
    setUploadData({ type, noSertifikat: '', instansi: '', terbit: '', expired: '' });
    setSelectedUploadFile(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUploadFile) {
      toast.error('Silakan pilih file PDF terlebih dahulu.');
      return;
    }

    try {
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
      const newFileUrl = json?.data?.url || json?.data?.fileUrl;

      if (!newFileUrl) throw new Error('Tidak mendapatkan URL file dari server');

      const masterItemId = item?.MasterId || item?.id;

      const certPayload = {
        itemId: masterItemId,
        noSertifikat: uploadData.noSertifikat || `CERT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        instansi: uploadData.instansi || null,
        terbit: uploadData.terbit || undefined,
        expired: uploadData.expired || undefined,
        status: 'Aktif',
        fileUrl: newFileUrl,
        jenisSertifikat: 'Sertifikat Utama'
      };

      if (uploadData.type === 'current') {
        if (item.currentCert && item.currentCert.id) {
          await updateCertificate(item.currentCert.id, { 
            noSertifikat: uploadData.noSertifikat || undefined,
            instansi: uploadData.instansi || undefined,
            terbit: uploadData.terbit || undefined,
            expired: uploadData.expired || undefined,
            fileUrl: newFileUrl 
          });
        } else {
          await createCertificate(certPayload);
        }
      } else if (uploadData.type === 'archive') {
        if (uploadData.rowId) {
          await updateCertificate(uploadData.rowId, { 
            noSertifikat: uploadData.noSertifikat || undefined,
            instansi: uploadData.instansi || undefined,
            terbit: uploadData.terbit || undefined,
            expired: uploadData.expired || undefined,
            fileUrl: newFileUrl 
          });
        } else {
          await createCertificate(certPayload);
        }
      }

      // Jika sebelumnya master item berstatus EXEMPT, kita cabut status EXEMPT-nya karena sudah ada sertifikat baru
      if (item.documentStatus === 'EXEMPT') {
        await updateMasterItem(masterItemId, { documentStatus: 'COMPLETED', exemptionNote: null });
      }

      // Inform the user
      toast.success('Berhasil mengunggah berkas baru!');
      setIsUploadModalOpen(false);
      
      const newLog = {
        id: 'temp-add-' + Date.now(),
        action: 'ADDED_CERTIFICATE',
        description: `Sertifikat / lampiran "${certPayload.noSertifikat}" berhasil ditambahkan.`,
        changedBy: 'System / User',
        createdAt: new Date().toISOString(),
        type: 'audit_log',
        sortDate: Date.now()
      };
      
      if (fetchHistory && typeof fetchHistory === 'function') {
        // optimistically push the log if possible, but fetchHistory will replace it anyway
        await fetchHistory();
      }

      if (onRefreshRequired) onRefreshRequired();
      // Optional callback
      if (onSaveUpdate) onSaveUpdate({ ...item, fileUrl: newFileUrl });
      
      setSelectedUploadFile(null);
      
    } catch (err) {
      console.error('Upload fail:', err);
      toast.error(err.message || 'Gagal mengunggah file.');
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
