import React, { useState } from 'react';
import {
  X,
  Edit3,
  RotateCcw,
  Ban,
  Save,
  FileText,
  Clock,
  CheckCircle2,
  Building2,
  ShieldCheck,
  FileCheck,
  ExternalLink,
  History,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function DocumentDetailModal({ item, onClose, onSaveUpdate, onQuickRenew, onQuickDecommission }) {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);

  // Form State for Editing
  const [formData, setFormData] = useState({
    merekItem: item.merekItem || item.title || '',
    jenisPeralatan: item.jenisPeralatan || item.kategoriDokumen || '',
    tipe: item.tipe || item.code || '',
    nomorSeri: item.nomorSeri || item.nomorSeriTipe || '',
    kapasitas: item.kapasitas || '',
    lokasi: item.lokasi || item.unitPabrik || item.unit || '',
    user: item.user || '',
    status: item.status || 'Aktif',
    noSertifikat: item.noSertifikat || item.certificateNo || '',
    tanggalInspeksi: item.tanggalInspeksi || item.issueDate || '',
    terbit: item.terbit || item.issueDate || '',
    berakhir: item.berakhir || item.expiryDate || '',
    keterangan: item.keterangan || item.notes || item.agency || ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (onSaveUpdate) {
      onSaveUpdate({
        ...item,
        ...formData
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005ea4] flex items-center justify-center font-bold text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Detail Dokumen & Perizinan</h3>
                <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded font-mono-data text-[10px] font-bold">
                  ID: {item.id}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono-data truncate max-w-md">
                {formData.merekItem} — ({formData.lokasi})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header Bar inside Detail Modal */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 font-mono-data">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Aksi Cepat:</span>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>Edit Data</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                Batal Edit
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (onQuickRenew) onQuickRenew(item.id); onClose(); }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
              <span>Perpanjang Sertifikat</span>
            </button>

            <button
              onClick={() => { if (onQuickDecommission) onQuickDecommission(item.id); onClose(); }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Ban className="w-3.5 h-3.5 text-slate-300" />
              <span>Afkir / Decommission</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs font-sans-clean">
          {isEditing ? (
            /* EDIT FORM MODE */
            <form onSubmit={handleSave} className="space-y-4 font-mono-data">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Mode Edit Data Dokumen — Perbarui informasi spesifikasi dan perizinan di bawah ini:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Merek / Nama Item</label>
                  <input
                    type="text"
                    value={formData.merekItem}
                    onChange={(e) => setFormData({ ...formData, merekItem: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Jenis Peralatan / Kategori</label>
                  <input
                    type="text"
                    value={formData.jenisPeralatan}
                    onChange={(e) => setFormData({ ...formData, jenisPeralatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tipe / Kode</label>
                  <input
                    type="text"
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Nomor Seri / Tag</label>
                  <input
                    type="text"
                    value={formData.nomorSeri}
                    onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Kapasitas SWL / Tekanan</label>
                  <input
                    type="text"
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Lokasi / Unit Pabrik</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">User / Dept Penanggung Jawab</label>
                  <input
                    type="text"
                    value={formData.user}
                    onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {(item.categoryKey === 'perizinan-proyek' || (item.categoryKey || '').toLowerCase().includes('proyek') || (item.jenisPeralatan || '').toLowerCase().includes('proyek') || (item.kategoriDokumen || '').toLowerCase().includes('proyek'))
                      ? 'Status Proyek'
                      : 'Status Fisik Operasional'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs cursor-pointer"
                  >
                    {(item.categoryKey === 'perizinan-proyek' || (item.categoryKey || '').toLowerCase().includes('proyek') || (item.jenisPeralatan || '').toLowerCase().includes('proyek') || (item.kategoriDokumen || '').toLowerCase().includes('proyek')) ? (
                      <>
                        <option value="Aktif">Aktif</option>
                        <option value="Spare">Selesai</option>
                        <option value="Rusak">Ditunda</option>
                      </>
                    ) : (
                      <>
                        <option value="Aktif">Aktif (Normal)</option>
                        <option value="Spare">Spare (Cadangan)</option>
                        <option value="Repair">Repair (Overhaul)</option>
                        <option value="Rusak">Rusak (Out of Service)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">No. Sertifikat SK Active</label>
                  <input
                    type="text"
                    value={formData.noSertifikat}
                    onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tanggal Expired (Kadaluarsa)</label>
                  <input
                    type="date"
                    value={formData.berakhir}
                    onChange={(e) => setFormData({ ...formData, berakhir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Keterangan & Catatan Pengujian</label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Data</span>
                </button>
              </div>
            </form>
          ) : (
            /* READ-ONLY FULL DETAIL DISPLAY */
            <div className="space-y-6">
              {/* SECTION 1: MAIN SPECIFICATION GRID */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#005ea4]" />
                  <span>Spesifikasi Utama & Identitas Aset</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono-data text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">Merek / Nama Item</span>
                    <span className="font-bold text-slate-900 text-sm">{formData.merekItem}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">Jenis Peralatan</span>
                    <span className="font-bold text-[#005ea4]">{formData.jenisPeralatan}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">Unit Pabrik / Lokasi</span>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                      {formData.lokasi}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">Tipe / Kode</span>
                    <span className="font-bold text-slate-800">{formData.tipe}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">Nomor Seri / Tag</span>
                    <span className="font-bold text-slate-800">{formData.nomorSeri}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">Kapasitas SWL / Beban</span>
                    <span className="font-bold text-slate-800">{formData.kapasitas || '-'}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">User / Dept Penanggung Jawab</span>
                    <span className="font-bold text-slate-800">{formData.user || 'Dept. Operasi'}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">
                      {(item.categoryKey === 'perizinan-proyek' || (item.categoryKey || '').toLowerCase().includes('proyek') || (item.jenisPeralatan || '').toLowerCase().includes('proyek') || (item.kategoriDokumen || '').toLowerCase().includes('proyek')) ? 'Status Proyek' : 'Status Operasional Fisik'}
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                      {(item.categoryKey === 'perizinan-proyek' || (item.categoryKey || '').toLowerCase().includes('proyek') || (item.jenisPeralatan || '').toLowerCase().includes('proyek') || (item.kategoriDokumen || '').toLowerCase().includes('proyek'))
                        ? (formData.status === 'Spare' ? 'Selesai' : formData.status === 'Rusak' ? 'Ditunda' : formData.status)
                        : (formData.status === 'Spare' ? 'Spare (Cadangan)' : formData.status === 'Rusak' ? 'Rusak (Out of Service)' : formData.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PERMIT & CERTIFICATE LEGAL STATUS */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-4 font-mono-data">
                <h4 className="font-bold text-sm text-slate-900 border-b border-blue-200 pb-2 flex items-center gap-2 font-sans">
                  <FileCheck className="w-4 h-4 text-[#005ea4]" />
                  <span>Status Legalitas Sertifikat Perizinan Active</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">No. Sertifikat Aktif</span>
                    <span className="font-bold text-[#005ea4] text-sm">{formData.noSertifikat}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">Tanggal Masa Berlaku (Expired)</span>
                    <span className="font-bold text-rose-700 text-sm">{formData.berakhir}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-sans block">Instansi / Penguji</span>
                    <span className="font-bold text-slate-800 font-sans">{formData.keterangan || 'Disnaker Kaltim / Sucofindo'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-blue-200/60">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#005ea4]" />
                    <span className="font-bold text-slate-800">Dokumen Digital SK (PDF Terlampir)</span>
                  </div>
                  <button
                    onClick={() => alert(`Membuka PDF Sertifikat: ${formData.noSertifikat}.pdf`)}
                    className="px-3 py-1 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Buka File PDF</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* SECTION 3: REKAM JEJAK / RIWAYAT PERPANJANGAN */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#005ea4]" />
                  <span>Riwayat & Rekam Jejak Audit Sertifikat</span>
                </h4>

                <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 font-mono-data text-xs">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-200" />
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Resertifikasi Terbaru ({formData.terbit || '2026'})</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">Terbit Sah</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <div>No. SK: <span className="font-bold text-slate-800">{formData.noSertifikat}</span></div>
                        <div>Masa Berlaku: s.d <span className="font-bold text-rose-700">{formData.berakhir}</span></div>
                        <div className="text-slate-500 italic mt-0.5">"{formData.keterangan}"</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white bg-slate-400" />
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Penerbitan Periode Sebelumnya</span>
                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200">Expired</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <div>Sertifikat awal kelayakan operasi unit pabrik.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 font-mono-data">
          <span className="text-slate-500 text-xs">Aplikasi Sertifikator • PT Pupuk Kaltim</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
