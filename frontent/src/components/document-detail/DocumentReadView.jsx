import React from 'react';
import {
  Building2, FileCheck, FileText, UploadCloud, ExternalLink,
  RefreshCw, Settings, ShieldAlert
} from 'lucide-react';
import { getFullFileUrl } from '../../config/api';
import CertHistorySection from './CertHistorySection';

export default function DocumentReadView({ hook, item }) {
  const parseKeteranganText = (ket) => {
    if (!ket) return '-';
    try {
      if (typeof ket === 'string' && ket.trim().startsWith('{')) {
        const parsed = JSON.parse(ket);
        return parsed.keteranganAsli !== undefined ? parsed.keteranganAsli : ket;
      }
    } catch (_) {}
    return ket;
  };

  const getAdditionalEntities = (ket) => {
    try {
      if (ket && typeof ket === 'string' && ket.trim().startsWith('{')) {
        const parsed = JSON.parse(ket);
        return Array.isArray(parsed.additionalEntities) ? parsed.additionalEntities : [];
      }
    } catch (_) {}
    return [];
  };

  const formatEntityValue = (val, type) => {
    if (!val) return '-';
    if (type === 'date') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const parts = val.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return val;
    }
    if (type === 'nominal') {
      const num = Number(val);
      if (!isNaN(num) && val.trim() !== '') {
        return num.toLocaleString('id-ID');
      }
      return val;
    }
    return val;
  };

  const {
    formData, isHaki, isEquipment, effectiveCategoryKey, isSingleCertScope, isMultiCertItem,
    targetCert,
    localDocumentStatus, historyList, isLoadingHistory,
    openUploadModal, setEditingHistoryRow, setSelectedHistoryToDelete,
    setIsRenewExemptModalOpen, setRenewExemptDate, setIsEditing,
    reminderEnabled, triggerType, triggerDate, reminderDays,
    handleToggleReminder, linkedCerts = []
  } = hook;

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
    const masterStatusLower = (formData.status || item?.status || '').toLowerCase();
    const isMasterAfkir = masterStatusLower === 'afkir' || masterStatusLower === 'decommissioned' || masterStatusLower === 'dicabut';
    const isMasterProses = masterStatusLower.includes('perpanjang') || masterStatusLower === 'in progress' || masterStatusLower === 'in_progress' || masterStatusLower === 'proses';

    const statusLower = (cert?.status || '').toLowerCase();
    const isExempt = statusLower === 'exempt';
    const isAfkir = isMasterAfkir || statusLower === 'afkir' || statusLower === 'decommissioned' || statusLower === 'dicabut';
    const isProses = !isAfkir && (isMasterProses || statusLower === 'perpanjangan' || statusLower === 'proses' || statusLower === 'in progress' || statusLower === 'sedang diperpanjang' || statusLower === 'perpanjang');

    const expiredStr = cert?.expired || cert?.berakhir;
    if (!expiredStr || expiredStr === '-') {
      if (isExempt) return { text: 'Pengecualian (Tanpa Sertifikat)', label: 'EXEMPT', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      if (isAfkir) return { text: 'Afkir / Dicabut', label: 'AFKIR', color: 'bg-slate-100 text-slate-500 border-slate-300' };
      if (isProses) return { text: 'Sedang Diperpanjang', label: 'PROSES', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      return { text: 'Belum Ada Data Expired', label: 'NO_DATA', color: 'bg-slate-50 text-slate-500 border-slate-200' };
    }

    const expiredTimestamp = getTimestamp(expiredStr);
    if (!expiredTimestamp) return { text: 'Format Tanggal Tidak Valid', label: 'INVALID', color: 'bg-slate-50 text-slate-500 border-slate-200' };

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayTimestamp = now.getTime();

    const diffTime = expiredTimestamp - todayTimestamp;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeText = '';
    let label = '';
    let color = '';

    if (diffDays < 0) {
      timeText = `Expired (${Math.abs(diffDays)} Hari Lalu)`;
      label = 'EXPIRED';
      color = 'bg-rose-100 text-rose-700 border-rose-300 font-bold';
    } else if (diffDays <= 90) {
      timeText = `Akan Expired (Sisa ${diffDays} Hari)`;
      label = 'WARNING';
      color = 'bg-amber-100 text-amber-700 border-amber-300 font-bold';
    } else {
      timeText = `Aktif (Sisa ${diffDays} Hari)`;
      label = 'ACTIVE';
      color = 'bg-emerald-100 text-emerald-700 border-emerald-300 font-bold';
    }

    // Keep semantic color for EXEMPT, just override label
    if (isExempt) return { text: timeText, label: 'EXEMPT', color };
    if (isAfkir) return { text: 'Non-aktif', label: 'AFKIR', color: 'bg-slate-100 text-slate-500 border-slate-300' };
    if (isProses) return { text: `Sedang Diperpanjang (Semula ${timeText})`, label: 'PROSES', color: 'bg-blue-100 text-blue-700 border-blue-300 font-bold' };

    return { text: timeText, label, color };
  };

  const primaryCert = historyList.find(c => c.isCurrent) || (historyList.length > 0 ? historyList[0] : null);

  const displayNoSert = primaryCert?.noSertifikat || formData.noSertifikat || 'Belum Ada Sertifikat Active';
  const displayExpired = primaryCert?.expired || formData.berakhir || 'Belum Ada Data';
  const displayFileUrl = primaryCert?.fileUrl || formData.fileUrl || null;

  let effectiveDocumentStatus = localDocumentStatus;

  // Helper to check if a value is meaningful (not empty/dash/placeholder)
  const isValidCertVal = (v) => v && v !== '-' && v !== 'BELUM_ADA_SERTIFIKAT' && v !== 'EXEMPT' && String(v).trim() !== '';

  // If the cert already has a real noSertifikat + terbit + expired, treat as COMPLETED (not EXEMPT)
  const certHasCompleteData = isValidCertVal(primaryCert?.noSertifikat || formData.noSertifikat) &&
    isValidCertVal(primaryCert?.terbit || formData.terbit) &&
    isValidCertVal(primaryCert?.expired || formData.berakhir);

  if (certHasCompleteData && effectiveDocumentStatus === 'EXEMPT') {
    effectiveDocumentStatus = 'COMPLETED';
  } else if (isSingleCertScope && primaryCert?.status === 'EXEMPT' && !certHasCompleteData) {
    effectiveDocumentStatus = 'EXEMPT';
  } else if (localDocumentStatus === 'EXEMPT' && !certHasCompleteData) {
    const isNoSertValid = displayNoSert && displayNoSert !== 'Belum Ada Sertifikat Active' && displayNoSert.toLowerCase() !== 'tanpa sertifikat' && displayNoSert !== '-';
    if (isNoSertValid) {
      effectiveDocumentStatus = 'COMPLETED';
    }
  }

  const childStatusInfo = (!isMultiCertItem || isSingleCertScope) ? calculateCertStatus(primaryCert || formData) : null;

  return (
    <div className="space-y-6">
      {/* KARTU STATUS PERIZINAN UNTUK CHILD VIEW */}
      {(!isMultiCertItem || isSingleCertScope) && childStatusInfo && (
        <div className={`border rounded-lg p-5 ${childStatusInfo.color.replace('font-bold', '')}`}>
          <div className="text-sm opacity-80 mb-1 font-mono-data uppercase tracking-wider">Status Perizinan</div>
          <div className="font-bold text-lg">{childStatusInfo.text}</div>
          <div className="mt-2 text-xs font-mono-data opacity-90">
            Masa Berlaku: {primaryCert?.terbit || '-'} s/d {primaryCert?.expired || '-'}
          </div>
        </div>
      )}

      {/* SECTION 1: ITEM SPEC GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3">
          <span>{isHaki ? 'Spesifikasi & Identitas Hak Cipta (HAKI)' : isEquipment ? 'Spesifikasi Utama & Identitas Aset Peralatan' : 'Spesifikasi Data'}</span>
        </h4>

        {(() => {
          const shouldShowPhoto = (isEquipment && formData.imageUrl) || (!isEquipment && !isSingleCertScope && formData.imageUrl);

          return (
            <div className={shouldShowPhoto ? "grid grid-cols-1 lg:grid-cols-4 gap-6" : ""}>
              <div className={shouldShowPhoto ? "lg:col-span-3" : ""}>
                {isHaki ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs mt-4">
                    {[
                      { label: 'Judul Ciptaan', val: formData.merekItem, cls: 'font-bold text-slate-900 text-sm' },
                      { label: 'Jenis Ciptaan', val: formData.jenisPeralatan, cls: 'font-bold text-slate-800' },
                      { label: 'Tanggal Ciptaan', val: formData.tanggalCiptaan || '2024-03-10', cls: 'font-bold text-slate-800' },
                      { label: 'Masa Berlaku', val: formData.masaBerlaku, cls: 'font-bold text-slate-800' },
                      { label: 'Kapan Berakhir', val: formData.berakhir, cls: 'font-bold text-slate-800' },
                      { label: 'Instansi Penerbit HAKI', val: formData.keterangan || 'Dirjen KI Kemenkumham', cls: 'font-bold text-slate-800' },
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
                        { label: 'Jenis Peralatan', val: formData.jenisPeralatan, cls: 'font-bold text-slate-800' },
                        { label: 'Tipe / Kode', val: formData.tipe || '-', cls: 'font-bold text-slate-800' },
                        { label: 'Nomor Seri / Tag', val: formData.nomorSeri || '-', cls: 'font-bold text-slate-800' },
                        { label: 'Unit Pabrik / Lokasi', val: formData.lokasi, cls: 'font-bold text-slate-800' },
                        { label: 'User / Dept PJ', val: formData.user || 'Dept. Operasi', cls: 'font-bold text-slate-800' },
                        {
                          label: effectiveCategoryKey === 'perizinan-proyek' ? 'Status Proyek' : 'Status Fisik Operasional',
                          val: effectiveCategoryKey === 'perizinan-proyek'
                            ? (formData.status === 'Spare' ? 'Selesai' : formData.status === 'Rusak' ? 'Ditunda' : formData.status)
                            : (formData.status === 'Spare' ? 'Spare (Cadangan)' : formData.status === 'Rusak' ? 'Rusak (Out of Service)' : formData.status),
                          cls: 'font-bold text-slate-800'
                        },
                        ...((formData.additionalEntities || []).map(ent => ({ label: ent.key, val: formatEntityValue(ent.value, ent.type), cls: 'font-bold text-slate-800' })))
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
                        <h5 className="font-bold text-sm text-slate-800 mb-4">
                          Detail Sertifikat Dokumen & Pengecualian
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono-data text-xs">
                          {[
                            { label: 'Nama Sertifikat', val: formData.namaSertifikat || '-', cls: 'font-bold text-slate-800' },
                            { label: 'No. Sertifikat Active', val: displayNoSert, cls: 'font-bold text-slate-800 font-mono' },
                            { label: 'Instansi Penerbit', val: formData.instansi || '-', cls: 'font-bold text-slate-800' },
                            { label: 'Tanggal Terbit', val: formData.terbit || '-', cls: 'font-bold text-slate-800' },
                            { label: 'Tanggal Expired', val: displayExpired, cls: 'font-bold text-slate-800' },
                            { label: 'Catatan / Pengecualian', val: formData.exemptionNote || parseKeteranganText(formData.keterangan) || '-', cls: 'font-bold text-slate-800 whitespace-pre-wrap' },
                            ...(isSingleCertScope ? (formData.additionalEntities || []).map(ent => ({ label: ent.key, val: formatEntityValue(ent.value, ent.type), cls: 'font-bold text-slate-800' })) : [])
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

              {shouldShowPhoto && (
                <div className="lg:col-span-1 flex flex-col justify-start border-l border-slate-100 lg:pl-6">
                  <span className="text-[11px] text-slate-500 font-sans block mb-2 font-bold uppercase tracking-wider">Dokumentasi Foto</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-slate-50 aspect-square flex items-center justify-center">
                    <img
                      src={getFullFileUrl(formData.imageUrl)}
                      alt="Dokumentasi"
                      className="w-full h-full object-cover cursor-zoom-in transition-transform hover:scale-105"
                      onClick={() => window.open(getFullFileUrl(formData.imageUrl), '_blank')}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* SECTION 1.5: NOTIFICATION SETTINGS (Read-only) */}
      {(targetCert || !isMultiCertItem || isSingleCertScope) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3">
            Pengaturan Notifikasi & Deadline
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${reminderEnabled ? 'bg-slate-800' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold text-slate-700">
                  Status Pengingat: {reminderEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleReminder(!reminderEnabled)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${reminderEnabled ? 'bg-slate-800' : 'bg-slate-300'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${reminderEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
              {reminderEnabled ? (
                <div className="text-xs text-slate-500 font-mono-data space-y-1">
                  {triggerType === 'DAYS' ? (
                    <p>Pengingat aktif pada <span className="font-bold text-slate-800">H-{reminderDays || 30}</span> sebelum tanggal kedaluwarsa.</p>
                  ) : (
                    <p>Pengingat aktif pada tanggal <span className="font-bold text-slate-800">{triggerDate || '-'}</span>.</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono-data">Sistem tidak akan mengirimkan notifikasi pengingat untuk dokumen ini.</p>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Ubah Pengaturan
            </button>
          </div>
        </div>
      )}
      {/* SECTION 3: HISTORY (Moved to Top) */}
      {(!isMultiCertItem || isSingleCertScope) && (
        <CertHistorySection
          historyList={historyList}
          isLoadingHistory={isLoadingHistory}
          openUploadModal={openUploadModal}
          setEditingHistoryRow={setEditingHistoryRow}
          setSelectedHistoryToDelete={setSelectedHistoryToDelete}
          primaryCert={primaryCert}
        />
      )}

      {/* SECTION 2: CERT LEGAL STATUS */}
      {effectiveDocumentStatus === 'EXEMPT' ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 font-mono-data text-center">
          <h4 className="font-bold text-sm text-slate-800 mb-2">
            Tanpa Sertifikat (Catatan / Exempt)
          </h4>
          <p className="text-sm font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-200 inline-block">
            Alasan: {(isSingleCertScope && primaryCert?.status === 'EXEMPT') ? (primaryCert?.instansi || 'Tanpa Sertifikat / Dihapus') : (item?.exemptionNote || 'Tidak ada catatan khusus')}
          </p>
          <div className="pt-4 mt-2 border-t border-slate-200 flex items-center justify-center gap-3">
            <button
              onClick={() => { setRenewExemptDate(formData.berakhir && formData.berakhir !== '-' ? formData.berakhir : ''); setIsRenewExemptModalOpen(true); }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              Ajukan Perpanjangan
            </button>
            <button
              onClick={() => openUploadModal('archive', primaryCert?.id)}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Upload Sertifikat Sekarang
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 font-mono-data">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between font-sans">
            <span>Daftar Sertifikat Terhubung</span>
            <span className="text-xs text-slate-600 font-mono-data font-bold">Terverifikasi Disnaker / Kemenperin</span>
          </h4>

          <div className="space-y-4">
            {(() => {
              let certsToDisplay = [];
              if (isMultiCertItem && !isSingleCertScope && linkedCerts.length > 0) {
                // Tampilkan SEMUA sertifikat, urutkan berdasarkan urgensi (Expired -> Warning -> Proses -> Active -> Afkir)
                certsToDisplay = [...linkedCerts].sort((a, b) => {
                  const statusA = calculateCertStatus(a).label;
                  const statusB = calculateCertStatus(b).label;
                  const order = { 'EXPIRED': 1, 'WARNING': 2, 'PROSES': 3, 'NO_DATA': 4, 'ACTIVE': 5, 'EXEMPT': 6, 'AFKIR': 7, 'INVALID': 8 };
                  return (order[statusA] || 99) - (order[statusB] || 99);
                });
              }

              if (certsToDisplay.length === 0) {
                if (isMultiCertItem && !isSingleCertScope) {
                  return (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center min-h-[100px]">
                      <p className="text-slate-500 font-bold font-sans text-sm">Belum ada sertifikat terhubung.</p>
                    </div>
                  );
                }
                certsToDisplay = [primaryCert || formData];
              }

              return certsToDisplay.map((cert, index) => {
                const currentNoSert = cert?.noSertifikat || cert?.certNo || formData.noSertifikat || '-';
                const currentExpired = cert?.expired || formData.berakhir || '-';
                const currentTerbit = cert?.terbit || formData.terbit || '-';
                const currentFileUrl = cert?.fileUrl || (index === 0 ? formData.fileUrl : null);
                const currentNamaSert = cert?.namaSertifikat || cert?.jenisSertifikat || formData.namaSertifikat || '-';
                const certStatusInfo = calculateCertStatus(cert || formData);

                return (
                  <div key={cert?.id || index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative mt-4">
                    <div className={`absolute top-4 right-4 text-sm px-3 py-1.5 rounded-lg border shadow-sm ${certStatusInfo.color}`}>
                      {certStatusInfo.text}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3 mt-8">
                      <div>
                        <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Nama Sertifikat</span>
                        <span className="font-bold text-slate-800 text-sm block">{currentNamaSert}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-sans block mb-0.5">No. Sertifikat</span>
                        <span className="font-bold text-slate-800 text-sm block">{currentNoSert}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tanggal Terbit</span>
                        <span className="font-bold text-slate-800 text-sm block">{currentTerbit}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Tanggal Expired</span>
                        <span className="font-bold text-slate-800 text-sm block">{currentExpired}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Catatan / Keterangan</span>
                        <span className="font-bold text-slate-800 text-sm block whitespace-pre-wrap">{parseKeteranganText(cert?.keterangan || formData.keterangan || formData.exemptionNote)}</span>
                      </div>
                    </div>
                    <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-100 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {currentFileUrl ? 'Dokumen Digital SK (PDF Terlampir)' : 'Dokumen Digital SK (Belum Ada File)'}
                        </span>
                      </div>
                      {currentFileUrl ? (
                        <button
                          onClick={() => window.open(getFullFileUrl(currentFileUrl), '_blank')}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Buka File PDF
                        </button>
                      ) : (
                        (!isMultiCertItem || isSingleCertScope) && (
                          <button
                            onClick={() => openUploadModal('current')}
                            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Unggah File PDF
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}


    </div>
  );
}
