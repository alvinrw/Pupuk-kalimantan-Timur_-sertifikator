import React, { useRef, useEffect, useState } from 'react';
import {
  Edit3, RotateCcw, Ban,
  UploadCloud, Trash2, Settings, ChevronDown
} from 'lucide-react';

export default function AdministrasiLainnyaHeaderActions({ hook }) {
  const {
    isEditing, setIsEditing,
    isPerpanjangStatus, isDecommissionedStatus,
    openUploadModal, handleDecommissioned, handleAktifkan,
    setIsConfirmRenewHeaderModalOpen,
    setIsConfirmCancelHeaderModalOpen,
    setIsDeleteDialogOpen,
    historyList
  } = hook;

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

  const primaryCert = historyList.find(c => c.isCurrent) || (historyList.length > 0 ? historyList[0] : null);

  return (
    <div className="relative font-mono-data" ref={actionMenuRef}>
      <button
        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
      >
        <Settings className="w-4 h-4 text-slate-500" />
        <span>Aksi</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden flex flex-col transition-all duration-200 origin-top-right ${isActionMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 pointer-events-none invisible -translate-y-2'}`}>
        
        {/* Edit Toggle */}
        {!isEditing && (
          <button
            onClick={() => { setIsEditing(true); setIsActionMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>Edit Data & Spesifikasi</span>
          </button>
        )}

        {/* Perpanjang / Upload */}
        {!isDecommissionedStatus && (
          isPerpanjangStatus ? (
            <>
              <button
                onClick={() => { openUploadModal('archive', primaryCert?.id); setIsActionMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-slate-400" />
                <span>Selesai & Upload Perpanjangan</span>
              </button>
              <button
                onClick={() => { setIsConfirmCancelHeaderModalOpen(true); setIsActionMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <Ban className="w-4 h-4 text-slate-400" />
                <span>Batal Proses Perpanjangan</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => { setIsConfirmRenewHeaderModalOpen(true); setIsActionMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Perpanjang Masa Berlaku</span>
            </button>
          )
        )}

        {/* Decommissioned / Aktifkan */}
        {isDecommissionedStatus ? (
          <button
            onClick={() => { handleAktifkan(); setIsActionMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Aktifkan Kembali Dokumen</span>
          </button>
        ) : (
          <button
            onClick={() => { handleDecommissioned(); setIsActionMenuOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <Ban className="w-4 h-4 text-slate-400" />
            <span>Tandai Sebagai Non-Aktif</span>
          </button>
        )}

        <div className="h-px bg-slate-100 my-1 mx-2" />

        {/* Hapus Item */}
        <button
          onClick={() => { 
            setIsDeleteDialogOpen(true); 
            setIsActionMenuOpen(false); 
          }}
          className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-2.5 transition-colors text-slate-700 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-slate-400" />
          <span>Hapus Item / Dokumen</span>
        </button>
      </div>
    </div>
  );
}
