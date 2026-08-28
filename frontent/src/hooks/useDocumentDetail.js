import { useState, useEffect } from 'react';
import { updateMasterItem } from '../services/masterItemsService';

// Sub-hooks
import { useDocumentHistory } from './document-detail/useDocumentHistory';
import { useDocumentUpload } from './document-detail/useDocumentUpload';
import { useDocumentStatus } from './document-detail/useDocumentStatus';
import { useLinkedCertificates } from './document-detail/useLinkedCertificates';
import { useNotificationSettings } from './document-detail/useNotificationSettings';

export function useDocumentDetail({ item: rawItem, onBack, onSaveUpdate, onDeleteSuccess, onRefreshRequired, initialCertId }) {
  const item = rawItem?.parentDoc || rawItem;
  const parentDoc = item;
  const effectiveCategoryKey = item?.categoryKey || '';

  const [activeCertId, setActiveCertId] = useState(initialCertId || item?.currentCert?.id || item?.cert?.id || null);

  useEffect(() => {
    setActiveCertId(initialCertId || item?.currentCert?.id || item?.cert?.id || null);
  }, [item, initialCertId]);

  const allItemCerts = item?.certificates || [];
  const activeItemCert = allItemCerts.filter(c => c.status === 'Aktif' || c.status === 'Active' || !c.status).sort((a,b) => new Date(b.expired || 0) - new Date(a.expired || 0))[0];

  const rawTargetCert = item?.currentCert || item?.cert || activeItemCert || null;
  const targetCert = activeCertId && item.linkedCertificates
    ? (item.linkedCertificates.find(c => c.id === activeCertId) || rawTargetCert)
    : rawTargetCert;

  const isSingleCertScope = Boolean(
    targetCert?.id &&
    (effectiveCategoryKey === 'perizinan-aset' ||
     effectiveCategoryKey === 'perizinan-proyek' ||
     effectiveCategoryKey === 'perizinan-produk')
  );

  const isHaki = Boolean(effectiveCategoryKey === 'administrasi-lainnya' || item.judulCiptaan || item.jenisCiptaan);
  const isEquipment = Boolean(effectiveCategoryKey === 'peralatan-pabrik' || (item.nomorSeri && !isHaki && !item.linkedCertificates));
  const isMultiCertItem = Boolean(
    item.linkedCertificates ||
    effectiveCategoryKey === 'perizinan-aset' ||
    effectiveCategoryKey === 'perizinan-proyek' ||
    effectiveCategoryKey === 'perizinan-produk'
  );

  const parseKeterangan = (ket) => {
    try {
      if (ket && typeof ket === 'string' && ket.trim().startsWith('{')) {
        const parsed = JSON.parse(ket);
        return {
          text: parsed.keteranganAsli !== undefined ? parsed.keteranganAsli : ket,
          additionalEntities: Array.isArray(parsed.additionalEntities) ? parsed.additionalEntities : []
        };
      }
    } catch (e) {}
    return { text: ket || '', additionalEntities: [] };
  };

  const initialKetRaw = targetCert?.keterangan || item.keterangan || item.notes || item.agency || (isHaki ? 'Dirjen Kekayaan Intelektual (Kemenkumham RI)' : 'Disnaker Kaltim / Sucofindo');
  const parsedKet = parseKeterangan(initialKetRaw);

  const localDocumentStatus = item.documentStatus || 'PENDING_DOC';
  const [isEditing, setIsEditing] = useState(false);
  
  const buildFormData = () => ({
    merekItem: parentDoc.title || parentDoc.merekItem || item.merekItem || item.title || item.judulCiptaan || '',
    jenisPeralatan: parentDoc.jenisPeralatan || item.jenisPeralatan || parentDoc.categoryKey || item.categoryKey || item.kategoriDokumen || 'Perizinan Aset',
    tipe: isSingleCertScope ? (targetCert?.noSertifikat || parentDoc.code || '') : (item.tipe || item.code || ''),
    nomorSeri: item.nomorSeri || item.nomorSeriTipe || '',
    kapasitas: item.kapasitas || '',
    lokasi: parentDoc.unitLocation || parentDoc.unit || item.lokasi || item.unitPabrik || item.unit || '',
    user: targetCert?.instansi || item.user || item.issuer || 'Umum',
    status: (item.status === 'Perpanjang' || item.status === 'in_progress' || item.status === 'Afkir' || item.status === 'decommissioned')
      ? item.status
      : (isSingleCertScope ? (targetCert?.status || item.status || 'Aktif') : (item.status || 'Aktif')),
    noSertifikat: isSingleCertScope ? (targetCert?.noSertifikat || '') : (item.noSertifikat || item.certNo || item.certificateNo || ''),
    tanggalInspeksi: isSingleCertScope ? (targetCert?.terbit || parentDoc.createdAt || '') : (item.tanggalInspeksi || item.issueDate || item.tanggalCiptaan || ''),
    tanggalCiptaan: item.tanggalCiptaan || item.tanggalInspeksi || item.issueDate || '',
    masaBerlaku: item.masaBerlaku || '5 Tahun',
    terbit: isSingleCertScope ? (targetCert?.terbit || '') : (item.terbit || item.issueDate || ''),
    berakhir: isSingleCertScope ? (targetCert?.expired || '') : (item.berakhir || item.expiryDate || item.kapanBerakhir || ''),
    keterangan: parsedKet.text,
    additionalEntities: parsedKet.additionalEntities,
    fileUrl: isSingleCertScope ? (targetCert?.fileUrl || '') : (item.fileUrl || item.pdfUrl || ''),
    namaSertifikat: targetCert?.namaSertifikat || targetCert?.jenisSertifikat || item.namaSertifikat || ''
  });

  const [formData, setFormData] = useState(buildFormData());

  useEffect(() => {
    if (!isEditing) {
      setFormData(buildFormData());
    }
  }, [item, targetCert]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let updatedTitle = formData.merekItem;
      let updatedCode = formData.nomorSeri || formData.tipe; // Prioritize nomorSeri for doc.code in Generic
      
      const metaObject = {
        keteranganAsli: formData.keterangan || '-',
        additionalEntities: formData.additionalEntities || [],
        tipe: formData.tipe,
        nomorSeri: formData.nomorSeri,
        penanggungJawab: formData.user,
        namaSertifikat: formData.namaSertifikat,
      };

      if (effectiveCategoryKey === 'peralatan-pabrik') {
        updatedTitle = formData.jenisPeralatan;
        updatedCode = formData.merekItem;
      } else if (isHaki) {
        updatedTitle = formData.merekItem;
        updatedCode = formData.tipe;
      }

      const payloadData = {
        title: updatedTitle,
        code: updatedCode,
        unitLocation: formData.lokasi,
        status: formData.status,
        keterangan: JSON.stringify(metaObject),
        issueDate: isHaki ? formData.tanggalCiptaan : (formData.terbit || formData.issueDate),
        expiryDate: isHaki ? formData.masaBerlaku : (formData.berakhir || formData.expiryDate),
        categoryKey: effectiveCategoryKey,
      };

      const targetId = item?.MasterId || item?.id;
      if (targetId) {
        await updateMasterItem(targetId, payloadData);
      }

      if (targetCert?.id && formData.noSertifikat !== undefined) {
        const { updateCertificate } = await import('../services/masterItemsService');
        await updateCertificate(targetCert.id, {
          namaSertifikat: formData.namaSertifikat,
          noSertifikat: formData.noSertifikat,
          terbit: formData.terbit,
          expired: formData.berakhir,
          status: formData.status,
        });
      }

      setIsEditing(false);
      // Construct a faux updated item to refresh the local view immediately
      const updatedLocalItem = { ...item, ...payloadData, ...metaObject, tipe: formData.tipe, nomorSeri: formData.nomorSeri };
      if (onSaveUpdate) onSaveUpdate({ ...updatedLocalItem, id: targetId });
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      alert('Gagal update dokumen: ' + (err.message || 'Error'));
    }
  };

  const historyHook = useDocumentHistory({ item, targetCert, onRefreshRequired });
  const uploadHook = useDocumentUpload({ item, fetchHistory: historyHook.fetchHistory, onSaveUpdate, onRefreshRequired });
  const statusHook = useDocumentStatus({ item, formData, setFormData, onSaveUpdate, onDeleteSuccess });
  const linkedCertsHook = useLinkedCertificates({ item, targetCert, fetchHistory: historyHook.fetchHistory, onRefreshRequired });
  const notificationHook = useNotificationSettings({ item, targetCert });

  const currentStatus = formData.status || item.status || 'Aktif';
  const lowerStatus = currentStatus.toLowerCase();
  const isAfkirStatus = lowerStatus === 'afkir' || lowerStatus === 'decommissioned';
  const isPerpanjangStatus = lowerStatus.includes('perpanjang') || lowerStatus === 'in progress' || lowerStatus === 'in_progress' || lowerStatus === 'proses';

  return {
    parentDoc, effectiveCategoryKey, targetCert, isSingleCertScope,
    isHaki, isEquipment, isMultiCertItem, currentStatus, isAfkirStatus, isPerpanjangStatus,
    isEditing, setIsEditing, formData, setFormData, handleSave, localDocumentStatus,
    activeCertId, setActiveCertId,
    
    ...historyHook,
    ...uploadHook,
    ...statusHook,
    ...linkedCertsHook,
    ...notificationHook
  };
}
