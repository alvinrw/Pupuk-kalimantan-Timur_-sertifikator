import { useState, useRef } from 'react';
import { updateCertificate, updateMasterItem, createCertificate } from '../../services/masterItemsService';
import { UPLOAD_ENDPOINT } from '../../config/api';

const getTimestamp = (dateStr) => {
  if (!dateStr || dateStr === '-') return 0;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
  }
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? 0 : t;
};

export function useDocumentUpload({ item, targetCert, fetchHistory, onSaveUpdate, onRefreshRequired, setActiveCertId }) {
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

        const res = await fetch(UPLOAD_ENDPOINT, { 
          method: 'POST', 
          credentials: 'include',
          body: fd
        });
        if (!res.ok) throw new Error('Gagal upload file ke server');

        const json = await res.json();
        newFileUrl = json?.data?.url || json?.data?.fileUrl;

        if (!newFileUrl) throw new Error('Tidak mendapatkan URL file dari server');
      }

      const masterItemId = item?.MasterId || item?.id;

      const currentExpiredTime = getTimestamp(targetCert?.expired || item?.currentCert?.expired || item?.berakhir);
      const newExpiredTime = getTimestamp(uploadData.expired);

      // Only treat the new certificate as active if its expiration date is later than the current one
      const isNewer = newExpiredTime > currentExpiredTime;

      const certPayload = {
        itemId: masterItemId,
        noSertifikat: uploadData.noSertifikat || `CERT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        namaSertifikat: uploadData.namaSertifikat || (targetCert ? targetCert.namaSertifikat : 'Sertifikat Utama'),
        jenisSertifikat: (targetCert ? targetCert.jenisSertifikat : uploadData.namaSertifikat) || 'Sertifikat Utama',
        instansi: uploadData.instansi || targetCert?.instansi || null,
        terbit: uploadData.terbit || undefined,
        expired: uploadData.expired || undefined,
        status: isNewer ? 'Aktif' : 'Diarsipkan',
        fileUrl: newFileUrl,
        keterangan: targetCert?.keterangan || null,
      };

      if (uploadData.type === 'current') {
        const certIdToUpdate = targetCert?.id || item?.currentCert?.id;
        if (certIdToUpdate) {
          const updatePayload = {
            namaSertifikat: uploadData.namaSertifikat || undefined,
            jenisSertifikat: (targetCert ? targetCert.jenisSertifikat : uploadData.namaSertifikat) || undefined,
            noSertifikat: uploadData.noSertifikat || undefined,
            instansi: uploadData.instansi || undefined,
            terbit: uploadData.terbit || undefined,
            expired: uploadData.expired || undefined,
            status: 'Aktif',
          };
          if (newFileUrl) updatePayload.fileUrl = newFileUrl;
          await updateCertificate(certIdToUpdate, updatePayload);
        }
      } else if (uploadData.type === 'archive') {
        // Create a new certificate
        const saved = await createCertificate(certPayload);

        // Archive the old certificate only if the new one is newer
        if (isNewer) {
          if (uploadData.rowId && uploadData.rowId !== masterItemId) {
            await updateCertificate(uploadData.rowId, { status: 'Diarsipkan' });
          }

          // Update active cert focus
          if (setActiveCertId && saved?.id) {
            setActiveCertId(saved.id);
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
      }

      setIsUploadModalOpen(false);
      setSelectedUploadFile(null);
      await fetchHistory();

      const updatedFields = { fileUrl: newFileUrl };
      if (uploadData.type === 'archive' && isNewer) {
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
