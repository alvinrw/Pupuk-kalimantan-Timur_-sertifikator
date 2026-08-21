import { useState } from 'react';
import { updateMasterItem, deleteMasterItem, updateCertificate } from '../../services/masterItemsService';

export function useDocumentStatus({ item, targetCert, formData, setFormData, onSaveUpdate, onDeleteSuccess, onRefreshRequired, isSingleCertScope, isMultiCertItem }) {
  const [isAfkirModalOpen, setIsAfkirModalOpen] = useState(false);
  const [isAfkiring, setIsAfkiring] = useState(false);

  const [isAktifkanModalOpen, setIsAktifkanModalOpen] = useState(false);
  const [isAktifkaning, setIsAktifkaning] = useState(false);

  const [isConfirmRenewHeaderModalOpen, setIsConfirmRenewHeaderModalOpen] = useState(false);
  const [isRenewingHeader, setIsRenewingHeader] = useState(false);

  const [isConfirmCancelHeaderModalOpen, setIsConfirmCancelHeaderModalOpen] = useState(false);
  const [isCancelingHeader, setIsCancelingHeader] = useState(false);

  const [isRenewExemptModalOpen, setIsRenewExemptModalOpen] = useState(false);
  const [renewExemptDate, setRenewExemptDate] = useState('');
  const [isRenewingExempt, setIsRenewingExempt] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAfkir = () => setIsAfkirModalOpen(true);
  const confirmAfkir = async () => {
    setIsAfkiring(true);
    try {
      if (targetCert?.id) {
        await updateCertificate(targetCert.id, { status: 'Afkir' });
        const targetId = item?.MasterId || item?.id;
        if ((!isMultiCertItem || isSingleCertScope) && targetId) {
          await updateMasterItem(targetId, { status: 'Afkir' });
        }
        setFormData(prev => ({ ...prev, status: 'Afkir' }));
        if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Afkir' });
      } else {
        const targetId = item?.MasterId || item?.id;
        if (targetId) {
          await updateMasterItem(targetId, { status: 'Afkir' });
          setFormData(prev => ({ ...prev, status: 'Afkir' }));
          if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Afkir', id: targetId });
        }
      }
      if (onRefreshRequired) onRefreshRequired();
      setIsAfkirModalOpen(false);
    } catch (err) {
      alert('Gagal Afkir: ' + (err.message || 'Error'));
    } finally { setIsAfkiring(false); }
  };

  const handleAktifkan = () => setIsAktifkanModalOpen(true);
  const confirmAktifkan = async () => {
    setIsAktifkaning(true);
    try {
      if (targetCert?.id) {
        await updateCertificate(targetCert.id, { status: 'Aktif' });
        const targetId = item?.MasterId || item?.id;
        if ((!isMultiCertItem || isSingleCertScope) && targetId) {
          await updateMasterItem(targetId, { status: 'Aktif' });
        }
        setFormData(prev => ({ ...prev, status: 'Aktif' }));
        if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Aktif' });
      } else {
        const targetId = item?.MasterId || item?.id;
        if (targetId) {
          await updateMasterItem(targetId, { status: 'Aktif' });
          setFormData(prev => ({ ...prev, status: 'Aktif' }));
          if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Aktif', id: targetId });
        }
      }
      if (onRefreshRequired) onRefreshRequired();
      setIsAktifkanModalOpen(false);
    } catch (err) {
      alert('Gagal Aktifkan: ' + (err.message || 'Error'));
    } finally { setIsAktifkaning(false); }
  };

  const confirmRenewHeader = async () => {
    setIsRenewingHeader(true);
    try {
      if (targetCert?.id) {
        await updateCertificate(targetCert.id, { status: 'Perpanjang' });
        const targetId = item?.MasterId || item?.id;
        if ((!isMultiCertItem || isSingleCertScope) && targetId) {
          await updateMasterItem(targetId, { status: 'Perpanjang' });
        }
        setFormData(prev => ({ ...prev, status: 'Perpanjang' }));
        if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Perpanjang' });
      } else {
        const targetId = item?.MasterId || item?.id;
        if (targetId) {
          await updateMasterItem(targetId, { status: 'Perpanjang' });
          setFormData(prev => ({ ...prev, status: 'Perpanjang' }));
          if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Perpanjang', id: targetId });
        }
      }
      if (onRefreshRequired) onRefreshRequired();
      setIsConfirmRenewHeaderModalOpen(false);
    } catch (err) {
      alert('Gagal: ' + (err.message || 'Error'));
    } finally { setIsRenewingHeader(false); }
  };

  const confirmCancelHeader = async () => {
    setIsCancelingHeader(true);
    try {
      if (targetCert?.id) {
        await updateCertificate(targetCert.id, { status: 'Aktif' });
        const targetId = item?.MasterId || item?.id;
        if ((!isMultiCertItem || isSingleCertScope) && targetId) {
          await updateMasterItem(targetId, { status: 'Aktif' });
        }
        setFormData(prev => ({ ...prev, status: 'Aktif' }));
        if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Aktif' });
      } else {
        const targetId = item?.MasterId || item?.id;
        if (targetId) {
          await updateMasterItem(targetId, { status: 'Aktif' });
          setFormData(prev => ({ ...prev, status: 'Aktif' }));
          if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Aktif', id: targetId });
        }
      }
      if (onRefreshRequired) onRefreshRequired();
      setIsConfirmCancelHeaderModalOpen(false);
    } catch (err) {
      alert('Gagal: ' + (err.message || 'Error'));
    } finally { setIsCancelingHeader(false); }
  };

  const confirmRenewExempt = async () => {
    if (!renewExemptDate) return;
    setIsRenewingExempt(true);
    try {
      const targetId = item?.MasterId || item?.id;
      await updateMasterItem(targetId, { expiryDate: renewExemptDate, status: 'Aktif' });
      setFormData(prev => ({ ...prev, berakhir: renewExemptDate, status: 'Aktif' }));
      if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, berakhir: renewExemptDate, status: 'Aktif', id: targetId });
      if (onRefreshRequired) onRefreshRequired();
      setIsRenewExemptModalOpen(false);
    } catch (err) {
      alert('Gagal: ' + (err.message || 'Error'));
    } finally { setIsRenewingExempt(false); }
  };

  const handleDeleteMasterItem = async () => {
    setIsDeleting(true);
    try {
      const targetId = item?.MasterId || item?.id;
      await deleteMasterItem(targetId);
      setIsDeleteDialogOpen(false);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      console.error('Failed to delete master item:', err);
      alert('Gagal menghapus dokumen: ' + (err.message || 'Error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isAfkirModalOpen, setIsAfkirModalOpen, isAfkiring, handleAfkir, confirmAfkir,
    isAktifkanModalOpen, setIsAktifkanModalOpen, isAktifkaning, handleAktifkan, confirmAktifkan,
    isConfirmRenewHeaderModalOpen, setIsConfirmRenewHeaderModalOpen, isRenewingHeader, confirmRenewHeader,
    isConfirmCancelHeaderModalOpen, setIsConfirmCancelHeaderModalOpen, isCancelingHeader, confirmCancelHeader,
    isRenewExemptModalOpen, setIsRenewExemptModalOpen, renewExemptDate, setRenewExemptDate, isRenewingExempt, confirmRenewExempt,
    isDeleteDialogOpen, setIsDeleteDialogOpen, isDeleting, handleDeleteMasterItem
  };
}
