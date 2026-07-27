import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Edit3,
  RotateCcw,
  Ban,
  Save,
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Building2,
  ShieldCheck,
  FileCheck,
  ExternalLink,
  History,
  Calendar,
  Layers,
  Sparkles,
  UploadCloud,
  Trash2,
  RefreshCw,
  PlusCircle,
  X,
  Upload,
  Link2,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import { getMasterItemById, deleteMasterItem, createCertificateForMasterItem, updateCertificate, deleteCertificate, updateMasterItem } from '../services/masterItemsService';

export default function DocumentDetailPage({ item, onBack, onSaveUpdate, onQuickRenew, onQuickDecommission, onDeleteSuccess, onRefreshRequired }) {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const manualFileInputRef = useRef(null);
  const [selectedHistoryToDelete, setSelectedHistoryToDelete] = useState(null);
  const [editingHistoryRow, setEditingHistoryRow] = useState(null);
  const [selectedHistoryFile, setSelectedHistoryFile] = useState(null);
  const editHistoryFileInputRef = useRef(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAfkirModalOpen, setIsAfkirModalOpen] = useState(false);
  const [isAfkiring, setIsAfkiring] = useState(false);
  const [isAktifkanModalOpen, setIsAktifkanModalOpen] = useState(false);
  const [isAktifkaning, setIsAktifkaning] = useState(false);

  // Multi-Certificate Hub State
  const [linkedCerts, setLinkedCerts] = useState(item.linkedCertificates || []);
  const [isAddCertModalOpen, setIsAddCertModalOpen] = useState(false);
  const [newCertData, setNewCertData] = useState({
    jenisSertifikat: '',
    noSertifikat: '',
    instansi: '',
    terbit: '',
    expired: '',
    status: 'Aktif',
    hasPdf: false,
    pdfName: ''
  });
  const [deletingLinkedCertId, setDeletingLinkedCertId] = useState(null);

  // Custom Renew Exempt Modal State
  const [isRenewExemptModalOpen, setIsRenewExemptModalOpen] = useState(false);
  const [renewExemptDate, setRenewExemptDate] = useState('');
  const [isRenewingExempt, setIsRenewingExempt] = useState(false);

  // Header Perpanjangan Confirmation State
  const [isConfirmRenewHeaderModalOpen, setIsConfirmRenewHeaderModalOpen] = useState(false);
  const [isRenewingHeader, setIsRenewingHeader] = useState(false);
  const [isConfirmCancelHeaderModalOpen, setIsConfirmCancelHeaderModalOpen] = useState(false);
  const [isCancelingHeader, setIsCancelingHeader] = useState(false);

  const targetCert = item?.currentCert || item?.cert || null;
  const parentDoc = item?.parentDoc || item;
  const effectiveCategoryKey = parentDoc.categoryKey || item.categoryKey || '';
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
  const isGenericDoc = !isHaki && !isEquipment;

  // Form State for Editing
  // When isSingleCertScope: init from targetCert fields; else fallback to item fields
  const [formData, setFormData] = useState({
    merekItem: parentDoc.title || parentDoc.merekItem || item.merekItem || item.title || item.judulCiptaan || '',
    jenisPeralatan: isSingleCertScope
      ? (targetCert?.jenisSertifikat || parentDoc.title || '')
      : (item.jenisPeralatan || item.jenisCert || item.kategoriDokumen || item.jenisCiptaan || item.title || ''),
    tipe: isSingleCertScope
      ? (targetCert?.noSertifikat || parentDoc.code || '')
      : (item.tipe || item.code || ''),
    nomorSeri: item.nomorSeri || item.nomorSeriTipe || '',
    kapasitas: item.kapasitas || '',
    lokasi: parentDoc.unitLocation || parentDoc.unit || item.lokasi || item.unitPabrik || item.unit || '',
    user: targetCert?.instansi || item.user || item.issuer || 'Umum',
    status: isSingleCertScope ? (targetCert?.status || 'Aktif') : (item.status || 'Aktif'),
    noSertifikat: isSingleCertScope
      ? (targetCert?.noSertifikat || '')
      : (item.noSertifikat || item.certNo || item.certificateNo || ''),
    tanggalInspeksi: isSingleCertScope
      ? (targetCert?.terbit || parentDoc.createdAt || '')
      : (item.tanggalInspeksi || item.issueDate || item.tanggalCiptaan || ''),
    tanggalCiptaan: item.tanggalCiptaan || item.tanggalInspeksi || item.issueDate || '',
    masaBerlaku: item.masaBerlaku || '5 Tahun',
    terbit: isSingleCertScope ? (targetCert?.terbit || '') : (item.terbit || item.issueDate || ''),
    berakhir: isSingleCertScope ? (targetCert?.expired || '') : (item.berakhir || item.expiryDate || item.kapanBerakhir || ''),
    keterangan: targetCert?.instansi || item.keterangan || item.notes || item.agency || (isHaki ? 'Dirjen Kekayaan Intelektual (Kemenkumham RI)' : 'Disnaker Kaltim / Sucofindo'),
    fileUrl: isSingleCertScope ? (targetCert?.fileUrl || '') : (item.fileUrl || item.pdfUrl || '')
  });

  // History Certificates State (Real Database)
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
        return;
      }

      let certList = detail.certificates;

      // When scoped to a specific cert (Perizinan Proyek/Aset/Produk):
      // Show ALL certs with the same jenisSertifikat as the selected cert.
      // This allows perpanjangan (renewals) of the same cert type to appear in history.
      // Primary anchor: find jenisSertifikat from targetCert.id match, then filter by jenisSertifikat.
      if (isSingleCertScope && targetCert?.id) {
        const anchorCert = certList.find(c => c.id === targetCert.id);
        const scopedJenis = anchorCert?.jenisSertifikat || targetCert?.jenisSertifikat;
        if (scopedJenis) {
          // Show all certs with same jenisSertifikat (includes renewals)
          certList = certList.filter(c => c.jenisSertifikat === scopedJenis);
        } else {
          // Fallback: exact ID only
          certList = certList.filter(c => c.id === targetCert.id);
        }
      }

      const mappedCerts = certList.map(c => ({
        id: c.id,
        periode: c.terbit && c.expired ? `${c.terbit.substring(0, 4)} – ${c.expired.substring(0, 4)}` : 'Periode SK',
        noSertifikat: c.noSertifikat || '-',
        jenisSertifikat: c.jenisSertifikat || '-',
        instansi: c.instansi || '-',
        terbit: c.terbit || '-',
        expired: c.expired || '-',
        status: c.status || 'Aktif',
        fileUrl: c.fileUrl || null,
        pdfName: c.fileUrl ? c.fileUrl.split('/').pop() : 'sertifikat.pdf',
        rawCert: c
      }));

      setHistoryList(mappedCerts);

      // Only update formData from DB if NOT scoped — when scoped, formData is already
      // correctly set from targetCert in useState initialization
      if (!isSingleCertScope) {
        const activeCerts = mappedCerts.filter(c => c.status === 'Aktif' || c.status === 'Active');
        let primaryCert = null;
        if (activeCerts.length > 0) {
          primaryCert = activeCerts.slice().sort((a, b) => {
            const dateA = new Date(a.expired && a.expired !== '-' ? a.expired : '1970-01-01').getTime();
            const dateB = new Date(b.expired && b.expired !== '-' ? b.expired : '1970-01-01').getTime();
            return dateB - dateA;
          })[0];
        } else if (mappedCerts.length > 0) {
          primaryCert = mappedCerts[0];
        }
        if (primaryCert) {
          setFormData(prev => ({
            ...prev,
            noSertifikat: primaryCert.noSertifikat,
            jenisPeralatan: primaryCert.rawCert?.jenisSertifikat || prev.jenisPeralatan,
            terbit: primaryCert.terbit,
            berakhir: primaryCert.expired,
            status: primaryCert.status,
            fileUrl: primaryCert.fileUrl || prev.fileUrl
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load history from DB", err);
      setHistoryList([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [item]);


  // Form Upload Manual State
  const [uploadData, setUploadData] = useState({
    noSertifikat: '',
    instansi: 'Disnaker Kaltim / Sucofindo',
    terbit: '2026-07-23',
    expired: '2029-07-23',
    target: 'archive', // default to adding certificate to history
    fileName: ''
  });

  const openUploadModal = (target = 'archive') => {
    setUploadData({
      noSertifikat: '',
      instansi: 'Disnaker Kaltim / Sucofindo',
      terbit: new Date().toISOString().split('T')[0],
      expired: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
      target: target,
      fileName: ''
    });
    setSelectedUploadFile(null);
    setIsUploadModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const targetId = item.MasterId || item.id;
      const updated = await updateMasterItem(targetId, formData);
      if (onSaveUpdate) {
        onSaveUpdate({
          ...item,
          ...formData,
          ...updated,
          id: item.id
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update master item:', err);
      alert('Gagal menyimpan perubahan data: ' + (err.message || 'Error'));
    }
  };

  const handleAfkir = () => {
    setIsAfkirModalOpen(true);
  };

  const confirmAfkir = async () => {
    setIsAfkiring(true);
    try {
      const targetId = item.MasterId || item.id;
      const updated = await updateMasterItem(targetId, { status: 'Afkir' });
      setFormData(prev => ({ ...prev, status: 'Afkir' }));
      if (onSaveUpdate) {
        onSaveUpdate({
          ...item,
          ...formData,
          status: 'Afkir',
          ...updated,
          id: item.id
        });
      }
      setIsAfkirModalOpen(false);
    } catch (err) {
      console.error('Failed to update master item status to Afkir:', err);
      alert('Gagal mengubah status menjadi Afkir: ' + (err.message || 'Error'));
    } finally {
      setIsAfkiring(false);
    }
  };

  const handleAktifkan = () => {
    setIsAktifkanModalOpen(true);
  };

  const confirmAktifkan = async () => {
    setIsAktifkaning(true);
    try {
      const targetId = item.MasterId || item.id;
      const updated = await updateMasterItem(targetId, { status: 'Aktif' });
      setFormData(prev => ({ ...prev, status: 'Aktif' }));
      if (onSaveUpdate) {
        onSaveUpdate({
          ...item,
          ...formData,
          status: 'Aktif',
          ...updated,
          id: item.id
        });
      }
      setIsAktifkanModalOpen(false);
    } catch (err) {
      console.error('Failed to update master item status to Aktif:', err);
      alert('Gagal mengaktifkan kembali: ' + (err.message || 'Error'));
    } finally {
      setIsAktifkaning(false);
    }
  };

  const [selectedUploadFile, setSelectedUploadFile] = useState(null);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileUrl = null;
      if (selectedUploadFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedUploadFile);
        const uploadRes = await fetch('http://localhost:3000/api/v1/document-history/upload', {
          method: 'POST',
          body: formDataUpload
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          fileUrl = uploadJson?.data?.url || uploadJson?.data?.fileUrl || null;
        } else {
          const errText = await uploadRes.text();
          throw new Error(`Upload file gagal (${uploadRes.status}): ${errText}`);
        }
      }

      const masterItemId = parentDoc.MasterId || parentDoc.id || item.MasterId || item.id;
      const targetIsUpdate = uploadData.target === 'current' && isSingleCertScope && targetCert?.id;

      if (targetIsUpdate) {
        // UPDATE cert yang ada — koreksi file/no sertifikat, tidak buat row baru
        const updatePayload = {
          noSertifikat: uploadData.noSertifikat.trim() || targetCert.noSertifikat,
          status: 'Aktif',
        };
        if (uploadData.terbit) updatePayload.terbit = uploadData.terbit;
        if (uploadData.expired) updatePayload.expired = uploadData.expired;
        if (uploadData.instansi) updatePayload.instansi = uploadData.instansi;
        if (fileUrl) updatePayload.fileUrl = fileUrl;
        await updateCertificate(targetCert.id, updatePayload);
      } else {
        // CREATE sertifikat baru — perpanjangan atau tambah histori
        // Jika isSingleCertScope, gunakan jenisSertifikat yang sama supaya relevan
        const certPayload = {
          itemId: masterItemId,
          jenisSertifikat: targetCert?.jenisSertifikat || item.jenisPeralatan || item.title || 'Riksa Uji Disnaker',
          noSertifikat: uploadData.noSertifikat.trim() || `CERT-${Date.now()}`,
          status: 'Aktif',
        };
        if (uploadData.terbit) certPayload.terbit = uploadData.terbit;
        if (uploadData.expired) certPayload.expired = uploadData.expired;
        if (uploadData.instansi) certPayload.instansi = uploadData.instansi;
        if (fileUrl) certPayload.fileUrl = fileUrl;
        await createCertificateForMasterItem(certPayload);
      }

      await fetchHistory();
      setIsUploadModalOpen(false);
      setSelectedUploadFile(null);
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      console.error("Failed to upload manual certificate:", err);
      alert("Gagal mengunggah sertifikat: " + (err.message || 'Error'));
    }
  };

  const handleDeleteHistoryRow = async (id) => {
    try {
      await deleteCertificate(id);
      await fetchHistory();
      setSelectedHistoryToDelete(null);
    } catch (err) {
      console.error("Failed to delete certificate:", err);
      alert("Gagal menghapus sertifikat: " + (err.message || "Error"));
    }
  };

  const handleSaveHistoryRowEdit = async (e) => {
    e.preventDefault();
    if (!editingHistoryRow) return;

    try {
      let fileUrl = editingHistoryRow.fileUrl;
      if (selectedHistoryFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedHistoryFile);
        const uploadRes = await fetch('http://localhost:3000/api/v1/document-history/upload', {
          method: 'POST',
          body: formDataUpload
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          fileUrl = uploadJson?.data?.url || uploadJson?.data?.fileUrl || fileUrl;
        }
      }

      const updatePayload = {
        noSertifikat: editingHistoryRow.noSertifikat,
        status: editingHistoryRow.status || 'Aktif',
      };
      if (editingHistoryRow.terbit) updatePayload.terbit = editingHistoryRow.terbit;
      if (editingHistoryRow.expired) updatePayload.expired = editingHistoryRow.expired;
      if (fileUrl) updatePayload.fileUrl = fileUrl;

      await updateCertificate(editingHistoryRow.id, updatePayload);
      await fetchHistory();
      setEditingHistoryRow(null);
      setSelectedHistoryFile(null);
    } catch (err) {
      console.error("Failed to update certificate:", err);
      alert("Gagal memperbarui sertifikat: " + (err.message || 'Error'));
    }
  };

  const handleDeleteMasterItem = async () => {
    try {
      setIsDeleting(true);
      const targetId = item.MasterId || item.id;
      await deleteMasterItem(targetId);
      setIsDeleteDialogOpen(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        onBack();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data: ' + (error.message || 'Error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const currentStatus = formData.status || item.status || 'Aktif';
  const isAfkirStatus = currentStatus.toLowerCase() === 'afkir' || currentStatus.toLowerCase() === 'decommissioned';

  return (
    <div className="p-8 space-y-6 font-sans-clean max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Navigation & Back Button Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-[#005ea4] text-slate-700 hover:text-white rounded-xl transition-all cursor-pointer shadow-2xs group"
            title="Kembali ke Daftar Dokumen"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-2xl text-slate-900 tracking-tight">
                {isSingleCertScope
                  ? (targetCert?.jenisSertifikat || formData.jenisPeralatan || formData.merekItem)
                  : formData.merekItem}
              </h2>
              {isSingleCertScope && (
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold font-mono-data">
                  {targetCert?.noSertifikat || formData.noSertifikat || 'Sertifikat'}
                </span>
              )}
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#005ea4] border border-blue-200 rounded-lg text-xs font-bold font-mono-data">
                {isSingleCertScope ? `Entity: ${parentDoc.id || item.id}` : `ID: ${item.id}`}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono-data mt-0.5">
              {isSingleCertScope
                ? `Entitas: ${formData.merekItem} · Detail & Riwayat Sertifikat Terpilih`
                : 'Detail Spesifikasi, Legalitas Sertifikat, dan Rekam Jejak Audit Dokumen'}
            </p>
          </div>
        </div>

        {/* Action Header Bar */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono-data">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Edit3 className="w-4 h-4 text-amber-700" />
              <span>Edit Data Dokumen</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
            >
              Batal Edit
            </button>
          )}

          {formData.status === 'Perpanjang' || formData.status === 'in_progress' ? (
            <>
              <button
                onClick={() => openUploadModal('archive')}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <UploadCloud className="w-4 h-4 text-amber-700" />
                <span>Selesai & Upload File Baru</span>
              </button>
              <button
                onClick={() => setIsConfirmCancelHeaderModalOpen(true)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <X className="w-4 h-4 text-rose-600" />
                <span>Batal Perpanjangan</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsConfirmRenewHeaderModalOpen(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Perpanjang</span>
            </button>
          )}

          {isAfkirStatus ? (
            <button
              onClick={handleAktifkan}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#005ea4] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-[#005ea4]" />
              <span>Batal Afkir / Aktifkan</span>
            </button>
          ) : (
            <button
              onClick={handleAfkir}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Ban className="w-4 h-4 text-slate-300" />
              <span>Afkir</span>
            </button>
          )}

          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ml-2"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Hapus Data</span>
          </button>
        </div>
      </div>

      {/* CLEAN NEUTRAL STATUS & SISA HARI INFO */}
      {(() => {
        let sisaHariCalc = item.sisaHari;
        if (sisaHariCalc === undefined || sisaHariCalc === null) {
          const expStr = formData.berakhir || item.berakhir || item.expiryDate;
          if (expStr) {
            const expDate = new Date(expStr);
            const today = new Date();
            sisaHariCalc = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          } else {
            sisaHariCalc = 0;
          }
        }

        const formattedExpiry = formData.berakhir || item.berakhir || item.expiryDate || '-';

        return (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono-data text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Status Dokumen</span>
                <span className="font-bold text-sm text-slate-900">{currentStatus}</span>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Sisa Masa Berlaku</span>
                <span className="font-bold text-sm text-slate-900">
                  {isAfkirStatus ? 'Afkir / Non-Aktif' : sisaHariCalc <= 0 ? `Expired (${Math.abs(sisaHariCalc)} hari lalu)` : `${sisaHariCalc.toLocaleString()} Hari`}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono-data">
              <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Tanggal Expired</span>
              <span className="font-bold text-xs text-slate-700">{formattedExpiry}</span>
            </div>
          </div>
        );
      })()}

      {isEditing ? (
        /* EDIT FORM PAGE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 font-mono-data">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                Mode Edit Data {isHaki ? 'Hak Cipta (HAKI)' : isEquipment ? 'Peralatan Pabrik' : 'Dokumen Perizinan'} — Perbarui informasi di bawah ini:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {isHaki ? 'Judul Ciptaan' : 'Merek / Nama Item'}
                </label>
                <input
                  type="text"
                  value={formData.merekItem}
                  onChange={(e) => setFormData({ ...formData, merekItem: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {isHaki ? 'Jenis Ciptaan' : 'Jenis Peralatan / Kategori'}
                </label>
                <input
                  type="text"
                  value={formData.jenisPeralatan}
                  onChange={(e) => setFormData({ ...formData, jenisPeralatan: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>

              {isHaki ? (
                <>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Tanggal Ciptaan / Deklarasi</label>
                    <input
                      type="date"
                      value={formData.tanggalCiptaan}
                      onChange={(e) => setFormData({ ...formData, tanggalCiptaan: e.target.value, terbit: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Masa Berlaku Perlindungan</label>
                    <input
                      type="text"
                      value={formData.masaBerlaku}
                      onChange={(e) => setFormData({ ...formData, masaBerlaku: e.target.value })}
                      placeholder="Contoh: 5 Tahun / Seumur Hidup"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Tipe / Kode</label>
                    <input
                      type="text"
                      value={formData.tipe}
                      onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Nomor Seri / Tag</label>
                    <input
                      type="text"
                      value={formData.nomorSeri}
                      onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Kapasitas SWL / Tekanan</label>
                    <input
                      type="text"
                      value={formData.kapasitas}
                      onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Lokasi / Unit Pabrik</label>
                    <input
                      type="text"
                      value={formData.lokasi}
                      onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">User / Dept Penanggung Jawab</label>
                    <input
                      type="text"
                      value={formData.user}
                      onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Status Fisik Operasional</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs cursor-pointer"
                    >
                      <option value="Aktif">Aktif (Normal)</option>
                      <option value="Spare">Spare (Cadangan)</option>
                      <option value="Repair">Repair (Overhaul)</option>
                      <option value="Rusak">Rusak (Out of Service)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {isHaki ? 'No. Sertifikat HAKI (e-HakCipta)' : 'No. Sertifikat SK Active'}
                </label>
                <input
                  type="text"
                  value={formData.noSertifikat}
                  onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5 text-rose-700">
                  {isHaki ? 'Kapan Berakhir (Kadaluarsa)' : 'Tanggal Expired (Kadaluarsa)'}
                </label>
                <input
                  type="text"
                  value={formData.berakhir}
                  onChange={(e) => setFormData({ ...formData, berakhir: e.target.value })}
                  placeholder="YYYY-MM-DD atau Seumur Hidup"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                {isHaki ? 'Instansi Penerbit / Keterangan Hak Cipta' : 'Keterangan & Catatan Pengujian'}
              </label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Data</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* READ-ONLY FULL DETAIL DISPLAY PAGE */
        <div className="space-y-6">
          {/* SECTION 1: MAIN SPECIFICATION GRID (DYNAMIC BY TYPE) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#005ea4]" />
              <span>
                {isHaki
                  ? 'Spesifikasi & Identitas Hak Cipta (HAKI)'
                  : isEquipment
                    ? 'Spesifikasi Utama & Identitas Aset Peralatan'
                    : 'Spesifikasi Dokumen Perizinan'}
              </span>
            </h4>

            {isHaki ? (
              /* DYNAMIC HAKI / ADMINISTRASI LAINNYA GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Judul Ciptaan</span>
                  <span className="font-bold text-slate-900 text-sm block">{formData.merekItem}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Jenis Ciptaan</span>
                  <span className="font-bold text-[#005ea4] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                    {formData.jenisPeralatan}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tanggal Ciptaan</span>
                  <span className="font-bold text-slate-800">{formData.tanggalCiptaan || '2024-03-10'}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Masa Berlaku Perlindungan</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                    {formData.masaBerlaku}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Kapan Berakhir</span>
                  <span className="font-bold text-rose-700">{formData.berakhir}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Instansi Penerbit HAKI</span>
                  <span className="font-bold text-slate-800 font-sans">{formData.keterangan || 'Dirjen KI Kemenkumham'}</span>
                </div>
              </div>
            ) : (
              /* DYNAMIC EQUIPMENT & GENERIC MACHINERY GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono-data text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Merek / Nama Item</span>
                  <span className="font-bold text-slate-900 text-sm block">{formData.merekItem}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Jenis Peralatan</span>
                  <span className="font-bold text-[#005ea4]">{formData.jenisPeralatan}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Unit Pabrik / Lokasi</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                    {formData.lokasi}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Status Fisik Operasional</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                    {formData.status}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tipe / Kode</span>
                  <span className="font-bold text-slate-800">{formData.tipe}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Nomor Seri / Tag</span>
                  <span className="font-bold text-slate-800">{formData.nomorSeri}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Kapasitas SWL / Beban</span>
                  <span className="font-bold text-slate-800">{formData.kapasitas || '-'}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">User / Dept Penanggung Jawab</span>
                  <span className="font-bold text-slate-800">{formData.user || 'Dept. Operasi'}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PERMIT & CERTIFICATE LEGAL STATUS */}
          {item.documentStatus === 'EXEMPT' ? (
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-6 space-y-4 font-mono-data text-center">
              <h4 className="font-bold text-sm text-indigo-900 flex items-center justify-center gap-2 mb-2">
                <ShieldAlert className="w-6 h-6 text-indigo-600" />
                <span>Tanpa Sertifikat (Catatan / Exempt)</span>
              </h4>
              <p className="text-sm font-bold text-indigo-800 bg-indigo-100/50 p-3 rounded-xl border border-indigo-200 inline-block">
                Alasan: {item.exemptionNote || 'Tidak ada catatan khusus'}
              </p>
              
              <div className="text-xs text-slate-600 mt-2 p-2 bg-white/50 rounded-lg inline-block border border-indigo-100 mx-auto">
                <span className="italic block mb-1">* Ini data bawaan dari Master CSV.</span>
                <span className="font-semibold block">
                  Estimasi Expired / Jatuh Tempo: <span className="text-rose-600 font-bold ml-1">{formData.berakhir || '-'}</span>
                </span>
              </div>

              <div className="pt-4 mt-2 border-t border-indigo-200/60 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const defaultDate = formData.berakhir && formData.berakhir !== '-' ? formData.berakhir : '';
                    setRenewExemptDate(defaultDate);
                    setIsRenewExemptModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Ajukan Perpanjangan</span>
                </button>
                <button
                  onClick={() => openUploadModal('archive')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Sertifikat Sekarang</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6 space-y-4 font-mono-data">
              {/* Compute active primary cert with furthest expiry from historyList */}
              {(() => {
                const activeCerts = historyList.filter(c => (c.status || '').toLowerCase() === 'aktif' || (c.status || '').toLowerCase() === 'active');
                const primaryCert = activeCerts.length > 0
                  ? activeCerts.slice().sort((a, b) => {
                      const dateA = new Date(a.expired && a.expired !== '-' ? a.expired : '1970-01-01').getTime();
                      const dateB = new Date(b.expired && b.expired !== '-' ? b.expired : '1970-01-01').getTime();
                      return dateB - dateA; // descending → furthest expiry first
                    })[0]
                  : (historyList.length > 0 ? historyList[0] : null);

                const displayNoSert = primaryCert?.noSertifikat || formData.noSertifikat || '-';
                const displayExpired = primaryCert?.expired || formData.berakhir || '-';
                const displayFileUrl = primaryCert?.fileUrl || formData.fileUrl || null;

                return (
                  <>
                    <h4 className="font-bold text-sm text-slate-900 border-b border-blue-200 pb-3 flex items-center justify-between font-sans">
                      <span className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-[#005ea4]" />
                        <span>Status Legalitas Sertifikat Active</span>
                      </span>
                      <span className="text-xs text-[#005ea4] font-mono-data font-bold">Terverifikasi Disnaker / Kemenperin</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-4 bg-[#f8fafc] p-4 rounded-xl border border-blue-100">
                      <div>
                        <span className="text-[11px] text-slate-500 font-sans block mb-0.5">No. Sertifikat Active</span>
                        <span className="font-bold text-[#005ea4] text-base">{displayNoSert}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tanggal Expired (Kadaluarsa)</span>
                        <span className="font-bold text-rose-700 text-base">{displayExpired}</span>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs border-t border-blue-200/80">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#005ea4]" />
                        <span className="font-bold text-slate-800">
                          {displayFileUrl ? 'Dokumen Digital SK (PDF Terlampir)' : 'Dokumen Digital SK (Belum Ada File)'}
                        </span>
                      </div>
                      {displayFileUrl ? (
                        <button
                          onClick={() => {
                            const fullUrl = displayFileUrl.startsWith('http') ? displayFileUrl : `http://localhost:3000${displayFileUrl}`;
                            window.open(fullUrl, '_blank');
                          }}
                          className="px-4 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Buka File PDF</span>
                          <ExternalLink className="w-3.5 h-3.5 text-white" />
                        </button>
                      ) : (
                        <button
                          onClick={() => openUploadModal('current')}
                          className="px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Unggah File PDF</span>
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* SECTION 3: REKAM JEJAK / RIWAYAT PERPANJANGAN & ARSIP PDF */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#005ea4]" />
                  <span>Histori & Riwayat Dokumen Sertifikat Fisik / Digital</span>
                </h4>
                <p className="text-xs text-slate-500 font-mono-data mt-0.5">
                  Daftar seluruh berkas SK, hasil inspeksi, dan koreksi upload manual
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openUploadModal('current')}
                  className="px-3.5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-mono-data"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>+ Unggah / Koreksi Berkas PDF Manual</span>
                </button>
              </div>
            </div>

            {/* HISTORI SERTIFIKAT TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono-data text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[11px] text-slate-700 uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-bold">PERIODE SK</th>
                    <th className="py-2.5 px-3 font-bold">NO. SERTIFIKAT / SK</th>
                    <th className="py-2.5 px-3 font-bold">TGL TERBIT</th>
                    <th className="py-2.5 px-3 font-bold">TGL EXPIRED</th>
                    <th className="py-2.5 px-3 font-bold text-center">STATUS HUKUM</th>
                    <th className="py-2.5 px-3 font-bold text-right">AKSI BERKAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {historyList
                    .slice()
                    .sort((a, b) => {
                      if (a.isCurrent && !b.isCurrent) return -1;
                      if (!a.isCurrent && b.isCurrent) return 1;
                      const dateA = new Date(a.expired || a.terbit || '1970-01-01').getTime();
                      const dateB = new Date(b.expired || b.terbit || '1970-01-01').getTime();
                      return dateB - dateA;
                    })
                    .map((row) => {
                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${row.isCurrent ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50'
                            }`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {row.periode}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#005ea4]">
                            {row.noSertifikat}
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {row.terbit}
                          </td>
                          <td className="py-3 px-3 font-bold text-rose-700">
                            {row.expired}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.isCurrent
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-200 text-slate-700 border-slate-300'
                                }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  if (row.fileUrl) {
                                    const fullUrl = row.fileUrl.startsWith('http') ? row.fileUrl : `http://localhost:3000${row.fileUrl}`;
                                    window.open(fullUrl, '_blank');
                                  } else {
                                    alert('Berkas PDF belum diunggah untuk sertifikat ini. Gunakan tombol "+ Unggah / Koreksi Berkas PDF Manual" untuk menambahkan file.');
                                  }
                                }}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg inline-flex items-center gap-1 transition-colors ${
                                  row.fileUrl
                                    ? 'bg-[#005ea4] hover:bg-[#004881] text-white cursor-pointer'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                                title={row.fileUrl ? 'Buka / Unduh Berkas PDF' : 'Belum ada berkas PDF'}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{row.fileUrl ? 'Liat PDF' : 'Belum Ada'}</span>
                              </button>

                              <button
                                onClick={() => setEditingHistoryRow({ ...row })}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                                title="Edit Baris Sertifikat Ini"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              </button>

                              <button
                                onClick={() => setSelectedHistoryToDelete({ ...row })}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Sertifikat Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* VISUAL AUDIT TIMELINE TRACE */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#005ea4]" />
                <span>Garis Waktu Audit & Kronologi Resertifikasi:</span>
              </h5>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 font-mono-data text-xs">
                {historyList.map((row, idx) => (
                  <div key={row.id} className="relative">
                    <span
                      className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${row.isCurrent ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'
                        }`}
                    />
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{row.periode} — No. SK: {row.noSertifikat}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] border ${row.isCurrent
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold'
                            : 'text-slate-500 bg-slate-100 border-slate-200'
                            }`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <div>Penerbit / Penguji: <span className="font-bold text-slate-800">{row.instansi}</span></div>
                        <div>Masa Berlaku: {row.terbit} s.d <span className="font-bold text-rose-700">{row.expired}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-CERTIFICATE HUB SECTION */}
      {!isEditing && isMultiCertItem && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#005ea4]" />
                <span>Sertifikat Terhubung ({linkedCerts.length} Dokumen)</span>
              </h4>
              <p className="text-xs text-slate-500 font-mono-data mt-0.5">
                Daftar semua jenis perizinan / sertifikat yang berlaku untuk aset / proyek / produk ini
              </p>
            </div>
            <button
              onClick={() => setIsAddCertModalOpen(true)}
              className="px-3.5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-mono-data shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Sertifikat Terhubung</span>
            </button>
          </div>

          {linkedCerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-mono-data text-xs">
              <Link2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Belum ada sertifikat terhubung.</p>
              <p className="text-[11px] mt-1 text-slate-300">Klik &ldquo;+ Tambah Sertifikat Terhubung&rdquo; untuk mulai menambahkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {linkedCerts.map((cert) => {
                const certStatusLower = (cert.status || '').toLowerCase();
                const certIsExpired = certStatusLower === 'expired';
                const certIsPerpanjang = certStatusLower === 'perpanjang' || certStatusLower === 'perpanjangan';
                const certIsAfkir = certStatusLower === 'afkir';

                // Compute sisa hari for this linked cert
                let certSisaHari = null;
                if (cert.expired) {
                  const d = new Date(cert.expired);
                  const today = new Date();
                  certSisaHari = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
                }

                return (
                  <div
                    key={cert.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono-data text-xs relative group hover:border-slate-300 transition-colors"
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => setDeletingLinkedCertId(cert.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Hapus Sertifikat Terhubung"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Jenis Sertifikat Header */}
                    <div className="pr-6">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Jenis Sertifikat</span>
                      <span className="font-bold text-slate-900 text-[13px] leading-tight block mt-0.5">{cert.jenisSertifikat}</span>
                    </div>

                    {/* No. SK */}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">No. SK / Sertifikat</span>
                      <span className="font-bold text-[#005ea4] text-xs block mt-0.5">{cert.noSertifikat}</span>
                    </div>

                    {/* Instansi */}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Instansi Penerbit</span>
                      <span className="text-slate-700 font-sans text-xs block mt-0.5">{cert.instansi}</span>
                    </div>

                    {/* Dates row */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Terbit</span>
                        <span className="text-slate-700 text-xs block mt-0.5">{cert.terbit || '-'}</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Expired</span>
                        <span className={`text-xs font-bold block mt-0.5 ${certIsExpired || (certSisaHari !== null && certSisaHari <= 0) ? 'text-rose-700' : 'text-slate-700'}`}>
                          {cert.expired || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Sisa hari + status row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${certIsAfkir
                        ? 'bg-slate-800 text-white border-slate-600'
                        : certIsExpired || (certSisaHari !== null && certSisaHari <= 0)
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : certIsPerpanjang || (certSisaHari !== null && certSisaHari > 0 && certSisaHari <= 30)
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                        {cert.status || 'Aktif'}
                      </span>

                      {certSisaHari !== null && !certIsAfkir && (
                        <span className="text-[10px] text-slate-500 font-bold">
                          {certSisaHari <= 0 ? `${Math.abs(certSisaHari)}h lalu` : `${certSisaHari.toLocaleString()} hr lagi`}
                        </span>
                      )}
                    </div>

                    {/* PDF action */}
                    <button
                      onClick={() => {
                        const targetUrl = cert.fileUrl || cert.pdfName;
                        if (targetUrl && (targetUrl.startsWith('http') || targetUrl.startsWith('/'))) {
                          const fullUrl = targetUrl.startsWith('http') ? targetUrl : `http://localhost:3000${targetUrl}`;
                          window.open(fullUrl, '_blank');
                        } else {
                          alert(`Berkas PDF ${cert.pdfName || ''} belum tersedia di storage.`);
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${cert.hasPdf || cert.fileUrl
                        ? 'bg-[#005ea4]/10 hover:bg-[#005ea4]/15 text-[#005ea4] border border-[#005ea4]/20'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      disabled={!cert.hasPdf && !cert.fileUrl}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{cert.hasPdf || cert.fileUrl ? `Buka PDF: ${cert.pdfName || 'Terlampir'}` : 'Belum Ada Berkas PDF'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: TAMBAH SERTIFIKAT TERHUBUNG */}
      {isAddCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#005ea4] flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Tambah Sertifikat Terhubung</h4>
                  <p className="text-[11px] text-blue-300 font-mono-data">Hubungkan jenis perizinan / sertifikat baru ke item ini</p>
                </div>
              </div>
              <button onClick={() => setIsAddCertModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  // Upload PDF file first if selected
                  let fileUrl = null;
                  const pdfInput = document.getElementById('add-linked-cert-pdf-input');
                  const pdfFile = pdfInput?.files?.[0];
                  if (pdfFile) {
                    const formDataUpload = new FormData();
                    formDataUpload.append('file', pdfFile);
                    const uploadRes = await fetch('http://localhost:3000/api/v1/document-history/upload', {
                      method: 'POST',
                      body: formDataUpload
                    });
                    if (uploadRes.ok) {
                      const uploadJson = await uploadRes.json();
                      fileUrl = uploadJson?.data?.url || uploadJson?.data?.fileUrl || null;
                    }
                  }

                  // Save certificate to database
                  const masterItemId = parentDoc.MasterId || parentDoc.id || item.MasterId || item.id;
                  const certPayload = {
                    itemId: masterItemId,
                    jenisSertifikat: newCertData.jenisSertifikat,
                    noSertifikat: newCertData.noSertifikat,
                    instansi: newCertData.instansi || null,
                    status: newCertData.status || 'Aktif',
                  };
                  if (newCertData.terbit) certPayload.terbit = newCertData.terbit;
                  if (newCertData.expired) certPayload.expired = newCertData.expired;
                  if (fileUrl) certPayload.fileUrl = fileUrl;

                  const saved = await createCertificateForMasterItem(certPayload);

                  // Update local linked certs state with the DB-saved cert (has real UUID id)
                  const updatedCerts = [...linkedCerts, saved];
                  setLinkedCerts(updatedCerts);

                  // Refresh history table
                  await fetchHistory();

                  // Notify parent to refresh main table
                  if (onRefreshRequired) onRefreshRequired();

                  setNewCertData({ jenisSertifikat: '', noSertifikat: '', instansi: '', terbit: '', expired: '', status: 'Aktif', hasPdf: false, pdfName: '' });
                  setIsAddCertModalOpen(false);
                } catch (err) {
                  console.error('Failed to save linked certificate:', err);
                  alert('Gagal menyimpan sertifikat terhubung: ' + (err.message || 'Error'));
                }
              }}
              className="p-6 space-y-4 text-xs font-mono-data"
            >
              <div>
                <label className="font-bold text-slate-800 block mb-1">Jenis / Nama Sertifikat <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCertData.jenisSertifikat}
                  onChange={(e) => setNewCertData({ ...newCertData, jenisSertifikat: e.target.value })}
                  placeholder="Contoh: PBG, SLF, HGB, Amdal, SNI, Halal BPJPH"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">No. SK / Sertifikat <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCertData.noSertifikat}
                  onChange={(e) => setNewCertData({ ...newCertData, noSertifikat: e.target.value })}
                  placeholder="Contoh: PBG-64.74/DPMPTSP/2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs text-[#005ea4]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Instansi Penerbit</label>
                <input
                  type="text"
                  value={newCertData.instansi}
                  onChange={(e) => setNewCertData({ ...newCertData, instansi: e.target.value })}
                  placeholder="Contoh: DPMPTSP Kota Bontang, BPN, KLHK RI"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tgl Terbit</label>
                  <input
                    type="date"
                    value={newCertData.terbit}
                    onChange={(e) => setNewCertData({ ...newCertData, terbit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired</label>
                  <input
                    type="date"
                    value={newCertData.expired}
                    onChange={(e) => setNewCertData({ ...newCertData, expired: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Status</label>
                <select
                  value={newCertData.status}
                  onChange={(e) => setNewCertData({ ...newCertData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs cursor-pointer"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Perpanjang">Perpanjang</option>
                  <option value="Expired">Expired</option>
                  <option value="Afkir">Afkir</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Unggah Berkas PDF Sertifikat</label>
                <div className="border border-dashed border-slate-300 hover:border-[#005ea4] rounded-lg p-3 text-center bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewCertData(prev => ({
                          ...prev,
                          hasPdf: true,
                          pdfName: file.name
                        }));
                      }
                    }}
                    className="hidden"
                    id="add-linked-cert-pdf-input"
                  />
                  <label
                    htmlFor="add-linked-cert-pdf-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer text-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#005ea4]" />
                    <span>Pilih Berkas PDF</span>
                  </label>
                  {newCertData.pdfName ? (
                    <span className="block text-emerald-700 font-bold text-[11px] mt-1.5">
                      ✓ Terpilih: {newCertData.pdfName}
                    </span>
                  ) : (
                    <span className="block text-slate-400 text-[10px] mt-1">
                      Format: PDF (Opsional)
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCertModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Simpan Sertifikat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS SERTIFIKAT TERHUBUNG */}
      {deletingLinkedCertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 text-center space-y-3 font-mono-data">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900 font-sans">Hapus Sertifikat Terhubung?</h4>
              <p className="text-xs text-slate-600 font-medium font-sans">
                Sertifikat ini akan dihapus dari daftar. Data lainnya tidak terpengaruh.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingLinkedCertId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updatedCerts = linkedCerts.filter(c => c.id !== deletingLinkedCertId);
                    setLinkedCerts(updatedCerts);
                    if (onSaveUpdate) {
                      onSaveUpdate({ ...item, linkedCertificates: updatedCerts });
                    }
                    setDeletingLinkedCertId(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: UNGGAH / KOREKSI SERTIFIKAT MANUAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#005ea4] flex items-center justify-center font-bold text-white">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Unggah / Koreksi Berkas Sertifikat Manual</h4>
                  <p className="text-[11px] text-blue-300 font-mono-data">Perbarui atau ganti file PDF yang salah/gagal OCR</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs font-mono-data">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">1. Pilih Berkas PDF Sertifikat Baru</label>
                <div
                  onClick={() => manualFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setSelectedUploadFile(file);
                      setUploadData(prev => ({ ...prev, fileName: file.name }));
                    }
                  }}
                  className="border-2 border-dashed border-slate-300 hover:border-[#005ea4] rounded-xl p-5 text-center bg-slate-50 hover:bg-blue-50/50 transition-all cursor-pointer group"
                >
                  <Upload className="w-7 h-7 text-[#005ea4] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-800 block text-xs">Klik atau Seret Berkas PDF ke Sini</span>
                  <span className="text-[10px] text-slate-500">Format: PDF, PNG, JPG (Maksimal 15MB)</span>
                  <input
                    ref={manualFileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedUploadFile(file);
                        setUploadData(prev => ({ ...prev, fileName: file.name }));
                      }
                    }}
                    className="hidden"
                  />
                  <div className="mt-2.5">
                    <span className="px-3.5 py-1.5 bg-[#005ea4] text-white font-bold text-xs rounded-lg shadow-xs group-hover:bg-[#004881] transition-colors inline-block">
                      Pilih Berkas PDF
                    </span>
                  </div>
                  {uploadData.fileName && (
                    <span className="block text-emerald-700 font-bold mt-2 text-xs">
                      ✓ Terpilih: {uploadData.fileName}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">2. No. Sertifikat / SK Baru (Koreksi)</label>
                <input
                  type="text"
                  value={uploadData.noSertifikat}
                  onChange={(e) => setUploadData({ ...uploadData, noSertifikat: e.target.value })}
                  placeholder="Contoh: CERT-8891/DISNAKER/2026 (opsional, auto-generate jika kosong)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tgl Terbit SK</label>
                  <input
                    type="date"
                    value={uploadData.terbit}
                    onChange={(e) => setUploadData({ ...uploadData, terbit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired SK</label>
                  <input
                    type="date"
                    value={uploadData.expired}
                    onChange={(e) => setUploadData({ ...uploadData, expired: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Instansi / Pelaksana Penguji</label>
                <input
                  type="text"
                  value={uploadData.instansi}
                  onChange={(e) => setUploadData({ ...uploadData, instansi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Tipe Perubahan Berkas</label>
                <select
                  value={uploadData.target}
                  onChange={(e) => setUploadData({ ...uploadData, target: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs cursor-pointer"
                >
                  <option value="current">Sertifikat Utama / Berkas Aktif (Koreksi)</option>
                  <option value="archive">Sertifikat Baru (Perpanjangan / Tambah Histori)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Perbarui Sertifikat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KONFIRMASI HAPUS SERTIFIKAT HISTORI */}
      {selectedHistoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 text-center space-y-3 font-mono-data">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900 font-sans">Konfirmasi Hapus Sertifikat</h4>
              <p className="text-xs text-slate-600 font-medium font-sans">
                Apakah Anda yakin ingin menghapus berkas sertifikat <b>{selectedHistoryToDelete.noSertifikat}</b> ({selectedHistoryToDelete.periode}) dari histori?
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHistoryToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteHistoryRow(selectedHistoryToDelete.id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Ya, Hapus Sertifikat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT BARIS SERTIFIKAT HISTORI SPECIFIC */}
      {editingHistoryRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm">Edit Data Baris Sertifikat Histori</h4>
              </div>
              <button onClick={() => setEditingHistoryRow(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHistoryRowEdit} className="p-5 space-y-3.5 text-xs font-mono-data">
              <div>
                <label className="font-bold text-slate-800 block mb-1">No. Sertifikat / SK</label>
                <input
                  type="text"
                  required
                  value={editingHistoryRow.noSertifikat}
                  onChange={(e) => setEditingHistoryRow({ ...editingHistoryRow, noSertifikat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tgl Terbit</label>
                  <input
                    type="date"
                    value={editingHistoryRow.terbit}
                    onChange={(e) => setEditingHistoryRow({ ...editingHistoryRow, terbit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired</label>
                  <input
                    type="date"
                    value={editingHistoryRow.expired}
                    onChange={(e) => setEditingHistoryRow({ ...editingHistoryRow, expired: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Upload / Ganti File PDF Sertifikat</label>
                <div
                  onClick={() => editHistoryFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#005ea4] rounded-xl p-3 text-center bg-slate-50 hover:bg-blue-50/50 cursor-pointer"
                >
                  <input
                    ref={editHistoryFileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setSelectedHistoryFile(file);
                    }}
                    className="hidden"
                  />
                  <span className="text-xs font-bold text-[#005ea4] block">
                    {selectedHistoryFile ? `✓ File Baru: ${selectedHistoryFile.name}` : (editingHistoryRow.fileUrl ? '✓ Ada Berkas PDF (Klik untuk ganti)' : 'Klik untuk Unggah PDF')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHistoryRow(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Baris</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Konfirmasi Hapus Data</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin menghapus seluruh data untuk <br /><strong className="text-slate-800">{formData.merekItem}</strong>?<br />
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMasterItem}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AFKIR CONFIRMATION MODAL */}
      {isAfkirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center mb-4 border border-slate-200">
                <Ban className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Tandai Sebagai Afkir?</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin menandai <br /><strong className="text-slate-800">{formData.merekItem || item.title}</strong> sebagai Afkir/Non-Aktif?<br />
                Tindakan ini akan mengubah status dokumen secara permanen.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAfkirModalOpen(false)}
                  disabled={isAfkiring}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmAfkir}
                  disabled={isAfkiring}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isAfkiring ? 'Memproses...' : 'Ya, Afkirkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AKTIFKAN CONFIRMATION MODAL */}
      {isAktifkanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#005ea4] mx-auto flex items-center justify-center mb-4 border border-blue-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Aktifkan Kembali?</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin membatalkan afkir dan mengaktifkan kembali <br /><strong className="text-slate-800">{formData.merekItem || item.title}</strong>?<br />
                Dokumen ini akan kembali dipantau status aktifnya.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAktifkanModalOpen(false)}
                  disabled={isAktifkaning}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmAktifkan}
                  disabled={isAktifkaning}
                  className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isAktifkaning ? 'Memproses...' : 'Ya, Aktifkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENEW EXEMPT MODAL */}
      {isRenewExemptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Ajukan Perpanjangan</h4>
                  <p className="text-[11px] text-slate-500 font-mono-data">Tanpa Upload Sertifikat Baru</p>
                </div>
              </div>
              
              <div className="space-y-3 font-mono-data">
                <p className="text-xs text-slate-600">
                  Masukkan estimasi tanggal jatuh tempo / expired yang baru untuk: <br/>
                  <strong className="text-slate-900 text-sm">{formData.merekItem || item.title}</strong>
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Tanggal Expired Baru (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={renewExemptDate}
                    onChange={(e) => setRenewExemptDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRenewExemptModalOpen(false)}
                  disabled={isRenewingExempt}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isRenewingExempt || !renewExemptDate}
                  onClick={async () => {
                    if (!renewExemptDate) return;
                    setIsRenewingExempt(true);
                    try {
                      const targetId = item.MasterId || item.id;
                      const updated = await updateMasterItem(targetId, { expiryDate: renewExemptDate, status: 'Aktif' });
                      setFormData(prev => ({ ...prev, berakhir: renewExemptDate, status: 'Aktif' }));
                      if (onSaveUpdate) {
                        onSaveUpdate({
                          ...item,
                          ...formData,
                          berakhir: renewExemptDate,
                          status: 'Aktif',
                          id: targetId
                        });
                      }
                      setIsRenewExemptModalOpen(false);
                      // Let user know without ugly alert if possible, or keep simple alert for now since it's just success
                      setTimeout(() => alert("Berhasil memperbarui tanggal jatuh tempo!"), 100);
                    } catch (err) {
                      alert("Gagal: " + (err.message || 'Error'));
                    } finally {
                      setIsRenewingExempt(false);
                    }
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRenewingExempt ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Simpan Perpanjangan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* HEADER PERPANJANG CONFIRMATION MODAL */}
      {isConfirmRenewHeaderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4 border border-amber-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Ajukan Perpanjangan?</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin mengajukan perpanjangan untuk <br /><strong className="text-slate-800">{formData.merekItem || item.title}</strong>?<br />
                Status baris akan berubah menjadi <span className="text-amber-700 font-bold">Kuning (Sedang Diproses)</span>.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmRenewHeaderModalOpen(false)}
                  disabled={isRenewingHeader}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isRenewingHeader}
                  onClick={async () => {
                    setIsRenewingHeader(true);
                    try {
                      const targetId = item.MasterId || item.id;
                      const updated = await updateMasterItem(targetId, { status: 'Perpanjang' });
                      setFormData(prev => ({ ...prev, status: 'Perpanjang' }));
                      if (onSaveUpdate) {
                        onSaveUpdate({
                          ...item,
                          ...formData,
                          status: 'Perpanjang',
                          workflowStatus: 'in_progress',
                          id: targetId
                        });
                      }
                      setIsConfirmRenewHeaderModalOpen(false);
                    } catch (err) {
                      alert("Gagal mengajukan perpanjangan: " + (err.message || 'Error'));
                    } finally {
                      setIsRenewingHeader(false);
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRenewingHeader ? 'Memproses...' : 'Ya, Ajukan Perpanjangan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* HEADER BATAL PERPANJANGAN CONFIRMATION MODAL */}
      {isConfirmCancelHeaderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4 border border-rose-200">
                <X className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Batalkan Perpanjangan?</h4>
              <p className="text-xs text-slate-600 font-medium pb-2">
                Apakah Anda yakin ingin membatalkan perpanjangan untuk <br /><strong className="text-slate-800">{formData.merekItem || item.title}</strong>?<br />
                Status akan dikembalikan menjadi <span className="text-slate-800 font-bold">Aktif (Normal)</span>.
              </p>
              <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmCancelHeaderModalOpen(false)}
                  disabled={isCancelingHeader}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isCancelingHeader}
                  onClick={async () => {
                    setIsCancelingHeader(true);
                    try {
                      const targetId = item.MasterId || item.id;
                      await updateMasterItem(targetId, { status: 'Aktif' });
                      setFormData(prev => ({ ...prev, status: 'Aktif' }));
                      if (onSaveUpdate) {
                        onSaveUpdate({
                          ...item,
                          ...formData,
                          status: 'Aktif',
                          workflowStatus: item.documentStatus === 'EXEMPT' ? 'exempt' : 'completed',
                          id: targetId
                        });
                      }
                      setIsConfirmCancelHeaderModalOpen(false);
                    } catch (err) {
                      alert("Gagal membatalkan perpanjangan: " + (err.message || 'Error'));
                    } finally {
                      setIsCancelingHeader(false);
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCancelingHeader ? 'Memproses...' : 'Ya, Batalkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
