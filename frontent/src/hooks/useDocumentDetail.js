import { useState, useEffect, useRef } from 'react';
import { updateMasterItem, updateCertificate } from '../services/masterItemsService';

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
  const prevInitialCertIdRef = useRef(initialCertId);

  // Only reset activeCertId if initialCertId explicitly changes (e.g. user clicked a different cert
  // from the parent list). Do NOT reset on item data refresh - that causes tab jumping after upload.
  useEffect(() => {
    if (prevInitialCertIdRef.current !== initialCertId) {
      prevInitialCertIdRef.current = initialCertId;
      setActiveCertId(initialCertId || item?.currentCert?.id || item?.cert?.id || null);
    }
  }, [initialCertId]);

  const getTimestamp = (dateStr) => {
    if (!dateStr || dateStr === '-') return 0;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
    }
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  const allItemCerts = item?.certificates || [];
  const validItemCerts = allItemCerts.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s !== 'diarsipkan';
  });
  const activeItemCert = validItemCerts.length > 0
    ? validItemCerts.slice().sort((a, b) => getTimestamp(b.expired || b.expiryDate) - getTimestamp(a.expired || a.expiryDate))[0]
    : (allItemCerts.length > 0 ? allItemCerts.slice().sort((a, b) => getTimestamp(b.expired || b.expiryDate) - getTimestamp(a.expired || a.expiryDate))[0] : null);

  const rawTargetCert = item?.currentCert || item?.cert || activeItemCert || null;
  const targetCert = activeCertId && (item.linkedCertificates || item.certificates)
    ? ((item.linkedCertificates || item.certificates).find(c => c.id === activeCertId) || rawTargetCert)
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

  const initialKetRaw = isSingleCertScope ? (targetCert?.keterangan || '') : (item.rawKeterangan || item.keterangan || item.notes || item.agency || (isHaki ? 'Dirjen Kekayaan Intelektual (Kemenkumham RI)' : 'Disnaker Kaltim / Sucofindo'));
  const parsedKet = parseKeterangan(initialKetRaw);

  const [localDocumentStatus, setLocalDocumentStatus] = useState(item.documentStatus || 'PENDING_DOC');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
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
    instansi: isSingleCertScope ? (targetCert?.instansi || '') : '',
    noSertifikat: isSingleCertScope ? (targetCert?.noSertifikat || '') : (item.noSertifikat || item.certNo || item.certificateNo || ''),
    tanggalInspeksi: isSingleCertScope ? (targetCert?.terbit || parentDoc.createdAt || '') : (item.tanggalInspeksi || item.issueDate || item.tanggalCiptaan || ''),
    tanggalCiptaan: item.tanggalCiptaan || item.tanggalInspeksi || item.issueDate || '',
    masaBerlaku: item.masaBerlaku || '5 Tahun',
    terbit: isSingleCertScope ? (targetCert?.terbit || '') : (item.terbit || item.issueDate || ''),
    berakhir: isSingleCertScope ? (targetCert?.expired || '') : (item.berakhir || item.expiryDate || item.kapanBerakhir || ''),
    keterangan: parsedKet.text,
    additionalEntities: parsedKet.additionalEntities,
    fileUrl: isSingleCertScope ? (targetCert?.fileUrl || '') : (item.fileUrl || item.pdfUrl || ''),
    namaSertifikat: targetCert?.namaSertifikat || targetCert?.jenisSertifikat || item.namaSertifikat || '',
    imageUrl: item.imageUrl || ''
  });

  useEffect(() => {
    const initialKetRaw = isSingleCertScope ? (targetCert?.keterangan || '') : (item.rawKeterangan || item.keterangan || item.notes || item.agency || (isHaki ? 'Dirjen Kekayaan Intelektual (Kemenkumham RI)' : 'Disnaker Kaltim / Sucofindo'));
    const parsedKet = parseKeterangan(initialKetRaw);

    setFormData({
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
      instansi: isSingleCertScope ? (targetCert?.instansi || '') : '',
      noSertifikat: isSingleCertScope ? (targetCert?.noSertifikat || '') : (item.noSertifikat || item.certNo || item.certificateNo || ''),
      tanggalInspeksi: isSingleCertScope ? (targetCert?.terbit || parentDoc.createdAt || '') : (item.tanggalInspeksi || item.issueDate || item.tanggalCiptaan || ''),
      tanggalCiptaan: item.tanggalCiptaan || item.tanggalInspeksi || item.issueDate || '',
      masaBerlaku: item.masaBerlaku || '5 Tahun',
      terbit: isSingleCertScope ? (targetCert?.terbit || '') : (item.terbit || item.issueDate || ''),
      berakhir: isSingleCertScope ? (targetCert?.expired || '') : (item.berakhir || item.expiryDate || item.kapanBerakhir || ''),
      keterangan: parsedKet.text,
      additionalEntities: parsedKet.additionalEntities,
      fileUrl: isSingleCertScope ? (targetCert?.fileUrl || '') : (item.fileUrl || item.pdfUrl || ''),
      namaSertifikat: targetCert?.namaSertifikat || targetCert?.jenisSertifikat || item.namaSertifikat || '',
      imageUrl: item.imageUrl || ''
    });
  }, [activeCertId, item]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payloadData = { ...formData };
      if (formData.additionalEntities) {
        payloadData.keterangan = JSON.stringify({
          keteranganAsli: formData.keterangan || '',
          additionalEntities: formData.additionalEntities
        });
      }
      
      const targetId = item?.MasterId || item?.id;
      if (targetId) {
        let finalStatus = formData.status;
        const expTime = getTimestamp(formData.berakhir || formData.expired);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expTime > 0) {
          if (finalStatus === 'Expired' && expTime >= today.getTime()) {
            finalStatus = 'Aktif';
            payloadData.status = 'Aktif';
          } else if (finalStatus === 'Aktif' && expTime < today.getTime()) {
            finalStatus = 'Expired';
            payloadData.status = 'Expired';
          }
        }

        if (isMultiCertItem) {
          if (isSingleCertScope && targetCert?.id) {
            // Multi-cert & Single Scope: Only update the specific child certificate
            await updateCertificate(targetCert.id, {
              namaSertifikat: formData.namaSertifikat,
              noSertifikat: formData.noSertifikat,
              instansi: formData.instansi,
              terbit: formData.terbit,
              expired: formData.berakhir || formData.expired,
              keterangan: payloadData.keterangan,
              status: finalStatus
            });
          } else {
            // Multi-cert & Master Scope: Only update the master item
            await updateMasterItem(targetId, payloadData);
          }
        } else {
          // Single-cert (Peralatan Pabrik): Update both MasterItem and Certificate to keep them in sync
          await updateMasterItem(targetId, payloadData);
          if (targetCert?.id) {
            await updateCertificate(targetCert.id, {
              namaSertifikat: formData.namaSertifikat,
              noSertifikat: formData.noSertifikat,
              instansi: formData.instansi,
              terbit: formData.terbit,
              expired: formData.berakhir || formData.expired,
              keterangan: payloadData.keterangan,
              status: finalStatus
            });
          }
        }
      }
      setIsEditing(false);
      if (onSaveUpdate) onSaveUpdate({ ...item, ...payloadData, id: targetId });
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      alert('Gagal update dokumen: ' + (err.message || 'Error'));
    }
  };

  const historyHook = useDocumentHistory({ item, targetCert, onRefreshRequired });
  const uploadHook = useDocumentUpload({ item, targetCert, fetchHistory: historyHook.fetchHistory, onSaveUpdate, onRefreshRequired, setActiveCertId });
  const statusHook = useDocumentStatus({ item, targetCert, formData, setFormData, onSaveUpdate, onDeleteSuccess, onRefreshRequired, isSingleCertScope, isMultiCertItem });
  const linkedCertsHook = useLinkedCertificates({ item, targetCert, fetchHistory: historyHook.fetchHistory, onRefreshRequired });
  const notificationHook = useNotificationSettings({ item, targetCert, onRefreshRequired });

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
