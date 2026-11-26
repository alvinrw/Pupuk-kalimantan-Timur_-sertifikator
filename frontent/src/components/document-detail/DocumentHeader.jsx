import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowLeft, Edit3, RotateCcw, Ban,
  UploadCloud, Trash2, Settings, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import AdministrasiLainnyaHeaderActions from './AdministrasiLainnyaHeaderActions';

export default function DocumentHeader({ hook, item, onBack }) {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';

  const {
    formData, targetCert, parentDoc, isSingleCertScope, effectiveCategoryKey,
    isEditing, setIsEditing,
    isPerpanjangStatus, isDecommissionedStatus,
    openUploadModal, handleDecommissioned, handleAktifkan,
    setIsConfirmRenewHeaderModalOpen,
    setIsConfirmCancelHeaderModalOpen,
    setIsDeleteDialogOpen,
    setSelectedHistoryToDelete,
    historyList,
    isMultiCertItem, activeCertId, isChildView, isMasterView
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
  const showSingleCertActions = (!isMultiCertItem && isSingleCertScope) || (isMultiCertItem && Boolean(activeCertId)) || effectiveCategoryKey === 'peralatan-pabrik';

  const getHeaderLabel = () => {
    if (hook.isHaki) return 'HAKI / CIPTAAN';
    if (hook.effectiveCategoryKey === 'peralatan-pabrik') return 'ITEM / PERALATAN';
    if (hook.effectiveCategoryKey === 'perizinan-aset') return 'ASET';
    if (hook.effectiveCategoryKey === 'perizinan-proyek') return 'PROYEK';
    if (hook.effectiveCategoryKey === 'perizinan-produk') return 'PRODUK';
    if (hook.isEquipment) return 'ASET / PERALATAN';
    return 'DOKUMEN';
  };

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
          {(() => {
            const getThemeName = (key) => {
              const mapping = {
                'peralatan-pabrik': 'Perizinan Peralatan Pabrik',
                'perizinan-aset': 'Perizinan Aset',
                'administrasi-lainnya': 'Administrasi Lainnya',
                'bangunan-generic': 'Bangunan & Konstruksi',
                'lingkungan-generic': 'Lingkungan Hidup',
                'kesehatan-generic': 'Kesehatan & Keselamatan',
                'proteksi-kebakaran': 'Proteksi Kebakaran',
                'pesawat-angkat-angkut': 'Pesawat Angkat & Angkut',
                'pesawat-tenaga-produksi': 'Pesawat Tenaga & Produksi',
                'instalasi-penyalur-petir': 'Instalasi Penyalur Petir',
                'esdm-generic': 'ESDM & Energi',
                'komunikasi-generic': 'Komunikasi & Telekomunikasi',
                'disnaker-generic': 'Ketenagakerjaan',
                'haki-generic': 'HAKI / Hak Kekayaan Intelektual'
              };
              return mapping[key] || 'Dokumen / Proyek';
            };
            return (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 flex items-center gap-2">
                <span>{getThemeName(effectiveCategoryKey)}</span>
                {isMultiCertItem && activeCertId && (
                  <button
                    onClick={() => hook.setActiveCertId(null)}
                    className="hover:underline text-[#005ea4] font-semibold lowercase cursor-pointer"
                  >
                    (lihat master)
                  </button>
                )}
              </div>
            );
          })()}
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-2xl text-slate-900 tracking-tight">
              {item?.title || item?.merekItem || targetCert?.jenisSertifikat || item?.jenisPeralatan || 'Detail Dokumen'}
            </h2>
            {activeCertId && targetCert && (
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold font-mono-data">
                {targetCert.noSertifikat || targetCert.certNo || 'Sertifikat'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            {activeCertId
              ? `Entitas: ${item?.title || item?.merekItem || (effectiveCategoryKey === 'peralatan-pabrik' ? 'Alat' : 'Item')} · Detail & Riwayat Sertifikat Terpilih`
              : 'Detail Spesifikasi, Legalitas Sertifikat, dan Rekam Jejak Audit Dokumen'}
          </p>
        </div>
      </div>

      {/* Right: Aksi Dropdown */}
      {!isViewer && !isEditing && (
        effectiveCategoryKey === 'administrasi-lainnya' ? (
          <AdministrasiLainnyaHeaderActions hook={hook} />
        ) : (
          <div className="relative font-mono-data" ref={actionMenuRef}>
            <button
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Aksi</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
            </button>

        <div className={`absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden flex flex-col transition-all duration-200 origin-top-right ${isActionMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 pointer-events-none invisible -translate-y-2'}`}>
            {/* Edit Toggle */}
            {!isEditing && (
              <button
                onClick={() => { setIsEditing(true); setIsActionMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <Edit3 className="w-4 h-4 text-slate-400" />
                <span>Edit Data Dokumen</span>
              </button>
            )}

            {/* Perpanjang / Upload */}
            {showSingleCertActions && !isDecommissionedStatus && (
              isPerpanjangStatus ? (
              <>
                <button
                  onClick={() => { openUploadModal('archive', primaryCert?.id); setIsActionMenuOpen(false); }}
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
            ))}

            {/* Decommissioned / Aktifkan */}
            {showSingleCertActions && (
              isDecommissionedStatus ? (
              <button
                onClick={() => { handleAktifkan(); setIsActionMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Batal Non Aktif / Aktifkan</span>
              </button>
            ) : (
              <button
                onClick={() => { handleDecommissioned(); setIsActionMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <Ban className="w-4 h-4 text-slate-400" />
                <span>Tandai Sebagai Non Aktif</span>
              </button>
            ))}

            <div className="h-px bg-slate-100 my-1 mx-2" />

            {/* Hapus Sertifikat */}
            {showSingleCertActions && (
              primaryCert ? (
              <button
                onClick={() => { 
                  setSelectedHistoryToDelete(primaryCert); 
                  setIsActionMenuOpen(false); 
                }}
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
            ))}

            <div className="h-px bg-slate-100 my-1 mx-2" />

            <button
              onClick={() => { 
                setIsDeleteDialogOpen(true); 
                setIsActionMenuOpen(false); 
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              <span>Hapus Item / Dokumen</span>
            </button>
          </div>
        </div>
        )
      )}
    </div>
  );
}
