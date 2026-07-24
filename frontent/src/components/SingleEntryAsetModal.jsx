import React, { useState } from 'react';
import { X, PlusCircle, Save, Upload } from 'lucide-react';

export default function SingleEntryAsetModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    certificateNo: '',
    location: '',
    areaSqm: '',
    areaHa: '',
    purpose: '',
    submissionDate: new Date().toISOString().split('T')[0],
    validityPeriod: '5 Tahun',
    condition: 'Baik',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const calculateExpiry = (tanggal, masa) => {
    if (masa === 'Selamanya') return 'Selamanya';
    const years = parseInt(masa);
    if (isNaN(years)) return '2030-12-31';
    const dateObj = new Date(tanggal);
    dateObj.setFullYear(dateObj.getFullYear() + years);
    return dateObj.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const calculatedExpiry = calculateExpiry(formData.submissionDate, formData.validityPeriod);

    onAddSuccess({
      ...formData,
      id: `ASET-MANUAL-${Date.now()}`,
      validityPeriod: calculatedExpiry,
      hasCertificatePdf: !!selectedFile,
      fileName: selectedFile ? selectedFile.name : null
    });

    setFormData({
      certificateNo: '',
      location: '',
      areaSqm: '',
      areaHa: '',
      purpose: '',
      submissionDate: new Date().toISOString().split('T')[0],
      validityPeriod: '5 Tahun',
      condition: 'Baik',
      description: ''
    });
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#005ea4] text-white">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Input 1 Data Perizinan Aset Baru
              </h3>
              <p className="text-xs text-slate-500 font-mono-data">
                Lengkapi formulir detail aset dan unggah dokumen sertifikat
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Nomer Sertifikat</label>
              <input
                type="text"
                value={formData.certificateNo}
                onChange={(e) => setFormData({ ...formData, certificateNo: e.target.value })}
                placeholder="misal: HGB-12345-2020"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Lokasi</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="misal: Kawasan Industri Kaltim Zone 1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Luas (m²)</label>
              <input
                type="number"
                value={formData.areaSqm}
                onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                placeholder="100000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-mono-data"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Luas (Ha)</label>
              <input
                type="number"
                step="0.01"
                value={formData.areaHa}
                onChange={(e) => setFormData({ ...formData, areaHa: e.target.value })}
                placeholder="10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-mono-data"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Peruntukan</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="misal: Area Pabrik Amonia"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Kondisi</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              >
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Dalam Pemeliharaan">Dalam Pemeliharaan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Tanggal Awal Pengajuan</label>
              <input
                type="date"
                value={formData.submissionDate}
                onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Masa Berlaku Produk</label>
              <select
                value={formData.validityPeriod}
                onChange={(e) => setFormData({ ...formData, validityPeriod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              >
                <option value="5 Tahun">5 Tahun</option>
                <option value="10 Tahun">10 Tahun</option>
                <option value="20 Tahun">20 Tahun</option>
                <option value="30 Tahun">30 Tahun</option>
                <option value="Selamanya">Selamanya</option>
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="font-bold text-slate-900 block mb-1">Keterangan</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tambahkan keterangan opsional..."
                rows="2"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          {/* FILE UPLOAD FIELD (PDF ONLY) */}
          <div className="pt-2">
            <label className="font-bold text-slate-900 block mb-1">
              Unggah Berkas Sertifikat (PDF)
            </label>
            <div className="border border-dashed border-slate-300 hover:border-[#005ea4] bg-slate-50 p-3.5 rounded-lg flex items-center justify-between relative cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-[#005ea4]" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    {selectedFile ? selectedFile.name : "Pilih File Sertifikat PDF"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-data">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Hanya mendukung format .pdf"}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#005ea4] text-white text-[11px] font-bold rounded">
                {selectedFile ? "Ganti File" : "Pilih PDF"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#005ea4] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#004881] flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
