import React, { useState, useEffect } from 'react';
import { 
  Columns, Rows, Plus, Eye, EyeOff, GripVertical, Trash2, 
  Edit3, Save, ArrowLeft, Loader2, PlusCircle, Settings, 
  HelpCircle, Calendar, Hash, Type, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '../services/api';

export default function AturKolomBaris({ categoryKey: propCategoryKey, onBack }) {
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

  // States for Rows
  const [rows, setRows] = useState([]);
  const [barisMode, setBarisMode] = useState('master'); // 'master' | 'child'
  const [modifiedCerts, setModifiedCerts] = useState({}); // id -> cert updates

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
      const rowRes = await api.get(`/master-items?categoryKey=${categoryKey}`);
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
        return {
          ...row,
          keteranganAsli,
          additionalEntities,
          rawMeta
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
    e.dataTransfer.setData('colIndex', index);
  };

  const handleColDragOver = (e) => {
    e.preventDefault();
  };

  const handleColDrop = (e, targetIndex) => {
    const sourceIndex = parseInt(e.dataTransfer.getData('colIndex'), 10);
    if (sourceIndex === targetIndex) return;

    const reordered = [...columns];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Re-index position
    const updated = reordered.map((col, idx) => ({ ...col, position: idx }));
    setColumns(updated);
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
    e.dataTransfer.setData('rowIndex', index);
  };

  const handleRowDragOver = (e) => {
    e.preventDefault();
  };

  const handleRowDrop = (e, targetIndex) => {
    const sourceIndex = parseInt(e.dataTransfer.getData('rowIndex'), 10);
    if (sourceIndex === targetIndex) return;

    const reordered = [...rows];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Re-index position
    const updated = reordered.map((row, idx) => ({ ...row, position: idx }));
    setRows(updated);
  };

  const handleSaveRowsSpreadsheet = async () => {
    setIsSaving(true);
    try {
      const payload = rows.map(r => {
        const payloadKeterangan = JSON.stringify({
          ...(r.rawMeta || {}),
          keteranganAsli: r.keteranganAsli || '',
          additionalEntities: r.additionalEntities || []
        });
        return {
          id: r.id,
          title: r.title,
          code: r.code || '',
          unitLocation: r.unitLocation || '',
          status: r.status || 'Aktif',
          keterangan: payloadKeterangan,
          position: r.position,
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
    switch (categoryKey) {
      case 'peralatan-pabrik': return 'Perizinan Peralatan Pabrik';
      case 'perizinan-aset': return 'Perizinan Aset';
      case 'perizinan-proyek': return 'Perizinan Proyek';
      case 'perizinan-produk': return 'Perizinan Produk';
      default: return 'Perizinan Peralatan Pabrik';
    }
  };

  const childRows = [];
  rows.forEach(master => {
    const certs = master.certificates || master.linkedCertificates || [];
    certs.forEach(cert => {
      childRows.push({
        ...cert,
        masterId: master.id,
        masterTitle: master.title
      });
    });
  });

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>
        )}
        <div className="flex flex-col gap-0.5">
          <h2 className="font-bold text-xl text-[#0F172A]">Atur Kolom & Baris</h2>
          <p className="text-xs text-[#64748B] font-mono-data">Modul: {getModuleLabel()}</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('kolom')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'kolom' 
              ? 'border-[#005ea4] text-[#005ea4]' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Columns className="w-4 h-4" />
          <span>Atur Struktur Kolom</span>
        </button>
        <button
          onClick={() => setActiveTab('baris')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'baris' 
              ? 'border-[#005ea4] text-[#005ea4]' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Rows className="w-4 h-4" />
          <span>Atur Susunan & Data Baris ({rows.length})</span>
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200 min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#005ea4]" />
          <p className="font-mono-data text-xs font-bold">Memuat konfigurasi modul...</p>
        </div>
      ) : (
        <>
          {/* =======================================================
              TAB 1: ATUR KOLOM
              ======================================================= */}
          {activeTab === 'kolom' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sisi Kiri: Draggable List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Susunan & Visibilitas Kolom</span>
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAddColOpen(true)}
                        className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kolom Kustom Baru</span>
                      </button>
                      <button
                        onClick={handleSaveColumns}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-[#00a368] hover:bg-[#008f5a] disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Kolom'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    * Seret (drag-and-drop) baris di bawah menggunakan handle <GripVertical className="inline w-3.5 h-3.5 text-slate-400" /> untuk mengatur posisi kolom dari kiri ke kanan. Klik ikon mata untuk menyembunyikan atau menampilkan kolom di tabel utama.
                  </p>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
                    {columns.map((col, idx) => (
                      <div
                        key={col.fieldKey}
                        draggable
                        onDragStart={(e) => handleColDragStart(e, idx)}
                        onDragOver={handleColDragOver}
                        onDrop={(e) => handleColDrop(e, idx)}
                        className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors group cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">{col.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono-data block">
                              Key: {col.fieldKey} • Tipe: {col.type === 'nominal' ? 'Nominal / Angka' : col.type === 'date' ? 'Tanggal' : 'Teks'}
                              {col.isCustom && <span className="ml-2 text-blue-600 font-bold bg-blue-50 px-1 rounded">Custom</span>}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleColVisibility(idx)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              col.isVisible 
                                ? 'bg-blue-50 border-blue-200 text-[#005ea4] hover:bg-blue-100' 
                                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={col.isVisible ? 'Kolom Terlihat' : 'Kolom Tersembunyi'}
                          >
                            {col.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {col.isCustom ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(col.fieldKey)}
                              className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Kolom"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 select-none">
                              Bawaan
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Preview Tampilan Tabel */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Pratinjau Tata Letak</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Visualisasi bagaimana kolom-kolom ini akan tersusun dari kiri ke kanan pada modul utama:
                  </p>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-white font-mono text-[10px] p-4 space-y-2">
                    <div className="flex border-b border-slate-700 pb-1.5 gap-2 text-slate-400 uppercase font-bold tracking-wider">
                      {columns.filter(c => c.isVisible).map(c => (
                        <div key={c.fieldKey} className="flex-1 truncate" title={c.label}>
                          {c.label}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 text-slate-300 py-1 border-b border-slate-800/40">
                      {columns.filter(c => c.isVisible).map(c => (
                        <div key={c.fieldKey} className="flex-1 truncate">
                          {c.fieldKey === 'no' ? '1' : c.fieldKey === 'title' ? 'Kompresor Gas' : c.fieldKey === 'status' ? 'Aktif' : '...'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =======================================================
              TAB 2: ATUR BARIS
              ======================================================= */}
          {activeTab === 'baris' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Rows className="w-4 h-4 text-slate-500" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Susunan & Manajemen Baris Data ({barisMode === 'master' ? rows.length : childRows.length})
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={barisMode === 'master' ? handleSaveRowsSpreadsheet : handleSaveCertsSpreadsheet}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-[#00a368] hover:bg-[#008f5a] disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
                  </button>
                </div>
              </div>

              {categoryKey !== 'peralatan-pabrik' && (
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl max-w-xs mb-4">
                  <button
                    onClick={() => setBarisMode('master')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      barisMode === 'master'
                        ? 'bg-white text-slate-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Data Master
                  </button>
                  <button
                    onClick={() => setBarisMode('child')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      barisMode === 'child'
                        ? 'bg-white text-slate-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Data Child (Sertifikat)
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                {barisMode === 'master' ? (
                  <>* Gunakan handle <GripVertical className="inline w-3.5 h-3.5 text-slate-400" /> di sebelah kiri untuk menyeret baris ke atas/bawah guna mengatur urutan prioritas atau visual data. Anda juga dapat langsung mengklik dan mengedit isi sel di bawah ini layaknya tabel Excel/Spreadsheet. Urutan dan perubahan nilai akan disimpan permanen ketika tombol hijau di atas diklik.</>
                ) : (
                  <>* Di bawah ini adalah daftar semua sertifikat terhubung (data child) yang dapat diedit langsung dalam format spreadsheet. Klik pada sel data sertifikat untuk mengubah nilainya, lalu simpan dengan tombol hijau di atas.</>
                )}
              </p>

              {/* Data Table with Draggable Rows & Inline Inputs */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono-data uppercase tracking-wider font-bold">
                        {barisMode === 'master' ? (
                          <>
                            <th className="p-3 w-10 text-center"></th>
                            {columns.filter(c => c.isVisible).map(col => (
                              <th key={col.fieldKey} className={`p-3 ${col.fieldKey === 'status' || col.fieldKey === 'no' ? 'text-center' : ''}`}>
                                {col.label}
                              </th>
                            ))}
                          </>
                        ) : (
                          <>
                            <th className="p-3 w-12 text-center">No</th>
                            <th className="p-3 min-w-[150px]">Item Induk</th>
                            <th className="p-3 min-w-[150px]">Nama Sertifikat</th>
                            <th className="p-3 min-w-[150px]">Nomor Sertifikat</th>
                            <th className="p-3 min-w-[150px]">Instansi Penerbit</th>
                            <th className="p-3 min-w-[150px] text-center">Tanggal Terbit</th>
                            <th className="p-3 min-w-[150px] text-center">Tanggal Expired</th>
                            <th className="p-3 min-w-[120px] text-center">Status</th>
                            <th className="p-3 min-w-[200px]">Keterangan / Catatan</th>
                          </>
                        )}
                        <th className="p-3 text-right w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {barisMode === 'master' ? (
                        rows.map((row, idx) => (
                          <tr 
                            key={row.id}
                            draggable
                            onDragStart={(e) => handleRowDragStart(e, idx)}
                            onDragOver={handleRowDragOver}
                            onDrop={(e) => handleRowDrop(e, idx)}
                            className="hover:bg-slate-50/50 bg-white transition-colors group"
                          >
                            <td className="p-3 text-center cursor-grab active:cursor-grabbing w-10">
                              <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 mx-auto transition-colors" />
                            </td>
                            {columns.filter(c => c.isVisible).map(col => {
                              if (col.fieldKey === 'no') {
                                return (
                                  <td key={col.fieldKey} className="p-3 text-center font-mono-data text-slate-400 font-bold w-12">
                                    {idx + 1}
                                  </td>
                                );
                              }

                              if (col.fieldKey === 'status') {
                                return (
                                  <td key={col.fieldKey} className="p-3 text-center w-36">
                                    <select
                                      value={row.status || 'Aktif'}
                                      onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1 outline-none text-xs font-bold text-center w-full cursor-pointer transition-colors"
                                    >
                                      <option value="Aktif">Aktif</option>
                                      <option value="Expired">Expired</option>
                                      <option value="Perpanjang">Perpanjang</option>
                                      <option value="Afkir">Afkir</option>
                                      <option value="Spare">Spare</option>
                                      <option value="Rusak">Rusak</option>
                                    </select>
                                  </td>
                                );
                              }

                              if (col.fieldKey === 'certCount') {
                                return (
                                  <td key={col.fieldKey} className="p-3 text-center text-slate-600 font-mono-data font-bold w-36">
                                    {row.certificates?.length || 0}
                                  </td>
                                );
                              }

                              if (col.fieldKey === 'user') {
                                const val = row.rawMeta?.penanggungJawab || '';
                                return (
                                  <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                      placeholder="Ketik..."
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-semibold"
                                    />
                                  </td>
                                );
                              }

                              if (!col.isCustom && col.fieldKey !== 'jenisPeralatan') {
                                const val = col.fieldKey === 'title' ? (row.title || '') :
                                            col.fieldKey === 'code' ? (row.code || '') :
                                            col.fieldKey === 'unitLocation' ? (row.unitLocation || '') :
                                            (row.keteranganAsli || '');
                                return (
                                  <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                      placeholder="Ketik..."
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-semibold"
                                    />
                                  </td>
                                );
                              }

                              // Custom Column Cells (or jenisPeralatan which is stored in additionalEntities)
                              const ent = row.additionalEntities?.find(e => e.key === col.label);
                              const val = ent ? ent.value : (col.fieldKey === 'jenisPeralatan' ? (row.title || '') : '');

                              if (col.type === 'date') {
                                return (
                                  <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                    <input
                                      type="date"
                                      value={val}
                                      onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                      onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }}
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold"
                                    />
                                  </td>
                                );
                              }

                              if (col.type === 'nominal') {
                                return (
                                  <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                    <input
                                      type="text"
                                      placeholder="Angka saja..."
                                      value={val ? Number(val.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                                      onChange={(e) => {
                                        const rawNum = e.target.value.replace(/\D/g, '');
                                        handleCellChange(row.id, col.fieldKey, col.isCustom, rawNum);
                                      }}
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full text-right transition-colors font-mono font-bold text-slate-800"
                                    />
                                  </td>
                                );
                              }

                              return (
                                <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                  <input
                                    type="text"
                                    placeholder="Ketik..."
                                    value={val}
                                    onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                    className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors text-slate-800 font-medium"
                                  />
                                </td>
                              );
                            })}
                            <td className="p-3 text-right whitespace-nowrap w-16">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1.5 hover:bg-rose-50 border border-rose-200 rounded-lg text-rose-600 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                                title="Hapus Baris"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        childRows.map((c, idx) => (
                          <tr key={c.id} className="hover:bg-slate-50/50 bg-white transition-colors">
                            <td className="p-3 text-center text-slate-400 font-mono-data font-bold w-12">
                              {idx + 1}
                            </td>
                            <td className="p-3 font-semibold text-slate-500 bg-slate-50/40 max-w-[200px] truncate" title={c.masterTitle}>
                              {c.masterTitle}
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="text"
                                value={c.namaSertifikat || ''}
                                onChange={(e) => handleChildCellChange(c.id, 'namaSertifikat', e.target.value)}
                                placeholder="Ketik..."
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-semibold"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="text"
                                value={c.noSertifikat || ''}
                                onChange={(e) => handleChildCellChange(c.id, 'noSertifikat', e.target.value)}
                                placeholder="Ketik..."
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold text-slate-800"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="text"
                                value={c.instansi || ''}
                                onChange={(e) => handleChildCellChange(c.id, 'instansi', e.target.value)}
                                placeholder="Ketik..."
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-semibold"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="date"
                                value={c.terbit ? c.terbit.substring(0, 10) : ''}
                                onChange={(e) => handleChildCellChange(c.id, 'terbit', e.target.value)}
                                onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }}
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold text-center"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="date"
                                value={c.expired ? c.expired.substring(0, 10) : ''}
                                onChange={(e) => handleChildCellChange(c.id, 'expired', e.target.value)}
                                onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }}
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold text-center text-rose-700"
                              />
                            </td>
                            <td className="p-3 text-center min-w-[120px]">
                              <select
                                value={c.status || 'Aktif'}
                                onChange={(e) => handleChildCellChange(c.id, 'status', e.target.value)}
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1 outline-none text-xs font-bold text-center w-full cursor-pointer transition-colors"
                              >
                                <option value="Aktif">Aktif</option>
                                <option value="Expired">Expired</option>
                                <option value="Proses">Proses</option>
                                <option value="Afkir">Afkir</option>
                                <option value="EXEMPT">EXEMPT</option>
                              </select>
                            </td>
                            <td className="p-1 min-w-[200px]">
                              <input
                                type="text"
                                value={c.keterangan || ''}
                                onChange={(e) => handleChildCellChange(c.id, 'keterangan', e.target.value)}
                                placeholder="Ketik..."
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-medium text-slate-600"
                              />
                            </td>
                            <td className="p-3 text-right whitespace-nowrap w-16">
                              <button
                                onClick={() => handleDeleteCert(c.id)}
                                className="p-1.5 hover:bg-rose-50 border border-rose-200 rounded-lg text-rose-600 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                                title="Hapus Sertifikat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}

                      {barisMode === 'master' && rows.length === 0 && (
                        <tr>
                          <td colSpan={columns.filter(c => c.isVisible).length + 2} className="p-12 text-center text-slate-400 italic">
                            Belum ada baris data.
                          </td>
                        </tr>
                      )}

                      {barisMode === 'child' && childRows.length === 0 && (
                        <tr>
                          <td colSpan={10} className="p-12 text-center text-slate-400 italic">
                            Belum ada data sertifikat (child).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =======================================================
          MODAL 1: TAMBAH KOLOM BARU
          ======================================================= */}
      {isAddColOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm">Tambah Kolom Kustom Baru</h4>
              <button onClick={() => setIsAddColOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddColumn} className="p-6 space-y-4 text-xs font-mono-data">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Nama / Label Kolom</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kapasitas Aset"
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] outline-none text-xs font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-800 block mb-1">Tipe Data Input</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'text', label: 'Teks', icon: Type },
                    { val: 'nominal', label: 'Nominal / Angka', icon: Hash },
                    { val: 'date', label: 'Tanggal', icon: Calendar }
                  ].map(t => {
                    const Icon = t.icon;
                    const isSelected = newColType === t.val;
                    return (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setNewColType(t.val)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer font-bold ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200 text-[#005ea4]' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddColOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Tambah Kolom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" /> }
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-900">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-mono-data">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Add a simple Close X icon placeholder in lucide-react if needed, or import standard
const X = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
