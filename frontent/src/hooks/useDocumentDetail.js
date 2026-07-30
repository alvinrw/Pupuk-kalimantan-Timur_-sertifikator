/**
 * useDocumentDetail — Custom hook untuk semua state dan business logic DocumentDetailPage.
 * Dengan mengekstrak logic ke sini, komponen utama hanya perlu fokus ke rendering UI.
 */
import { useState, useEffect, useRef } from 'react';
import {
  getMasterItemById,
  deleteMasterItem,
  createCertificateForMasterItem,
  updateCertificate,
  deleteCertificate,
  updateMasterItem,
  updateNotificationSetting
} from '../services/masterItemsService';
import { API_BASE, UPLOAD_ENDPOINT, getFullFileUrl } from '../config/api';

export function useDocumentDetail({ item, onBack, onSaveUpdate, onDeleteSuccess, onRefreshRequired }) {
  // ──────────────────────────────────────────────────────────────────
  // INITIAL COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────────
  const parentDoc = item?.parentDoc || item;
  const effectiveCategoryKey = parentDoc?.categoryKey || item?.categoryKey || '';

  // ──────────────────────────────────────────────────────────────────
  // MULTI-CERT HUB STATE
  // ──────────────────────────────────────────────────────────────────

  const [linkedCerts, setLinkedCerts] = useState(item?.linkedCertificates || []);
  const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
  const [newCertData, setNewCertData] = useState({
    jenisSertifikat: '', noSertifikat: '', instansi: '',
    terbit: '', expired: '', status: 'Aktif', hasPdf: false, pdfName: ''
  });
  const [deletingLinkedCertId, setDeletingLinkedCertId] = useState(null);

  const [activeCertId, setActiveCertId] = useState(item?.currentCert?.id || item?.cert?.id || null);

  useEffect(() => {
    setActiveCertId(item?.currentCert?.id || item?.cert?.id || null);
  }, [item]);

  const allItemCerts = item?.certificates || [];
  const activeItemCert = allItemCerts.filter(c => c.status === 'Aktif' || c.status === 'Active' || !c.status).sort((a,b) => new Date(b.expired || 0) - new Date(a.expired || 0))[0];

  const rawTargetCert = item?.currentCert || item?.cert || activeItemCert || null;
  const targetCert = activeCertId
    ? (linkedCerts.find(c => c.id === activeCertId) || rawTargetCert)
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

  // ──────────────────────────────────────────────────────────────────
  // EDITING & LOCAL STATE
  // ──────────────────────────────────────────────────────────────────
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
    noSertifikat: isSingleCertScope ? (targetCert?.noSertifikat || '') : (item.noSertifikat || item.certNo || item.certificateNo || ''),
    tanggalInspeksi: isSingleCertScope ? (targetCert?.terbit || parentDoc.createdAt || '') : (item.tanggalInspeksi || item.issueDate || item.tanggalCiptaan || ''),
    tanggalCiptaan: item.tanggalCiptaan || item.tanggalInspeksi || item.issueDate || '',
    masaBerlaku: item.masaBerlaku || '5 Tahun',
    terbit: isSingleCertScope ? (targetCert?.terbit || '') : (item.terbit || item.issueDate || ''),
    berakhir: isSingleCertScope ? (targetCert?.expired || '') : (item.berakhir || item.expiryDate || item.kapanBerakhir || ''),
    keterangan: targetCert?.keterangan || item.keterangan || item.notes || item.agency || (isHaki ? 'Dirjen Kekayaan Intelektual (Kemenkumham RI)' : 'Disnaker Kaltim / Sucofindo'),
    fileUrl: isSingleCertScope ? (targetCert?.fileUrl || '') : (item.fileUrl || item.pdfUrl || ''),
    namaSertifikat: targetCert?.namaSertifikat || targetCert?.jenisSertifikat || item.namaSertifikat || ''
  });

  // ──────────────────────────────────────────────────────────────────
  // REMINDER & NOTIFICATION STATE
  // ──────────────────────────────────────────────────────────────────
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    if (item && item.notificationSetting) return item.notificationSetting.isEnabled !== false;
    if (item && item.reminderEnabled !== undefined) return !!item.reminderEnabled;
    return true;
  });
  const [triggerType, setTriggerType] = useState(() => {
    if (item && item.notificationSetting) return item.notificationSetting.triggerType || 'DAYS';
    return 'DAYS';
  });
  const [reminderDays, setReminderDays] = useState(() => {
    if (item && item.notificationSetting) return item.notificationSetting.triggerDays ?? 30;
    return 30;
  });
  const [triggerDate, setTriggerDate] = useState(() => {
    if (item && item.notificationSetting && item.notificationSetting.triggerDate) {
      return item.notificationSetting.triggerDate.substring(0, 10);
    }
    return '';
  });

  useEffect(() => {
    if (item) {
      if (item.notificationSetting) {
        setReminderEnabled(item.notificationSetting.isEnabled !== false);
        setTriggerType(item.notificationSetting.triggerType || 'DAYS');
        setReminderDays(item.notificationSetting.triggerDays ?? 30);
        setTriggerDate(item.notificationSetting.triggerDate ? item.notificationSetting.triggerDate.substring(0, 10) : '');
      } else if (item.reminderEnabled !== undefined) {
        setReminderEnabled(!!item.reminderEnabled);
      }
    }
  }, [item]);

  const handleToggleReminder = async (newVal) => {
    const isChecked = typeof newVal === 'boolean' ? newVal : !reminderEnabled;
    setReminderEnabled(isChecked);
    if (item) {
      if (!item.notificationSetting) {
        item.notificationSetting = {};
      }
      item.notificationSetting.isEnabled = isChecked;
      item.reminderEnabled = isChecked;
    }
    try {
      const targetId = item?.MasterId || item?.id;
      if (targetId) {
        await updateNotificationSetting(targetId, {
          isEnabled: isChecked,
          triggerType: triggerType,
          triggerDays: parseInt(reminderDays) || 30,
          triggerDate: triggerType === 'DATE' ? triggerDate : null
        });
      }
      if (onSaveUpdate) {
        onSaveUpdate({
          ...item,
          notificationSetting: {
            ...item?.notificationSetting,
            isEnabled: isChecked,
            triggerType: triggerType,
            triggerDays: parseInt(reminderDays) || 30,
            triggerDate: triggerType === 'DATE' ? triggerDate : null
          }
        });
      }
    } catch (err) {
      console.error('Failed to toggle reminder setting:', err);
    }
  };

  // Sync formData whenever targetCert changes (navigasi antar sertifikat)
  useEffect(() => {
    if (isSingleCertScope && targetCert) {
      setFormData(prev => ({
        ...prev,
        namaSertifikat: targetCert.namaSertifikat || targetCert.jenisSertifikat || prev.namaSertifikat,
        tipe: targetCert.noSertifikat || prev.tipe,
        user: targetCert.instansi || prev.user,
        status: (item.status === 'Perpanjang' || item.status === 'in_progress' || item.status === 'Afkir' || item.status === 'decommissioned')
          ? item.status
          : (targetCert.status || 'Aktif'),
        noSertifikat: targetCert.noSertifikat || '',
        tanggalInspeksi: targetCert.terbit || prev.tanggalInspeksi,
        terbit: targetCert.terbit || '',
        berakhir: targetCert.expired || '',
        keterangan: targetCert.instansi || prev.keterangan,
        fileUrl: targetCert.fileUrl || ''
      }));
    }
  }, [targetCert, isSingleCertScope, item.status]);

  // ──────────────────────────────────────────────────────────────────
  // HISTORY STATE
  // ──────────────────────────────────────────────────────────────────
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const masterItemId = parentDoc?.MasterId || parentDoc?.id || item?.MasterId || item?.id;
      if (!masterItemId) { setHistoryList([]); return; }

      const detail = await getMasterItemById(masterItemId);
      if (!detail || !detail.certificates || detail.certificates.length === 0) {
        setHistoryList([]);
        setLinkedCerts([]);
        if (!isSingleCertScope) {
          setLocalDocumentStatus('EXEMPT');
          setFormData(prev => ({
            ...prev,
            noSertifikat: '',
            terbit: '',
            berakhir: '',
            fileUrl: null
          }));
        }
        return;
      }

      let masterCertList = detail.certificates || [];

      const allMappedLinkedCerts = masterCertList.map((c, index) => ({
        id: c.id,
        periode: c.terbit && c.expired ? `${c.terbit.substring(0, 4)} – ${c.expired.substring(0, 4)}` : 'Periode SK',
        noSertifikat: c.noSertifikat || '-',
        namaSertifikat: c.namaSertifikat || c.jenisSertifikat || 'Sertifikat Terhubung',
        jenisSertifikat: c.jenisSertifikat || '-',
        instansi: c.instansi || '-',
        terbit: c.terbit || '-',
        expired: c.expired || '-',
        status: c.status || 'Aktif',
        fileUrl: c.fileUrl || null,
        pdfName: c.fileUrl ? c.fileUrl.split('/').pop() : 'sertifikat.pdf',
        isCurrent: c.status?.toLowerCase() === 'aktif' || index === 0,
        rawCert: c
      }));
      setLinkedCerts(allMappedLinkedCerts);

      let certList = masterCertList;

      if (isSingleCertScope && targetCert?.id) {
        const anchorCert = certList.find(c => c.id === targetCert.id);
        const scopedJenis = anchorCert?.jenisSertifikat || targetCert?.jenisSertifikat;
        if (scopedJenis) {
          certList = certList.filter(c => c.jenisSertifikat === scopedJenis);
        } else {
          certList = certList.filter(c => c.id === targetCert.id);
        }
      }

      const mappedCerts = certList.map((c, index) => ({
        id: c.id,
        periode: c.terbit && c.expired ? `${c.terbit.substring(0, 4)} – ${c.expired.substring(0, 4)}` : 'Periode SK',
        noSertifikat: c.noSertifikat || '-',
        namaSertifikat: c.namaSertifikat || c.jenisSertifikat || 'Sertifikat Terhubung',
        jenisSertifikat: c.jenisSertifikat || '-',
        instansi: c.instansi || '-',
        terbit: c.terbit || '-',
        expired: c.expired || '-',
        status: c.status || 'Aktif',
        fileUrl: c.fileUrl || null,
        pdfName: c.fileUrl ? c.fileUrl.split('/').pop() : 'sertifikat.pdf',
        isCurrent: c.status?.toLowerCase() === 'aktif' || index === 0,
        rawCert: c
      }));

      setHistoryList(mappedCerts);

      if (!isSingleCertScope) {
        const activeCerts = mappedCerts.filter(c => c.status === 'Aktif' || c.status === 'Active');
        let primaryCert = activeCerts.length > 0
          ? activeCerts.slice().sort((a, b) => new Date(b.expired || '1970-01-01') - new Date(a.expired || '1970-01-01'))[0]
          : (mappedCerts.length > 0 ? mappedCerts[0] : null);
        if (primaryCert) {
          setLocalDocumentStatus('COMPLETED');
          setFormData(prev => {
            const currentStatusLower = (prev.status || '').toLowerCase();
            const isSpecialState = currentStatusLower.includes('perpanjang') || currentStatusLower.includes('proses') || currentStatusLower === 'afkir' || currentStatusLower === 'decommissioned' || currentStatusLower === 'in_progress' || currentStatusLower === 'in progress';
            
            return {
              ...prev,
              noSertifikat: primaryCert.noSertifikat,
              namaSertifikat: primaryCert.namaSertifikat || primaryCert.jenisSertifikat || '',
              terbit: primaryCert.terbit,
              berakhir: primaryCert.expired,
              status: isSpecialState ? prev.status : primaryCert.status,
              fileUrl: primaryCert.fileUrl || prev.fileUrl
            };
          });
        } else {
          setLocalDocumentStatus('EXEMPT');
          setFormData(prev => ({
            ...prev,
            noSertifikat: '',
            terbit: '',
            berakhir: '',
            fileUrl: null
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load history from DB', err);
      setHistoryList([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [item, activeCertId]);

  // ──────────────────────────────────────────────────────────────────
  // UPLOAD STATE
  // ──────────────────────────────────────────────────────────────────
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    noSertifikat: '', instansi: 'Disnaker Kaltim / Sucofindo',
    terbit: '2026-07-23', expired: '2029-07-23', target: 'archive', fileName: ''
  });
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const manualFileInputRef = useRef(null);

  const openUploadModal = (target = 'archive') => {
    setUploadData({
      noSertifikat: '', instansi: 'Disnaker Kaltim / Sucofindo',
      terbit: new Date().toISOString().split('T')[0],
      expired: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
      target, fileName: ''
    });
    setSelectedUploadFile(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileUrl = null;
      if (uploadData.tempUrl) {
        // Move from temp to final
        const moveRes = await fetch(`${API_BASE}/document-history/move-temp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempUrl: uploadData.tempUrl })
        });
        if (moveRes.ok) {
          const json = await moveRes.json();
          fileUrl = json?.data?.url || null;
        } else {
          throw new Error('Gagal memindahkan file dari temporary ke final storage');
        }
      } else if (selectedUploadFile) {
        // Fallback if somehow there's no tempUrl (e.g. upload failed previously)
        const fd = new FormData();
        fd.append('file', selectedUploadFile);
        const uploadRes = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const json = await uploadRes.json();
          fileUrl = json?.data?.url || json?.data?.fileUrl || null;
        } else {
          const errText = await uploadRes.text();
          throw new Error(`Upload gagal (${uploadRes.status}): ${errText}`);
        }
      }

      const masterItemId = parentDoc.MasterId || parentDoc.id || item.MasterId || item.id;
      const isKoreksi = uploadData.target === 'current' && isSingleCertScope && targetCert?.id;
      const basePayload = {
        itemId: masterItemId,
        jenisSertifikat: targetCert?.jenisSertifikat || item.jenisPeralatan || item.title || 'Riksa Uji Disnaker',
        noSertifikat: uploadData.noSertifikat.trim() || (isKoreksi ? targetCert.noSertifikat : null) || `CERT-${Date.now()}`,
        status: 'Aktif',
      };
      if (uploadData.terbit) basePayload.terbit = uploadData.terbit;
      if (uploadData.expired) basePayload.expired = uploadData.expired;
      if (uploadData.instansi) basePayload.instansi = uploadData.instansi;
      if (fileUrl) basePayload.fileUrl = fileUrl;

      await createCertificateForMasterItem(basePayload);

      if (isKoreksi && targetCert?.id) {
        await updateCertificate(targetCert.id, { status: 'Direvisi' });
      } else if (isSingleCertScope && targetCert?.id) {
        await updateCertificate(targetCert.id, { status: 'Diperpanjang' });
      }

      // Jika ini adalah upload file untuk menyelesaikan perpanjangan
      if (uploadData.target === 'archive') {
        const updatedMaster = await updateMasterItem(masterItemId, { status: 'Aktif', documentStatus: 'COMPLETED' });
        setFormData(prev => ({ ...prev, status: 'Aktif' }));
        if (onSaveUpdate) {
           onSaveUpdate({ ...item, ...formData, status: 'Aktif', documentStatus: 'COMPLETED', ...updatedMaster, id: masterItemId });
        }
      }

      await fetchHistory();
      setIsUploadModalOpen(false);
      setSelectedUploadFile(null);
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      console.error('Failed to upload certificate:', err);
      alert('Gagal mengunggah sertifikat: ' + (err.message || 'Error'));
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // HISTORY ROW EDIT STATE
  // ──────────────────────────────────────────────────────────────────
  const [selectedHistoryToDelete, setSelectedHistoryToDelete] = useState(null);
  const [editingHistoryRow, setEditingHistoryRow] = useState(null);
  const [selectedHistoryFile, setSelectedHistoryFile] = useState(null);
  const editHistoryFileInputRef = useRef(null);

  const handleDeleteHistoryRow = async (id) => {
    try {
      await deleteCertificate(id);
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
      setSelectedHistoryToDelete(null);
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      alert('Gagal menghapus sertifikat: ' + (err.message || 'Error'));
    }
  };

  const handleSaveHistoryRowEdit = async (e) => {
    e.preventDefault();
    if (!editingHistoryRow) return;
    try {
      let fileUrl = editingHistoryRow.fileUrl;
      if (selectedHistoryFile) {
        const fd = new FormData();
        fd.append('file', selectedHistoryFile);
        const uploadRes = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const json = await uploadRes.json();
          fileUrl = json?.data?.url || json?.data?.fileUrl || fileUrl;
        }
      }
      const updatePayload = { noSertifikat: editingHistoryRow.noSertifikat, status: editingHistoryRow.status || 'Aktif' };
      if (editingHistoryRow.terbit) updatePayload.terbit = editingHistoryRow.terbit;
      if (editingHistoryRow.expired) updatePayload.expired = editingHistoryRow.expired;
      if (fileUrl) updatePayload.fileUrl = fileUrl;
      await updateCertificate(editingHistoryRow.id, updatePayload);
      await fetchHistory();
      setEditingHistoryRow(null);
      setSelectedHistoryFile(null);
    } catch (err) {
      console.error('Failed to update certificate:', err);
      alert('Gagal memperbarui sertifikat: ' + (err.message || 'Error'));
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // SAVE DATA
  // ──────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const targetId = item.MasterId || item.id;
      
      let payload = {};
      if (isEquipment) {
        // - title is jenisPeralatan (e.g. Bejana Tekan)
        // - code is merekItem (e.g. HE-102)
        payload = {
          title: formData.jenisPeralatan,
          code: formData.merekItem,
          unitLocation: formData.lokasi,
          status: formData.status,
          issueDate: formData.terbit || null,
          expiryDate: formData.berakhir || null,
          keterangan: JSON.stringify({
            tipe: formData.tipe || '',
            nomorSeri: formData.nomorSeri || '',
            penanggungJawab: formData.user || '',
            noSertifikat: formData.noSertifikat || '',
            namaSertifikat: formData.namaSertifikat || '',
            keteranganAsli: formData.keterangan || ''
          })
        };
      } else {
        // - title is merekItem or title
        // - code is code or noSertifikat
        payload = {
          title: formData.merekItem || formData.title || '',
          code: formData.code || formData.noSertifikat || '',
          unitLocation: formData.lokasi || '',
          status: formData.status,
          issueDate: formData.terbit || formData.issueDate || null,
          expiryDate: formData.berakhir || formData.expiryDate || null,
          keterangan: JSON.stringify({
            namaSertifikat: formData.namaSertifikat || '',
            keteranganAsli: formData.keterangan || ''
          })
        };
      }

      const updated = await updateMasterItem(targetId, payload);

      // Update Active Certificate if it exists, so changes in the form also apply to the cert!
      if (rawTargetCert && rawTargetCert.id) {
        await updateCertificate(rawTargetCert.id, {
          namaSertifikat: formData.namaSertifikat,
          noSertifikat: formData.noSertifikat || formData.code,
          instansi: formData.user,
          terbit: formData.terbit || formData.issueDate,
          expired: formData.berakhir || formData.expiryDate,
          status: formData.status
        });
      }

      // Save notification settings
      await updateNotificationSetting(targetId, {
        isEnabled: reminderEnabled,
        triggerType: triggerType,
        triggerDays: parseInt(reminderDays) || 30,
        triggerDate: triggerType === 'DATE' ? triggerDate : null
      });

      if (onSaveUpdate) {
        onSaveUpdate({
          ...item,
          ...formData,
          ...updated,
          id: item.id,
          namaSertifikat: formData.namaSertifikat,
          notificationSetting: {
            isEnabled: reminderEnabled,
            triggerType: triggerType,
            triggerDays: parseInt(reminderDays) || 30,
            triggerDate: triggerType === 'DATE' ? triggerDate : null
          }
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update master item:', err);
      alert('Gagal menyimpan perubahan data: ' + (err.message || 'Error'));
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // AFKIR / AKTIFKAN
  // ──────────────────────────────────────────────────────────────────
  const [isAfkirModalOpen, setIsAfkirModalOpen] = useState(false);
  const [isAfkiring, setIsAfkiring] = useState(false);
  const [isAktifkanModalOpen, setIsAktifkanModalOpen] = useState(false);
  const [isAktifkaning, setIsAktifkaning] = useState(false);

  const handleAfkir = () => setIsAfkirModalOpen(true);
  const confirmAfkir = async () => {
    setIsAfkiring(true);
    try {
      const targetId = item.MasterId || item.id;
      const updated = await updateMasterItem(targetId, { status: 'Afkir' });
      setFormData(prev => ({ ...prev, status: 'Afkir' }));
      if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Afkir', ...updated, id: item.id });
      setIsAfkirModalOpen(false);
    } catch (err) {
      alert('Gagal mengubah status menjadi Afkir: ' + (err.message || 'Error'));
    } finally { setIsAfkiring(false); }
  };

  const handleAktifkan = () => setIsAktifkanModalOpen(true);
  const confirmAktifkan = async () => {
    setIsAktifkaning(true);
    try {
      const targetId = item.MasterId || item.id;
      const updated = await updateMasterItem(targetId, { status: 'Aktif' });
      setFormData(prev => ({ ...prev, status: 'Aktif' }));
      if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Aktif', ...updated, id: item.id });
      setIsAktifkanModalOpen(false);
    } catch (err) {
      alert('Gagal mengaktifkan kembali: ' + (err.message || 'Error'));
    } finally { setIsAktifkaning(false); }
  };

  // ──────────────────────────────────────────────────────────────────
  // DELETE MASTER ITEM
  // ──────────────────────────────────────────────────────────────────
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMasterItem = async () => {
    try {
      setIsDeleting(true);
      const targetId = item.MasterId || item.id;
      await deleteMasterItem(targetId);
      setIsDeleteDialogOpen(false);
      if (onDeleteSuccess) onDeleteSuccess(); else onBack();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data: ' + (error.message || 'Error'));
    } finally { setIsDeleting(false); }
  };

  // ──────────────────────────────────────────────────────────────────
  // PERPANJANG HEADER
  // ──────────────────────────────────────────────────────────────────
  const [isConfirmRenewHeaderModalOpen, setIsConfirmRenewHeaderModalOpen] = useState(false);
  const [isRenewingHeader, setIsRenewingHeader] = useState(false);
  const [isConfirmCancelHeaderModalOpen, setIsConfirmCancelHeaderModalOpen] = useState(false);
  const [isCancelingHeader, setIsCancelingHeader] = useState(false);

  const confirmRenewHeader = async () => {
    setIsRenewingHeader(true);
    try {
      const targetId = item.MasterId || item.id;
      const updated = await updateMasterItem(targetId, { status: 'Perpanjang' });
      setFormData(prev => ({ ...prev, status: 'Perpanjang' }));
      if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Perpanjang', workflowStatus: 'in_progress', id: targetId });
      setIsConfirmRenewHeaderModalOpen(false);
    } catch (err) {
      alert('Gagal mengajukan perpanjangan: ' + (err.message || 'Error'));
    } finally { setIsRenewingHeader(false); }
  };

  const confirmCancelHeader = async () => {
    setIsCancelingHeader(true);
    try {
      const targetId = item.MasterId || item.id;
      await updateMasterItem(targetId, { status: 'Aktif' });
      setFormData(prev => ({ ...prev, status: 'Aktif' }));
      if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, status: 'Aktif', workflowStatus: item.documentStatus === 'EXEMPT' ? 'exempt' : 'completed', id: targetId });
      setIsConfirmCancelHeaderModalOpen(false);
    } catch (err) {
      alert('Gagal membatalkan perpanjangan: ' + (err.message || 'Error'));
    } finally { setIsCancelingHeader(false); }
  };

  // ──────────────────────────────────────────────────────────────────
  // RENEW EXEMPT
  // ──────────────────────────────────────────────────────────────────
  const [isRenewExemptModalOpen, setIsRenewExemptModalOpen] = useState(false);
  const [renewExemptDate, setRenewExemptDate] = useState('');
  const [isRenewingExempt, setIsRenewingExempt] = useState(false);

  const confirmRenewExempt = async () => {
    if (!renewExemptDate) return;
    setIsRenewingExempt(true);
    try {
      const targetId = item.MasterId || item.id;
      await updateMasterItem(targetId, { expiryDate: renewExemptDate, status: 'Aktif' });
      setFormData(prev => ({ ...prev, berakhir: renewExemptDate, status: 'Aktif' }));
      if (onSaveUpdate) onSaveUpdate({ ...item, ...formData, berakhir: renewExemptDate, status: 'Aktif', id: targetId });
      setIsRenewExemptModalOpen(false);
      setTimeout(() => alert('Berhasil memperbarui tanggal jatuh tempo!'), 100);
    } catch (err) {
      alert('Gagal: ' + (err.message || 'Error'));
    } finally { setIsRenewingExempt(false); }
  };

  const handleAddLinkedCert = async ({ certPayload, pdfFile }) => {
    try {
      let fileUrl = null;
      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        const uploadRes = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const json = await uploadRes.json();
          fileUrl = json?.data?.url || json?.data?.fileUrl || null;
        }
      }
      const masterItemId = parentDoc.MasterId || parentDoc.id || item.MasterId || item.id;
      const payload = { itemId: masterItemId, ...certPayload };
      if (fileUrl) payload.fileUrl = fileUrl;
      const saved = await createCertificateForMasterItem(payload);
      setLinkedCerts(prev => [...prev, saved]);
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
      setIsAddCertModalOpen(false);
    } catch (err) {
      console.error('Failed to save linked certificate:', err);
      alert('Gagal menyimpan sertifikat terhubung: ' + (err.message || 'Error'));
    }
  };

  const handleDeleteLinkedCert = async (id) => {
    try {
      if (id) {
        await deleteCertificate(id);
      }
      await fetchHistory();
      if (onRefreshRequired) onRefreshRequired();
      if (activeCertId === id) {
        setActiveCertId(null);
      }
    } catch (err) {
      console.error('Failed to delete linked certificate:', err);
      alert('Gagal menghapus sertifikat terhubung: ' + (err.message || 'Error'));
    } finally {
      setDeletingLinkedCertId(null);
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────────
  const currentStatus = formData.status || item.status || 'Aktif';
  const lowerStatus = currentStatus.toLowerCase();
  const isAfkirStatus = lowerStatus === 'afkir' || lowerStatus === 'decommissioned';
  const isPerpanjangStatus = lowerStatus.includes('perpanjang') || lowerStatus === 'in progress' || lowerStatus === 'in_progress' || lowerStatus === 'proses';

  return {
    // context
    parentDoc, effectiveCategoryKey, targetCert, isSingleCertScope,
    isHaki, isEquipment, isMultiCertItem, currentStatus, isAfkirStatus, isPerpanjangStatus,
    // editing
    isEditing, setIsEditing, formData, setFormData, handleSave,
    // history
    historyList, isLoadingHistory, fetchHistory,
    selectedHistoryToDelete, setSelectedHistoryToDelete,
    editingHistoryRow, setEditingHistoryRow,
    selectedHistoryFile, setSelectedHistoryFile,
    editHistoryFileInputRef,
    handleDeleteHistoryRow, handleSaveHistoryRowEdit,
    // upload
    isUploadModalOpen, setIsUploadModalOpen,
    uploadData, setUploadData,
    selectedUploadFile, setSelectedUploadFile,
    manualFileInputRef,
    openUploadModal, handleUploadSubmit,
    // linked certs
    linkedCerts, setLinkedCerts,
    isAddCertModalOpen, setIsAddCertModalOpen,
    newCertData, setNewCertData,
    deletingLinkedCertId, setDeletingLinkedCertId,
    handleAddLinkedCert, handleDeleteLinkedCert,
    // active cert navigation
    activeCertId, setActiveCertId,
    // delete
    isDeleteDialogOpen, setIsDeleteDialogOpen, isDeleting, handleDeleteMasterItem,
    // afkir/aktifkan
    isAfkirModalOpen, setIsAfkirModalOpen, isAfkiring, handleAfkir, confirmAfkir,
    isAktifkanModalOpen, setIsAktifkanModalOpen, isAktifkaning, handleAktifkan, confirmAktifkan,
    // perpanjang
    isConfirmRenewHeaderModalOpen, setIsConfirmRenewHeaderModalOpen, isRenewingHeader, confirmRenewHeader,
    isConfirmCancelHeaderModalOpen, setIsConfirmCancelHeaderModalOpen, isCancelingHeader, confirmCancelHeader,
    // renew exempt
    isRenewExemptModalOpen, setIsRenewExemptModalOpen,
    renewExemptDate, setRenewExemptDate, isRenewingExempt, confirmRenewExempt,
    localDocumentStatus,
    reminderEnabled, setReminderEnabled,
    triggerType, setTriggerType,
    reminderDays, setReminderDays,
    triggerDate, setTriggerDate,
    handleToggleReminder,
    localDocumentStatus, setLocalDocumentStatus
  };
}
