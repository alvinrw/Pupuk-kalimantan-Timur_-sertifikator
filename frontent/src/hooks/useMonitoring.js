import { useState, useEffect, useMemo } from 'react';
import { getMasterItems, updateMasterItem, createCertificateForMasterItem } from '../services/masterItemsService';

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
  const [isLoading, setIsLoading] = useState(true);

  // Quick Action Modals State
  const [isAfkirModalOpen, setIsAfkirModalOpen] = useState(false);
  const [isAktifkanModalOpen, setIsAktifkanModalOpen] = useState(false);
  const [isRenewConfirmModalOpen, setIsRenewConfirmModalOpen] = useState(false);
  const [isCancelRenewModalOpen, setIsCancelRenewModalOpen] = useState(false);
  const [activeItemForAction, setActiveItemForAction] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // OCR Extracted & Editable Fields
  const [newCertNumber, setNewCertNumber] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems();
      
      const calcDiff = (dStr) => {
         if (!dStr || dStr === '-' || dStr === '2030-01-01' || dStr.trim() === '') return null;
         const expiry = new Date(dStr);
         if (isNaN(expiry.getTime())) return null;
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

      const getWfStatus = (st, docSt) => {
         const lowerSt = (st || '').toLowerCase();
         if (lowerSt === 'afkir' || lowerSt === 'decommissioned') return 'decommissioned';
         if (lowerSt === 'perpanjang' || lowerSt === 'perpanjangan' || lowerSt === 'in progress' || lowerSt === 'in_progress') return 'in_progress';
         if (docSt === 'EXEMPT') return 'exempt';
         return 'completed';
      };

      const flattened = [];
      data.forEach(item => {
        if (item.documentStatus === 'PENDING_DOC') return; // Skip staging items

        const certs = item.certificates || [];
        const activeCerts = certs.filter(c => c.status === 'Aktif' || c.status === 'Active' || !c.status);

        let primaryCert = null;
        if (activeCerts.length > 0) {
          primaryCert = activeCerts.slice().sort((a, b) => {
            const dA = new Date(a.expired && a.expired !== '-' ? a.expired : '1970-01-01').getTime();
            const dB = new Date(b.expired && b.expired !== '-' ? b.expired : '1970-01-01').getTime();
            return dB - dA;
          })[0];
        } else if (certs.length > 0) {
          primaryCert = certs[0];
        }

        const rawExp = primaryCert?.expired || item.expiryDate;
        const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
        const hari = calcDiff(dateVal);

        flattened.push({
          id: item.id,
          MasterId: item.id,
          no: flattened.length + 1,
          categoryKey: item.categoryKey || 'Lainnya',
          kategoriDokumen: item.categoryKey || 'Lainnya',
          jenisItem: item.categoryKey || 'Peralatan',
          jenisPeralatan: item.categoryKey || 'Peralatan',
          merekItem: item.title || '-',
          tipe: item.categoryKey || '-',
          code: item.code || item.id,
          nomorSeri: item.code || '-',
          nomorSeriTipe: item.code || '-',
          kapasitas: '-',
          lokasi: item.unitLocation || 'Umum',
          unitPabrik: item.unitLocation || 'Umum',
          status: item.status || 'Aktif',
          statusOperasional: item.status || 'Aktif',
          documentStatus: item.documentStatus || (certs.length > 0 ? 'COMPLETED' : 'EXEMPT'),
          exemptionNote: item.exemptionNote || null,
          tglTerbit: primaryCert?.terbit || item.createdAt,
          tglExpired: dateVal,
          sisaHari: hari,
          statusLegal: calcStatus(hari),
          nomorSertifikat: item.documentStatus === 'EXEMPT' ? 'Tanpa Sertifikat' : (primaryCert?.noSertifikat || primaryCert?.noIzin || item.code || '-'),
          instansiPenerbit: primaryCert?.instansi || '-',
          nomorSK: '-',
          keterangan: item.description || '-',
          riwayatPerpanjangan: certs,
          workflowStatus: getWfStatus(item.status, item.documentStatus || 'EXEMPT')
        });
      });
      setAllCertificates(flattened);
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
      if (filterRentangHari === 'expired') {
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
      }

      return matchesSearch && matchesKategori && matchesUnitPabrik && matchesStatusFisik && matchesRentangHari && matchesTab;
    });
  }, [allCertificates, searchTerm, filterKategori, filterUnitPabrik, filterStatusOperasional, filterRentangHari, customUrgentDays, expiryTab]);

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
      await updateMasterItem(targetId, { status: 'Perpanjang' });
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
      setIsAfkirModalOpen(true);
    }
  };

  const confirmQuickDecommission = async () => {
    if (!activeItemForAction) return;
    setIsProcessingAction(true);
    try {
      const targetId = activeItemForAction.MasterId || activeItemForAction.id;
      await updateMasterItem(targetId, { status: 'Afkir' });
      await fetchMonitoringData();
      setIsAfkirModalOpen(false);
    } catch (err) {
      console.error('Failed to update status to Afkir:', err);
      alert('Gagal mengubah status menjadi Afkir: ' + (err.message || 'Error'));
    } finally {
      setIsProcessingAction(false);
      setActiveItemForAction(null);
    }
  };

  const handleCancelAfkir = (id) => {
    const item = allCertificates.find(c => c.id === id);
    if (item) {
      setActiveItemForAction(item);
      setIsAktifkanModalOpen(true);
    }
  };

  const confirmCancelAfkir = async () => {
    if (!activeItemForAction) return;
    setIsProcessingAction(true);
    try {
      const targetId = activeItemForAction.MasterId || activeItemForAction.id;
      await updateMasterItem(targetId, { status: 'Aktif' });
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
      await updateMasterItem(targetId, { status: 'Aktif' });
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

    setNewCertNumber(item.certificateNo || '');
    setInspectionDate(item.inspectionDate || "2026-04-10");
    setIssueDate(item.issueDate || "2026-04-15");
    setNewExpiryDate("2028-04-15");
    setResertifikasiNotes("Perpanjangan selesai. File sertifikat baru telah diunggah dan terverifikasi oleh OCR.");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsOcrScanning(true);
    setOcrSuccess(false);

    setTimeout(() => {
      const randomCertNum = "500.15.18.2 / " + Math.floor(2000 + Math.random() * 8000) + " / DTKT-2026";
      const todayStr = new Date().toISOString().split('T')[0];
      
      setNewCertNumber(randomCertNum);
      setInspectionDate("2026-04-10");
      setIssueDate(todayStr);
      setNewExpiryDate("2028-04-15");
      
      setIsOcrScanning(false);
      setOcrSuccess(true);
    }, 1200);
  };

  const handleConfirmUploadRenewal = async (e) => {
    e.preventDefault();
    if (!activeModalItem) return;

    if (!uploadedFile) {
      alert("Harap pilih/upload file sertifikat baru terlebih dahulu!");
      return;
    }

    try {
      let fileUrl = null;
      if (uploadedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', uploadedFile);
        const uploadRes = await fetch('http://localhost:3000/api/v1/document-history/upload', {
          method: 'POST',
          body: formDataUpload
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          fileUrl = uploadJson?.data?.url || uploadJson?.data?.fileUrl || null;
        }
      }

      const targetId = activeModalItem.MasterId || activeModalItem.id;

      const certPayload = {
        itemId: targetId,
        jenisSertifikat: activeModalItem.jenisPeralatan || 'Riksa Uji Disnaker',
        noSertifikat: newCertNumber || activeModalItem.noSertifikat || `CERT-${Date.now()}`,
        status: 'Aktif',
      };
      if (issueDate) certPayload.terbit = issueDate;
      if (newExpiryDate) certPayload.expired = newExpiryDate;
      if (fileUrl) certPayload.fileUrl = fileUrl;

      await createCertificateForMasterItem(certPayload);

      await updateMasterItem(targetId, {
        status: 'Aktif',
        issueDate: issueDate || activeModalItem.tglTerbit,
        expiryDate: newExpiryDate || activeModalItem.tglExpired,
      });

      await fetchMonitoringData();

      setActiveModalItem(null);
      setUploadedFile(null);
      setNewCertNumber("");
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
  const countValid = allCertificates.filter(c => (c.sisaHari === null || c.sisaHari > (parseInt(customUrgentDays) || 30)) && c.workflowStatus !== 'decommissioned').length;
  const countInProgress = allCertificates.filter(c => c.workflowStatus === 'in_progress').length;
  const countDecommissioned = allCertificates.filter(c => c.workflowStatus === 'decommissioned').length;

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
    isAfkirModalOpen, setIsAfkirModalOpen,
    isAktifkanModalOpen, setIsAktifkanModalOpen,
    isRenewConfirmModalOpen, setIsRenewConfirmModalOpen,
    isCancelRenewModalOpen, setIsCancelRenewModalOpen,
    activeItemForAction, setActiveItemForAction,
    isProcessingAction, setIsProcessingAction,
    newCertNumber, setNewCertNumber,
    inspectionDate, setInspectionDate,
    issueDate, setIssueDate,
    newExpiryDate, setNewExpiryDate,

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
    handleCancelAfkir,
    confirmCancelAfkir,
    handleCancelAction,
    confirmCancelRenew,
    openCompleteModal,
    handleFileSelect,
    handleConfirmUploadRenewal,
    resetFilters,

    // Counts
    counts: { countExpired, countUrgent, countValid, countInProgress, countDecommissioned }
  };
}
