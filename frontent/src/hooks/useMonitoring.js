import { useState, useEffect, useMemo } from 'react';
import { getMasterItems, updateMasterItem, createCertificateForMasterItem, updateCertificate } from '../services/masterItemsService';
import api from '../services/api';

export function useMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryTab, setExpiryTab] = useState('all'); // 'all' | 'expired' | 'urgent' | 'valid' | 'in_progress' | 'decommissioned'
  const [selectedDetailDoc, setSelectedDetailDoc] = useState(null);

  // Global & Multi-Parameter Dropdown Filter States
  const [filterKategori, setFilterKategori] = useState('All');
  const [filterUnitPabrik, setFilterUnitPabrik] = useState('All');
  const [filterStatusOperasional, setFilterStatusOperasional] = useState('All');
  const [filterRentangHari, setFilterRentangHari] = useState('All');
  const [customUrgentDays, setCustomUrgentDays] = useState(30);

  // Pop-up Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Drawer Sidebar State for Riwayat Perpanjangan
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Modal States for Action & Upload Renewal
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalMode, setModalMode] = useState('action');
  const [resertifikasiNotes, setResertifikasiNotes] = useState('');

  // Upload Form & OCR Simulation States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  
  const [allCertificates, setAllCertificates] = useState([]);
  const [countTanpaSertifikat, setCountTanpaSertifikat] = useState(0);
  const [activeReminders, setActiveReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Action Modals State
  const [isDecommissionedModalOpen, setIsDecommissionedModalOpen] = useState(false);
  const [isAktifkanModalOpen, setIsAktifkanModalOpen] = useState(false);
  const [isRenewConfirmModalOpen, setIsRenewConfirmModalOpen] = useState(false);
  const [isCancelRenewModalOpen, setIsCancelRenewModalOpen] = useState(false);
  const [activeItemForAction, setActiveItemForAction] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // OCR Extracted & Editable Fields
  const [newCertNumber, setNewCertNumber] = useState('');
  const [instansi, setInstansi] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems();
      
      const exemptCount = data.filter(item => item.documentStatus === 'EXEMPT').length;
      setCountTanpaSertifikat(exemptCount);
      
      const parseCustomDate = (dStr) => {
        if (!dStr || dStr === '-' || dStr === '2030-01-01' || String(dStr).trim() === '') return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return new Date(dStr);
        
        // 4-digit year: DD/MM/YYYY or MM/DD/YYYY
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dStr)) {
          const parts = dStr.split('/');
          const p0 = parseInt(parts[0]);
          const p1 = parseInt(parts[1]);
          const y = parseInt(parts[2]);
          if (p0 > 12) return new Date(y, p1 - 1, p0);
          if (p1 > 12) return new Date(y, p0 - 1, p1);
          return new Date(y, p1 - 1, p0);
        }
        
        // 2-digit year: M/D/YY or DD/MM/YY
        if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dStr)) {
          const parts = dStr.split('/');
          const p0 = parseInt(parts[0]);
          const p1 = parseInt(parts[1]);
          const rawY = parseInt(parts[2]);
          const y = (rawY > 30 ? 1900 : 2000) + rawY;
          if (p0 > 12) return new Date(y, p1 - 1, p0);
          if (p1 > 12) return new Date(y, p0 - 1, p1);
          return new Date(y, p1 - 1, p0);
        }
        
        const d = new Date(dStr);
        return isNaN(d.getTime()) ? null : d;
      };

      const calcDiff = (dStr) => {
         const expiry = parseCustomDate(dStr);
         if (!expiry) return null;
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         expiry.setHours(0, 0, 0, 0);
         return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      };

      const calcStatus = (hari) => {
         if (hari === null) return 'valid';
         if (hari <= 0) return 'expired';
         if (hari <= 60) return 'urgent';
         return 'valid';
      };

      const getWfStatus = (st, docSt, certSt, hasCert) => {
         const lowerSt = (st || '').toLowerCase();
         const lowerCertSt = (certSt || '').toLowerCase();
         if (lowerCertSt === 'decommissioned' || lowerCertSt === 'decommissioned' || lowerCertSt === 'dicabut') return 'decommissioned';
         if (lowerCertSt === 'perpanjang' || lowerCertSt === 'perpanjangan' || lowerCertSt === 'in progress' || lowerCertSt === 'in_progress') return 'in_progress';

         if (lowerSt === 'decommissioned' || lowerSt === 'decommissioned') return 'decommissioned';
         if (lowerSt === 'perpanjang' || lowerSt === 'perpanjangan' || lowerSt === 'in progress' || lowerSt === 'in_progress') return 'in_progress';
         if (docSt === 'EXEMPT' && !hasCert) return 'exempt';
         return 'completed';
      };

      const formatStatus = (rawStatus, catKey, certSt) => {
        const lowerCertSt = (certSt || '').toLowerCase();
        if (lowerCertSt === 'decommissioned' || lowerCertSt === 'decommissioned' || lowerCertSt === 'dicabut') return 'Decommissioned';
        if (lowerCertSt === 'perpanjang' || lowerCertSt === 'perpanjangan' || lowerCertSt === 'in progress') return 'Perpanjang';

        if (catKey === 'perizinan-proyek') {
          if (rawStatus === 'Spare') return 'Selesai';
          if (rawStatus === 'Rusak') return 'Ditunda';
        }
        return rawStatus || 'Aktif';
      };

      const getTimestamp = (dateStr) => {
        if (!dateStr || dateStr === '-') return 0;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
          const parts = dateStr.split('/');
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
        }
        const t = new Date(dateStr).getTime();
        return isNaN(t) ? 0 : t;
      };

      const flattened = [];
      data.forEach(item => {
        if (item.documentStatus === 'PENDING_DOC') return; // Skip staging items

        const certs = item.certificates || [];

        const formatToDDMMYYYY = (rawDateStr) => {
          if (!rawDateStr || rawDateStr === '-') return '-';
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDateStr)) return rawDateStr;
          try {
            const dObj = new Date(rawDateStr);
            if (!isNaN(dObj.getTime())) {
              const dd = String(dObj.getDate()).padStart(2, '0');
              const mm = String(dObj.getMonth() + 1).padStart(2, '0');
              const yyyy = dObj.getFullYear();
              return `${dd}/${mm}/${yyyy}`;
            }
          } catch (_) {}
          return rawDateStr;
        };

        let meta = {};
        try {
          if (item.keterangan && item.keterangan.startsWith('{')) {
            meta = JSON.parse(item.keterangan);
          }
        } catch (_) {}

        const catKeyLower = String(item.categoryKey || '').toLowerCase();
        const isAdm = catKeyLower === 'administrasi-lainnya' || catKeyLower === 'sertifikat-ciptaan' || catKeyLower === 'hak-cipta' || catKeyLower === 'hak-paten' || catKeyLower.includes('administrasi');

        let resolvedJenis = meta.additionalEntities?.find(e => e.key.toUpperCase() === 'JENIS PERALATAN PABRIK')?.value || meta.jenisPeralatan || meta.tipe || item.jenisPeralatan;
        if (isAdm) {
          const checkStr = `${resolvedJenis || ''} ${item.title || ''} ${item.description || ''} ${meta.tipe || ''}`.toLowerCase();
          resolvedJenis = checkStr.includes('paten') ? 'Hak Paten' : 'Hak Cipta';
        } else if (!resolvedJenis) {
          resolvedJenis = item.categoryKey === 'peralatan-pabrik' ? 'Peralatan Pabrik' : (item.categoryKey || 'Peralatan');
        }

        const mapToRow = (targetCert) => {
          const rawTerbit = targetCert?.terbit || item.issueDate || '-';
          const terbitVal = formatToDDMMYYYY(rawTerbit);
          
          const rawExpired = targetCert?.expired || item.expiryDate || '-';
          const expiredVal = formatToDDMMYYYY(rawExpired);
          const hari = calcDiff(rawExpired && rawExpired !== '2030-01-01' && rawExpired !== '-' ? rawExpired : '-');

          let displayName = item.title || '-';
          if (item.categoryKey === 'perizinan-proyek' && targetCert?.namaSertifikat && targetCert.namaSertifikat !== 'Tanpa Sertifikat') {
            displayName = `${targetCert.namaSertifikat} (${item.title || item.code || item.id})`;
          }

          flattened.push({
            id: targetCert?.id || item.id,
            MasterId: item.id,
            no: flattened.length + 1,
            categoryKey: isAdm ? 'administrasi-lainnya' : (item.categoryKey || 'Lainnya'),
            kategoriDokumen: isAdm ? 'Perizinan Administrasi Lainnya' : (item.categoryKey || 'Lainnya'),
            jenisItem: resolvedJenis,
            jenisPeralatan: resolvedJenis,
            merekItem: displayName,
            tipe: item.categoryKey || '-',
            code: item.code || item.id,
            nomorSeri: item.code || '-',
            nomorSeriTipe: item.code || '-',
            kapasitas: '-',
            lokasi: item.unitLocation || 'Umum',
            unitPabrik: item.unitLocation || 'Umum',
            status: formatStatus(item.status, item.categoryKey, targetCert?.status),
            statusOperasional: formatStatus(item.status, item.categoryKey, targetCert?.status),
            documentStatus: item.documentStatus || item.document_status || (certs.length > 0 ? 'COMPLETED' : 'PENDING_DOC'),
            exemptionNote: item.exemptionNote || null,
            tglTerbit: terbitVal,
            tglExpired: expiredVal,
            sisaHari: hari,
            statusLegal: calcStatus(hari),
            noSertifikat: targetCert?.noSertifikat || targetCert?.noIzin || (!targetCert && (item.documentStatus === 'EXEMPT' || item.documentStatus === 'PENDING_DOC') ? 'Tanpa Sertifikat' : '-'),
            nomorSertifikat: targetCert?.noSertifikat || targetCert?.noIzin || (!targetCert && (item.documentStatus === 'EXEMPT' || item.documentStatus === 'PENDING_DOC') ? 'Tanpa Sertifikat' : '-'),
            jenisSertifikat: targetCert?.jenisSertifikat || item.categoryKey || '-',
            namaSertifikat: targetCert?.namaSertifikat || item.namaSertifikat || '-',
            instansiPenerbit: targetCert?.instansi || '-',
            nomorSK: '-',
            keterangan: item.description || '-',
            riwayatPerpanjangan: certs,
            primaryCertId: targetCert?.id || null,
            workflowStatus: getWfStatus(item.status, item.documentStatus || item.document_status || 'PENDING_DOC', targetCert?.status, !!targetCert),
            notificationSetting: item.notificationSetting || null,
            reminderEnabled: item.notificationSetting ? item.notificationSetting.isEnabled : true,
            rawItem: item
          });
        };

        if (certs.length === 0) {
          mapToRow(null);
        } else {
          const validCerts = certs.filter(cert => cert.status !== 'EXEMPT' && cert.status !== 'Diarsipkan');
          if (validCerts.length === 0) {
            mapToRow(null);
          } else {
            if (item.categoryKey === 'peralatan-pabrik') {
              // Peralatan Pabrik: Kelompokkan semua sertifikat dan ambil yang teraktif/terbaru saja
              const sortedCerts = validCerts.slice().sort((a, b) => {
                const tA = getTimestamp(a.expired);
                const tB = getTimestamp(b.expired);
                if (tA !== tB) return tB - tA; // Highest expiration date first

                const aActive = ['aktif', 'active'].includes((a.status || '').toLowerCase()) || (a.status || '').toLowerCase().includes('perpanjang') || (a.status || '').toLowerCase().includes('proses');
                const bActive = ['aktif', 'active'].includes((b.status || '').toLowerCase()) || (b.status || '').toLowerCase().includes('perpanjang') || (b.status || '').toLowerCase().includes('proses');
                if (aActive !== bActive) return aActive ? -1 : 1;
                
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
              });
              mapToRow(sortedCerts[0]);
            } else {
              // Perizinan Aset, Produk, Proyek:
              // Setiap sertifikat anak (child) yang aktif adalah dokumen mandiri.
              // Render SETIAP sertifikat yang valid (tidak diarsipkan) sebagai baris terpisah secara penuh!
              validCerts.forEach(cert => {
                mapToRow(cert);
              });
            }
          }
        }
      });
      setAllCertificates(flattened);
      try {
        const reminderRes = await api.get('/master-items/reminders/active');
        setActiveReminders(reminderRes.data);
      } catch (err) {
        console.error("Failed to fetch active reminders in monitoring:", err);
      }
    } catch (err) {
      console.error("Failed to fetch MonitoringSertifikasi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const uniqueKategori = useMemo(() => ['All', ...new Set(allCertificates.map(i => i.kategoriDokumen || i.categoryKey || ''))], [allCertificates]);
  const uniqueUnitPabrik = useMemo(() => ['All', ...new Set(allCertificates.map(i => i.unitPabrik || i.unit || i.lokasi || ''))], [allCertificates]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterKategori !== 'All') count++;
    if (filterUnitPabrik !== 'All') count++;
    if (filterStatusOperasional !== 'All') count++;
    if (filterRentangHari !== 'All') count++;
    if (searchTerm !== '') count++;
    return count;
  }, [filterKategori, filterUnitPabrik, filterStatusOperasional, filterRentangHari, searchTerm]);

  const filteredCertificates = useMemo(() => {
    return allCertificates.filter((item) => {
      const merekStr = (item.merekItem || item.title || item.judulCiptaan || '');
      const jenisStr = (item.jenisItem || item.jenisPeralatan || item.jenisCiptaan || '');
      const seriStr = (item.nomorSeriTipe || item.nomorSeri || item.code || '');
      const katStr = (item.kategoriDokumen || item.categoryKey || '');
      const certStr = (item.certificateNo || item.noSertifikat || '');
      const unitStr = (item.unitPabrik || item.unit || item.lokasi || '');

      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        merekStr.toLowerCase().includes(searchLower) ||
        jenisStr.toLowerCase().includes(searchLower) ||
        seriStr.toLowerCase().includes(searchLower) ||
        katStr.toLowerCase().includes(searchLower) ||
        certStr.toLowerCase().includes(searchLower) ||
        unitStr.toLowerCase().includes(searchLower);

      const matchesKategori = filterKategori === 'All' || katStr === filterKategori;
      const matchesUnitPabrik = filterUnitPabrik === 'All' || unitStr === filterUnitPabrik;
      const matchesStatusFisik = filterStatusOperasional === 'All' || item.statusOperasional === filterStatusOperasional || item.status === filterStatusOperasional;

      let matchesRentangHari = true;
      if (filterRentangHari === 'today') {
        matchesRentangHari = item.sisaHari !== null && item.sisaHari === 0;
      } else if (filterRentangHari === '7') {
        matchesRentangHari = item.sisaHari !== null && item.sisaHari > 0 && item.sisaHari <= 7;
      } else if (filterRentangHari === 'expired') {
        matchesRentangHari = item.sisaHari !== null && item.sisaHari <= 0;
      } else if (filterRentangHari === 'urgent') {
        matchesRentangHari = item.sisaHari !== null && item.sisaHari > 0 && item.sisaHari <= (parseInt(customUrgentDays) || 30);
      } else if (filterRentangHari === '60') {
        matchesRentangHari = item.sisaHari !== null && item.sisaHari > 0 && item.sisaHari <= 60;
      } else if (filterRentangHari === '90') {
        matchesRentangHari = item.sisaHari !== null && item.sisaHari > 0 && item.sisaHari <= 90;
      } else if (filterRentangHari === '180') {
        matchesRentangHari = item.sisaHari !== null && item.sisaHari > 0 && item.sisaHari <= 180;
      } else if (filterRentangHari === '365') {
        matchesRentangHari = item.sisaHari !== null && item.sisaHari > 0 && item.sisaHari <= 365;
      }

      let matchesTab = true;
      if (expiryTab === 'expired') {
        matchesTab = item.sisaHari !== null && item.sisaHari <= 0 && item.workflowStatus !== 'decommissioned';
      } else if (expiryTab === 'urgent') {
        matchesTab = item.sisaHari !== null && item.sisaHari > 0 && item.sisaHari <= (parseInt(customUrgentDays) || 30) && item.workflowStatus !== 'decommissioned';
      } else if (expiryTab === 'valid') {
        matchesTab = (item.sisaHari === null || item.sisaHari > (parseInt(customUrgentDays) || 30)) && item.workflowStatus !== 'decommissioned';
      } else if (expiryTab === 'in_progress') {
        matchesTab = item.workflowStatus === 'in_progress';
      } else if (expiryTab === 'decommissioned') {
        matchesTab = item.workflowStatus === 'decommissioned';
      } else if (expiryTab === 'exempt') {
        matchesTab = item.workflowStatus === 'exempt';
      } else if (expiryTab === 'has_cert') {
        matchesTab = item.workflowStatus !== 'exempt';
      }

      return matchesSearch && matchesKategori && matchesUnitPabrik && matchesStatusFisik && matchesRentangHari && matchesTab;
    });

    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'tglExpired') {
          const daysA = a.sisaHari;
          const daysB = b.sisaHari;
          if (daysA === null && daysB === null) return 0;
          if (daysA === null) return 1;
          if (daysB === null) return -1;
          return sortOrder === 'asc' ? daysA - daysB : daysB - daysA;
        }

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [allCertificates, searchTerm, filterKategori, filterUnitPabrik, filterStatusOperasional, filterRentangHari, customUrgentDays, expiryTab, sortKey, sortOrder]);

  const handleQuickRenew = (id) => {
    const item = allCertificates.find(c => c.id === id);
    if (item) {
      setActiveItemForAction(item);
      setIsRenewConfirmModalOpen(true);
    }
  };

  const confirmQuickRenew = async () => {
    if (!activeItemForAction) return;
    setIsProcessingAction(true);
    try {
      const targetId = activeItemForAction.MasterId || activeItemForAction.id;
      if (activeItemForAction.primaryCertId) {
        await updateCertificate(activeItemForAction.primaryCertId, { status: 'Perpanjang' });
      }
      if (activeItemForAction.categoryKey === 'peralatan-pabrik') {
        await updateMasterItem(targetId, { status: 'Perpanjang' });
      }
      await fetchMonitoringData();
      setIsRenewConfirmModalOpen(false);
    } catch (err) {
      console.error('Failed to update status to Perpanjang:', err);
      alert('Gagal mengajukan perpanjangan: ' + (err.message || 'Error'));
    } finally {
      setIsProcessingAction(false);
      setActiveItemForAction(null);
    }
  };

  const handleQuickDecommission = (id) => {
    const item = allCertificates.find(c => c.id === id);
    if (item) {
      setActiveItemForAction(item);
      setIsDecommissionedModalOpen(true);
    }
  };

  const confirmQuickDecommission = async () => {
    if (!activeItemForAction) return;
    setIsProcessingAction(true);
    try {
      const targetId = activeItemForAction.MasterId || activeItemForAction.id;
      if (activeItemForAction.primaryCertId) {
        await updateCertificate(activeItemForAction.primaryCertId, { status: 'Decommissioned' });
      }
      if (activeItemForAction.categoryKey === 'peralatan-pabrik') {
        await updateMasterItem(targetId, { status: 'Decommissioned' });
      }
      await fetchMonitoringData();
      setIsDecommissionedModalOpen(false);
    } catch (err) {
      console.error('Failed to update status to Decommissioned:', err);
      alert('Gagal mengubah status menjadi Decommissioned: ' + (err.message || 'Error'));
    } finally {
      setIsProcessingAction(false);
      setActiveItemForAction(null);
    }
  };

  const handleCancelDecommissioned = (id) => {
    const item = allCertificates.find(c => c.id === id);
    if (item) {
      setActiveItemForAction(item);
      setIsAktifkanModalOpen(true);
    }
  };

  const confirmCancelDecommissioned = async () => {
    if (!activeItemForAction) return;
    setIsProcessingAction(true);
    try {
      const targetId = activeItemForAction.MasterId || activeItemForAction.id;
      if (activeItemForAction.primaryCertId) {
        await updateCertificate(activeItemForAction.primaryCertId, { status: 'Aktif' });
      }
      if (activeItemForAction.categoryKey === 'peralatan-pabrik') {
        await updateMasterItem(targetId, { status: 'Aktif' });
      }
      await fetchMonitoringData();
      setIsAktifkanModalOpen(false);
    } catch (err) {
      console.error('Failed to update status to Aktif:', err);
      alert('Gagal mengaktifkan kembali: ' + (err.message || 'Error'));
    } finally {
      setIsProcessingAction(false);
      setActiveItemForAction(null);
    }
  };

  const handleCancelAction = (id) => {
    const item = allCertificates.find(c => c.id === id);
    if (item) {
      setActiveItemForAction(item);
      setIsCancelRenewModalOpen(true);
    }
  };

  const confirmCancelRenew = async () => {
    if (!activeItemForAction) return;
    setIsProcessingAction(true);
    try {
      const targetId = activeItemForAction.MasterId || activeItemForAction.id;
      if (activeItemForAction.primaryCertId) {
        await updateCertificate(activeItemForAction.primaryCertId, { status: 'Aktif' });
      }
      if (activeItemForAction.categoryKey === 'peralatan-pabrik') {
        await updateMasterItem(targetId, { status: 'Aktif' });
      }
      await fetchMonitoringData();
      setIsCancelRenewModalOpen(false);
    } catch (err) {
      console.error('Failed to cancel perpanjangan:', err);
      alert('Gagal membatalkan perpanjangan: ' + (err.message || 'Error'));
    } finally {
      setIsProcessingAction(false);
      setActiveItemForAction(null);
    }
  };

  const openCompleteModal = (item) => {
    setActiveModalItem(item);
    setModalMode('complete_upload');
    setUploadedFile(null);
    setIsOcrScanning(false);
    setOcrSuccess(false);

    setNewCertNumber(item.certificateNo || item.noSertifikat || '');
    setInstansi(item.instansiPenerbit && item.instansiPenerbit !== '-' ? item.instansiPenerbit : (item.instansi || ''));
    setInspectionDate(item.inspectionDate || "2026-04-10");
    setIssueDate(item.issueDate || "2026-04-15");
    setNewExpiryDate("2028-04-15");
    setResertifikasiNotes(item.keterangan && item.keterangan !== '-' ? item.keterangan : "Perpanjangan selesai. File sertifikat baru telah diunggah dan terverifikasi.");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
  };

  const handleConfirmUploadRenewal = async (e) => {
    e.preventDefault();
    if (!activeModalItem) return;

    try {
      let fileUrl = null;
      if (uploadedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', uploadedFile);
        const uploadRes = await api.post('/document-history/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const uploadJson = uploadRes.data;
        fileUrl = uploadJson?.data?.url || uploadJson?.data?.fileUrl || null;
      }

      const targetId = activeModalItem.MasterId || activeModalItem.id;

      // Extract existing meta to preserve other JSON metadata
      let existingMeta = {};
      try {
        const rawKet = activeModalItem.rawItem?.keterangan || activeModalItem.keterangan;
        if (rawKet && typeof rawKet === 'string' && rawKet.startsWith('{')) {
          existingMeta = JSON.parse(rawKet);
        }
      } catch (_) {}

      const updatedMeta = {
        ...existingMeta,
        keteranganAsli: resertifikasiNotes || existingMeta.keteranganAsli || '-',
        instansi: instansi || activeModalItem.instansiPenerbit || existingMeta.instansi || '',
        noSertifikat: newCertNumber || existingMeta.noSertifikat || '',
      };

      const certPayload = {
        itemId: targetId,
        jenisSertifikat: activeModalItem.jenisSertifikat || activeModalItem.jenisPeralatan || 'Riksa Uji Disnaker',
        namaSertifikat: activeModalItem.namaSertifikat !== '-' ? activeModalItem.namaSertifikat : undefined,
        noSertifikat: newCertNumber || activeModalItem.noSertifikat || `CERT-${Date.now()}`,
        instansi: instansi || activeModalItem.instansiPenerbit || activeModalItem.instansi || undefined,
        keterangan: resertifikasiNotes || undefined,
        status: 'Aktif',
      };
      if (issueDate) certPayload.terbit = issueDate;
      if (newExpiryDate) certPayload.expired = newExpiryDate;
      if (fileUrl) certPayload.fileUrl = fileUrl;

      await createCertificateForMasterItem(certPayload);

      // Archive the old certificate so it drops off the Agenda list
      const oldCertId = activeModalItem.primaryCertId || activeModalItem.id;
      if (oldCertId && oldCertId !== targetId) {
        await updateCertificate(oldCertId, { status: 'Diarsipkan' });
      }

      await updateMasterItem(targetId, {
        status: 'Aktif',
        issueDate: issueDate || activeModalItem.tglTerbit,
        expiryDate: newExpiryDate || activeModalItem.tglExpired,
        keterangan: JSON.stringify(updatedMeta),
        documentStatus: 'COMPLETED'
      });

      await fetchMonitoringData();

      setActiveModalItem(null);
      setUploadedFile(null);
      setNewCertNumber("");
      setInstansi("");
      setInspectionDate("");
      setIssueDate("");
      setNewExpiryDate("");
      setResertifikasiNotes("");
      setOcrSuccess(false);
    } catch (err) {
      console.error("Failed to complete renewal:", err);
      alert("Gagal memproses perpanjangan: " + (err.message || 'Error'));
    }
  };

  const resetFilters = () => {
    setFilterKategori('All');
    setFilterUnitPabrik('All');
    setFilterStatusOperasional('All');
    setFilterRentangHari('All');
    setSearchTerm('');
    setExpiryTab('all');
  };

  const countExpired = allCertificates.filter(c => c.sisaHari !== null && c.sisaHari <= 0 && c.workflowStatus !== 'decommissioned').length;
  const countUrgent = allCertificates.filter(c => c.sisaHari !== null && c.sisaHari > 0 && c.sisaHari <= (parseInt(customUrgentDays) || 30) && c.workflowStatus !== 'decommissioned').length;
  const countValid = allCertificates.filter(c => (c.sisaHari === null || c.sisaHari > 0) && c.workflowStatus !== 'decommissioned' && c.workflowStatus !== 'exempt').length;
  const countInProgress = allCertificates.filter(c => c.workflowStatus === 'in_progress').length;
  const countDecommissioned = allCertificates.filter(c => c.workflowStatus === 'decommissioned').length;
  const countAdaSertifikat = allCertificates.filter(c => c.workflowStatus !== 'decommissioned').length;
  const countTotal = countAdaSertifikat + countTanpaSertifikat;

  const handleExportCSV = (data) => {
    const headers = ['No', 'Kategori', 'Jenis', 'Unit', 'Alat', 'No Seri', 'No Sertifikat', 'Tgl Expired', 'Sisa Hari', 'Status'];
    const rows = data.map((doc, idx) => [
      idx + 1,
      doc.kategoriDokumen || doc.kategori || '-',
      doc.jenisItem || '-',
      doc.unitPabrik || '-',
      doc.merekItem || doc.title || '-',
      doc.nomorSeriTipe || '-',
      doc.nomorSertifikat || '-',
      doc.tglExpired !== '-' ? doc.tglExpired : '-',
      doc.sisaHari !== null ? doc.sisaHari : '-',
      doc.workflowStatus || '-',
    ]);
    const csvContent = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monitoring_sertifikasi_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monitoring_sertifikasi_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };


  return {
    searchTerm, setSearchTerm,
    expiryTab, setExpiryTab,
    selectedDetailDoc, setSelectedDetailDoc,
    filterKategori, setFilterKategori,
    filterUnitPabrik, setFilterUnitPabrik,
    filterStatusOperasional, setFilterStatusOperasional,
    filterRentangHari, setFilterRentangHari,
    customUrgentDays, setCustomUrgentDays,
    isFilterModalOpen, setIsFilterModalOpen,
    selectedHistoryItem, setSelectedHistoryItem,
    activeModalItem, setActiveModalItem,
    modalMode, setModalMode,
    resertifikasiNotes, setResertifikasiNotes,
    uploadedFile, setUploadedFile,
    isOcrScanning, setIsOcrScanning,
    ocrSuccess, setOcrSuccess,
    allCertificates, setAllCertificates,
    isLoading, setIsLoading,
    isDecommissionedModalOpen, setIsDecommissionedModalOpen,
    isAktifkanModalOpen, setIsAktifkanModalOpen,
    isRenewConfirmModalOpen, setIsRenewConfirmModalOpen,
    isCancelRenewModalOpen, setIsCancelRenewModalOpen,
    activeItemForAction, setActiveItemForAction,
    isProcessingAction, setIsProcessingAction,
    newCertNumber, setNewCertNumber,
    instansi, setInstansi,
    inspectionDate, setInspectionDate,
    issueDate, setIssueDate,
    newExpiryDate, setNewExpiryDate,
    activeReminders, setActiveReminders,

    sortKey,
    sortOrder,
    toggleSort,

    // Derived states & functions
    fetchMonitoringData,
    uniqueKategori,
    uniqueUnitPabrik,
    activeFilterCount,
    filteredCertificates,
    handleQuickRenew,
    confirmQuickRenew,
    handleQuickDecommission,
    confirmQuickDecommission,
    handleCancelDecommissioned,
    confirmCancelDecommissioned,
    handleCancelAction,
    confirmCancelRenew,
    openCompleteModal,
    handleFileSelect,
    handleConfirmUploadRenewal,
    handleExportCSV,
    handleExportJSON,
    resetFilters,

    // Counts
    counts: { countExpired, countUrgent, countValid, countInProgress, countDecommissioned, countTanpaSertifikat, countAdaSertifikat, countTotal }
  };
}
