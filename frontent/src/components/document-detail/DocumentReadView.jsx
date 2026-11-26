import React from 'react';
import {
  Building2, FileCheck, FileText, UploadCloud, ExternalLink,
  RefreshCw, Settings, ShieldAlert
} from 'lucide-react';
import { getFullFileUrl } from '../../config/api';
import CertHistorySection from './CertHistorySection';


export default function DocumentReadView({ hook, item, hideLinkedCertificates }) {
  const parseKeteranganText = (ket) => {
    if (!ket) return '-';
    try {
      if (typeof ket === 'string' && ket.trim().startsWith('{')) {
        const parsed = JSON.parse(ket);
        return (parsed.keteranganAsli !== undefined && parsed.keteranganAsli !== '-') ? parsed.keteranganAsli : '-';
      }
    } catch (_) { }
    return ket;
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
    isMasterView, isChildView, targetCert, activeCertId,
    localDocumentStatus, historyList, isLoadingHistory,
    openUploadModal, setEditingHistoryRow, setSelectedHistoryToDelete,
    setIsRenewExemptModalOpen, setRenewExemptDate, setIsEditing,
    reminderEnabled, triggerType, triggerDate, reminderDays,
    handleToggleReminder, linkedCerts = []
  } = hook;

  const isKeanggotaan = effectiveCategoryKey === 'iuran_keanggotaan';
  const masterStatusLower = (formData.status || item?.status || '').toLowerCase();
  const isMasterDecommissioned = masterStatusLower === 'decommissioned' || masterStatusLower === 'decommissioned' || masterStatusLower === 'dicabut' || masterStatusLower === 'non-aktif';

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
    const statusLower = (cert?.status || '').toLowerCase();
    const isExempt = statusLower === 'exempt';
    const isDecommissioned = statusLower === 'decommissioned' || statusLower === 'dicabut' || statusLower === 'non-aktif';
    const isProses = !isDecommissioned && (statusLower === 'perpanjangan' || statusLower === 'proses' || statusLower === 'in progress' || statusLower === 'sedang diperpanjang' || statusLower === 'perpanjang');

    const expiredStr = cert?.expired || cert?.berakhir;
    if (!expiredStr || expiredStr === '-') {
      if (isExempt) return { text: 'Pengecualian (Tanpa Sertifikat)', label: 'EXEMPT', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      if (isDecommissioned) return { text: 'Non-aktif', label: 'DECOMMISSIONED', color: 'bg-slate-100 text-slate-500 border-slate-300' };
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

    if (isExempt) return { text: timeText, label: 'EXEMPT', color };
    if (isDecommissioned) return { text: 'Non-aktif', label: 'DECOMMISSIONED', color: 'bg-slate-100 text-slate-500 border-slate-300' };
    if (isProses) return { text: `Sedang Diperpanjang (Semula ${timeText})`, label: 'PROSES', color: 'bg-blue-100 text-blue-700 border-blue-300 font-bold' };

    return { text: timeText, label, color };
  };

  const primaryCert = historyList.find(c => c.isCurrent) || (historyList.length > 0 ? historyList[0] : null);
  const activeCert = targetCert || ((isChildView || isEquipment || isSingleCertScope) ? (primaryCert || formData) : null);
  const childStatusInfo = activeCert ? calculateCertStatus(activeCert) : null;

  const displayNoSert = activeCert?.noSertifikat || activeCert?.certNo || primaryCert?.noSertifikat || formData.noSertifikat || 'Belum Ada Sertifikat Active';
  const displayExpired = activeCert?.expired || primaryCert?.expired || formData.berakhir || 'Belum Ada Data';
  const displayTerbit = activeCert?.terbit || primaryCert?.terbit || formData.terbit || '-';
  const itemMeta = (() => {
    try {
      const raw = item?.rawKeterangan || item?.keterangan;
      if (raw && typeof raw === 'string' && raw.trim().startsWith('{')) return JSON.parse(raw);
    } catch (_) {}
    return null;
  })();
  const displayInstansi = activeCert?.instansi || primaryCert?.instansi || targetCert?.instansi || formData.instansi || itemMeta?.instansi || (item?.instansi && item?.instansi !== '-' ? item?.instansi : null) || '-';
  const cleanInstansi = (() => {
    const raw = displayInstansi && displayInstansi !== '-' ? displayInstansi : (formData.instansi || itemMeta?.instansi || itemMeta?.instansiPenerbit);
    if (raw && typeof raw === 'string' && !raw.trim().startsWith('{') && raw !== '-') {
      return raw;
    }
    return '-';
  })();
  const displayNamaSert = activeCert?.namaSertifikat || activeCert?.jenisSertifikat || formData.namaSertifikat || '-';
  const resolveKeterangan = (...sources) => {
    for (const src of sources) {
      if (!src) continue;
      const parsed = parseKeteranganText(src);
      if (parsed && typeof parsed === 'string' && parsed.trim() !== '' && parsed.trim() !== '-') {
        return parsed.trim();
      }
    }
    return '-';
  };

  const displayKeterangan = resolveKeterangan(
    formData.keterangan,
    activeCert?.keterangan,
    primaryCert?.keterangan,
    targetCert?.keterangan,
    itemMeta?.keteranganAsli,
    itemMeta?.keterangan,
    item?.rawKeterangan,
    item?.keterangan,
    item?.notes
  );

  const isPaten = Boolean(
    effectiveCategoryKey?.includes('paten') ||
    item?.categoryKey?.includes('paten') ||
    (item?.categoryName && item?.categoryName.toLowerCase().includes('paten')) ||
    (item?.title && item?.title.toLowerCase().includes('paten'))
  );

  return (
    <div className="space-y-6">
      {/* KARTU STATUS PERIZINAN */}
      {(isChildView || isEquipment || isSingleCertScope) && childStatusInfo && (() => {
        let bannerBg = "bg-emerald-100/90 border-emerald-300";
        let labelText = "text-emerald-800";
        let valueText = "text-emerald-950";
        let subText = "text-emerald-900";

        if (childStatusInfo.label === 'DECOMMISSIONED') {
          bannerBg = "bg-slate-900 border-slate-800";
          labelText = "text-slate-400";
          valueText = "text-white";
          subText = "text-slate-300";
        } else if (childStatusInfo.label === 'EXPIRED') {
          bannerBg = "bg-rose-100/90 border-rose-300";
          labelText = "text-rose-800";
          valueText = "text-rose-950";
          subText = "text-rose-900";
        } else if (childStatusInfo.label === 'WARNING' || childStatusInfo.label === 'EXEMPT') {
          bannerBg = "bg-amber-100/90 border-amber-300";
          labelText = "text-amber-800";
          valueText = "text-amber-950";
          subText = "text-amber-900";
        } else if (childStatusInfo.label === 'PROSES') {
          bannerBg = "bg-blue-100/90 border-blue-300";
          labelText = "text-blue-800";
          valueText = "text-blue-950";
          subText = "text-blue-900";
        }

        return (
          <div className={`${bannerBg} border rounded-2xl p-5 shadow-2xs font-mono-data`}>
            <div className={`text-xs font-bold ${labelText} uppercase tracking-wider mb-1`}>
              STATUS PERIZINAN
            </div>
            <div className={`font-bold text-xl ${valueText}`}>{childStatusInfo.text}</div>
            <div className={`mt-1 text-xs font-medium ${subText}`}>
              Masa Berlaku: {displayTerbit} s/d {displayExpired}
            </div>
          </div>
        );
      })()}

      {/* SECTION 1: SPESIFIKASI DATA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3">
          <span>{isKeanggotaan ? 'Data Keanggotaan' : isHaki ? (effectiveCategoryKey?.includes('paten') ? 'Spesifikasi & Identitas Hak Paten' : 'Spesifikasi & Identitas Hak Cipta') : isEquipment ? 'Spesifikasi Utama & Identitas Aset Peralatan' : 'Spesifikasi Data'}</span>
        </h4>

        {(() => {
          const shouldShowPhoto = (isEquipment && formData.imageUrl) || (!isEquipment && !isSingleCertScope && formData.imageUrl);

          return (
            <div className={shouldShowPhoto ? "grid grid-cols-1 lg:grid-cols-4 gap-6" : ""}>
              <div className={shouldShowPhoto ? "lg:col-span-3" : ""}>
                {isKeanggotaan ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs mt-4">
                    {[
                      { label: 'Kompartemen', val: formData.kompartemen || '-', cls: 'font-bold text-slate-900 text-sm' },
                      { label: 'Unit Kerja', val: formData.unitKerja || '-', cls: 'font-bold text-slate-800' },
                      { label: 'Asosiasi', val: formData.asosiasi || '-', cls: 'font-bold text-slate-800' },
                      { label: 'Nama', val: formData.nama || '-', cls: 'font-bold text-slate-800' },
                      { label: 'Status', val: formData.status || '-', cls: 'font-bold text-slate-800' },
                      ...(formData.status === 'Karyawan' ? [{ label: 'NPK', val: formData.npk || '-', cls: 'font-bold text-slate-800' }] : []),
                      { label: 'Tahun Pendaftaran', val: formData.tanggalMulai || '-', cls: 'font-bold text-slate-800' },
                      { label: 'Tahun Aktif', val: formData.tanggalSelesai || '-', cls: 'font-bold text-slate-800' },
                      { label: 'Nominal (Rp)', val: formData.nominal ? `Rp ${formatEntityValue(formData.nominal, 'nominal')}` : '-', cls: 'font-bold text-slate-800' },
                      { label: 'Keterangan', val: formData.keterangan || '-', cls: 'font-bold text-slate-800 col-span-full' },
                    ].map(({ label, val, cls }) => (
                      <div key={label} className={label === 'Keterangan' ? 'lg:col-span-3 sm:col-span-2' : ''}>
                        <span className="text-[11px] text-slate-500 font-sans block mb-0.5">{label}</span>
                        <span className={cls}>{val}</span>
                      </div>
                    ))}
                  </div>
                ) : isHaki ? (
                  <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs">
                      {[
                        { label: isPaten ? 'Judul Invensi Paten' : 'Judul Ciptaan', val: formData.merekItem || item.title || '-', cls: 'font-bold text-slate-900 text-sm' },
                        { label: isPaten ? 'Kategori Paten' : 'Jenis Ciptaan', val: formData.jenisPeralatan || item.jenisPeralatan || '-', cls: 'font-bold text-slate-800' },
                        { label: isPaten ? 'Inventor / Unit Riset' : 'Owner Departemen', val: formData.lokasi || item.unitLocation || itemMeta?.unitLocation || '-', cls: 'font-bold text-slate-800' },
                        { label: isPaten ? 'Penanggung Jawab / Inventor' : 'Penanggung Jawab', val: (formData.user && formData.user !== 'Umum' ? formData.user : (itemMeta?.penanggungJawab || item.user || '-')), cls: 'font-bold text-slate-800' },
                        { label: isPaten ? 'Nomor Paten / Pendaftaran' : 'No. Sertifikat', val: (formData.noSertifikat && formData.noSertifikat !== 'Belum Ada Sertifikat Active' ? formData.noSertifikat : (displayNoSert !== 'Belum Ada Sertifikat Active' ? displayNoSert : (itemMeta?.noSertifikat || item.code || '-'))), cls: 'font-bold text-slate-800 font-mono' },
                        { label: 'Instansi Penerbit', val: cleanInstansi, cls: 'font-bold text-slate-800' },
                        { label: 'Tanggal Terbit', val: formatEntityValue(formData.tanggalCiptaan || formData.terbit || displayTerbit || '-', 'date'), cls: 'font-bold text-slate-800' },
                        { label: 'Masa Berlaku', val: formData.masaBerlaku || '-', cls: 'font-bold text-slate-800' },
                        { label: 'Tanggal Berakhir', val: formatEntityValue(formData.berakhir || displayExpired || '-', 'date'), cls: 'font-bold text-slate-800' },
                        ...(formData.additionalEntities || []).map(ent => ({ label: ent.key, val: ent.value, cls: 'font-bold text-slate-800' })),
                        {
                          label: 'Catatan / Keterangan',
                          val: displayKeterangan,
                          cls: 'font-bold text-slate-800 whitespace-pre-wrap',
                          fullWidth: true
                        }
                      ].map(({ label, val, cls, fullWidth }) => (
                        <div key={label} className={fullWidth ? 'col-span-full bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80' : ''}>
                          <span className="text-[11px] text-slate-500 font-sans block mb-0.5">{label}</span>
                          <span className={cls}>{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* PDF Sertifikat Resmi jika ada */}
                    {(() => {
                      const pdfFileUrl = activeCert?.fileUrl || primaryCert?.fileUrl || targetCert?.fileUrl || formData.fileUrl || item.fileUrl || item.pdfUrl;
                      if (!pdfFileUrl) return null;
                      return (
                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-800">Dokumen PDF Sertifikat Resmi DJKI</div>
                              <div className="text-[11px] text-slate-500 font-mono-data">Tersimpan secara digital di sistem</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => window.open(getFullFileUrl(pdfFileUrl), '_blank')}
                            className="px-4 py-2 bg-[#005ea4] hover:bg-[#004a82] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Buka File PDF Sertifikat</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="space-y-6 mt-4">
                    {/* SPESIFIKASI ASET / MASTER */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs">
                      {[
                        { label: (effectiveCategoryKey === 'peralatan-pabrik' || isEquipment) ? 'Alat' : 'Merek', val: formData.merekItem, cls: 'font-bold text-slate-900 text-sm' },
                        { label: 'Jenis Peralatan', val: formData.jenisPeralatan, cls: 'font-bold text-slate-800' },
                        { label: 'Tipe', val: isChildView && activeCert?.noSertifikat ? activeCert.noSertifikat : (formData.tipe || '-'), cls: 'font-bold text-slate-800' },
                        { label: 'Nomor Seri', val: formData.nomorSeri || '-', cls: 'font-bold text-slate-800' },
                        { label: 'Lokasi', val: formData.lokasi, cls: 'font-bold text-slate-800' },
                        { label: 'User', val: formData.user || 'Dept. Produksi', cls: 'font-bold text-slate-800' },
                        {
                          label: effectiveCategoryKey === 'perizinan-proyek' ? 'Status Proyek' : 'Status Fisik Operasional',
                          val: effectiveCategoryKey === 'perizinan-proyek'
                            ? (formData.status === 'Spare' ? 'Selesai' : formData.status === 'Rusak' ? 'Ditunda' : formData.status)
                            : (formData.status === 'Spare' ? 'Spare (Cadangan)' : formData.status === 'Rusak' ? 'Rusak (Out of Service)' : (formData.status || 'Aktif')),
                          cls: 'font-bold text-slate-800'
                        },
                        { label: 'Instansi Penerbit', val: displayInstansi, cls: 'font-bold text-slate-800' },
                        { label: 'Keterangan', val: displayKeterangan, cls: 'font-bold text-slate-800' },
                        ...((formData.additionalEntities || [])
                          .filter(ent => ent.key !== 'JENIS PERALATAN PABRIK' && !ent.key.toLowerCase().includes('parameter 1'))
                          .map(ent => ({ label: ent.key, val: formatEntityValue(ent.value, ent.type), cls: 'font-bold text-slate-800' })))
                      ].map(({ label, val, cls }) => (
                        <div key={label}>
                          <span className="text-[11px] text-slate-500 font-sans block mb-0.5">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className={cls}>{val}</span>
                            {(label === 'Merek' || label === 'Alat' || label === 'Item' || label === 'Merek / Nama Item' || label === 'Nama Aset') && effectiveCategoryKey !== 'peralatan-pabrik' && linkedCerts && linkedCerts.length > 0 && (
                              <span
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black bg-[#005ea4] text-white border border-[#005ea4] shadow-2xs shrink-0"
                                title={`Jumlah Sertifikat Terhubung: ${linkedCerts.length}`}
                              >
                                {linkedCerts.length}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* DETAIL SERTIFIKAT DOKUMEN (Di Tampilan Child / Screenshot 2) */}
                    {isChildView && !isKeanggotaan && (
                      <div className="pt-4 border-t border-slate-100">
                        <h5 className="font-bold text-sm text-slate-800 mb-4 font-sans">
                          Detail Sertifikat Dokumen
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono-data text-xs">
                          {[
                            { label: 'Nama Sertifikat', val: displayNamaSert, cls: 'font-bold text-slate-800' },
                            { label: 'No. Sertifikat Active', val: displayNoSert, cls: 'font-bold text-slate-800 font-mono' },
                            { label: 'Instansi Penerbit', val: displayInstansi, cls: 'font-bold text-slate-800' },
                            { label: 'Tanggal Terbit', val: displayTerbit, cls: 'font-bold text-slate-800' },
                            { label: 'Tanggal Expired', val: displayExpired, cls: 'font-bold text-slate-800' },
                            { label: 'Catatan / Pengecualian', val: parseKeteranganText(activeCert?.keterangan || formData.keterangan || formData.exemptionNote) || '-', cls: 'font-bold text-slate-800 whitespace-pre-wrap' },
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

      {/* SECTION NOTIFICATION SETTINGS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3">
          Pengaturan Notifikasi & Deadline
        </h4>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${isMasterDecommissioned ? 'bg-slate-300' : reminderEnabled ? 'bg-slate-800' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-slate-700 font-mono-data">
                Status Pengingat: {isMasterDecommissioned ? 'Nonaktif' : reminderEnabled ? 'Aktif' : 'Nonaktif'}
              </span>
              {!isMasterDecommissioned && (
                <button
                  type="button"
                  onClick={() => handleToggleReminder(!reminderEnabled)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${reminderEnabled ? 'bg-slate-800' : 'bg-slate-300'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${reminderEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              )}
            </div>
            {isMasterDecommissioned ? (
              <p className="text-xs text-slate-500 font-mono-data">Sistem tidak akan mengirimkan notifikasi pengingat karena dokumen berstatus Non-aktif.</p>
            ) : reminderEnabled ? (
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
          {!isMasterDecommissioned && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer font-mono-data"
            >
              Ubah Pengaturan
            </button>
          )}
        </div>
      </div>

      {/* DAFTAR SERTIFIKAT TERHUBUNG (Khusus Non-Peralatan & Multi-Cert) */}
      {!hideLinkedCertificates && effectiveCategoryKey !== 'administrasi-lainnya' && effectiveCategoryKey !== 'peralatan-pabrik' && (
        <div id="cert-history-section" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 font-mono-data transition-all duration-500">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between font-sans">
          <span>Daftar Sertifikat Terhubung</span>
          <span className="text-xs text-slate-600 font-mono-data font-bold">Terverifikasi Disnaker / Kemenperin</span>
        </h4>

        <div className="space-y-4">
          {(() => {
            let certsToDisplay = [];
            if (effectiveCategoryKey === 'peralatan-pabrik') {
              const activeCertForPeralatan = primaryCert || linkedCerts.find(c => c.isCurrent || (c.status || '').toLowerCase() === 'aktif') || linkedCerts[0] || formData;
              certsToDisplay = activeCertForPeralatan ? [activeCertForPeralatan] : [];
            } else if (isChildView && activeCertId && linkedCerts.length > 0) {
              const selectedCert = linkedCerts.find(c => c.id === activeCertId);
              certsToDisplay = selectedCert ? [selectedCert] : (targetCert ? [targetCert] : []);
            } else if (linkedCerts.length > 0) {
              certsToDisplay = [...linkedCerts];
            } else if (primaryCert || formData.noSertifikat) {
              certsToDisplay = [primaryCert || formData];
            }

            if (certsToDisplay.length === 0) {
              return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center min-h-[100px]">
                  <p className="text-slate-500 font-bold font-sans text-sm">Belum ada sertifikat terhubung.</p>
                </div>
              );
            }

            const getIssuanceCount = (c) => {
              if (!c) return 0;
              const statusL = (c.status || '').toLowerCase();
              const noS = c.noSertifikat || c.certNo || '';
              const isEmptyNoS = !noS || noS === '-' || noS === 'BELUM_ADA_SERTIFIKAT' || noS === 'EXEMPT';
              if (statusL === 'exempt' || (isEmptyNoS && !c.fileUrl && !c.terbit && !c.expired)) return 0;
              if (Array.isArray(c.history) && c.history.length > 0) {
                return 1 + c.history.length;
              }
              const allC = linkedCerts || item?.linkedCertificates || item?.certificates || [];
              const certTypesCount = certsToDisplay.length || 1;

              if (allC.length > 0) {
                const cJenis = c.jenisSertifikat || c.jenisItem || '';
                const cName = c.namaSertifikat || c.jenisSertifikat || '';

                if (cJenis) {
                  const matchingJenis = allC.filter(item => (item.jenisSertifikat || item.jenisItem) === cJenis);
                  if (matchingJenis.length > 0) return matchingJenis.length;
                }

                if (cName) {
                  const matchingName = allC.filter(item => (item.namaSertifikat || item.jenisSertifikat) === cName);
                  if (matchingName.length > 0) {
                    if (certTypesCount === 1 && allC.length > matchingName.length) {
                      return allC.length;
                    }
                    return matchingName.length;
                  }
                }

                if (certTypesCount === 1) return allC.length;
              }
              return 1;
            };

            return certsToDisplay.map((cert, index) => {
              const currentNoSert = cert?.noSertifikat || cert?.certNo || (cert === formData ? formData.noSertifikat : null) || '-';
              const currentExpired = cert?.expired || (cert === formData ? formData.berakhir : null) || '-';
              const currentTerbit = cert?.terbit || (cert === formData ? formData.terbit : null) || '-';
              const currentFileUrl = cert?.fileUrl || cert?.pdfUrl || (cert === formData ? formData.fileUrl : null);
              const currentNamaSert = cert?.namaSertifikat || cert?.jenisSertifikat || (cert === formData ? formData.namaSertifikat : null) || '-';
              const certStatusInfo = calculateCertStatus(cert || formData);
              const isSelectedCert = activeCertId === cert.id;
              const issuanceCount = getIssuanceCount(cert);

              return (
                <div key={cert?.id || index} className={`p-4 rounded-xl border transition-all ${isSelectedCert ? 'bg-blue-50/40 border-[#005ea4] ring-1 ring-[#005ea4]/20' : 'bg-white border-slate-200 shadow-2xs'}`}>
                  <div className="flex justify-end mb-3">
                    <div className={`text-xs px-3 py-1.5 rounded-full border text-center ${certStatusInfo.color}`}>
                      {certStatusInfo.text}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3 mt-2">
                    <div>
                      <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Nama Sertifikat</span>
                      <span className="font-bold text-slate-800 text-sm flex items-start gap-2">
                        <span className="break-all">{currentNamaSert}</span>
                        {effectiveCategoryKey !== 'peralatan-pabrik' && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black bg-[#005ea4] text-white border border-[#005ea4] shadow-2xs shrink-0 mt-0.5" title={`Jumlah penerbitan: ${issuanceCount}`}>
                            {issuanceCount}
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-sans block mb-0.5">No. Sertifikat</span>
                      <span className="font-bold text-slate-800 text-sm block break-all">{currentNoSert}</span>
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
                      <span className="text-[11px] text-slate-500 font-sans block mb-0.5">Keterangan</span>
                      <span className="font-bold text-slate-800 text-sm block whitespace-pre-wrap">{parseKeteranganText(cert?.keterangan || formData.keterangan || formData.exemptionNote) || '-'}</span>
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
                      !isMasterDecommissioned && (
                        <button
                          onClick={() => openUploadModal('current', cert?.id)}
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
