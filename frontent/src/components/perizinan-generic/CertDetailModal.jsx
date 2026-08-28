import React, { useState, useEffect, useRef } from 'react';
import {
  X, Edit3, Eye, FileText, Download, ExternalLink,
  Save, Trash2, Calendar, ShieldCheck, AlertTriangle,
  Building2, Hash, CheckCircle2, Upload, Loader2, RefreshCw,
  Settings, History, Plus, Clock, FileCheck
} from 'lucide-react';
import { getFullFileUrl, API_BASE, UPLOAD_ENDPOINT } from '../../config/api';

export default function CertDetailModal({
  isOpen,
  onClose,
  cert,
  masterItem,
  onSaveCert,
  onDeleteCert
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const fileInputRef = useRef(null);

  const formatToIsoDate = (str) => {
    if (!str || str === '-') return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [dd, mm, yyyy] = str.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (_) { }
    return str;
  };

  const [formData, setFormData] = useState({
    jenisSertifikat: '',
    namaSertifikat: '',
    noSertifikat: '',
    instansi: '',
    terbit: '',
    expired: '',
    status: 'Aktif',
    fileUrl: ''
  });

  useEffect(() => {
    if (cert) {
      const jenis = cert.jenisSertifikat || cert.jenis || cert.namaSertifikat || 'Sertifikat';
      const nama = cert.namaSertifikat || cert.certName || cert.nama || cert.jenisSertifikat || '';
      const no = cert.noSertifikat || cert.certNo || cert.noIzin || '';
      const instansi = cert.instansi || cert.issuer || 'Disnaker / Kemenperin';
      const terbit = cert.terbit || cert.issueDate || '';
      const expired = cert.expired || cert.expiryDate || '';
      const status = cert.status || 'Aktif';
      const fileUrl = cert.fileUrl || '';

      setFormData({
        jenisSertifikat: jenis,
        namaSertifikat: nama,
        noSertifikat: no,
        instansi: instansi,
        terbit: formatToIsoDate(terbit),
        expired: formatToIsoDate(expired),
        status: status,
        fileUrl: fileUrl
      });
      setIsEditing(false);
      setConfirmDelete(false);
      setPdfFile(null);
    }
  }, [cert, isOpen]);

  if (!isOpen) return null;

  const activeCert = cert || {};
  const fullUrl = getFullFileUrl(formData.fileUrl);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: fd });
      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json.url || json.data?.url || json.filePath;
        if (uploadedUrl) {
          setFormData(prev => ({ ...prev, fileUrl: uploadedUrl }));
        }
      }
    } catch (err) {
      console.error('Gagal unggah file PDF:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSaveCert || !cert) return;
    try {
      setIsSubmitting(true);
      await onSaveCert(cert.id || cert.certId, formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Gagal menyimpan sertifikat:', err);
      alert('Gagal menyimpan perubahan sertifikat!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteCert || !cert) return;
    try {
      setIsDeleting(true);
      await onDeleteCert(cert.id || cert.certId);
      onClose();
    } catch (err) {
      console.error('Gagal menghapus sertifikat:', err);
      alert('Gagal menghapus sertifikat!');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (statusStr) => {
    const s = (statusStr || '').toLowerCase();
    if (s === 'aktif' || s === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Aktif
        </span>
      );
    }
    if (s === 'expired' || s === 'kadaluarsa') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          Expired
        </span>
      );
    }
    if (s === 'perpanjang' || s === 'perpanjangan' || s === 'proses') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Proses Perpanjangan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
        {statusStr}
      </span>
    );
  };

  const masterNama = masterItem?.docNamaItem || masterItem?.title || masterItem?.namaItem || 'Master Item';
  const masterCode = masterItem?.docCode || masterItem?.code || '-';
  const masterUnit = masterItem?.docUnit || masterItem?.unitLocation || masterItem?.unit || 'Workshop - Bay 1';
  const masterJenis = masterItem?.docJenis || masterItem?.jenisPeralatan || masterItem?.jenisItem || 'Peralatan';
  const masterUser = masterItem?.docUser || masterItem?.user || 'Departemen Maintenance';

  const historyList = activeCert.history && activeCert.history.length > 0
    ? [activeCert, ...activeCert.history]
    : [activeCert];

  const masterStatusLower = (masterItem?.status || masterItem?.docStatus || '').toLowerCase();
  const isMasterAfkir = masterStatusLower === 'afkir' || masterStatusLower === 'decommissioned' || masterStatusLower === 'dicabut' || masterStatusLower === 'non-aktif';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">

        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#005ea4]/40 text-blue-300 rounded-xl border border-blue-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Detail Sertifikat: {formData.namaSertifikat || formData.jenisSertifikat || 'Sertifikat'}
                </h3>
                {getStatusBadge(formData.status)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono-data">
                Master Terhubung: <strong className="text-slate-200">{masterNama}</strong> ({masterCode})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && !isMasterAfkir ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#005ea4] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Sertifikat
              </button>
            ) : (!isEditing && isMasterAfkir) ? null : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Mode Lihat
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/70 space-y-6">

          {isEditing ? (
            /* EDIT MODE FORM */
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Edit Metadata Sertifikat
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis / Nama Sertifikat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jenisSertifikat"
                    value={formData.jenisSertifikat}
                    onChange={handleInputChange}
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                    placeholder="misal: Sertifikat Crane / SHM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Sertifikat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="noSertifikat"
                    value={formData.noSertifikat}
                    onChange={handleInputChange}
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-mono"
                    placeholder="misal: CERT-8039/DISNAKER-KT/2024"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instansi Penerbit
                  </label>
                  <input
                    type="text"
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                    placeholder="misal: Disnaker Kaltim / Kemenperin"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Sertifikat
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Perpanjang">Perpanjang / Dalam Proses</option>
                    <option value="Expired">Expired / Kadaluarsa</option>
                    <option value="Decommissioned">Decommissioned / Non-aktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    name="terbit"
                    value={formData.terbit}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Masa Berlaku / Expired
                  </label>
                  <input
                    type="date"
                    name="expired"
                    value={formData.expired}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan / Keterangan Tambahan
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan || ''}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none min-h-[60px] resize-none"
                    placeholder="misal: Sertifikat sedang dalam proses pengurusan di kementerian..."
                  />
                </div>
              </div>

              {/* Upload PDF Section */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Berkas PDF Sertifikat (Revisi)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#005ea4]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#005ea4]" />
                    )}
                    {isUploading ? 'Mengunggah...' : 'Pilih Berkas PDF Baru'}
                  </button>

                  <span className="text-xs text-slate-500 truncate max-w-xs font-mono">
                    {pdfFile ? pdfFile.name : formData.fileUrl ? formData.fileUrl.split('/').pop() : 'Belum ada file terpilih'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Sertifikat Ini
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600">Yakin hapus?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
                    >
                      {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="px-4 py-2 rounded-lg bg-[#005ea4] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* VIEW MODE - 4 DASHBOARD CARDS EXACTLY LIKE SCREENSHOT */
            <>
              {/* SECTION 1: Spesifikasi Utama & Identitas Aset Peralatan */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#005ea4]" />
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                    Spesifikasi Utama & Identitas Sertifikat / Master Item
                  </h4>
                </div>

                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Merek / Nama Item</span>
                    <strong className="text-slate-900 text-sm">{masterNama}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Jenis Peralatan</span>
                    <strong className="text-[#005ea4]">{masterJenis}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Nama Sertifikat</span>
                    <strong className="text-slate-900">{formData.namaSertifikat || formData.jenisSertifikat || '-'}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Tipe / Kode</span>
                    <strong className="text-slate-900">{masterJenis}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Nomor Seri / Tag</span>
                    <span className="font-mono text-[#005ea4] font-bold">{masterCode}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Unit Pabrik / Lokasi</span>
                    <span className="inline-block bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                      {masterUnit}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">User / Dept PJ (Penanggung Jawab)</span>
                    <span className="font-semibold text-slate-800">{masterUser}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Status Fisik Operasional</span>
                    <div>{getStatusBadge(formData.status)}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">No. Sertifikat Active</span>
                    <span className="font-mono font-bold text-[#005ea4]">{formData.noSertifikat || '-'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Tanggal Terbit</span>
                    <span className="font-semibold text-slate-700">{formData.terbit || '-'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Tanggal Expired</span>
                    <span className="font-bold text-rose-600">{formData.expired || '-'}</span>
                  </div>

                  <div className="col-span-2 md:col-span-4 mt-2">
                    <span className="text-slate-400 block mb-0.5 font-medium">Catatan / Keterangan Tambahan</span>
                    <strong className="text-slate-900 whitespace-pre-wrap">{formData.keterangan || cert.keterangan || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Pengaturan Notifikasi & Deadline */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Settings className="w-4 h-4 text-[#005ea4]" />
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                    Pengaturan Notifikasi & Deadline
                  </h4>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      <span className="text-xs font-bold text-slate-800">
                        Status Pengingat: <strong className="text-emerald-700">{reminderEnabled ? 'Aktif' : 'Non-Aktif'}</strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Reminder <strong className="text-slate-700">akan mulai aktif</strong> pada H-30 sebelum tanggal kedaluwarsa ({formData.expired || 'kadaluarsa'}). Setelah melewati waktu tersebut, reminder akan <strong className="text-emerald-700">aktif</strong> dan tetap ditampilkan hingga diperpanjang.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-2xs cursor-pointer transition-colors shrink-0"
                  >
                    {reminderEnabled ? 'Non-aktifkan Pengingat' : 'Ubah Pengaturan'}
                  </button>
                </div>
              </div>

              {/* SECTION 4: Histori & Riwayat Dokumen Sertifikat Fisik / Digital (Moved to Top) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <History className="w-4 h-4 text-[#005ea4]" />
                      Histori & Riwayat Dokumen Sertifikat Fisik / Digital
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Daftar seluruh berkas SK, hasil inspeksi, dan koreksi upload manual
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 bg-[#005ea4] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Unggah / Koreksi Berkas PDF Manual</span>
                  </button>
                </div>

                {/* Table of History */}
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse font-mono-data text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3">PERIODE SK</th>
                        <th className="py-2.5 px-4 text-left">NO. SERTIFIKAT / SK</th>
                        <th className="py-2.5 px-4">TGL TERBIT</th>
                        <th className="py-2.5 px-4">TGL EXPIRED</th>
                        <th className="py-2.5 px-4">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyList.map((hItem, hIdx) => {
                        const hFileUrl = getFullFileUrl(hItem.fileUrl);
                        const hStatusStr = (hItem.status || 'Aktif').toLowerCase();
                        const isExpiredH = hStatusStr === 'expired';

                        return (
                          <tr key={hItem.id || hIdx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-600">
                              {hItem.terbit ? hItem.terbit.substring(0, 5) : '08/1'} – {hItem.expired ? hItem.expired.substring(0, 5) : '07/1'}
                            </td>
                            <td className="py-3 px-4 text-left font-bold text-[#005ea4]">
                              {hItem.noSertifikat || formData.noSertifikat || '-'}
                            </td>
                            <td className="py-3 px-4 text-slate-600">{hItem.terbit || formData.terbit || '-'}</td>
                            <td className={`py-3 px-4 font-bold ${isExpiredH ? 'text-rose-600' : 'text-rose-700'}`}>
                              {hItem.expired || formData.expired || '-'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                {hFileUrl ? (
                                  <a
                                    href={hFileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#005ea4] text-[11px] font-bold rounded-md border border-blue-200 inline-flex items-center gap-1 transition-colors"
                                  >
                                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Lihat PDF</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-[11px] italic bg-slate-100 px-2 py-0.5 rounded">Belum Ada</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setIsEditing(true)}
                                  className="p-1 text-slate-600 hover:text-[#005ea4] hover:bg-slate-100 rounded cursor-pointer"
                                  title="Edit Entry ini"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Garis Waktu Audit & Kronologi Resertifikasi */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h5 className="font-bold text-xs text-slate-700 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#005ea4]" />
                    Garis Waktu
                  </h5>

                  <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    <div className="relative bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                      <div>
                        <strong className="text-slate-800 font-mono-data">
                          No. SK: {formData.noSertifikat || 'CERT-8039/DISNAKER-KT/2024'}
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Penerbit/Penguji: <span className="font-medium text-slate-700">{formData.instansi || 'Disnaker / Kemenperin'}</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Masa Berlaku: <span className="font-bold text-slate-700">{formData.terbit || '-'} s.d <strong className="text-rose-600">{formData.expired || '-'}</strong></span>
                        </p>
                      </div>
                      <div>{getStatusBadge(formData.status)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Status Legalitas Sertifikat Active */}
              <div className="bg-blue-50/50 rounded-xl border border-blue-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3 bg-blue-100/70 border-b border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#005ea4]" />
                    <h4 className="font-bold text-xs text-[#005ea4] uppercase tracking-wide">
                      Status Legalitas Sertifikat Active
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Terverifikasi {formData.instansi || 'Disnaker / Kemenperin'}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium">Nama Sertifikat</span>
                      <strong className="text-slate-900">{formData.namaSertifikat || formData.jenisSertifikat || '-'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium">No. Sertifikat Active</span>
                      <strong className="text-[#005ea4] font-mono">{formData.noSertifikat || '-'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium">Tanggal Terbit</span>
                      <span className="font-semibold text-slate-700">{formData.terbit || '-'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5 font-medium">Tanggal Expired (Kadaluarsa)</span>
                      <span className="font-bold text-rose-600">{formData.expired || '-'}</span>
                    </div>
                  </div>

                  {/* Dokumen Digital SK Viewer / Upload */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-8 h-8 ${fullUrl ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">
                          Dokumen Digital SK ({fullUrl ? 'Berkas PDF Tersedia' : 'Belum Ada File'})
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {fullUrl ? formData.fileUrl.split('/').pop() : 'Silakan unggah dokumen PDF SK resmi'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {fullUrl ? (
                        <>
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 rounded-lg bg-[#005ea4] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Buka PDF
                          </a>
                          <a
                            href={fullUrl}
                            download
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 border border-slate-300 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh
                          </a>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Unggah File PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>


            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono-data">
          <span>ID Sertifikat: {activeCert.id || 'N/A'}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
