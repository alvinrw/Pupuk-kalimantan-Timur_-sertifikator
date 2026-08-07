import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowLeft, Edit3, RotateCcw, Ban,
  UploadCloud, Trash2, Settings, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DocumentHeader({ hook, item, onBack }) {
  const {
    formData, targetCert, parentDoc, isSingleCertScope,
    isEditing, setIsEditing,
    isPerpanjangStatus, isAfkirStatus,
    openUploadModal, handleAfkir, handleAktifkan,
    setIsConfirmRenewHeaderModalOpen,
    setIsConfirmCancelHeaderModalOpen,
    setIsDeleteDialogOpen,
    setSelectedHistoryToDelete,
    historyList,
  } = hook;

  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setIsActionMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCerts = historyList.filter(c => (c.status || '').toLowerCase() === 'aktif' || (c.status || '').toLowerCase() === 'active');
  const primaryCert = activeCerts.length > 0
    ? activeCerts.slice().sort((a, b) => new Date(b.expired || '1970-01-01') - new Date(a.expired || '1970-01-01'))[0]
    : (historyList.length > 0 ? historyList[0] : null);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      {/* Left: Back Button + Title */}
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
            <span className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
              {hook.isHaki ? 'HAKI / CIPTAAN' : hook.isEquipment ? 'ASET / PERALATAN' : 'DOKUMEN / PROYEK'}
            </span>
            <h2 className="font-bold text-2xl text-slate-900 tracking-tight">
              {formData.merekItem || formData.title || targetCert?.jenisSertifikat || formData.jenisPeralatan || 'Detail Dokumen'}
            </h2>
            {isSingleCertScope && (
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold font-mono-data">
                {targetCert?.noSertifikat || formData.noSertifikat || 'Sertifikat'}
              </span>
            )}
            <span className="px-2.5 py-0.5 bg-blue-50 text-[#005ea4] border border-blue-200 rounded-lg text-xs font-bold font-mono-data">
              {isSingleCertScope ? `Entity: ${parentDoc?.id || item?.id}` : `ID: ${item?.id}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            {isSingleCertScope
              ? `Entitas: ${formData.merekItem} · Detail & Riwayat Sertifikat Terpilih`
              : 'Detail Spesifikasi, Legalitas Sertifikat, dan Rekam Jejak Audit Dokumen'}
          </p>
        </div>
      </div>

      {/* Right: Aksi Dropdown */}
      {!isViewer && (
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
            {/* Edit Toggle */}
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

            {/* Perpanjang / Upload */}
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

            {/* Afkir / Aktifkan */}
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

            <div className="h-px bg-slate-100 my-1 mx-2" />

            {/* Hapus Sertifikat */}
            {primaryCert ? (
              <button
                onClick={() => { setSelectedHistoryToDelete(primaryCert); setIsActionMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
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

            <div className="h-px bg-slate-100 my-1 mx-2" />

            {/* Hapus Master */}
            <button
              onClick={() => { setIsDeleteDialogOpen(true); setIsActionMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              <span>Hapus Data Ini</span>
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
