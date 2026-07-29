import React, { useState } from 'react';
import { X, PlusCircle, Save, Upload, FileCheck, Loader2, Sparkles } from 'lucide-react';
import { scanPdfDocument } from '../services/ocrService';

export default function SingleEntryModal({ isOpen, onClose, onAddSuccess }) {
  const [formData, setFormData] = useState({
    jenisPeralatan: '',
    merekItem: '',
    tipe: '',
    nomorSeri: '',
    kapasitas: '',
    lokasi: 'Pabrik 1A (Amonia)',
    user: 'Dept. Operasi Pabrik 1A',
    status: 'Aktif',
    noSertifikat: '',
    terbit: '',
    expired: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [sertifikatMode, setSertifikatMode] = useState('dengan'); // 'dengan' | 'tanpa'
  const [isScanningOcr, setIsScanningOcr] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          setIsScanningOcr(true);
          const ocrData = await scanPdfDocument(file);
          if (ocrData) {
            setFormData(prev => ({
              ...prev,
              noSertifikat: ocrData.noSertifikat || '',
              terbit: ocrData.terbit || '',
              expired: ocrData.expired || '',
              merekItem: ocrData.namaPeralatan || prev.merekItem,
            }));
          }
        } catch (err) {
          console.error("Gagal melakukan scan AI:", err);
        } finally {
          setIsScanningOcr(false);
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSuccess({
      ...formData,
      file: sertifikatMode === 'dengan' ? selectedFile : null,
      id: `EQ-MANUAL-${Date.now()}`,
      noSertifikat: sertifikatMode === 'tanpa' ? "Tanpa Sertifikat" : (formData.noSertifikat || (selectedFile ? `CERT-AUTO-${Math.floor(1000 + Math.random() * 9000)}` : "BELUM_ADA_SERTIFIKAT")),
      tanggalInspeksi: formData.terbit || new Date().toISOString().split('T')[0],
      terbit: formData.terbit || new Date().toISOString().split('T')[0],
      berakhir: formData.expired || '',
      hasCertificatePdf: sertifikatMode === 'dengan' && !!selectedFile,
      documentStatus: sertifikatMode === 'tanpa' ? 'EXEMPT' : 'COMPLETED',
      keterangan: sertifikatMode === 'tanpa' ? "Tidak Perlu Sertifikat" : (selectedFile ? `Sertifikat Attached (${selectedFile.name})` : "Data Manual Input")
    });
    setFormData({
      jenisPeralatan: '',
      merekItem: '',
      tipe: '',
      nomorSeri: '',
      kapasitas: '',
      lokasi: 'Pabrik 1A (Amonia)',
      user: 'Dept. Operasi Pabrik 1A',
      status: 'Aktif',
      noSertifikat: '',
      terbit: '',
      expired: ''
    });
    setSelectedFile(null);
    setSertifikatMode('dengan');
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
                Input 1 Data Perizinan Peralatan Baru
              </h3>
              <p className="text-xs text-slate-500 font-mono-data">
                No. Sertifikat & Tanggal Berlaku otomatis dibaca dari berkas PDF
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* OPTION SELECTOR: DENGAN / TANPA SERTIFIKAT */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setSertifikatMode('dengan')}
              className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                sertifikatMode === 'dengan'
                  ? 'bg-white text-[#005ea4] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-4 h-4" />
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
              <X className="w-4 h-4 text-amber-600" />
              <span>Tanpa Sertifikat (Exempt)</span>
            </button>
          </div>

          {/* FILE UPLOAD & CERTIFICATE DATA FIELD - Tampil jika mode 'dengan' */}
          {sertifikatMode === 'dengan' && (
            <div className="space-y-4 pb-2 border-b border-slate-200 mb-4">
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Unggah Berkas Sertifikat (PDF)
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

              {isScanningOcr && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#005ea4] bg-blue-50 p-2.5 rounded-lg border border-blue-200 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI sedang memindai & mengunduh metadata dokumen...</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-900 block mb-1">Nomor Sertifikat</label>
                <input
                  type="text"
                  value={formData.noSertifikat}
                  onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                  placeholder="Isi manual atau biarkan AI membaca otomatis"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ALWAYS VISIBLE DATE FIELDS */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Tanggal Terbit / Berlaku</label>
              <input
                type="date"
                value={formData.terbit}
                onChange={(e) => setFormData({ ...formData, terbit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-900 block mb-1">Tanggal Berakhir</label>
              <input
                type="date"
                value={formData.expired}
                onChange={(e) => setFormData({ ...formData, expired: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Jenis Peralatan Pabrik</label>
              <input
                type="text"
                value={formData.jenisPeralatan}
                onChange={(e) => setFormData({ ...formData, jenisPeralatan: e.target.value })}
                placeholder="misal: Bejana Tekan / Boiler"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Merek / Nama Item</label>
              <input
                type="text"
                value={formData.merekItem}
                onChange={(e) => setFormData({ ...formData, merekItem: e.target.value })}
                placeholder="misal: High Pressure Waste Heat Exchanger"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Tipe / Model</label>
              <input
                type="text"
                value={formData.tipe}
                onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                placeholder="misal: E-108-P1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Nomor Seri</label>
              <input
                type="text"
                value={formData.nomorSeri}
                onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })}
                placeholder="misal: SN-EX-99182"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Kapasitas</label>
              <input
                type="text"
                value={formData.kapasitas}
                onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })}
                placeholder="misal: 100 Bar / 50 Ton"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Lokasi & User</label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="misal: Pabrik 1A (Area Reformer)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="font-bold text-slate-900 block mb-1">Status Operational</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-[#005ea4]"
              >
                <option value="Aktif">Aktif</option>
                <option value="Spare">Spare</option>
                <option value="Rusak">Rusak</option>
              </select>
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
