import { useState, useMemo, useEffect } from 'react';
import {
  getMasterItems,
  resolveMasterItemExemption,
  createMasterItem,
  createCertificateForMasterItem,
  updateCertificate,
  deleteCertificate,
  updateMasterItem
} from '../services/masterItemsService';
import { useAuth } from '../contexts/AuthContext';

export function usePerizinanGeneric({ title, subtitle, categoryName }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('main'); // 'main' | 'staging'
  const [selectedStagingIds, setSelectedStagingIds] = useState([]);
  const [bulkExemptModalOpen, setBulkExemptModalOpen] = useState(false);
  const [bulkExemptNote, setBulkExemptNote] = useState('');
  const [isSubmittingBulkExempt, setIsSubmittingBulkExempt] = useState(false);
  const [resolveTargetItem, setResolveTargetItem] = useState(null);
  
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterLokasi, setFilterLokasi] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterHasSertifikat, setFilterHasSertifikat] = useState('All'); // 'All' | 'ada' | 'tidak'

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [activeCertId, setActiveCertId] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);
  const [addCertTargetMaster, setAddCertTargetMaster] = useState(null);

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [expandedMasterIds, setExpandedMasterIds] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sortDateOrder, setSortDateOrder] = useState('desc'); // 'desc' = terbaru, 'asc' = terlama

  const isAsetCategory = useMemo(() => {
    return categoryName?.toLowerCase().includes('aset');
  }, [categoryName]);

  const currentCategoryKey = useMemo(() => {
    const catLower = (categoryName || title || '').toLowerCase();
    if (catLower.includes('aset')) return 'perizinan-aset';
    if (catLower.includes('proyek')) return 'perizinan-proyek';
    if (catLower.includes('produk')) return 'perizinan-produk';
    if (catLower.includes('ciptaan')) return 'sertifikat-ciptaan';
    return '';
  }, [categoryName, title]);

  const formatStatus = (rawStatus) => {
    if (currentCategoryKey === 'perizinan-proyek') {
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

  const calculateCertStatus = (cert) => {
    const raw = formatStatus(cert.status || 'Aktif');
    if (raw.toLowerCase() === 'aktif' || raw.toLowerCase() === 'active') {
      const expTime = getTimestamp(cert.expired || cert.expiryDate || cert.berakhir);
      // Compare with start of today to be safe
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expTime > 0 && expTime < today.getTime()) {
        return 'Expired';
      }
    }
    return raw;
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMasterItems(currentCategoryKey);
      
      const mapped = data.map((doc, index) => {
        const rawCerts = doc.certificates || [];
        const certs = rawCerts.map(c => ({
          ...c,
          status: calculateCertStatus(c)
        }));
        const activeCerts = certs.filter(c => c.status === 'Aktif' || c.status === 'Active' || !c.status);

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
          primaryCert = activeCerts[0];
        } else if (certs.length > 0) {
          primaryCert = certs[0];
        }

        let meta = {};
        try {
          if (doc.keterangan && doc.keterangan.startsWith('{')) {
            meta = JSON.parse(doc.keterangan);
          } else {
            meta = { keteranganAsli: doc.keterangan };
          }
        } catch (e) {
          meta = { keteranganAsli: doc.keterangan };
        }

        const actualJenisAset = meta.tipe || doc.jenisPeralatan || meta.jenisAset || doc.categoryKey || (categoryName?.toLowerCase().includes('aset') ? 'Perizinan Aset' : categoryName?.toLowerCase().includes('proyek') ? 'Perizinan Proyek' : 'Perizinan Produk');

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

        return {
          id: doc.id,
          MasterId: doc.id,
          title: doc.title || '-',
          categoryKey: doc.categoryKey,
          kategoriDokumen: doc.categoryKey,
          jenisItem: actualJenisAset,
          jenisPeralatan: actualJenisAset,
          namaItem: doc.title || '-',
          merekItem: doc.title,
          code: doc.code || "-",
          no: index + 1,
          hasSertifikat: certs.length > 0 ? "Ada" : "Tidak Ada",
          hasPdf: !!primaryCert?.fileUrl,
          fileUrl: primaryCert?.fileUrl || null,
          imageUrl: doc.imageUrl || null,
          certificateNo: primaryCert?.noSertifikat || meta.noSertifikat || (doc.documentStatus === 'EXEMPT' ? 'Tanpa Sertifikat' : '-'),
          unitLocation: doc.unitLocation || '-',
          unit: doc.unitLocation || '-',
          luasM2: doc.luasM2 || "0",
          luasHa: doc.luasHa || "0",
          peruntukan: doc.peruntukan || "-",
          issueDate: formatToDDMMYYYY(primaryCert?.terbit || doc.issueDate || '-'),
          expiryDate: formatToDDMMYYYY(primaryCert?.expired || doc.expiryDate || "-"),
          kondisi: doc.status || "Baik",
          description: primaryCert?.keterangan || meta.keteranganAsli || doc.keterangan || "-",
          keterangan: primaryCert?.keterangan || meta.keteranganAsli || doc.keterangan || "-",
          namaSertifikat: primaryCert?.namaSertifikat || meta.namaSertifikat || '-',
          status: formatStatus(doc.status),
          user: primaryCert?.instansi || meta.penanggungJawab || "Umum",
          documentStatus: doc.documentStatus || doc.document_status || (certs.length > 0 ? 'COMPLETED' : 'PENDING_DOC'),
          exemptionNote: doc.exemptionNote || null,
          linkedCertificates: certs,
          notificationSetting: doc.notificationSetting || null,
          reminderEnabled: doc.notificationSetting ? doc.notificationSetting.isEnabled : true,
          validationStatus: doc.validationStatus || 'NEW',
          validationErrors: doc.validationErrors || null,
          imageUrl: doc.imageUrl || null,
          createdAt: doc.createdAt || null
        };
      });
      setDocuments(mapped);

      // Auto-update detailModalItem to reflect changes (e.g. deleted linked certificates)
      setDetailModalItem(prev => {
        if (!prev) return null;
        const updated = mapped.find(m => m.id === prev.id || m.MasterId === prev.MasterId);
        return updated ? updated : prev;
      });
    } catch (error) {
      console.error("Failed to load generic permissions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryName]);

  const isProyek = categoryName?.toLowerCase().includes('proyek');
  const isProduk = categoryName?.toLowerCase().includes('produk') || categoryName?.toLowerCase().includes('ciptaan');

  const defaultColumns = [
    { key: "no", label: "NO." },
    { key: "namaItem", label: isProyek ? "NAMA PROYEK" : isProduk ? "NAMA PRODUK" : "NAMA ITEM" },
    { key: "code", label: isProyek ? "KODE PROYEK" : isProduk ? "KODE PRODUK" : "KODE REGISTRASI" },
    { key: "jenisItem", label: isProyek ? "KATEGORI PROYEK" : isProduk ? "JENIS PRODUK" : "JENIS ITEM" },
    // Kolom Lokasi hanya ada untuk Aset & Proyek, bukan Produk (sesuai template Excel)
    ...(!isProduk ? [{ key: "unit", label: isProyek ? "LOKASI PROYEK" : "LOKASI" }] : []),
    { key: "user", label: "PENANGGUNG JAWAB" },
    { key: "certCount", label: "SERTIFIKAT TERHUBUNG" },
    // Kolom Status hanya ada untuk Aset & Proyek, bukan Produk (sesuai template Excel)
    ...(!isProduk ? [{ key: "status", label: "STATUS" }] : []),
  ];

  const asetColumns = [
    { key: "no", label: "NO." },
    { key: "namaItem", label: "NAMA ASET" },
    { key: "code", label: "NOMOR SERI ASSET" },
    { key: "jenisItem", label: "JENIS ASET" },
    { key: "unit", label: "LOKASI" },
    { key: "user", label: "PENANGGUNG JAWAB" },
    { key: "certCount", label: "SERTIFIKAT TERHUBUNG" },
    { key: "status", label: "STATUS" }
  ];

  const baseColumns = isAsetCategory ? asetColumns : defaultColumns;

  const allColumns = useMemo(() => {
    return baseColumns;
  }, [baseColumns]);

  const pendingCount = useMemo(() => {
    return documents.filter(doc => doc.documentStatus === 'PENDING_DOC').length;
  }, [documents]);

  const handleBulkExempt = async () => {
    if (selectedStagingIds.length === 0 || !bulkExemptNote.trim()) return;
    try {
      setIsSubmittingBulkExempt(true);
      for (const id of selectedStagingIds) {
        await resolveMasterItemExemption(id, bulkExemptNote.trim());
        
        // Find the document to check if it already has certificates
        const doc = documents.find(d => d.id === id || d.MasterId === id);
        const hasExistingCerts = doc && doc.linkedCertificates && doc.linkedCertificates.length > 0;
        
        if (!hasExistingCerts) {
          // Create dummy certificate only if no existing certificates
          await createCertificateForMasterItem({
            itemId: id,
            jenisSertifikat: 'Sertifikat Pengecualian',
            namaSertifikat: 'Tanpa Sertifikat',
            noSertifikat: 'Tanpa Sertifikat',
            status: 'EXEMPT',
            terbit: undefined,
            expired: undefined,
            fileUrl: null,
            uploadedBy: user?.nama ? `${user.nama} ${user.npk ? `(${user.npk})` : ''}` : 'Sistem / Bulk Action',
          }).catch(err => console.error("Gagal buat dummy cert bulk:", err));
        } else {
          // Update only placeholder certificates to EXEMPT, keep real ones as 'Aktif'
          const uploaderName = user?.nama ? `${user.nama} ${user.npk ? `(${user.npk})` : ''}` : 'Sistem / Bulk Action';
          await Promise.all(
            doc.linkedCertificates.map(cert => {
              const no = cert.noSertifikat || '';
              const hasRealNo = no && no !== 'Tanpa Sertifikat' && no !== '-' && no !== 'BELUM_ADA_SERTIFIKAT';
              return updateCertificate(cert.id, {
                status: hasRealNo ? 'Aktif' : 'EXEMPT',
                uploadedBy: uploaderName
              }).catch(err => console.error("Gagal update existing cert during bulk exempt:", err));
            })
          );
        }
      }
      setSelectedStagingIds([]);
      setBulkExemptModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan bulk action.");
    } finally {
      setIsSubmittingBulkExempt(false);
    }
  };

  const handleMoveToUtama = async (masterId) => {
    try {
      setIsLoading(true);
      await updateMasterItem(masterId, { documentStatus: 'COMPLETED' });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal memindahkan data ke Utama.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.handleMoveToUtama = handleMoveToUtama;
    return () => {
      if (window.handleMoveToUtama === handleMoveToUtama) {
        delete window.handleMoveToUtama;
      }
    };
  }, [documents]);

  const toggleSelectStaging = (id) => {
    setSelectedStagingIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allColumns.map(c => c.key));

  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map(c => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  const categoryFilteredDocs = useMemo(() => {
    return documents;
  }, [documents, categoryName]);

  const uniqueJenis = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.jenisItem || i.jenisPeralatan || i.jenisCiptaan || 'General'))], [categoryFilteredDocs]);
  const uniqueLokasi = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.unitPabrik || i.unit || i.lokasi || 'Kantor Pusat'))], [categoryFilteredDocs]);
  const uniqueStatus = useMemo(() => ['All', ...new Set(categoryFilteredDocs.map(i => i.status || 'Aktif'))], [categoryFilteredDocs]);

  const filteredDocs = useMemo(() => {
    let result = categoryFilteredDocs.filter(doc => {
      const matchesTab = activeMainTab === 'staging'
        ? doc.documentStatus === 'PENDING_DOC'
        : doc.documentStatus !== 'PENDING_DOC';

      const titleStr = doc.title || doc.merekItem || doc.judulCiptaan || doc.namaItem || '';
      const codeStr = doc.code || doc.id || doc.noSertifikat || '';
      const unitStr = doc.unitPabrik || doc.unit || doc.lokasi || 'Kantor Pusat';
      const certStr = doc.certificateNo || doc.noSertifikat || '';
      const jenisStr = doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || 'General';
      const statusStr = doc.status || 'Aktif';

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        titleStr.toLowerCase().includes(searchLower) ||
        codeStr.toLowerCase().includes(searchLower) ||
        unitStr.toLowerCase().includes(searchLower) ||
        certStr.toLowerCase().includes(searchLower) ||
        jenisStr.toLowerCase().includes(searchLower);

      const matchesJenis = filterJenis === 'All' || jenisStr === filterJenis;
      const matchesLokasi = filterLokasi === 'All' || unitStr === filterLokasi;
      const matchesStatus = filterStatus === 'All' || statusStr === filterStatus;
      const matchesHasSertifikat = filterHasSertifikat === 'All'
        ? true
        : filterHasSertifikat === 'ada'
        ? (doc.documentStatus === 'COMPLETED' && !!doc.fileUrl)
        : filterHasSertifikat === 'tidak'
        ? doc.documentStatus === 'EXEMPT'
        : (doc.documentStatus === 'PENDING_DOC' || (doc.documentStatus === 'COMPLETED' && !doc.fileUrl));

      return matchesTab && matchesSearch && matchesJenis && matchesLokasi && matchesStatus && matchesHasSertifikat;
    });

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return sortDateOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [categoryFilteredDocs, searchTerm, filterJenis, filterLokasi, filterStatus, filterHasSertifikat, activeMainTab, sortDateOrder]);

  const toggleExpandMaster = (id) => {
    setExpandedMasterIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };


  const masterRows = useMemo(() => {
    return filteredDocs.map((doc, index) => {
      const certs = doc.linkedCertificates || [];
      const assetCategory = doc.jenisPeralatan || doc.categoryKey || categoryName || 'Perizinan Aset';
      
      const processedCerts = [];
      if (certs.length > 0) {
        const chains = [];
        certs.forEach(c => {
          const isActive = c.status?.toLowerCase() === 'aktif' || c.status?.toLowerCase() === 'active';
          if (isActive) {
            chains.push({ head: c, history: [] });
          }
        });

        certs.forEach(c => {
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

        chains.forEach((ch, idx) => {
          const cert = ch.head;
          processedCerts.push({
            id: cert.id || `${doc.id}-cert-${idx}`,
            namaSertifikat: cert.namaSertifikat || cert.jenisSertifikat || 'Sertifikat Terhubung',
            noSertifikat: cert.noSertifikat || cert.noIzin || '-',
            terbit: cert.terbit || '-',
            expired: cert.expired || '-',
            status: formatStatus(cert.status || 'Aktif'),
            hasPdf: !!cert.fileUrl,
            fileUrl: cert.fileUrl || null,
            history: ch.history,
            certObj: cert
          });
        });
      }

      return {
        id: doc.id || doc.MasterId || `doc-${index}`,
        rowId: doc.id || doc.MasterId || `doc-${index}`,
        parentDoc: doc,
        docCode: doc.code || doc.id || '-',
        docNamaItem: doc.merekItem || doc.title || doc.judulCiptaan || doc.namaItem || '-',
        docJenis: doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || '-',
        docUnit: doc.unit || doc.unitPabrik || doc.lokasi || '-',
        docUser: doc.user || doc.description || 'Umum',
        documentStatus: doc.documentStatus || 'COMPLETED',
        status: formatStatus(doc.status || 'Aktif'),
        exemptionNote: doc.exemptionNote || null,
        certs: processedCerts
      };
    });
  }, [filteredDocs, categoryName]);

  const toggleSelectAllStaging = (rows) => {
    const targetRows = rows || masterRows;
    if (selectedStagingIds.length === targetRows.length) {
      setSelectedStagingIds([]);
    } else {
      setSelectedStagingIds(targetRows.map(r => r.id || r.parentDoc?.id));
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterJenis('All');
    setFilterLokasi('All');
    setFilterStatus('All');
    selectAllColumns();
  };

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
        nomorSeri: newItem.code || '',
        penanggungJawab: newItem.user || 'Umum',
        noSertifikat: newItem.noSertifikat || '',
        namaSertifikat: newItem.namaSertifikat || '',
        keteranganAsli: newItem.keterangan || '-'
      };

      const createdItem = await createMasterItem({
        title: newItem.title || 'Unknown Item',
        code: newItem.code || '-',
        categoryKey: currentCategoryKey,
        unitLocation: newItem.unitLocation || 'Umum',
        status: newItem.status || 'Aktif',
        keterangan: JSON.stringify(extraData),
        issueDate: newItem.terbit || undefined,
        expiryDate: newItem.expired || undefined,
        luasM2: newItem.luasM2 || undefined,
        luasHa: newItem.luasHa || undefined,
        peruntukan: newItem.peruntukan || undefined,
        documentStatus: newItem.documentStatus || 'COMPLETED',
      });

      const targetItemId = createdItem?.id || createdItem?.MasterId || createdItem?.['id'];

      if (targetItemId) {
        await createCertificateForMasterItem({
          itemId: targetItemId,
          jenisSertifikat: newItem.tipe || 'Sertifikat Utama',
          namaSertifikat: newItem.namaSertifikat || undefined,
          noSertifikat: newItem.noSertifikat || 'BELUM_ADA_SERTIFIKAT',
          status: newItem.documentStatus === 'EXEMPT' ? 'EXEMPT' : 'Aktif',
          terbit: newItem.terbit || undefined,
          expired: newItem.expired || undefined,
          fileUrl: newItem.fileUrl || null,
          uploadedBy: user?.nama ? `${user.nama} ${user.npk ? `(${user.npk})` : ''}` : 'Sistem / Single Entry',
        });

        if (newItem.documentStatus === 'EXEMPT') {
          await resolveMasterItemExemption(targetItemId, newItem.keterangan || 'Tidak memerlukan sertifikat');
        }
      }

      setIsSingleModalOpen(false);
      setActiveMainTab('main');
      await loadData();
    } catch (error) {
      console.error("Gagal menambahkan data:", error);
      alert("Gagal menyimpan data ke database!");
    }
  };

  const handleSaveCertEdit = async (certId, updatedData) => {
    try {
      await updateCertificate(certId, {
        ...updatedData,
        uploadedBy: updatedData.uploadedBy || (user?.nama ? `${user.nama} ${user.npk ? `(${user.npk})` : ''}` : 'Sistem / Update')
      });
      setViewingCert(null);
      await loadData();
    } catch (err) {
      console.error("Gagal update sertifikat:", err);
      throw err;
    }
  };

  const handleDeleteCert = async (certId) => {
    try {
      await deleteCertificate(certId);
      setViewingCert(null);
      await loadData();
    } catch (err) {
      console.error("Gagal hapus sertifikat:", err);
      throw err;
    }
  };

  const handleAddCertSuccess = async (certPayload, pdfFile) => {
    try {
      if (!addCertTargetMaster) return;
      const targetItemId = addCertTargetMaster.id || addCertTargetMaster.MasterId || addCertTargetMaster.parentDoc?.id;
      
      let finalFileUrl = certPayload.fileUrl || null;

      await createCertificateForMasterItem({
        itemId: targetItemId,
        jenisSertifikat: certPayload.jenisSertifikat || 'Sertifikat Terhubung',
        namaSertifikat: certPayload.namaSertifikat || certPayload.jenisSertifikat || 'Sertifikat Terhubung',
        noSertifikat: certPayload.noSertifikat || 'BELUM_ADA_SERTIFIKAT',
        instansi: certPayload.instansi || undefined,
        terbit: certPayload.terbit || undefined,
        expired: certPayload.expired || undefined,
        status: certPayload.status || 'Aktif',
        keterangan: certPayload.keterangan || undefined,
        fileUrl: finalFileUrl,
        uploadedBy: user?.nama ? `${user.nama} ${user.npk ? `(${user.npk})` : ''}` : 'Sistem / Tambah Terhubung'
      });

      // Jika dokumen berasal dari staging (PENDING_DOC), otomatis ubah jadi COMPLETED karena sudah diberi sertifikat
      if (addCertTargetMaster.documentStatus === 'PENDING_DOC' || addCertTargetMaster.status === 'PENDING' || addCertTargetMaster.documentStatus === 'EXPIRED') {
        try {
          await updateMasterItem(targetItemId, { documentStatus: 'COMPLETED', status: 'Aktif' });
        } catch (updateErr) {
          console.warn("Gagal update status master ke COMPLETED, mungkin tidak di-support oleh dummy API:", updateErr);
        }
      }

      setAddCertTargetMaster(null);
      await loadData();
    } catch (err) {
      console.error("Gagal menambah sertifikat:", err);
      alert("Gagal menambahkan sertifikat baru.");
    }
  };

  const getRowStatusStyle = (doc) => {
    const statusStr = (doc.status || '').toLowerCase();
    if (statusStr === 'afkir' || statusStr === 'decommissioned') {
      return 'bg-[#0f172a] text-white hover:bg-slate-900 border-b border-slate-700';
    }
    if (statusStr === 'expired') {
      return 'bg-rose-50/90 text-rose-950 hover:bg-rose-100 border-b border-rose-200';
    }
    if (statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'proses') {
      return 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border-b border-amber-200';
    }
    return 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';
  };

  return {
    searchTerm, setSearchTerm,
    activeMainTab, setActiveMainTab,
    selectedStagingIds, setSelectedStagingIds,
    bulkExemptModalOpen, setBulkExemptModalOpen,
    bulkExemptNote, setBulkExemptNote,
    isSubmittingBulkExempt, setIsSubmittingBulkExempt,
    resolveTargetItem, setResolveTargetItem,
    filterJenis, setFilterJenis,
    filterLokasi, setFilterLokasi,
    filterStatus, setFilterStatus,
    filterHasSertifikat, setFilterHasSertifikat,
    isCsvModalOpen, setIsCsvModalOpen,
    isSingleModalOpen, setIsSingleModalOpen,
    historyTargetItem, setHistoryTargetItem,
    detailModalItem, setDetailModalItem,
    activeCertId, setActiveCertId,
    viewingCert, setViewingCert,
    addCertTargetMaster, setAddCertTargetMaster,
    handleSaveCertEdit, handleDeleteCert, handleAddCertSuccess,
    isColumnDropdownOpen, setIsColumnDropdownOpen,
    isImportMenuOpen, setIsImportMenuOpen,
    documents, setDocuments,
    isLoading, setIsLoading,
    isAsetCategory, currentCategoryKey,
    loadData, allColumns, pendingCount,
    handleBulkExempt, toggleSelectStaging,
    visibleColumnKeys, toggleColumn, selectAllColumns, isVisible,
    uniqueJenis, uniqueLokasi, uniqueStatus,
    masterRows, expandedRows: masterRows,
    expandedMasterIds, setExpandedMasterIds, toggleExpandMaster,
    toggleSelectAllStaging,
    resetFilters, handleCsvImported, handleSingleAdded,
    getRowStatusStyle,
    sortDateOrder, setSortDateOrder
  };
}
