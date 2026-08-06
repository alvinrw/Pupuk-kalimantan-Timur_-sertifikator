import React from 'react';
import {
  Building2, FileCheck, FileText, UploadCloud, ExternalLink,
  RefreshCw, Settings, ShieldAlert
} from 'lucide-react';
import { getFullFileUrl } from '../../config/api';
import CertHistorySection from './CertHistorySection';

export default function DocumentReadView({ hook, item }) {
  const {
    formData, isHaki, isEquipment, effectiveCategoryKey, isSingleCertScope, isMultiCertItem,
    localDocumentStatus, historyList, isLoadingHistory,
    openUploadModal, setEditingHistoryRow, setSelectedHistoryToDelete,
    setIsRenewExemptModalOpen, setRenewExemptDate, setIsEditing,
    reminderEnabled, triggerType, triggerDate, reminderDays,
    handleToggleReminder,
  } = hook;

  const activeCerts = historyList.filter(c => (c.status || '').toLowerCase() === 'aktif' || (c.status || '').toLowerCase() === 'active');
  const primaryCert = activeCerts.length > 0
    ? activeCerts.slice().sort((a, b) => new Date(b.expired || '1970-01-01') - new Date(a.expired || '1970-01-01'))[0]
    : (historyList.length > 0 ? historyList[0] : null);

  const displayNoSert = primaryCert?.noSertifikat || formData.noSertifikat || 'Belum Ada Sertifikat Active';
  const displayExpired = primaryCert?.expired || formData.berakhir || 'Belum Ada Data';
  const displayFileUrl = primaryCert?.fileUrl || formData.fileUrl || null;

  return (
    <div className="space-y-6">
      {/* SECTION 1: ITEM SPEC GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#005ea4]" />
          <span>{isHaki ? 'Spesifikasi & Identitas Hak Cipta (HAKI)' : isEquipment ? 'Spesifikasi Utama & Identitas Aset Peralatan' : 'Spesifikasi Data'}</span>
        </h4>
        {isHaki ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs mt-4">
            {[
              { label: 'Judul Ciptaan', val: formData.merekItem, cls: 'font-bold text-slate-900 text-sm' },
              { label: 'Jenis Ciptaan', val: formData.jenisPeralatan, cls: 'font-bold text-[#005ea4] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block' },
              { label: 'Tanggal Ciptaan', val: formData.tanggalCiptaan || '2024-03-10', cls: 'font-bold text-slate-800' },
              { label: 'Masa Berlaku', val: formData.masaBerlaku, cls: 'font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block' },
              { label: 'Kapan Berakhir', val: formData.berakhir, cls: 'font-bold text-rose-700' },
              { label: 'Instansi Penerbit HAKI', val: formData.keterangan || 'Dirjen KI Kemenkumham', cls: 'font-bold text-slate-800 font-sans' },
              ...(formData.additionalEntities || []).map(ent => ({ label: ent.key, val: ent.value, cls: 'font-bold text-slate-800' }))
            ].map(({ label, val, cls }) => (
              <div key={label}>
                <span className="text-[11px] text-slate-500 font-sans block mb-0.5">{label}</span>
                <span className={cls}>{val}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* SPESIFIKASI ASET */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs">
              {[
                { label: 'Merek / Nama Item', val: formData.merekItem, cls: 'font-bold text-slate-900 text-sm' },
                { label: 'Jenis Peralatan', val: formData.jenisPeralatan, cls: 'font-bold text-[#005ea4]' },
                { label: 'Tipe / Kode', val: formData.tipe || '-', cls: 'font-bold text-slate-800' },
                { label: 'Nomor Seri / Tag', val: formData.nomorSeri || '-', cls: 'font-bold text-slate-800' },
                { label: 'Unit Pabrik / Lokasi', val: formData.lokasi, cls: 'font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block' },
                { label: 'User / Dept PJ (Penanggung Jawab)', val: formData.user || 'Dept. Operasi', cls: 'font-bold text-slate-800' },
                {
                  label: effectiveCategoryKey === 'perizinan-proyek' ? 'Status Proyek' : 'Status Fisik Operasional',
                  val: effectiveCategoryKey === 'perizinan-proyek'
                    ? (formData.status === 'Spare' ? 'Selesai' : formData.status === 'Rusak' ? 'Ditunda' : formData.status)
                    : (formData.status === 'Spare' ? 'Spare (Cadangan)' : formData.status === 'Rusak' ? 'Rusak (Out of Service)' : formData.status),
                  cls: 'font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block'
                },
                ...(formData.additionalEntities || []).map(ent => ({ label: ent.key, val: ent.value, cls: 'font-bold text-slate-800' }))
              ].map(({ label, val, cls }) => (
                <div key={label}>
                  <span className="text-[11px] text-slate-500 font-sans block mb-0.5">{label}</span>
                  <span className={cls}>{val}</span>
                </div>
              ))}
            </div>

            {/* SPESIFIKASI SERTIFIKAT (Hanya jika Single Cert Scope atau Bukan Multi Cert Master) */}
            {(!isMultiCertItem || isSingleCertScope) && (
              <div className="pt-4 border-t border-slate-100">
                <h5 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Detail Sertifikat Dokumen</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono-data text-xs">
                  {[
                    { label: 'Nama Sertifikat', val: formData.namaSertifikat || '-', cls: 'font-bold text-slate-800' },
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 1.5: NOTIFICATION SETTINGS (Read-only) - ONLY FOR SINGLE CERT SCOPE */}
      {isSingleCertScope && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#005ea4]" />
            <span>Pengaturan Notifikasi & Deadline</span>
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${reminderEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold text-slate-700">
                  Status Pengingat: {reminderEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleReminder(!reminderEnabled)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${reminderEnabled ? 'bg-[#005ea4]' : 'bg-slate-300'}`}
                  title={reminderEnabled ? 'Klik untuk menonaktifkan pengingat' : 'Klik untuk mengaktifkan pengingat'}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${reminderEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
              {reminderEnabled ? (
                <div className="text-xs text-slate-500 font-mono-data space-y-1">
                  {triggerType === 'DAYS' ? (
                    <p>Pengingat aktif pada <span className="font-bold text-[#005ea4]">H-{reminderDays || 30}</span> sebelum tanggal kedaluwarsa.</p>
                  ) : (
                    <p>Pengingat aktif pada tanggal <span className="font-bold text-[#005ea4]">{triggerDate || '-'}</span>.</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono-data">Sistem tidak akan mengirimkan notifikasi pengingat untuk dokumen ini.</p>
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
      )}


      {/* SECTION 2: CERT LEGAL STATUS */}
      {localDocumentStatus === 'EXEMPT' ? (
        <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-6 space-y-4 font-mono-data text-center">
          <h4 className="font-bold text-sm text-indigo-900 flex items-center justify-center gap-2 mb-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            <span>Tanpa Sertifikat (Catatan / Exempt)</span>
          </h4>
          <p className="text-sm font-bold text-indigo-800 bg-indigo-100/50 p-3 rounded-xl border border-indigo-200 inline-block">
            Alasan: {item?.exemptionNote || 'Tidak ada catatan khusus'}
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

          <div className="space-y-4">
            {(activeCerts.length > 0 ? activeCerts : [primaryCert || formData]).map((cert, index) => {
              const currentNoSert = cert?.noSertifikat || cert?.certNo || formData.noSertifikat || '-';
              const currentExpired = cert?.expired || formData.berakhir || '-';
              const currentTerbit = cert?.terbit || formData.terbit || '-';
              const currentFileUrl = cert?.fileUrl || (index === 0 ? formData.fileUrl : null);
              const currentNamaSert = cert?.namaSertifikat || cert?.jenisSertifikat || formData.namaSertifikat || '-';

              return (
                <div key={cert?.id || index} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Nama Sertifikat</span>
                      <span className="font-bold text-slate-850 text-sm block">{currentNamaSert}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-sans block mb-0.5">No. Sertifikat Active</span>
                      <span className="font-bold text-[#005ea4] text-sm block">{currentNoSert}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tanggal Terbit</span>
                      <span className="font-bold text-slate-850 text-sm block">{currentTerbit}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tanggal Expired</span>
                      <span className="font-bold text-rose-700 text-sm block">{currentExpired}</span>
                    </div>
                  </div>
                  <div className="pt-3 flex items-center justify-between text-xs border-t border-blue-50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#005ea4]" />
                      <span className="font-bold text-slate-800">
                        {currentFileUrl ? 'Dokumen Digital SK (PDF Terlampir)' : 'Dokumen Digital SK (Belum Ada File)'}
                      </span>
                    </div>
                    {currentFileUrl ? (
                      <button
                        onClick={() => window.open(getFullFileUrl(currentFileUrl), '_blank')}
                        className="px-4 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Buka File PDF</span>
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </button>
                    ) : (
                      (!isMultiCertItem || isSingleCertScope) && (
                        <button
                          onClick={() => openUploadModal('current')}
                          className="px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-amber-600" /><span>+ Unggah File PDF</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: HISTORY */}
      {(!isMultiCertItem || isSingleCertScope) && (
        <CertHistorySection
          historyList={historyList}
          isLoadingHistory={isLoadingHistory}
          openUploadModal={openUploadModal}
          setEditingHistoryRow={setEditingHistoryRow}
          setSelectedHistoryToDelete={setSelectedHistoryToDelete}
        />
      )}
    </div>
  );
}
