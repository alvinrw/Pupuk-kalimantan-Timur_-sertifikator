/**
 * DocumentDetailPage — Orchestrator utama halaman detail dokumen/sertifikat.
 *
 * Semua state & business logic ada di: hooks/useDocumentDetail.js
 * Semua sub-komponen UI ada di: components/document-detail/
 *
 * Refactored dari 2183 → ~400 baris.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Edit3, RotateCcw, Ban, Save,
  FileText, CheckCircle2, ShieldAlert, Building2,
  ShieldCheck, FileCheck, ExternalLink, Sparkles,
  UploadCloud, Trash2, RefreshCw, AlertTriangle, Loader2,
  ChevronDown, Settings
} from 'lucide-react';
import { updateNotificationSetting } from '../services/masterItemsService';

// Hook & Config
import { useDocumentDetail } from '../hooks/useDocumentDetail';
import { getFullFileUrl } from '../config/api';

// Section Components
import CertHistorySection from '../components/document-detail/CertHistorySection';
import CertificateNavCards from '../components/document-detail/CertificateNavCards';

// Modal Components
import ModalConfirm from '../components/document-detail/ModalConfirm';
import ModalUploadCert from '../components/document-detail/ModalUploadCert';
import ModalAddLinkedCert from '../components/document-detail/ModalAddLinkedCert';
import ModalEditHistoryRow from '../components/document-detail/ModalEditHistoryRow';

export default function DocumentDetailPage({ item, onBack, onSaveUpdate, onQuickRenew, onQuickDecommission, onDeleteSuccess, onRefreshRequired, hideLinkedCertificates }) {
  if (!item) return null;

  const hook = useDocumentDetail({ item, onBack, onSaveUpdate, onDeleteSuccess, onRefreshRequired });
  const {
    parentDoc, effectiveCategoryKey, targetCert, isSingleCertScope,
    isHaki, isEquipment, isMultiCertItem, currentStatus, isAfkirStatus, isPerpanjangStatus,
    isEditing, setIsEditing, formData, setFormData, handleSave,
    historyList, isLoadingHistory,
    selectedHistoryToDelete, setSelectedHistoryToDelete,
    editingHistoryRow, setEditingHistoryRow,
    selectedHistoryFile, setSelectedHistoryFile,
    editHistoryFileInputRef,
    handleDeleteHistoryRow, handleSaveHistoryRowEdit,
    isUploadModalOpen, setIsUploadModalOpen,
    uploadData, setUploadData,
    selectedUploadFile, setSelectedUploadFile,
    manualFileInputRef, openUploadModal, handleUploadSubmit,
    linkedCerts,
    isAddCertModalOpen, setIsAddCertModalOpen,
    deletingLinkedCertId, setDeletingLinkedCertId,
    handleAddLinkedCert, handleDeleteLinkedCert,
    activeCertId, setActiveCertId,
    isDeleteDialogOpen, setIsDeleteDialogOpen, isDeleting, handleDeleteMasterItem,
    isAfkirModalOpen, setIsAfkirModalOpen, isAfkiring, handleAfkir, confirmAfkir,
    isAktifkanModalOpen, setIsAktifkanModalOpen, isAktifkaning, handleAktifkan, confirmAktifkan,
    isConfirmRenewHeaderModalOpen, setIsConfirmRenewHeaderModalOpen, isRenewingHeader, confirmRenewHeader,
    isConfirmCancelHeaderModalOpen, setIsConfirmCancelHeaderModalOpen, isCancelingHeader, confirmCancelHeader,
    isRenewExemptModalOpen, setIsRenewExemptModalOpen,
    renewExemptDate, setRenewExemptDate, isRenewingExempt, confirmRenewExempt,
    localDocumentStatus,
    reminderEnabled, setReminderEnabled,
    triggerType, setTriggerType,
    reminderDays, setReminderDays,
    triggerDate, setTriggerDate,
  } = hook;

  // ─── Sisa hari kalkulasi ───
  const expiryStr = formData.berakhir || item.berakhir || item.expiryDate;
  const sisaHari = expiryStr
    ? Math.ceil((new Date(expiryStr) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  // ─── Primary cert for status section ───
  const activeCerts = historyList.filter(c => (c.status || '').toLowerCase() === 'aktif' || (c.status || '').toLowerCase() === 'active');
  const primaryCert = activeCerts.length > 0
    ? activeCerts.slice().sort((a, b) => new Date(b.expired || '1970-01-01') - new Date(a.expired || '1970-01-01'))[0]
    : (historyList.length > 0 ? historyList[0] : null);
  const displayNoSert = primaryCert?.noSertifikat || formData.noSertifikat || 'Belum Ada Sertifikat Active';
  const displayExpired = primaryCert?.expired || formData.berakhir || 'Belum Ada Data';
  const displayFileUrl = primaryCert?.fileUrl || formData.fileUrl || null;

  // ─── Dropdown Aksi State ───
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setIsActionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-8 space-y-6 font-sans-clean max-w-7xl mx-auto animate-in fade-in duration-200">

      {/* ──────────────── TOP NAVIGATION ──────────────── */}
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
                  : (formData.namaSertifikat || formData.merekItem)}
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

        {/* Action Buttons Dropdown */}
        <div className="relative font-mono-data" ref={actionMenuRef}>
          <button
            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Aksi</span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isActionMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
              {!isEditing ? (
                <button
                  onClick={() => { setIsEditing(true); setIsActionMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-slate-400" />
                  <span>Edit Data Dokumen</span>
                </button>
              ) : (
                <button
                  onClick={() => { setIsEditing(false); setIsActionMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Ban className="w-4 h-4 text-slate-400" />
                  <span>Batal Edit</span>
                </button>
              )}

              {isPerpanjangStatus ? (
                <>
                  <button
                    onClick={() => { openUploadModal('archive'); setIsActionMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    <span>Selesai & Upload File Baru</span>
                  </button>
                  <button
                    onClick={() => { setIsConfirmCancelHeaderModalOpen(true); setIsActionMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Ban className="w-4 h-4 text-slate-400" />
                    <span>Batal Perpanjangan</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsConfirmRenewHeaderModalOpen(true); setIsActionMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Perpanjang Dokumen</span>
                </button>
              )}

              {isAfkirStatus ? (
                <button
                  onClick={() => { handleAktifkan(); setIsActionMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Batal Afkir / Aktifkan</span>
                </button>
              ) : (
                <button
                  onClick={() => { handleAfkir(); setIsActionMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Ban className="w-4 h-4 text-slate-400" />
                  <span>Tandai Sebagai Afkir</span>
                </button>
              )}

              <div className="h-px bg-slate-100 my-1 mx-2"></div>

              {primaryCert ? (
                <button
                  onClick={() => { setSelectedHistoryToDelete(primaryCert); setIsActionMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                  <span>Hapus Data Item (Sertifikat)</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-400 flex items-center gap-2.5 cursor-not-allowed opacity-60"
                  title="Belum ada sertifikat aktif"
                >
                  <Trash2 className="w-4 h-4 text-slate-300" />
                  <span>Hapus Data Item (Sertifikat)</span>
                </button>
              )}

              <div className="h-px bg-slate-100 my-1 mx-2"></div>

              <button
                onClick={() => { setIsDeleteDialogOpen(true); setIsActionMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                <span>Hapus Data Ini</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────── STATUS BAR ──────────────── */}
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
              {isAfkirStatus ? 'Afkir / Non-Aktif' : sisaHari <= 0 ? `Expired (${Math.abs(sisaHari)} hari lalu)` : `${sisaHari.toLocaleString()} Hari`}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Tanggal Expired</span>
          <span className="font-bold text-xs text-slate-700">{expiryStr || '-'}</span>
        </div>
      </div>

      {/* ──────────────── EDIT FORM / READ-ONLY DETAIL ──────────────── */}
      {isEditing ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 font-mono-data">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Mode Edit Data {isHaki ? 'Hak Cipta (HAKI)' : isEquipment ? 'Peralatan Pabrik' : 'Dokumen Perizinan'} — Perbarui informasi di bawah ini:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {[
                { label: isHaki ? 'Judul Ciptaan' : 'Merek / Nama Item', key: 'merekItem', type: 'text', bold: true },
                { label: isHaki ? 'Jenis Ciptaan' : 'Jenis Peralatan / Kategori', key: 'jenisPeralatan', type: 'text' },
              ].map(({ label, key, type, bold }) => (
                <div key={key}>
                  <label className="font-bold text-slate-800 block mb-1.5">{label}</label>
                  <input
                    type={type} value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className={`w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs ${bold ? 'font-bold' : ''}`}
                  />
                </div>
              ))}

              {!isHaki && (
                <>
                  {[
                    { label: 'Nama Sertifikat', key: 'namaSertifikat' },
                    { label: 'Tipe / Kode', key: 'tipe' },
                    { label: 'Nomor Seri / Tag', key: 'nomorSeri' },
                    { label: 'Lokasi / Unit Pabrik', key: 'lokasi', bold: true },
                    { label: 'User / Dept Penanggung Jawab', key: 'user' },
                  ].map(({ label, key, bold }) => (
                    <div key={key}>
                      <label className="font-bold text-slate-800 block mb-1.5">{label}</label>
                      <input
                        type="text" value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className={`w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs ${bold ? 'font-bold' : ''}`}
                      />
                    </div>
                  ))}
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

              {isHaki && (
                <>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Tanggal Ciptaan / Deklarasi</label>
                    <input type="date" value={formData.tanggalCiptaan}
                      onChange={(e) => setFormData({ ...formData, tanggalCiptaan: e.target.value, terbit: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Masa Berlaku Perlindungan</label>
                    <input type="text" value={formData.masaBerlaku} placeholder="Contoh: 5 Tahun / Seumur Hidup"
                      onChange={(e) => setFormData({ ...formData, masaBerlaku: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">{isHaki ? 'No. Sertifikat HAKI' : 'No. Sertifikat SK Active'}</label>
                <input type="text" value={formData.noSertifikat}
                  onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>
              {!isHaki && (
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">Tanggal Terbit / Berlaku</label>
                  <input type="date" value={formData.terbit}
                    onChange={(e) => setFormData({ ...formData, terbit: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs font-mono-data"
                  />
                </div>
              )}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5 text-rose-700">{isHaki ? 'Kapan Berakhir' : 'Tanggal Expired'}</label>
                <input type="text" value={formData.berakhir} placeholder="YYYY-MM-DD atau Seumur Hidup"
                  onChange={(e) => setFormData({ ...formData, berakhir: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">{isHaki ? 'Instansi Penerbit / Keterangan HAKI' : 'Keterangan & Catatan Pengujian'}</label>
                <textarea value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>
            </div>

            {/* Seksi Pengaturan Pengingat (Edit Mode) */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="font-bold text-slate-800 block mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono-data">
                <span></span> Pengaturan Pengingat & Notifikasi
              </label>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editReminderEnabled"
                    checked={reminderEnabled}
                    onChange={async (e) => {
                      const isChecked = e.target.checked;
                      setReminderEnabled(isChecked);
                      // Auto-save just the toggle to ensure it persists even without clicking Simpan
                      try {
                        const tId = item.MasterId || item.id;
                        await updateNotificationSetting(tId, {
                          isEnabled: isChecked,
                          triggerType: triggerType,
                          triggerDays: parseInt(reminderDays) || 30,
                          triggerDate: triggerType === 'DATE' ? triggerDate : null
                        });
                        if (item && item.notificationSetting) {
                          item.notificationSetting.isEnabled = isChecked;
                        }
                      } catch(err) {
                        console.error('Auto-save failed:', err);
                      }
                    }}
                    className="rounded border-slate-300 accent-[#005ea4] h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="editReminderEnabled" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                    Aktifkan Pengingat Notifikasi untuk Dokumen ini
                  </label>
                </div>
                {reminderEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Tipe Pemicu</label>
                      <select
                        value={triggerType}
                        onChange={(e) => setTriggerType(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
                      >
                        <option value="DAYS">Berdasarkan Sisa Hari (H-)</option>
                        <option value="DATE">Berdasarkan Tanggal Spesifik</option>
                      </select>
                    </div>
                    {triggerType === 'DAYS' ? (
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Pemicu H- (Hari)</label>
                        <input
                          type="number"
                          min="1"
                          value={reminderDays}
                          onChange={(e) => setReminderDays(e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Tanggal Pemicu</label>
                        <input
                          type="date"
                          value={triggerDate}
                          onChange={(e) => setTriggerDate(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  if (item && item.notificationSetting) {
                    setReminderEnabled(item.notificationSetting.isEnabled);
                    setTriggerType(item.notificationSetting.triggerType || 'DAYS');
                    setReminderDays(item.notificationSetting.triggerDays);
                    setTriggerDate(item.notificationSetting.triggerDate ? item.notificationSetting.triggerDate.substring(0, 10) : '');
                  }
                }} 
                className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button type="submit" className="px-6 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Data</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: ITEM SPEC GRID */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#005ea4]" />
              <span>{isHaki ? 'Spesifikasi & Identitas Hak Cipta (HAKI)' : isEquipment ? 'Spesifikasi Utama & Identitas Aset Peralatan' : 'Spesifikasi Dokumen Perizinan'}</span>
            </h4>
            {isHaki ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs">
                {[
                  { label: 'Judul Ciptaan', val: formData.merekItem, cls: 'font-bold text-slate-900 text-sm' },
                  { label: 'Jenis Ciptaan', val: formData.jenisPeralatan, cls: 'font-bold text-[#005ea4] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block' },
                  { label: 'Tanggal Ciptaan', val: formData.tanggalCiptaan || '2024-03-10', cls: 'font-bold text-slate-800' },
                  { label: 'Masa Berlaku', val: formData.masaBerlaku, cls: 'font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block' },
                  { label: 'Kapan Berakhir', val: formData.berakhir, cls: 'font-bold text-rose-700' },
                  { label: 'Instansi Penerbit HAKI', val: formData.keterangan || 'Dirjen KI Kemenkumham', cls: 'font-bold text-slate-800 font-sans' },
                ].map(({ label, val, cls }) => (
                  <div key={label}>
                    <span className="text-[11px] text-slate-500 font-sans block mb-0.5">{label}</span>
                    <span className={cls}>{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono-data text-xs">
                {[
                  { label: 'Merek / Nama Item', val: formData.merekItem, cls: 'font-bold text-slate-900 text-sm' },
                  { label: 'Jenis Peralatan', val: formData.jenisPeralatan, cls: 'font-bold text-[#005ea4]' },
                  { label: 'Nama Sertifikat', val: formData.namaSertifikat || '-', cls: 'font-bold text-slate-800' },
                  { label: 'Tipe / Kode', val: formData.tipe || '-', cls: 'font-bold text-slate-800' },
                  { label: 'Nomor Seri / Tag', val: formData.nomorSeri || '-', cls: 'font-bold text-slate-800' },
                  { label: 'Unit Pabrik / Lokasi', val: formData.lokasi, cls: 'font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block' },
                  { label: 'User / Dept PJ (Penanggung Jawab)', val: formData.user || 'Dept. Operasi', cls: 'font-bold text-slate-800' },
                  { label: 'Status Fisik Operasional', val: formData.status, cls: 'font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block' },
                  { label: 'No. Sertifikat Active', val: displayNoSert, cls: 'font-bold text-[#005ea4]' },
                  { label: 'Tanggal Terbit', val: formData.terbit || '-', cls: 'font-bold text-slate-800' },
                  { label: 'Tanggal Expired', val: displayExpired, cls: 'font-bold text-rose-700' },
                ].map(({ label, val, cls }) => (
                  <div key={label}>
                    <span className="text-[11px] text-slate-500 font-sans block mb-0.5">{label}</span>
                    <span className={cls}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 1.5: NOTIFICATION SETTINGS (Read-only Mode) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#005ea4]" />
              <span>Pengaturan Notifikasi & Deadline</span>
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${reminderEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-xs font-bold text-slate-700">
                    Status Pengingat: {reminderEnabled ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {reminderEnabled ? (
                  <div className="text-xs text-slate-500 font-mono-data space-y-1">
                    {(() => {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      
                      if (triggerType === 'DAYS') {
                        const expiryDate = formData.berakhir && formData.berakhir !== '-' ? new Date(formData.berakhir) : null;
                        let activeDate = null;
                        let isPastDays = false;
                        
                        if (expiryDate) {
                          activeDate = new Date(expiryDate);
                          activeDate.setDate(activeDate.getDate() - (reminderDays || 30));
                          activeDate.setHours(0,0,0,0);
                          isPastDays = activeDate <= today;
                        }

                        if (isPastDays) {
                          return (
                            <>
                              <p>Reminder <span className="font-bold text-emerald-600">SUDAH AKTIF</span> sejak H-{reminderDays || 30} sebelum kedaluwarsa ({activeDate ? activeDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}).</p>
                              <p>Reminder ini akan terus ditampilkan hingga sertifikat diperpanjang.</p>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <p>Reminder <span className="font-bold text-[#005ea4]">akan mulai aktif</span> pada H-{reminderDays || 30} sebelum tanggal kedaluwarsa{activeDate ? ` (${activeDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})` : ''}.</p>
                              <p>Setelah melewati waktu tersebut, reminder akan <span className="font-bold text-emerald-600">aktif</span> dan tetap ditampilkan hingga diperpanjang.</p>
                            </>
                          );
                        }
                      } else {
                        const tDate = triggerDate ? new Date(triggerDate) : null;
                        if (tDate) tDate.setHours(0,0,0,0);
                        const isPastDate = tDate && tDate <= today;
                        
                        if (isPastDate) {
                          return (
                            <>
                              <p>Reminder <span className="font-bold text-emerald-600">SUDAH AKTIF</span> sejak tanggal <span className="font-bold text-[#005ea4]">{tDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.</p>
                              <p>Reminder ini akan terus ditampilkan hingga sertifikat diperpanjang.</p>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <p>Reminder <span className="font-bold text-[#005ea4]">akan mulai aktif</span> pada <span className="font-bold text-[#005ea4]">{tDate ? tDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>.</p>
                              <p>Setelah tanggal tersebut, reminder akan <span className="font-bold text-emerald-600">aktif</span> dan tetap ditampilkan hingga sertifikat diperpanjang.</p>
                            </>
                          );
                        }
                      }
                    })()}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-mono-data">
                    Sistem tidak akan mengirimkan notifikasi pengingat untuk dokumen ini.
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-xs font-bold text-[#005ea4] hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Ubah Pengaturan
              </button>
            </div>
          </div>

          {/* SECTION 2: CERT LEGAL STATUS */}
          {localDocumentStatus === 'EXEMPT' ? (
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-6 space-y-4 font-mono-data text-center">
              <h4 className="font-bold text-sm text-indigo-900 flex items-center justify-center gap-2 mb-2">
                <ShieldAlert className="w-6 h-6 text-indigo-600" />
                <span>Tanpa Sertifikat (Catatan / Exempt)</span>
              </h4>
              <p className="text-sm font-bold text-indigo-800 bg-indigo-100/50 p-3 rounded-xl border border-indigo-200 inline-block">
                Alasan: {item.exemptionNote || 'Tidak ada catatan khusus'}
              </p>
              <div className="pt-4 mt-2 border-t border-indigo-200/60 flex items-center justify-center gap-3">
                <button
                  onClick={() => { setRenewExemptDate(formData.berakhir && formData.berakhir !== '-' ? formData.berakhir : ''); setIsRenewExemptModalOpen(true); }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /><span>Ajukan Perpanjangan</span>
                </button>
                <button
                  onClick={() => openUploadModal('archive')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" /><span>Upload Sertifikat Sekarang</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6 space-y-4 font-mono-data">
              <h4 className="font-bold text-sm text-slate-900 border-b border-blue-200 pb-3 flex items-center justify-between font-sans">
                <span className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#005ea4]" />
                  <span>Status Legalitas Sertifikat Active</span>
                </span>
                <span className="text-xs text-[#005ea4] font-mono-data font-bold">Terverifikasi Disnaker / Kemenperin</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#f8fafc] p-4 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Nama Sertifikat</span>
                  <span className="font-bold text-slate-850 text-sm block">{formData.namaSertifikat || primaryCert?.namaSertifikat || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">No. Sertifikat Active</span>
                  <span className="font-bold text-[#005ea4] text-sm block">{displayNoSert}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tanggal Terbit</span>
                  <span className="font-bold text-slate-850 text-sm block">{formData.terbit || primaryCert?.terbit || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tanggal Expired (Kadaluarsa)</span>
                  <span className="font-bold text-rose-700 text-sm block">{displayExpired}</span>
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
                    onClick={() => window.open(getFullFileUrl(displayFileUrl), '_blank')}
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
                    <UploadCloud className="w-3.5 h-3.5 text-amber-600" /><span>+ Unggah File PDF</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: HISTORY */}
          <CertHistorySection
            historyList={historyList}
            isLoadingHistory={isLoadingHistory}
            openUploadModal={openUploadModal}
            setEditingHistoryRow={setEditingHistoryRow}
            setSelectedHistoryToDelete={setSelectedHistoryToDelete}
          />
        </div>
      )}

      {/* MULTI-CERT HUB (Sertifikat Terhubung) */}
      {!isEditing && isMultiCertItem && !hideLinkedCertificates && (
        <CertificateNavCards
          linkedCerts={linkedCerts}
          activeCertId={activeCertId}
          onSelectCert={setActiveCertId}
          onAddCert={() => setIsAddCertModalOpen(true)}
          onDeleteCert={(id) => setDeletingLinkedCertId(id)}
        />
      )}

      {/* ──────────────── MODALS ──────────────── */}

      <ModalUploadCert
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadData={uploadData}
        setUploadData={setUploadData}
        selectedUploadFile={selectedUploadFile}
        setSelectedUploadFile={setSelectedUploadFile}
        manualFileInputRef={manualFileInputRef}
        onSubmit={handleUploadSubmit}
        isSingleCertScope={isSingleCertScope}
      />

      <ModalAddLinkedCert
        isOpen={isAddCertModalOpen}
        onClose={() => setIsAddCertModalOpen(false)}
        onSave={handleAddLinkedCert}
      />

      <ModalEditHistoryRow
        editingHistoryRow={editingHistoryRow}
        setEditingHistoryRow={setEditingHistoryRow}
        selectedHistoryFile={selectedHistoryFile}
        setSelectedHistoryFile={setSelectedHistoryFile}
        editHistoryFileInputRef={editHistoryFileInputRef}
        onSubmit={handleSaveHistoryRowEdit}
      />

      {/* Delete Linked Cert */}
      <ModalConfirm
        isOpen={!!deletingLinkedCertId}
        onClose={() => setDeletingLinkedCertId(null)}
        onConfirm={() => handleDeleteLinkedCert(deletingLinkedCertId)}
        title="Hapus Sertifikat Terhubung?"
        description="Sertifikat ini akan dihapus dari daftar. Data lainnya tidak terpengaruh."
        confirmLabel="Ya, Hapus"
        icon={<Trash2 className="w-6 h-6" />}
        iconBgClassName="bg-rose-100 text-rose-600"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
      />

      {/* Delete History Row */}
      <ModalConfirm
        isOpen={!!selectedHistoryToDelete}
        onClose={() => setSelectedHistoryToDelete(null)}
        onConfirm={() => handleDeleteHistoryRow(selectedHistoryToDelete.id)}
        title="Konfirmasi Hapus Sertifikat"
        description={<>Hapus berkas sertifikat <b>{selectedHistoryToDelete?.noSertifikat}</b> ({selectedHistoryToDelete?.periode}) dari histori?</>}
        confirmLabel="Ya, Hapus Sertifikat"
        icon={<Trash2 className="w-6 h-6" />}
        iconBgClassName="bg-rose-100 text-rose-600"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
      />

      {/* Delete Master Item */}
      <ModalConfirm
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteMasterItem}
        isLoading={isDeleting}
        title="Konfirmasi Hapus Seluruh Data Induk"
        description={<>Apakah Anda yakin ingin menghapus seluruh entitas data untuk <br /><strong className="text-slate-800">{formData.merekItem}</strong>?<br /><br /><span className="text-rose-600 font-bold">PERINGATAN: Tindakan ini akan menghapus entitas induk beserta seluruh histori dan dokumen/sertifikat terhubung di dalamnya secara permanen!</span></>}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus Seluruh Data & Dokumen'}
        icon={<AlertTriangle className="w-6 h-6" />}
        iconBgClassName="bg-rose-100 text-rose-600"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
      />

      {/* Afkir */}
      <ModalConfirm
        isOpen={isAfkirModalOpen}
        onClose={() => setIsAfkirModalOpen(false)}
        onConfirm={confirmAfkir}
        isLoading={isAfkiring}
        title="Tandai Sebagai Afkir?"
        description={<>Apakah Anda yakin ingin menandai <br /><strong className="text-slate-800">{formData.merekItem || item.title}</strong> sebagai Afkir/Non-Aktif?</>}
        confirmLabel={isAfkiring ? 'Memproses...' : 'Ya, Afkirkan'}
        icon={<Ban className="w-6 h-6" />}
        iconBgClassName="bg-slate-100 text-slate-600 border border-slate-200"
        confirmClassName="bg-slate-800 hover:bg-slate-900 text-white"
      />

      {/* Aktifkan */}
      <ModalConfirm
        isOpen={isAktifkanModalOpen}
        onClose={() => setIsAktifkanModalOpen(false)}
        onConfirm={confirmAktifkan}
        isLoading={isAktifkaning}
        title="Aktifkan Kembali?"
        description={<>Apakah Anda yakin ingin mengaktifkan kembali <br /><strong className="text-slate-800">{formData.merekItem || item.title}</strong>?</>}
        confirmLabel={isAktifkaning ? 'Memproses...' : 'Ya, Aktifkan'}
        icon={<RotateCcw className="w-6 h-6" />}
        iconBgClassName="bg-blue-100 text-[#005ea4] border border-blue-200"
        confirmClassName="bg-[#005ea4] hover:bg-[#004881] text-white"
      />

      {/* Perpanjang Header */}
      <ModalConfirm
        isOpen={isConfirmRenewHeaderModalOpen}
        onClose={() => setIsConfirmRenewHeaderModalOpen(false)}
        onConfirm={confirmRenewHeader}
        isLoading={isRenewingHeader}
        title="Ajukan Perpanjangan?"
        description={<>Status <strong className="text-slate-800">{formData.merekItem || item.title}</strong> akan berubah menjadi <span className="text-amber-700 font-bold">Sedang Diproses</span>.</>}
        confirmLabel={isRenewingHeader ? 'Memproses...' : 'Ya, Ajukan Perpanjangan'}
        icon={<RotateCcw className="w-6 h-6" />}
        iconBgClassName="bg-amber-100 text-amber-600 border border-amber-200"
        confirmClassName="bg-amber-500 hover:bg-amber-600 text-white"
      />

      {/* Batal Perpanjang */}
      <ModalConfirm
        isOpen={isConfirmCancelHeaderModalOpen}
        onClose={() => setIsConfirmCancelHeaderModalOpen(false)}
        onConfirm={confirmCancelHeader}
        isLoading={isCancelingHeader}
        title="Batalkan Perpanjangan?"
        description={<>Status <strong className="text-slate-800">{formData.merekItem || item.title}</strong> akan dikembalikan menjadi <span className="text-slate-800 font-bold">Aktif (Normal)</span>.</>}
        confirmLabel={isCancelingHeader ? 'Memproses...' : 'Ya, Batalkan'}
        icon={<Ban className="w-6 h-6" />}
        iconBgClassName="bg-rose-100 text-rose-600 border border-rose-200"
        confirmClassName="bg-rose-600 hover:bg-rose-700 text-white"
      />

      {/* Renew Exempt */}
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
                <p className="text-xs text-slate-600">Masukkan estimasi tanggal jatuh tempo baru untuk: <br /><strong className="text-slate-900 text-sm">{formData.merekItem || item.title}</strong></p>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Tanggal Expired Baru</label>
                  <input type="date" value={renewExemptDate} onChange={(e) => setRenewExemptDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setIsRenewExemptModalOpen(false)} disabled={isRenewingExempt} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">Batal</button>
                <button onClick={confirmRenewExempt} disabled={isRenewingExempt || !renewExemptDate}
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
      {/* MODAL CONFIRM DELETE MASTER ITEM */}
      <ModalConfirm
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Hapus Alat Ini?"
        message={`Data alat dan semua sertifikat historinya akan dihapus permanen.`}
        confirmText="Hapus Permanen"
        onConfirm={handleDeleteMasterItem}
        isProcessing={isDeleting}
      />
    </div>
  );
}
