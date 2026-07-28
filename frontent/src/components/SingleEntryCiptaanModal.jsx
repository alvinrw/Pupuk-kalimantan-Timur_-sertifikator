import React, { useState } from 'react';
import { X, PlusCircle, Save, Upload, ShieldAlert } from 'lucide-react';

export default function SingleEntryCiptaanModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    judulCiptaan: '',
    jenisCiptaan: 'Program Komputer (Software)',
    tanggalCiptaan: new Date().toISOString().split('T')[0],
    masaBerlaku: '5 Tahun'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [sertifikatMode, setSertifikatMode] = useState('dengan'); // 'dengan' | 'tanpa'

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const calculateExpiry = (tanggal, masa) => {
    if (masa === 'Seumur Hidup') {
      return 'Seumur Hidup + 70 Tahun';
    }
    const years = parseInt(masa);
    if (isNaN(years)) return '2031-12-31';
    const dateObj = new Date(tanggal);
    dateObj.setFullYear(dateObj.getFullYear() + years);
    return dateObj.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const calculatedExpiry = calculateExpiry(formData.tanggalCiptaan, formData.masaBerlaku);

    onAddSuccess({
      ...formData,
      file: sertifikatMode === 'dengan' ? selectedFile : null,
      id: `CIPTAAN-MANUAL-${Date.now()}`,
      expiryDate: calculatedExpiry,
      hasCertificatePdf: sertifikatMode === 'dengan' && !!selectedFile,
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      noSertifikat: sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (selectedFile ? `CIPTAAN-CERT-${Math.floor(1000 + Math.random() * 9000)}` : "BELUM_ADA_SERTIFIKAT")
    });

    setFormData({
      judulCiptaan: '',
      jenisCiptaan: 'Program Komputer (Software)',
      tanggalCiptaan: new Date().toISOString().split('T')[0],
      masaBerlaku: '5 Tahun'
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
                Input 1 Data Hak Cipta Baru
              </h3>
              <p className="text-xs text-slate-500 font-mono-data">
                Masa berlaku & tanggal berakhir otomatis disesuaikan
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Toggles Dengan/Tanpa Sertifikat */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setSertifikatMode('dengan')}
              className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                sertifikatMode === 'dengan'
                  ? 'bg-[#005ea4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Dengan Sertifikat (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => setSertifikatMode('tanpa')}
              className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                sertifikatMode === 'tanpa'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Tanpa Sertifikat (Exempt)</span>
            </button>
          </div>

          {sertifikatMode === 'dengan' && (
            <div className="pt-2 pb-4 border-b border-slate-200 mb-4">
              <label className="font-bold text-slate-900 block mb-1">
                Unggah Berkas Sertifikat Pencatatan (PDF)
              </label>
              <div className="border border-dashed border-slate-300 hover:border-[#005ea4] bg-slate-50 p-3.5 rounded-lg flex items-center justify-between relative cursor-pointer">
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
          )}

          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Judul Ciptaan</label>
              <input
                type="text"
                value={formData.judulCiptaan}
                onChange={(e) => setFormData({ ...formData, judulCiptaan: e.target.value })}
                placeholder="misal: Aplikasi E-Licensing Peralatan Pabrik PT Pupuk Kaltim"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Jenis Ciptaan</label>
              <select
                value={formData.jenisCiptaan}
                onChange={(e) => setFormData({ ...formData, jenisCiptaan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              >
                <option value="Program Komputer (Software)">Program Komputer (Software)</option>
                <option value="Buku / Karya Tulis">Buku / Karya Tulis</option>
                <option value="Desain Layout / Tata Letak">Desain Layout / Tata Letak</option>
                <option value="Karya Seni Rupa">Karya Seni Rupa</option>
                <option value="Modul Pelatihan & Metode Kerja">Modul Pelatihan & Metode Kerja</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Tanggal Ciptaan</label>
                <input
                  type="date"
                  value={formData.tanggalCiptaan}
                  onChange={(e) => setFormData({ ...formData, tanggalCiptaan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Masa Berlaku</label>
                <select
                  value={formData.masaBerlaku}
                  onChange={(e) => setFormData({ ...formData, masaBerlaku: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                >
                  <option value="5 Tahun">5 Tahun</option>
                  <option value="10 Tahun">10 Tahun</option>
                  <option value="20 Tahun">20 Tahun</option>
                  <option value="Seumur Hidup">Seumur Hidup</option>
                </select>
              </div>
            </div>
          </div>

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
