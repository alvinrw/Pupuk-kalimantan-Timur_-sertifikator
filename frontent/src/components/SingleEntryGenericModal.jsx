import React, { useState, useEffect } from 'react';
import { Building2, Save, X } from 'lucide-react';

export default function SingleEntryGenericModal({ isOpen, onClose, onAddSuccess, categoryName }) {
  const isAset = categoryName?.toLowerCase().includes('aset');
  const isProduk = categoryName?.toLowerCase().includes('produk');
  const isProyek = !isAset && !isProduk;

  const [formData, setFormData] = useState({
    title: '',
    tipe: '',
    code: '',
    unitLocation: '',
    penanggungJawab: '',
    status: 'Aktif',
    keterangan: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        tipe: '',
        code: '',
        unitLocation: isAset 
          ? 'Kawasan Industri Bontang' 
          : isProduk 
          ? 'Pabrik 5 Fertilizer' 
          : 'Area Pabrik NPK Cluster 2',
        penanggungJawab: isAset 
          ? 'Departemen Aset & Umum' 
          : isProduk 
          ? 'Departemen Penjaminan Mutu' 
          : 'Departemen Proyek & Lingkungan',
        status: 'Aktif',
        keterangan: ''
      });
    }
  }, [isOpen, isAset, isProduk]);

  if (!isOpen) return null;

  const labels = {
    title: `Input Data Master ${categoryName || 'Perizinan'} Baru`,
    subtitle: isAset 
      ? 'Lengkapi informasi master aset/bangunan baru' 
      : isProduk 
      ? 'Lengkapi informasi master produk baru' 
      : 'Lengkapi informasi master proyek baru',
    nameLabel: isAset ? 'Nama Aset' : isProduk ? 'Nama Produk' : 'Nama Proyek',
    namePlaceholder: isAset 
      ? 'Contoh: Gedung Kantor Pusat Bontang' 
      : isProduk 
      ? 'Contoh: Pupuk NPK 16-16-16' 
      : 'Contoh: Izin Amdal Ekspansi Pabrik',
    jenisLabel: isAset ? 'Jenis Aset' : isProduk ? 'Jenis Produk' : 'Kategori Proyek',
    jenisPlaceholder: isAset 
      ? 'Contoh: Tanah / Bangunan' 
      : isProduk 
      ? 'Contoh: Pupuk / Bahan Chemical' 
      : 'Contoh: Amdal / Pertek Lingkungan',
    codeLabel: isAset ? 'Nomor Seri Asset' : isProduk ? 'Kode Produk' : 'Kode Proyek',
    codePlaceholder: isAset 
      ? 'Contoh: AST-BPN-001' 
      : isProduk 
      ? 'Contoh: PRD-NPK-001' 
      : 'Contoh: PRJ-ENV-001',
    locationLabel: isAset ? 'Lokasi Aset' : isProduk ? 'Unit Pengelola' : 'Lokasi / Area Proyek',
    locationPlaceholder: isAset 
      ? 'Contoh: Kawasan Industri Bontang' 
      : isProduk 
      ? 'Contoh: Pabrik 5' 
      : 'Contoh: Area Pabrik NPK',
    userLabel: 'Penanggung Jawab',
    userPlaceholder: isAset 
      ? 'Contoh: Departemen Aset & Umum' 
      : isProduk 
      ? 'Contoh: Departemen Penjaminan Mutu' 
      : 'Contoh: Departemen Proyek',
    statusLabel: isAset ? 'Status Aset' : isProduk ? 'Status Produk' : 'Status Proyek',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const systemCategoryKey = isProduk ? 'perizinan-produk' : isAset ? 'perizinan-aset' : 'perizinan-proyek';
    const idPrefix = isAset ? 'AST' : isProduk ? 'PRD' : 'PRJ';

    onAddSuccess({
      ...formData,
      id: `${idPrefix}-MANUAL-${Date.now()}`,
      categoryKey: systemCategoryKey,
      title: formData.title,
      merekItem: formData.title,
      jenisPeralatan: formData.tipe || (isAset ? 'Aset & Bangunan' : isProduk ? 'Sertifikasi Produk' : 'Perizinan Proyek'),
      code: formData.code || `${idPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      unitLocation: formData.unitLocation,
      user: formData.penanggungJawab,
      status: formData.status,
      keterangan: formData.keterangan || "Data Master Input Manual",
      
      // Defaults to empty certs
      linkedCertificates: [],
      hasCertificatePdf: false,
      documentStatus: 'COMPLETED'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#005ea4]/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#005ea4]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{labels.title}</h2>
              <p className="text-xs text-slate-500 font-mono-data">{labels.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 font-mono-data text-xs">
          <form id="singleEntryGenericForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {labels.nameLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={labels.namePlaceholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {labels.jenisLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text" required
                  value={formData.tipe}
                  onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                  placeholder={labels.jenisPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">{labels.codeLabel}</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={labels.codePlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{labels.locationLabel}</label>
                <input
                  type="text"
                  value={formData.unitLocation}
                  onChange={(e) => setFormData({ ...formData, unitLocation: e.target.value })}
                  placeholder={labels.locationPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">{labels.userLabel}</label>
                <input
                  type="text"
                  value={formData.penanggungJawab}
                  onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                  placeholder={labels.userPlaceholder}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{labels.statusLabel}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold cursor-pointer"
              >
                <option value="Aktif">Aktif / Beroperasi</option>
                {isProyek ? (
                  <>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditunda">Ditunda</option>
                  </>
                ) : (
                  <>
                    <option value="Spare">Spare / Cadangan</option>
                    <option value="Rusak">Rusak / Tidak Aktif</option>
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="font-bold text-slate-700 block mb-1">Catatan / Keterangan</label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                rows={2}
                placeholder="Tambahkan catatan untuk aset ini jika ada..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4]"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="singleEntryGenericForm"
            className="px-6 py-2 font-bold text-white bg-[#005ea4] rounded-lg shadow-sm hover:bg-[#004881] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Data Master</span>
          </button>
        </div>
      </div>
    </div>
  );
}
