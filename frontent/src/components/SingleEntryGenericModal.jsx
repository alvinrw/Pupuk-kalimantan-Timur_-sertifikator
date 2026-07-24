import React, { useState } from 'react';
import { X, PlusCircle, Upload } from 'lucide-react';

export default function SingleEntryGenericModal({ isOpen, onClose, onAddSuccess, categoryName }) {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    unit: 'Pabrik 1A (Amonia)',
    issuer: 'Kementerian LHK RI / Disnaker',
    certificateNo: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-12-31',
    status: 'Aktif'
  });

  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSuccess({
      ...formData,
      id: `PERIZ-MANUAL-${Date.now()}`,
      code: formData.code || `PERIZ-${Math.floor(100 + Math.random() * 900)}`,
      certificateNo: formData.certificateNo || (selectedFile ? `CERT-AUTO-${Math.floor(1000 + Math.random() * 9000)}` : "PERIZ-BELUM-ADA-SK"),
      hasCertificatePdf: !!selectedFile,
      merekItem: formData.title,
      jenisPeralatan: categoryName || "Perizinan Generic",
      unitPabrik: formData.unit,
      berakhir: formData.expiryDate,
      keterangan: selectedFile ? `Sertifikat Attached (${selectedFile.name})` : "Input Manual Baru"
    });

    setFormData({
      title: '',
      code: '',
      unit: 'Pabrik 1A (Amonia)',
      issuer: 'Kementerian LHK RI / Disnaker',
      certificateNo: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '2028-12-31',
      status: 'Aktif'
    });
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#005ea4] text-white">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Input 1 Data {categoryName || 'Perizinan'} Baru
              </h3>
              <p className="text-xs text-slate-500 font-mono-data">
                Lengkapi formulir perizinan & lampirkan berkas sertifikat PDF
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-mono-data">
          <div>
            <label className="font-bold text-slate-900 block mb-1">Nama Dokumen / Item Perizinan <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={`Contoh: Izin Operasional ${categoryName || 'Aset'} Unit 1`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Kode / Tag Perizinan</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Contoh: PERIZ-ENV-991"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Unit Pabrik / Lokasi</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs font-bold text-slate-800"
              >
                <option value="Pabrik 1A (Amonia)">Pabrik 1A (Amonia)</option>
                <option value="Pabrik 2 (Urea)">Pabrik 2 (Urea)</option>
                <option value="Pabrik 3 (Urea)">Pabrik 3 (Urea)</option>
                <option value="Pabrik 4 (Amuria)">Pabrik 4 (Amuria)</option>
                <option value="Pabrik 5 (Utility)">Pabrik 5 (Utility)</option>
                <option value="Dermaga & Pelabuhan">Dermaga & Pelabuhan</option>
                <option value="Kantor Pusat">Kantor Pusat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Instansi Penerbit / User</label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="Contoh: Disnaker / Kemenperin"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">No. Sertifikat / SK</label>
              <input
                type="text"
                value={formData.certificateNo}
                onChange={(e) => setFormData({ ...formData, certificateNo: e.target.value })}
                placeholder="Contoh: SK-PERIZ-2024-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs font-bold text-[#005ea4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Tanggal Terbit</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Tanggal Expired</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] text-xs font-bold text-rose-700"
              />
            </div>
          </div>

          {/* Lampiran PDF Single */}
          <div>
            <label className="font-bold text-slate-900 block mb-1">Lampirkan Berkas Sertifikat (PDF)</label>
            <div className="border border-dashed border-slate-300 bg-slate-50 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#005ea4]" />
                <span className="text-slate-700 truncate max-w-[280px]">
                  {selectedFile ? selectedFile.name : "Belum ada file dipilih"}
                </span>
              </div>
              <label className="px-3 py-1 bg-[#005ea4] text-white text-xs font-bold rounded cursor-pointer hover:bg-[#004881]">
                Pilih PDF
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
