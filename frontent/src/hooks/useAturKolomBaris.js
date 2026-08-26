import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useAturKolomBaris(propCategoryKey) {
  const [activeTab, setActiveTab] = useState('kolom'); // 'kolom' | 'baris'
  const [categoryKey, setCategoryKey] = useState(propCategoryKey || 'peralatan-pabrik');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (propCategoryKey) {
      setCategoryKey(propCategoryKey);
    }
  }, [propCategoryKey]);

  // States for Columns
  const [columns, setColumns] = useState([]);
  const [isAddColOpen, setIsAddColOpen] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState('text'); // 'text' | 'nominal' | 'date'
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverColIndex, setDragOverColIndex] = useState(null);

  // States for Rows
  const [rows, setRows] = useState([]);
  const [barisMode, setBarisMode] = useState('master'); // 'master' | 'child'
  const [modifiedCerts, setModifiedCerts] = useState({}); // id -> cert updates
  const [draggedRowIndex, setDraggedRowIndex] = useState(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Konfirmasi Hapus',
    message: '',
    onConfirm: null
  });

  const showConfirm = (message, title = 'Konfirmasi Hapus', onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const convertToYYYYMMDD = (dateStr) => {
    if (!dateStr || dateStr === '-') return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    } catch (_) {}
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      let part0 = parts[0].padStart(2, '0');
      let part1 = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = '20' + year;
      if (parseInt(part0, 10) > 12) {
        return `${year}-${part1}-${part0}`;
      }
      return `${year}-${part0}-${part1}`;
    }
    return '';
  };

  // Load Columns and Rows Data
  const loadData = async () => {
    setIsLoading(true);
    setModifiedCerts({});
    try {
      // 1. Load Column Configs
      const colRes = await api.get(`/column-configs/${categoryKey}`);
      const fetchedCols = colRes.data || [];
      const filteredCols = fetchedCols.filter(c => c.fieldKey !== 'certCount');
      setColumns(filteredCols);

      // 2. Load Master Items (Rows)
      const baseCategoryKey = categoryKey.replace('-child', '');
      const rowRes = await api.get(`/master-items?categoryKey=${baseCategoryKey}`);
      const rawRows = rowRes.data || [];
      const nonStagingRows = rawRows.filter(row => row.documentStatus !== 'PENDING_DOC');
      const parsedRows = nonStagingRows.map(row => {
        let keteranganAsli = '';
        let additionalEntities = [];
        let rawMeta = {};
        try {
          if (row.keterangan && row.keterangan.startsWith('{')) {
            const parsed = JSON.parse(row.keterangan);
            keteranganAsli = parsed.keteranganAsli || '';
            additionalEntities = parsed.additionalEntities || [];
            rawMeta = parsed;
          } else {
            keteranganAsli = row.keterangan || '';
          }
        } catch (_) {
          keteranganAsli = row.keterangan || '';
        }
        // Try to get dates from primary certificate if they exist, otherwise fallback to item dates
        const certs = row.certificates || [];
        const activeCerts = certs.filter(c => {
          const s = (c.status || '').toLowerCase();
          return s === 'aktif' || s === 'active' || s.includes('perpanjang') || s.includes('proses') || !c.status;
        });
        
        let primaryCert = null;
        if (activeCerts.length > 0) {
          primaryCert = activeCerts[0]; // Simplified for AturKolomBaris
        } else if (certs.length > 0) {
          primaryCert = certs[0];
        }

        const issueDate = primaryCert?.terbit || row.issueDate || '';
        const expiryDate = primaryCert?.expired || row.expiryDate || '';

        return {
          ...row,
          keteranganAsli,
          additionalEntities,
          rawMeta,
          issueDate,
          expiryDate
        };
      });
      setRows(parsedRows);
    } catch (err) {
      console.error('Failed to load columns & rows configs:', err);
      showToast('Gagal memuat konfigurasi kolom dan baris.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryKey]);

  // ==========================================
  // COLUMN DRAG & DROP & CONFIGURATION
  // ==========================================
  
  const handleColDragStart = (e, index) => {
    setDraggedColIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleColDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverColIndex !== index) {
      setDragOverColIndex(index);
    }
  };

  const handleColDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === targetIndex) {
      setDraggedColIndex(null);
      setDragOverColIndex(null);
      return;
    }

    const reordered = [...columns];
    const [moved] = reordered.splice(draggedColIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((col, idx) => ({ ...col, position: idx }));
    setColumns(updated);
    setDraggedColIndex(null);
    setDragOverColIndex(null);
  };

  const toggleColVisibility = (idx) => {
    const updated = [...columns];
    updated[idx].isVisible = !updated[idx].isVisible;
    setColumns(updated);
  };

  const handleSaveColumns = async () => {
    setIsSaving(true);
    try {
      const payload = columns.map(c => ({
        fieldKey: c.fieldKey,
        position: c.position,
        isVisible: c.isVisible
      }));
      await api.put(`/column-configs/${categoryKey}/reorder`, payload);
      showToast('Susunan dan visibilitas kolom berhasil disimpan!', 'success');
      loadData();
    } catch (err) {
      console.error('Failed to save columns configuration:', err);
      showToast('Gagal menyimpan susunan kolom.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColLabel.trim()) return;

    // Generate camelCase key from label
    const cleanKey = newColLabel
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    // Check if key already exists
    if (columns.some(c => c.fieldKey === cleanKey)) {
      showToast('Nama kolom sudah digunakan.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      await api.post(`/column-configs/${categoryKey}`, {
        fieldKey: cleanKey,
        label: newColLabel,
        type: newColType
      });
      setIsAddColOpen(false);
      setNewColLabel('');
      setNewColType('text');
      showToast('Kolom kustom baru berhasil ditambahkan!', 'success');
      loadData();
    } catch (err) {
      console.error('Failed to create new column:', err);
      showToast('Gagal menambahkan kolom kustom baru.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteColumn = (fieldKey) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus kolom kustom ini? Data pada kolom ini di item perizinan akan diabaikan.',
      'Hapus Kolom Kustom',
      async () => {
        try {
          setIsSaving(true);
          await api.delete(`/column-configs/${categoryKey}/${fieldKey}`);
          showToast('Kolom kustom berhasil dihapus!', 'success');
          loadData();
        } catch (err) {
          console.error('Failed to delete column config:', err);
          showToast('Gagal menghapus kolom.', 'error');
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  // ==========================================
  // ROW DRAG & DROP & CRUD OPERATIONS
  // ==========================================

  const handleRowDragStart = (e, index) => {
    setDraggedRowIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleRowDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverRowIndex !== index) {
      setDragOverRowIndex(index);
    }
  };

  const handleRowDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === targetIndex) {
      setDraggedRowIndex(null);
      setDragOverRowIndex(null);
      return;
    }

    const reordered = [...rows];
    const [moved] = reordered.splice(draggedRowIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((row, idx) => ({ ...row, position: idx }));
    setRows(updated);
    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  const handleSaveRowsSpreadsheet = async () => {
    setIsSaving(true);
    try {
      const payload = rows.map(r => {
        const payloadKeterangan = JSON.stringify({
          ...(r.rawMeta || {}),
          keteranganAsli: r.keteranganAsli || '',
          additionalEntities: r.additionalEntities || [],
        });
        return {
          id: r.id,
          title: r.title,
          code: r.code || '',
          user: r.user || '',
          tipe: r.tipe || '',
          unitLocation: r.unitLocation || '',
          status: r.status || 'Aktif',
          keterangan: payloadKeterangan,
          position: r.position,
          issueDate: r.issueDate || null,
          expiryDate: r.expiryDate || null,
          categoryKey
        };
      });

      await api.put('/master-items/bulk', payload);
      showToast('Semua perubahan data dan posisi baris berhasil disimpan!', 'success');
      loadData();
    } catch (err) {
      console.error('Failed to save spreadsheet changes:', err);
      showToast('Gagal menyimpan perubahan spreadsheet.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCellChange = (rowId, fieldKey, isCustom, value) => {
    setRows(prevRows => prevRows.map(row => {
      if (row.id !== rowId) return row;

      const updated = { ...row };

      if (fieldKey === 'user') {
        updated.rawMeta = { ...updated.rawMeta, penanggungJawab: value };
        updated.user = value;
      } else if (fieldKey === 'jenisItem') {
        updated.rawMeta = { ...updated.rawMeta, tipe: value, jenisAset: value, jenisProyek: value, kategori: value, jenisProduk: value, kategoriProyek: value };
        updated.tipe = value;
      } else if (fieldKey === 'jenisPeralatan' || isCustom) {
        const col = columns.find(c => c.fieldKey === fieldKey);
        const colLabel = col ? col.label : fieldKey;

        const entities = [...(row.additionalEntities || [])];
        const idx = entities.findIndex(e => e.key === colLabel);
        if (idx > -1) {
          entities[idx] = { ...entities[idx], value };
        } else {
          entities.push({ key: colLabel, value, type: col?.type || 'text' });
        }
        updated.additionalEntities = entities;
      } else {
        if (fieldKey === 'title') updated.title = value;
        else if (fieldKey === 'code') updated.code = value;
        else if (fieldKey === 'unitLocation') updated.unitLocation = value;
        else if (fieldKey === 'status') updated.status = value;
        else if (fieldKey === 'keterangan') updated.keteranganAsli = value;
        else if (fieldKey === 'terbit') updated.issueDate = value;
        else if (fieldKey === 'berakhir') updated.expiryDate = value;
      }

      return updated;
    }));
  };

  const handleAddNewSpreadsheetRow = () => {
    const newId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRow = {
      id: newId,
      title: 'Nama Alat Baru',
      code: '',
      unitLocation: '',
      status: 'Aktif',
      keteranganAsli: '',
      additionalEntities: columns
        .filter(c => c.isCustom || c.fieldKey === 'jenisPeralatan')
        .map(c => ({ key: c.label, value: '', type: c.type || 'text' })),
      position: rows.length,
      categoryKey
    };
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (id) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus baris data peralatan ini? Semua riwayat perizinan dan sertifikat terlampir juga akan ikut terhapus.',
      'Hapus Baris Data',
      async () => {
        try {
          setIsSaving(true);
          await api.delete(`/master-items/${id}`);
          showToast('Baris data berhasil dihapus!', 'success');
          loadData();
        } catch (err) {
          console.error('Failed to delete master item:', err);
          showToast('Gagal menghapus baris data.', 'error');
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  const handleChildCellChange = (certId, fieldKey, value) => {
    setRows(prevRows => prevRows.map(row => {
      const certs = row.certificates || row.linkedCertificates || [];
      if (!certs.some(c => c.id === certId)) return row;

      const updatedCerts = certs.map(c => {
        if (c.id !== certId) return c;
        const updatedCert = { ...c, [fieldKey]: value };
        
        setModifiedCerts(prev => ({
          ...prev,
          [certId]: {
            ...(prev[certId] || {}),
            ...updatedCert
          }
        }));

        return updatedCert;
      });

      return {
        ...row,
        certificates: updatedCerts,
        linkedCertificates: updatedCerts
      };
    }));
  };

  const handleSaveCertsSpreadsheet = async () => {
    const certsToSave = Object.values(modifiedCerts);
    if (certsToSave.length === 0) {
      showToast('Tidak ada perubahan data sertifikat yang perlu disimpan.', 'info');
      return;
    }

    try {
      setIsSaving(true);
      await Promise.all(
        certsToSave.map(c => {
          const payload = {
            namaSertifikat: c.namaSertifikat,
            noSertifikat: c.noSertifikat,
            instansi: c.instansi,
            terbit: c.terbit,
            expired: c.expired,
            status: c.status,
            keterangan: c.keterangan
          };
          return api.put(`/certificates/${c.id}`, payload);
        })
      );

      showToast('Semua perubahan data sertifikat berhasil disimpan!', 'success');
      loadData();
    } catch (err) {
      console.error('Failed to save certificates:', err);
      showToast('Gagal menyimpan perubahan data sertifikat.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCert = (id) => {
    showConfirm(
      'Apakah Anda yakin ingin menghapus data sertifikat ini? Berkas sertifikat terlampir juga akan ikut terhapus.',
      'Hapus Data Sertifikat',
      async () => {
        try {
          setIsSaving(true);
          await api.delete(`/certificates/${id}`);
          showToast('Data sertifikat berhasil dihapus!', 'success');
          loadData();
        } catch (err) {
          console.error('Failed to delete certificate:', err);
          showToast('Gagal menghapus data sertifikat.', 'error');
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  const getModuleLabel = () => {
    if (!categoryKey) return '';
    return categoryKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return {
    activeTab, setActiveTab,
    categoryKey, setCategoryKey,
    isLoading,
    isSaving,
    columns, setColumns,
    isAddColOpen, setIsAddColOpen,
    newColLabel, setNewColLabel,
    newColType, setNewColType,
    draggedColIndex, setDraggedColIndex,
    dragOverColIndex, setDragOverColIndex,
    rows, setRows,
    barisMode, setBarisMode,
    modifiedCerts, setModifiedCerts,
    draggedRowIndex, setDraggedRowIndex,
    dragOverRowIndex, setDragOverRowIndex,
    toast, setToast,
    confirmModal, setConfirmModal,
    showToast,
    showConfirm,
    convertToYYYYMMDD,
    loadData,
    handleColDragStart, handleColDragOver, handleColDrop, toggleColVisibility, handleSaveColumns, handleAddColumn, handleDeleteColumn,
    handleRowDragStart, handleRowDragOver, handleRowDrop,
    handleCellChange, handleChildCellChange, handleSaveRowsSpreadsheet, handleSaveCertsSpreadsheet, handleDeleteRow, handleDeleteCert,
    getModuleLabel
  };
}
