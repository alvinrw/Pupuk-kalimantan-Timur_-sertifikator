/**
 * ModalUploadCert — Modal unggah / koreksi berkas PDF manual.
 * Dipisah dari DocumentDetailPage (sebelumnya ~160 baris inline).
 */
import React, { useRef, useState } from 'react';
import { X, UploadCloud, Save, Upload, Loader2 } from 'lucide-react';
import { scanPdfDocument } from '../../services/ocrService';

export default function ModalUploadCert({
  isOpen,
  onClose,
  uploadData,
  setUploadData,
  selectedUploadFile,
  setSelectedUploadFile,
  manualFileInputRef,
  onSubmit,
  isSingleCertScope,
}) {
  const [isScanningOcr, setIsScanningOcr] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#005ea4] flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {uploadData.target === 'current' ? 'Koreksi Sertifikat Aktif' : 'Unggah / Tambah Arsip Berkas PDF'}
              </h4>
              <p className="text-[11px] text-blue-300 font-mono-data">
                {uploadData.target === 'current'
                  ? 'Buat versi baru — versi lama otomatis masuk histori'
                  : 'Tambahkan riwayat berkas ke daftar histori sertifikat'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs font-mono-data">
          {isSingleCertScope && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
              <strong>Mode:</strong> {uploadData.target === 'current' ? 'Koreksi (buat versi baru, versi lama → Direvisi)' : 'Arsip (tambah ke histori)'}
            </div>
          )}

          <div>
            <label className="font-bold text-slate-800 block mb-1">Berkas PDF Sertifikat</label>
            <div
              onClick={() => manualFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#005ea4] rounded-xl p-4 text-center bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
            >
              <input
                ref={manualFileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedUploadFile(file);
                    setUploadData(prev => ({ ...prev, fileName: file.name }));

                    if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
                      try {
                        setIsScanningOcr(true);
                        const ocrData = await scanPdfDocument(file);
                        if (ocrData) {
                          setUploadData(prev => ({
                            ...prev,
                            noSertifikat: ocrData.noSertifikat || '',
                            terbit: ocrData.terbit || '',
                            expired: ocrData.expired || '',
                            instansi: ocrData.instansi || prev.instansi,
                          }));
                        }
                      } catch (err) {
                        console.error("Gagal scan AI:", err);
                      } finally {
                        setIsScanningOcr(false);
                      }
                    }
                  }
                }}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="text-xs font-bold text-[#005ea4] block">
                {selectedUploadFile ? `✓ Terpilih: ${selectedUploadFile.name}` : 'Klik untuk Memilih File PDF'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Format: PDF, PNG, JPG (Opsional)</span>
            </div>
            {isScanningOcr && (
              <div className="flex items-center gap-2 text-xs font-bold text-[#005ea4] bg-blue-50 p-2.5 rounded-lg border border-blue-200 animate-pulse mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI sedang memindai & mengunduh metadata dokumen...</span>
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              No. Sertifikat / SK Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={uploadData.noSertifikat}
              onChange={(e) => setUploadData({ ...uploadData, noSertifikat: e.target.value })}
              placeholder="Contoh: SKP-2024/DISNAKER/1234"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Instansi Penerbit / Penguji</label>
            <input
              type="text"
              value={uploadData.instansi}
              onChange={(e) => setUploadData({ ...uploadData, instansi: e.target.value })}
              placeholder="Contoh: Disnaker Kaltim, Sucofindo, BKI"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Tgl Terbit</label>
              <input
                type="date"
                value={uploadData.terbit}
                onChange={(e) => setUploadData({ ...uploadData, terbit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired</label>
              <input
                type="date"
                value={uploadData.expired}
                onChange={(e) => setUploadData({ ...uploadData, expired: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan &amp; Unggah</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
