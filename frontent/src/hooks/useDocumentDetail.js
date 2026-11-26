import { useState, useEffect, useRef } from 'react';
import { updateMasterItem, updateCertificate } from '../services/masterItemsService';
import api from '../services/api';

// Sub-hooks
import { useDocumentHistory } from './document-detail/useDocumentHistory';
import { useDocumentUpload } from './document-detail/useDocumentUpload';
import { useDocumentStatus } from './document-detail/useDocumentStatus';
import { useLinkedCertificates } from './document-detail/useLinkedCertificates';
import { useNotificationSettings } from './document-detail/useNotificationSettings';

export function useDocumentDetail({ item: rawItem, onBack, onSaveUpdate, onDeleteSuccess, onRefreshRequired, initialCertId }) {
  const item = rawItem?.parentDoc 
    ? { ...rawItem.parentDoc, _scrollToHistory: rawItem._scrollToHistory }
    : rawItem;
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
  
  const isMultiCertCategory = effectiveCategoryKey === 'perizinan-aset' || effectiveCategoryKey === 'perizinan-proyek' || effectiveCategoryKey === 'perizinan-produk';
  
  const targetCert = activeCertId && (item.linkedCertificates || item.certificates)
    ? ((item.linkedCertificates || item.certificates).find(c => c.id === activeCertId) || rawTargetCert)
    : (isMultiCertCategory ? null : rawTargetCert);

  const isSingleCertScope = Boolean(
    targetCert?.id &&
    (effectiveCategoryKey === 'perizinan-aset' ||
     effectiveCategoryKey === 'perizinan-proyek' ||
     effectiveCategoryKey === 'perizinan-produk')
  );

  const isHaki = Boolean(
    effectiveCategoryKey === 'administrasi-lainnya' ||
    effectiveCategoryKey?.includes('cipta') ||
    effectiveCategoryKey?.includes('paten') ||
    item?.judulCiptaan ||
    item?.jenisCiptaan
  );
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
        const text = (parsed.keteranganAsli !== undefined && parsed.keteranganAsli !== '-')
          ? parsed.keteranganAsli
          : (parsed.keterangan !== undefined && parsed.keterangan !== '-' ? parsed.keterangan : '');
        return {
          text: text === '-' ? '' : text,
          instansi: parsed.instansi !== undefined ? parsed.instansi : (parsed.instansiPenerbit !== undefined ? parsed.instansiPenerbit : ''),
          tipe: parsed.tipe !== undefined ? parsed.tipe : '',
          nomorSeri: parsed.nomorSeri !== undefined ? parsed.nomorSeri : '',
          penanggungJawab: parsed.penanggungJawab !== undefined ? parsed.penanggungJawab : '',
          noSertifikat: parsed.noSertifikat !== undefined ? parsed.noSertifikat : '',
          unitLocation: parsed.unitLocation !== undefined ? parsed.unitLocation : '',
          additionalEntities: Array.isArray(parsed.additionalEntities) ? parsed.additionalEntities : []
        };
      }
    } catch (e) {}
    return { text: ket === '-' ? '' : (ket || ''), instansi: '', tipe: '', nomorSeri: '', penanggungJawab: '', noSertifikat: '', unitLocation: '', additionalEntities: [] };
  };

  const resolveRawKeterangan = () => {
    const certKet = targetCert?.keterangan;
    if (certKet && typeof certKet === 'string' && certKet.trim() !== '' && certKet.trim() !== '-') {
      return certKet;
    }
    const itemKet = item?.rawKeterangan || item?.keterangan;
    if (itemKet && typeof itemKet === 'string' && itemKet.trim() !== '' && itemKet.trim() !== '-') {
      return itemKet;
    }
    if (item?.notes && typeof item.notes === 'string' && item.notes.trim() !== '' && item.notes.trim() !== '-') {
      return item.notes;
    }
    return '';
  };

  const initialKetRaw = resolveRawKeterangan();
  const parsedKet = parseKeterangan(initialKetRaw);
  const initialEntities = parsedKet.additionalEntities || [];
  const initialJenisPeralatanEnt = initialEntities.find(e => e.key === 'JENIS PERALATAN PABRIK');
  const initialJenisPeralatan = initialJenisPeralatanEnt ? initialJenisPeralatanEnt.value : (parentDoc.jenisPeralatan || item.jenisPeralatan || parentDoc.categoryKey || item.categoryKey || item.kategoriDokumen || 'Perizinan Aset');

  const [columnConfigs, setColumnConfigs] = useState([]);
  
  useEffect(() => {
    if (effectiveCategoryKey) {
      api.get(`/column-configs/${effectiveCategoryKey}`)
        .then(res => {
          const fetchedCols = res.data || [];
          setColumnConfigs(fetchedCols);
        })
        .catch(err => console.error(err));
    }
  }, [effectiveCategoryKey]);

  const localDocumentStatus = item.documentStatus || 'PENDING_DOC';
  const [isEditing, setIsEditing] = useState(false);
  
  const parseMetaFromItem = (itm) => {
    try {
      const raw = itm?.rawKeterangan || itm?.keterangan;
      if (raw && typeof raw === 'string' && raw.trim().startsWith('{')) {
        return JSON.parse(raw);
      }
    } catch (_) {}
    return null;
  };
  const itemMeta = parseMetaFromItem(item);

  const buildFormData = () => {
    let resolvedMerekItem = parentDoc.title || parentDoc.merekItem || item.merekItem || item.title || item.judulCiptaan || '';
    let resolvedTipe = isSingleCertScope ? (targetCert?.noSertifikat || parentDoc.code || '') : (item.tipe || item.code || '');
    
    if (effectiveCategoryKey === 'peralatan-pabrik') {
      resolvedMerekItem = parentDoc.title || item.title || parentDoc.merekItem || item.merekItem || '';
      resolvedTipe = parsedKet.tipe || item.tipe || '';
    } else if (isHaki) {
      resolvedMerekItem = parentDoc.title || parentDoc.merekItem || item.merekItem || item.title || item.judulCiptaan || '';
      resolvedTipe = parentDoc.code || item.code || item.tipe || '';
    }

    const resolvedUser = itemMeta?.penanggungJawab || parsedKet.penanggungJawab || (isSingleCertScope ? (targetCert?.instansi || item.user || 'Umum') : (item.user || item.issuer || 'Umum'));
    const resolvedKeterangan = parsedKet.text || itemMeta?.keteranganAsli || (targetCert?.keterangan && targetCert.keterangan !== '-' ? targetCert.keterangan : '') || '';

    return {
      merekItem: resolvedMerekItem,
      jenisPeralatan: initialJenisPeralatan,
      tipe: resolvedTipe,
      nomorSeri: item.nomorSeri || parsedKet.nomorSeri || itemMeta?.nomorSeri || parentDoc.code || item.code || '',
      kapasitas: item.kapasitas || '',
      lokasi: parentDoc.unitLocation || parentDoc.unit || item.lokasi || item.unitPabrik || item.unit || itemMeta?.unitLocation || '',
      user: resolvedUser,
      status: (item.status === 'Perpanjang' || item.status === 'in_progress' || item.status === 'Afkir' || item.status === 'decommissioned')
        ? item.status
        : (isSingleCertScope ? (targetCert?.status || item.status || 'Aktif') : (item.status || 'Aktif')),
      instansi: targetCert?.instansi || activeItemCert?.instansi || parsedKet.instansi || itemMeta?.instansi || itemMeta?.instansiPenerbit || (item.instansi && item.instansi !== '-' && !item.instansi.trim().startsWith('{') ? item.instansi : '') || '',
      noSertifikat: targetCert?.noSertifikat || item.noSertifikat || item.certNo || item.certificateNo || itemMeta?.noSertifikat || '',
      tanggalInspeksi: targetCert?.terbit || item.tanggalInspeksi || item.issueDate || item.tanggalCiptaan || parentDoc.createdAt || '',
      tanggalCiptaan: item.tanggalCiptaan || item.tanggalInspeksi || item.issueDate || targetCert?.terbit || item.terbit || '',
      masaBerlaku: item.masaBerlaku || '5 Tahun',
      terbit: targetCert?.terbit || item.terbit || item.issueDate || item.tanggalCiptaan || '',
      berakhir: targetCert?.expired || item.berakhir || item.expiryDate || item.kapanBerakhir || '',
      keterangan: resolvedKeterangan,
      additionalEntities: parsedKet.additionalEntities,
      fileUrl: isSingleCertScope ? (targetCert?.fileUrl || '') : (item.fileUrl || item.pdfUrl || targetCert?.fileUrl || ''),
      namaSertifikat: targetCert?.namaSertifikat || targetCert?.jenisSertifikat || item.namaSertifikat || '',
      imageUrl: item.imageUrl || ''
    };
  };

  const [formData, setFormData] = useState(buildFormData());

  useEffect(() => {
    const rawKet = resolveRawKeterangan();
    const parsedKetDynamic = parseKeterangan(rawKet);
    const parsedEntities = parsedKetDynamic.additionalEntities || [];

    let finalEntities = parsedEntities;
    if (columnConfigs.length > 0) {
      const customCols = columnConfigs.filter(c => c.isCustom);
      const mergedEntities = customCols.map(col => {
        const existing = parsedEntities.find(e => e.key === col.label);
        return {
          key: col.label,
          value: existing ? existing.value : '',
          type: col.type || 'text'
        };
      });
      const otherEntities = parsedEntities.filter(e => !customCols.some(c => c.label === e.key));
      finalEntities = [...mergedEntities, ...otherEntities];
    }

    const targetJenisPeralatanEnt = parsedEntities.find(e => e.key === 'JENIS PERALATAN PABRIK');
    const targetJenisPeralatan = targetJenisPeralatanEnt ? targetJenisPeralatanEnt.value : (parentDoc.jenisPeralatan || item.jenisPeralatan || parentDoc.categoryKey || item.categoryKey || item.kategoriDokumen || 'Perizinan Aset');

    let resolvedMerekItem = parentDoc.title || parentDoc.merekItem || item.merekItem || item.title || item.judulCiptaan || '';
    let resolvedTipe = isSingleCertScope ? (targetCert?.noSertifikat || parentDoc.code || '') : (item.tipe || item.code || '');
    
    if (effectiveCategoryKey === 'peralatan-pabrik') {
      resolvedMerekItem = parentDoc.title || item.title || parentDoc.merekItem || item.merekItem || '';
      resolvedTipe = parsedKetDynamic.tipe || item.tipe || '';
    } else if (isHaki) {
      resolvedMerekItem = parentDoc.title || parentDoc.merekItem || item.merekItem || item.title || item.judulCiptaan || '';
      resolvedTipe = parentDoc.code || item.code || item.tipe || '';
    }

    const resolvedUser = itemMeta?.penanggungJawab || parsedKetDynamic.penanggungJawab || (isSingleCertScope ? (targetCert?.instansi || item.user || 'Umum') : (item.user || item.issuer || 'Umum'));
    const resolvedKeterangan = parsedKetDynamic.text || itemMeta?.keteranganAsli || (targetCert?.keterangan && targetCert.keterangan !== '-' ? targetCert.keterangan : '') || '';

    setFormData({
      merekItem: resolvedMerekItem,
      jenisPeralatan: targetJenisPeralatan,
      tipe: resolvedTipe,
      nomorSeri: item.nomorSeri || parsedKetDynamic.nomorSeri || itemMeta?.nomorSeri || parentDoc.code || item.code || '',
      kapasitas: item.kapasitas || '',
      lokasi: parentDoc.unitLocation || parentDoc.unit || item.lokasi || item.unitPabrik || item.unit || itemMeta?.unitLocation || '',
      user: resolvedUser,
      status: (item.status === 'Afkir' || item.status === 'decommissioned')
        ? item.status
        : (isSingleCertScope ? (targetCert?.status || item.status || 'Aktif') : (item.status || 'Aktif')),
      instansi: targetCert?.instansi || activeItemCert?.instansi || parsedKetDynamic.instansi || itemMeta?.instansi || itemMeta?.instansiPenerbit || (item.instansi && item.instansi !== '-' && !item.instansi.trim().startsWith('{') ? item.instansi : '') || '',
      noSertifikat: targetCert?.noSertifikat || item.noSertifikat || item.certNo || item.certificateNo || itemMeta?.noSertifikat || '',
      tanggalInspeksi: targetCert?.terbit || item.tanggalInspeksi || item.issueDate || item.tanggalCiptaan || parentDoc.createdAt || '',
      tanggalCiptaan: item.tanggalCiptaan || item.tanggalInspeksi || item.issueDate || targetCert?.terbit || item.terbit || '',
      masaBerlaku: item.masaBerlaku || '5 Tahun',
      terbit: targetCert?.terbit || item.terbit || item.issueDate || item.tanggalCiptaan || '',
      berakhir: targetCert?.expired || item.berakhir || item.expiryDate || item.kapanBerakhir || '',
      keterangan: resolvedKeterangan,
      additionalEntities: finalEntities,
      fileUrl: isSingleCertScope ? (targetCert?.fileUrl || '') : (item.fileUrl || item.pdfUrl || targetCert?.fileUrl || ''),
      namaSertifikat: targetCert?.namaSertifikat || targetCert?.jenisSertifikat || item.namaSertifikat || '',
      imageUrl: item.imageUrl || ''
    });
  }, [activeCertId, item, columnConfigs]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let origMeta = {};
      try {
        if (initialKetRaw && initialKetRaw.startsWith('{')) {
          origMeta = JSON.parse(initialKetRaw);
        }
      } catch (_) {}

      let finalEntities = formData.additionalEntities || [];
      if (formData.additionalEntities) {
        finalEntities = [...formData.additionalEntities];
        const jenisIdx = finalEntities.findIndex(e => e.key === 'JENIS PERALATAN PABRIK');
        if (jenisIdx > -1) {
          finalEntities[jenisIdx] = { ...finalEntities[jenisIdx], value: formData.jenisPeralatan };
        } else {
          finalEntities.push({ key: 'JENIS PERALATAN PABRIK', value: formData.jenisPeralatan, type: 'text' });
        }
      }
      
      let updatedTitle = formData.title || formData.merekItem || item.title || item.merekItem || '';
      let updatedCode = formData.code || formData.nomorSeri || formData.tipe || item.code || item.tipe || '';

      if (effectiveCategoryKey === 'peralatan-pabrik') {
        updatedTitle = formData.merekItem || formData.title || item.title || '';
        updatedCode = formData.nomorSeri || formData.code || item.code || '';
      } else if (isHaki) {
        updatedTitle = formData.merekItem;
        updatedCode = formData.tipe;
      }

      const metaObject = {
        ...origMeta,
        keteranganAsli: formData.keterangan || '-',
        additionalEntities: finalEntities,
        tipe: formData.tipe,
        nomorSeri: formData.nomorSeri || updatedCode,
        penanggungJawab: formData.user,
        namaSertifikat: formData.namaSertifikat,
        instansi: formData.instansi,
        noSertifikat: formData.noSertifikat,
      };

      const payloadData = {
        title: updatedTitle,
        code: updatedCode,
        unitLocation: formData.lokasi,
        status: formData.status,
        keterangan: JSON.stringify(metaObject),
        issueDate: isHaki ? formData.tanggalCiptaan : (formData.terbit || formData.issueDate),
        expiryDate: isHaki ? formData.masaBerlaku : (formData.berakhir || formData.expiryDate),
        categoryKey: effectiveCategoryKey,
        imageUrl: formData.imageUrl,
      };

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

      if (targetCert?.id && formData.noSertifikat !== undefined) {
        const { updateCertificate } = await import('../services/masterItemsService');
        await updateCertificate(targetCert.id, {
          namaSertifikat: formData.namaSertifikat,
          noSertifikat: formData.noSertifikat,
          instansi: formData.instansi,
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
  const uploadHook = useDocumentUpload({ item, targetCert, fetchHistory: historyHook.fetchHistory, onSaveUpdate, onRefreshRequired, setActiveCertId });
  const statusHook = useDocumentStatus({ item, targetCert, formData, setFormData, onSaveUpdate, onDeleteSuccess, onRefreshRequired, isSingleCertScope, isMultiCertItem });
  const linkedCertsHook = useLinkedCertificates({ item, targetCert, fetchHistory: historyHook.fetchHistory, onRefreshRequired });
  const notificationHook = useNotificationSettings({ item, targetCert, onRefreshRequired });

  const currentStatus = formData.status || item.status || 'Aktif';
  const lowerStatus = currentStatus.toLowerCase();
  const isDecommissionedStatus = lowerStatus === 'decommissioned' || lowerStatus === 'non-aktif' || lowerStatus === 'afkir' || lowerStatus.includes('non aktif') || lowerStatus.includes('tidak aktif') || lowerStatus.includes('inactive');
  const isPerpanjangStatus = lowerStatus.includes('perpanjang') || lowerStatus === 'in progress' || lowerStatus === 'in_progress' || lowerStatus === 'proses';

  return {
    parentDoc, effectiveCategoryKey, targetCert, isSingleCertScope,
    isHaki, isEquipment, isMultiCertItem, currentStatus, isDecommissionedStatus, isPerpanjangStatus,
    isEditing, setIsEditing, formData, setFormData, handleSave, localDocumentStatus,
    activeCertId, setActiveCertId,
    columnConfigs,
    
    ...historyHook,
    ...uploadHook,
    ...statusHook,
    ...linkedCertsHook,
    ...notificationHook
  };
}
