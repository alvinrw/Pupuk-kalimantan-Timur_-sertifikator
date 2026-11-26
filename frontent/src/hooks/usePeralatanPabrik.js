import toast from 'react-hot-toast';
import { useState, useMemo, useEffect } from 'react';
import { getMasterItems, createMasterItem, resolveMasterItemExemption, createCertificateForMasterItem, updateMasterItem } from '../services/masterItemsService';
import api from '../services/api';

export function usePeralatanPabrik() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterLokasi, setFilterLokasi] = useState('All');
  const [filterUser, setFilterUser] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterHasSertifikat, setFilterHasSertifikat] = useState('All'); // 'All' | 'ada' | 'tidak'

  // Modals & Popovers
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [resolveTargetItem, setResolveTargetItem] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('main'); // 'main' | 'staging'

  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('Tanpa Sertifikat (Massal)');
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  
  const [openActionRowId, setOpenActionRowId] = useState(null);
  const [rowConfirmModalOpen, setRowConfirmModalOpen] = useState(false);
  const [pendingDeleteRowId, setPendingDeleteRowId] = useState(null);

  // Data State
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sortKey, setSortKey] = useState(null); // 'terbit' | 'berakhir'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [sortDateOrder, setSortDateOrder] = useState('desc'); // 'asc' | 'desc' untuk Terbaru/Terlama (createdAt)

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
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

  const formatToDDMMYYYY = (rawDateStr) => {
    if (!rawDateStr || rawDateStr === '-') return '-';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDateStr)) return rawDateStr;
    // Handle ISO format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(rawDateStr)) {
      const parts = rawDateStr.substring(0, 10).split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
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

  // Ganti Target Sertifikat Modal State
  const [reassignCertRowItem, setReassignCertRowItem] = useState(null);
  const [searchTargetItemTerm, setSearchTargetItemTerm] = useState('');
  const [selectedNewTargetItem, setSelectedNewTargetItem] = useState(null);

  const [allColumns, setAllColumns] = useState([]);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState([]);

  const loadColumns = async () => {
    try {
      const res = await api.get('/column-configs/peralatan-pabrik?t=' + new Date().getTime());
      const fetchedCols = res.data || [];
      const filteredCols = fetchedCols.filter(c => c.fieldKey !== 'certCount' && c.fieldKey !== 'instansi' && c.fieldKey !== 'keterangan');
      const cols = filteredCols.map(c => ({
        key: c.fieldKey,
        label: c.fieldKey === 'title' ? 'ALAT' : c.label,
        isCustom: c.isCustom,
        type: c.type
      }));
      setAllColumns(cols);
      const visible = filteredCols.filter(c => c.isVisible).map(c => c.fieldKey);
      setVisibleColumnKeys(visible);
    } catch (err) {
      console.error("Failed to load columns config in usePeralatanPabrik:", err);
      const defaultCols = [
        { key: "no", label: "NO." },
        { key: "title", label: "ALAT" },
        { key: "code", label: "NOMOR SERI" },
        { key: "jenisPeralatan", label: "JENIS PERALATAN PABRIK" },
        { key: "unitLocation", label: "LOKASI" },
        { key: "user", label: "PENANGGUNG JAWAB" },
        { key: "terbit", label: "TANGGAL TERBIT" },
        { key: "berakhir", label: "TANGGAL EXPIRED" },
        { key: "status", label: "STATUS" },
      ];
      setAllColumns(defaultCols);
      setVisibleColumnKeys(defaultCols.map(c => c.key));
    }
  };


  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems('peralatan-pabrik');
      
      const mapped = data.map(item => {
        const certs = item.certificates || [];
        const activeCerts = certs.filter(c => {
          const s = (c.status || '').toLowerCase();
          return s === 'aktif' || s === 'active' || s.includes('perpanjang') || s.includes('proses') || !c.status;
        });

        let primaryCert = null;
        if (activeCerts.length > 0) {
          primaryCert = activeCerts.slice().sort((a, b) => {
            const dA = getTimestamp(a.expired);
            const dB = getTimestamp(b.expired);
            if (dA !== dB) return dB - dA;
            const hasPdfA = !!a.fileUrl;
            const hasPdfB = !!b.fileUrl;
            if (hasPdfA !== hasPdfB) return hasPdfB ? 1 : -1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          })[0];
        } else if (certs.length > 0) {
          primaryCert = certs[0];
        }

        let meta = {};
        try {
          if (item.keterangan && item.keterangan.startsWith('{')) {
            meta = JSON.parse(item.keterangan);
          } else {
            meta = { keteranganAsli: item.keterangan };
          }
        } catch (e) {
          meta = { keteranganAsli: item.keterangan };
        }

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

        const noCert = primaryCert?.noSertifikat || primaryCert?.noIzin || meta.noSertifikat || (item.documentStatus === 'EXEMPT' ? 'Tanpa Sertifikat' : '-');

        const rawTerbit = primaryCert?.terbit || item.issueDate || '-';
        const terbitVal = formatToDDMMYYYY(rawTerbit);
        
        const rawExpired = primaryCert?.expired || item.expiryDate || '-';
        const expiredVal = formatToDDMMYYYY(rawExpired);

        return {
          id: item.id,
          MasterId: item.id,
          categoryKey: item.categoryKey,
          title: item.title,
          code: item.code,
          unitLocation: item.unitLocation,
          jenisPeralatan: meta.additionalEntities?.find(e => e.key.toUpperCase() === 'JENIS PERALATAN PABRIK')?.value || meta.jenisPeralatan || meta.tipe || item.jenisPeralatan || item.jenisItem || item.kategoriDokumen || item.title || 'Unknown',
          merekItem: item.title || item.code || '-',
          tipe: meta.tipe || '-',
          nomorSeri: meta.nomorSeri || item.code || '-',
          lokasi: item.unitLocation || 'Umum',
          user: meta.penanggungJawab || 'Umum',
          status: item.status || 'Aktif',
          documentStatus: item.documentStatus || item.document_status || (certs.length > 0 ? 'COMPLETED' : 'PENDING_DOC'),
          exemptionNote: item.exemptionNote || null,
          namaSertifikat: primaryCert?.namaSertifikat || primaryCert?.jenisSertifikat || meta.namaSertifikat || '-',
          noSertifikat: noCert,
          terbit: terbitVal,
          berakhir: expiredVal,
          notificationSetting: item.notificationSetting || null,
          reminderEnabled: item.notificationSetting ? item.notificationSetting.isEnabled : true,
          keterangan: primaryCert?.keterangan || meta.keteranganAsli || '-',
          instansi: primaryCert?.instansi || primaryCert?.issuer || meta.instansi || '-',
          fileUrl: primaryCert?.fileUrl || null,
          hasPdf: !!primaryCert?.fileUrl,
          imageUrl: item.imageUrl || null,
          certificates: certs,
          validationStatus: item.validationStatus || 'NEW',
          validationErrors: item.validationErrors || null,
          createdAt: item.createdAt || null,
          additionalEntities: meta.additionalEntities || [],
          rawKeterangan: item.keterangan
        };
      });

      setEquipmentList(mapped);

      // Auto-update detailModalItem using functional updater to avoid stale closure
      // (Hanya update jika masih ada item terbuka, tidak akan membatalkan back)
      setDetailModalItem(prev => {
        if (!prev) return null; // Jika sudah di-null-kan oleh tombol back, jangan kembalikan
        const updated = mapped.find(x => x.id === prev.id);
        return updated || prev;
      });
    } catch (err) {
      console.error("Failed to fetch PeralatanPabrik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadColumns();
    loadData();
  }, []);

  const handleBulkExempt = async () => {
    if (selectedStagingIds.length === 0 || !bulkExemptNote.trim()) return;
    try {
      setIsSubmittingBulkExempt(true);
      for (const id of selectedStagingIds) {
        await resolveMasterItemExemption(id, bulkExemptNote.trim());
      }
      setSelectedStagingIds([]);
      setBulkExemptModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal melakukan bulk action.");
    } finally {
      setIsSubmittingBulkExempt(false);
    }
  };

  const toggleSelectStaging = (id) => {
    setSelectedStagingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllStaging = (currentRows) => {
    if (selectedStagingIds.length === currentRows.length && currentRows.length > 0) {
      setSelectedStagingIds([]);
    } else {
      setSelectedStagingIds(currentRows.map(r => r.parentItem.id || r.parentItem.MasterId));
    }
  };

  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map(c => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  const getRowStatusStyle = (item) => {
    const statusStr = (item.status || '').toLowerCase();
    const workflowStr = (item.workflowStatus || '').toLowerCase();
    const docStatusStr = (item.documentStatus || '').toLowerCase();
    
    if (statusStr === 'decommissioned' || statusStr === 'decommissioned' || workflowStr === 'decommissioned') {
      return 'bg-[#0f172a] text-white hover:bg-slate-900 border-b border-slate-700';
    }

    let isExpired = statusStr === 'expired';
    let isPerpanjang = statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'in_progress' || workflowStr === 'in_progress' || docStatusStr === 'in_progress';

    if (isPerpanjang) return 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border-b border-amber-200';

    if (item.documentStatus === 'PENDING_DOC') {
      return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
    }

    if (item.berakhir && item.berakhir !== '-') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let expDate;
      // Handle DD/MM/YYYY format (format Indonesia yang dipakai di sistem ini)
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(item.berakhir)) {
        const parts = item.berakhir.split('/');
        expDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        expDate = new Date(item.berakhir);
      }
      expDate.setHours(0, 0, 0, 0);

      if (!isNaN(expDate.getTime())) {
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) isExpired = true;
      }
    } else {
      isExpired = true;
    }

    if (isExpired) return 'bg-rose-50/90 text-rose-950 hover:bg-rose-100 border-b border-rose-200';
    return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
  };

  const uniqueJenis = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.jenisPeralatan).filter(Boolean))], [equipmentList]);
  const uniqueLokasi = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.lokasi).filter(Boolean))], [equipmentList]);
  const uniqueUser = useMemo(() => ['All', ...new Set(equipmentList.map(i => i.user).filter(Boolean))], [equipmentList]);

  const pendingCount = useMemo(() => {
    return equipmentList.filter(i => i.documentStatus === 'PENDING_DOC').length;
  }, [equipmentList]);

  const filteredData = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchesTab = activeMainTab === 'staging'
        ? item.documentStatus === 'PENDING_DOC'
        : item.documentStatus !== 'PENDING_DOC';

      const searchLower = (searchTerm || '').toLowerCase();
      const matchesSearch =
        (item.jenisPeralatan || '').toLowerCase().includes(searchLower) ||
        (item.merekItem || '').toLowerCase().includes(searchLower) ||
        (item.tipe || '').toLowerCase().includes(searchLower) ||
        (item.nomorSeri || '').toLowerCase().includes(searchLower) ||
        (item.noSertifikat || '').toLowerCase().includes(searchLower);

      const matchesJenis = filterJenis === 'All' || item.jenisPeralatan === filterJenis;
      const matchesLokasi = filterLokasi === 'All' || item.lokasi === filterLokasi;
      const matchesUser = filterUser === 'All' || item.user === filterUser;
      let matchesStatus = false;
      if (filterStatus === 'All') {
        matchesStatus = true;
      } else {
        const s = (item.status || '').toLowerCase();
        let isExp = s === 'expired';
        if (s === 'aktif' && item.berakhir && item.berakhir !== '-') {
          const tEnd = getTimestamp(item.berakhir);
          const today = new Date();
          today.setHours(0,0,0,0);
          if (tEnd > 0 && tEnd < today.getTime()) isExp = true;
        }

        if (filterStatus === 'Expired') {
          matchesStatus = isExp;
        } else if (filterStatus === 'Non-aktif') {
          matchesStatus = s === 'decommissioned' || s === 'non-aktif' || s === 'afkir' || s === 'rusak' || s === 'rusak (out of service)' || s.includes('non aktif');
        } else if (filterStatus === 'Perpanjang') {
          matchesStatus = s.includes('perpanjang') || s === 'in progress' || s === 'in_progress' || s === 'proses' || item.documentStatus === 'in_progress';
        } else if (filterStatus === 'Aktif') {
          matchesStatus = (s === 'aktif' || s === 'active') && !isExp;
        } else {
          matchesStatus = item.status === filterStatus;
        }
      }
      const matchesHasSertifikat = filterHasSertifikat === 'All'
        ? true
        : filterHasSertifikat === 'ada'
        ? (item.documentStatus === 'COMPLETED' && !!item.fileUrl)
        : filterHasSertifikat === 'tidak'
        ? item.documentStatus === 'EXEMPT'
        : (item.documentStatus === 'PENDING_DOC' || (item.documentStatus === 'COMPLETED' && !item.fileUrl));

      return matchesTab && matchesSearch && matchesJenis && matchesLokasi && matchesUser && matchesStatus && matchesHasSertifikat;
    });
  }, [equipmentList, activeMainTab, searchTerm, filterJenis, filterLokasi, filterUser, filterStatus, filterHasSertifikat]);

  const sortedFilteredData = useMemo(() => {
    let result = [...filteredData];

    // 1. Sort by createdAt (Terbaru / Terlama)
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return sortDateOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    // 2. Sort by specific key if active
    if (sortKey) {
      result.sort((a, b) => {
        const valA = sortKey === 'terbit' ? (a.terbit || a.issueDate) : (a.berakhir || a.expiryDate);
        const valB = sortKey === 'terbit' ? (b.terbit || b.issueDate) : (b.berakhir || b.expiryDate);
        
        const tA = getTimestamp(valA);
        const tB = getTimestamp(valB);
        
        if (tA === 0 && tB === 0) return 0;
        if (tA === 0) return 1;
        if (tB === 0) return -1;
        
        return sortOrder === 'asc' ? tA - tB : tB - tA;
      });
    }
    
    return result;
  }, [filteredData, sortKey, sortOrder, sortDateOrder]);

  const expandedRows = useMemo(() => {
    const rows = [];
    sortedFilteredData.forEach((item) => {
      let terbitVal = item.terbit || item.issueDate || '-';
      let berakhirVal = item.berakhir || item.expiryDate || '-';
      let statusVal = item.status || 'Aktif';

      if (statusVal.toLowerCase() === 'aktif' && berakhirVal !== '-') {
        const tEnd = getTimestamp(berakhirVal);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (tEnd > 0 && tEnd < today.getTime()) {
          statusVal = 'Expired';
        }
      }

      rows.push({
        rowId: `${item.id}-primary`,
        parentItem: item,
        isLinked: false,
        noSertifikat: item.noSertifikat || item.certificateNo || '-',
        jenisPeralatan: item.jenisPeralatan || item.jenisItem || 'Peralatan Pabrik',
        tanggalInspeksi: item.tanggalInspeksi || item.issueDate || '-',
        terbit: terbitVal,
        berakhir: berakhirVal,
        keterangan: item.keterangan || item.user || 'Instansi Terkait',
        status: statusVal,
        namaSertifikat: item.namaSertifikat || '-',
        documentStatus: item.documentStatus,
        exemptionNote: item.exemptionNote,
        hasPdf: item.hasPdf
      });

      if (item.linkedCertificates && Array.isArray(item.linkedCertificates)) {
        const chains = [];
        item.linkedCertificates.forEach(c => {
          const isActive = c.status?.toLowerCase() === 'aktif' || c.status?.toLowerCase() === 'active';
          if (isActive) {
            chains.push({ head: c, history: [] });
          }
        });

        item.linkedCertificates.forEach(c => {
          const isActive = c.status?.toLowerCase() === 'aktif' || c.status?.toLowerCase() === 'active';
          if (!isActive) {
            const jenis = c.jenisSertifikat || 'Sertifikat Terhubung';
            const matchingChain = chains.find(ch => (ch.head.jenisSertifikat || 'Sertifikat Terhubung') === jenis);
            if (matchingChain) {
              matchingChain.history.push(c);
            } else {
              const existingExpiredChain = chains.find(ch => (ch.head.jenisSertifikat || 'Sertifikat Terhubung') === jenis);
              if (existingExpiredChain) {
                const existingDate = new Date(existingExpiredChain.head.terbit || '1970-01-01');
                const newDate = new Date(c.terbit || '1970-01-01');
                if (newDate > existingDate) {
                  existingExpiredChain.history.push(existingExpiredChain.head);
                  existingExpiredChain.head = c;
                } else {
                  existingExpiredChain.history.push(c);
                }
              } else {
                chains.push({ head: c, history: [] });
              }
            }
          }
        });
        const uniqueCerts = chains.map(ch => ch.head);

        uniqueCerts.forEach((lc, idx) => {
          rows.push({
            rowId: `${item.id}-linked-${lc.id || idx}`,
            parentItem: item,
            isLinked: true,
            noSertifikat: lc.noSertifikat || '-',
            jenisPeralatan: lc.jenisSertifikat || item.jenisPeralatan,
            tanggalInspeksi: formatToDDMMYYYY(lc.terbit) || '-',
            terbit: formatToDDMMYYYY(lc.terbit) || '-',
            berakhir: formatToDDMMYYYY(lc.expired) || '-',
            keterangan: lc.instansi || item.keterangan,
            status: (() => {
              let s = lc.status || 'Aktif';
              if (s.toLowerCase() === 'aktif' && lc.expired) {
                const tEnd = getTimestamp(formatToDDMMYYYY(lc.expired));
                const today = new Date();
                today.setHours(0,0,0,0);
                if (tEnd > 0 && tEnd < today.getTime()) s = 'Expired';
              }
              return s;
            })(),
            namaSertifikat: lc.namaSertifikat || '-',
            hasPdf: !!lc.fileUrl
          });
        });
      }
    });
    return rows;
  }, [sortedFilteredData]);

  const handleCsvImported = async () => {
    setActiveMainTab('staging');
    await loadData();
    setTimeout(() => {
      loadData();
    }, 800);
  };

  const handleSingleAdded = async (newItem) => {
    try {
      const extraData = {
        tipe: newItem.tipe || '',
        nomorSeri: newItem.nomorSeri || '',
        penanggungJawab: newItem.penanggungJawab || 'Dept. Operasi Pabrik 1A',
        noSertifikat: newItem.noSertifikat || '',
        namaSertifikat: newItem.namaSertifikat || '',
        instansi: newItem.instansi || '-',
        keteranganAsli: newItem.keterangan || '-',
        additionalEntities: [
          { key: 'JENIS PERALATAN PABRIK', value: newItem.jenisPeralatan || newItem.tipe || '' }
        ]
      };
      
      let locationStr = newItem.lokasi || newItem.lokasiDetail || newItem.unitPabrik || 'Umum';
      if (newItem.unitPabrik && newItem.lokasiDetail) {
        locationStr = `${newItem.unitPabrik} - ${newItem.lokasiDetail}`;
      } else if (newItem.lokasi) {
        locationStr = newItem.lokasi;
      } else if (newItem.lokasiDetail) {
        locationStr = newItem.lokasiDetail;
      }

      const itemPayload = {
        title: newItem.item || newItem.title || newItem.merekItem || newItem.jenisPeralatan || 'Unknown Item',
        code: newItem.nomorSeri || newItem.code || newItem.merekItem || '-',
        categoryKey: 'peralatan-pabrik',
        unitLocation: locationStr,
        status: newItem.status || 'Aktif',
        keterangan: JSON.stringify(extraData),
        issueDate: newItem.terbit || undefined,
        expiryDate: newItem.berakhir || newItem.expired || undefined,
        documentStatus: newItem.documentStatus || 'COMPLETED',
      };

      let createdItem;
      if (newItem.forceUpdate && newItem.existingId) {
        createdItem = await updateMasterItem(newItem.existingId, itemPayload);
      } else {
        createdItem = await createMasterItem(itemPayload);
      }

      const targetItemId = createdItem?.id || createdItem?.MasterId || createdItem?.['id'];

      if (targetItemId) {
        let fileUrl = newItem.fileUrl || null;
        if (newItem.file && !fileUrl) {
          const formData = new FormData();
          formData.append('file', newItem.file);
          const token = sessionStorage.getItem('token') || localStorage.getItem('token');
          try {
            const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/document-history/upload`, {
              method: 'POST',
              body: formData,
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (uploadRes.ok) {
              const uploadJson = await uploadRes.json();
              fileUrl = uploadJson.data?.url || null;
            }
          } catch (uploadErr) {
            console.error("Gagal mengunggah file:", uploadErr);
          }
        }

        const hasCertDetails = (newItem.noSertifikat && newItem.noSertifikat !== 'BELUM_ADA_SERTIFIKAT' && newItem.noSertifikat !== 'Tanpa Sertifikat') || newItem.file || fileUrl;

        if (hasCertDetails) {
          await createCertificateForMasterItem({
            itemId: targetItemId,
            jenisSertifikat: newItem.jenisPeralatan || 'Sertifikat Peralatan',
            namaSertifikat: newItem.namaSertifikat || undefined,
            noSertifikat: newItem.noSertifikat || 'BELUM_ADA_SERTIFIKAT',
            status: 'Aktif',
            terbit: newItem.terbit || undefined,
            expired: newItem.berakhir || newItem.expired || undefined,
            fileUrl: fileUrl,
            instansi: (newItem.instansi && newItem.instansi !== '-') ? newItem.instansi : undefined,
            keterangan: (newItem.keterangan && newItem.keterangan !== '-') ? newItem.keterangan : undefined,
          });
        }

        if (newItem.documentStatus === 'EXEMPT') {
          await resolveMasterItemExemption(targetItemId, newItem.keterangan || 'Tidak memerlukan sertifikat');
        }

        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/master-items/${targetItemId}/notification-setting`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            isEnabled: newItem.reminderEnabled !== false,
            triggerType: newItem.reminderType || 'DAYS',
            triggerDays: newItem.reminderDays || 30,
            triggerDate: newItem.reminderType === 'DATE' ? newItem.reminderDate : null
          })
        }).catch(err => console.error('Error saving notification setting:', err));
      }

      setIsSingleModalOpen(false);
      setActiveMainTab('main');
      await loadData();
      toast.success("Data peralatan pabrik baru berhasil disimpan!");
      return true;
    } catch (error) {
      console.error("Gagal menambahkan data:", error);
      const errMsg = error?.response?.data?.message || error?.message || 'Terjadi kesalahan sistem';
      toast.error(`Gagal menyimpan data ke database: ${Array.isArray(errMsg) ? errMsg.join(', ') : errMsg}`);
      throw error;
    }
  };

    const handleZipMatched = async (extractedList) => {
    try {
      const successfulItems = extractedList.filter(item => item.statusLabel !== "Gagal Ekstraksi");
      for (const item of successfulItems) {
        await createMasterItem({
          title: item.matchedTitle || item.pdfName,
          code: item.matchedCode || item.nomorSeri || "-",
          categoryKey: 'peralatan-pabrik',
          unitLocation: 'Umum',
          status: 'Aktif',
          keterangan: `Diimpor otomatis dari ZIP (${item.pdfName})`,
        });
      }
      loadData();
      toast.success(`Berhasil menyimpan ${successfulItems.length} data peralatan dari hasil ZIP OCR!`);
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan data Batch ZIP!");
    }
  };

  const requestDeleteRow = (rowId) => {
    setPendingDeleteRowId(rowId);
    setRowConfirmModalOpen(true);
    setOpenActionRowId(null);
  };

  const confirmDeleteRow = () => {
    setEquipmentList(prev => prev.filter(item => item.id !== pendingDeleteRowId));
    setRowConfirmModalOpen(false);
    setPendingDeleteRowId(null);
  };

  const openReassignTargetModal = (item) => {
    setReassignCertRowItem(item);
    setSelectedNewTargetItem(equipmentList.find(e => e.id !== item.id) || equipmentList[0]);
    setSearchTargetItemTerm('');
    setOpenActionRowId(null);
  };

  const confirmReassignTargetRow = () => {
    if (!reassignCertRowItem || !selectedNewTargetItem) return;

    setEquipmentList(prev =>
      prev.map(eq => {
        if (eq.id === selectedNewTargetItem.id) {
          return {
            ...eq,
            noSertifikat: reassignCertRowItem.noSertifikat,
            hasCertificatePdf: true,
            keterangan: `Sertifikat Dipindahkan dari ${reassignCertRowItem.tipe}`
          };
        }
        if (eq.id === reassignCertRowItem.id) {
          return {
            ...eq,
            noSertifikat: "BELUM_ADA_SERTIFIKAT",
            hasCertificatePdf: false,
            keterangan: "Sertifikat Dipindahkan ke Item Lain"
          };
        }
        return eq;
      })
    );

    toast.success(`Sertifikat ${reassignCertRowItem.noSertifikat} berhasil dipindahkan ke ${selectedNewTargetItem.merekItem} (${selectedNewTargetItem.tipe})!`);
    setReassignCertRowItem(null);
    loadData();
  };

  const targetSearchLower = (searchTargetItemTerm || '').toLowerCase();
  const filteredTargetEquipmentList = equipmentList.filter(eq =>
    eq.id !== reassignCertRowItem?.id &&
    ((eq.tipe || '').toLowerCase().includes(targetSearchLower) ||
     (eq.merekItem || '').toLowerCase().includes(targetSearchLower) ||
     (eq.jenisPeralatan || '').toLowerCase().includes(targetSearchLower) ||
     (eq.lokasi || '').toLowerCase().includes(targetSearchLower))
  );

  return {
    searchTerm, setSearchTerm,
    filterJenis, setFilterJenis,
    filterLokasi, setFilterLokasi,
    filterUser, setFilterUser,
    filterStatus, setFilterStatus,
    filterHasSertifikat, setFilterHasSertifikat,
    isCsvModalOpen, setIsCsvModalOpen,
    isSingleModalOpen, setIsSingleModalOpen,
    historyTargetItem, setHistoryTargetItem,
    detailModalItem, setDetailModalItem,
    resolveTargetItem, setResolveTargetItem,
    activeMainTab, setActiveMainTab,
    selectedStagingIds, setSelectedStagingIds,
    isSubmittingBulkExempt, setIsSubmittingBulkExempt,
    bulkExemptModalOpen, setBulkExemptModalOpen,
    bulkExemptNote, setBulkExemptNote,
    isColumnDropdownOpen, setIsColumnDropdownOpen,
    isImportMenuOpen, setIsImportMenuOpen,
    openActionRowId, setOpenActionRowId,
    rowConfirmModalOpen, setRowConfirmModalOpen,
    pendingDeleteRowId, setPendingDeleteRowId,
    equipmentList, setEquipmentList,
    isLoading, setIsLoading,
    reassignCertRowItem, setReassignCertRowItem,
    searchTargetItemTerm, setSearchTargetItemTerm,
    selectedNewTargetItem, setSelectedNewTargetItem,
    allColumns, visibleColumnKeys, setVisibleColumnKeys,
    loadData, handleBulkExempt, toggleSelectStaging, toggleSelectAllStaging,
    toggleColumn, selectAllColumns, isVisible, getRowStatusStyle,
    uniqueJenis, uniqueLokasi, uniqueUser, pendingCount, filteredData, expandedRows,
    handleSingleAdded, handleCsvImported, handleZipMatched, requestDeleteRow, confirmDeleteRow,
    openReassignTargetModal, confirmReassignTargetRow, filteredTargetEquipmentList,
    sortKey, sortOrder, toggleSort,
    sortDateOrder, setSortDateOrder
  };
}
