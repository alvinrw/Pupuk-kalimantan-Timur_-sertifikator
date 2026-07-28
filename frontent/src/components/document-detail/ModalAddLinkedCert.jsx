/**
 * ModalAddLinkedCert — Modal tambah sertifikat terhubung baru.
 * Dipisah dari DocumentDetailPage (sebelumnya ~200 baris inline).
 */
import React, { useState } from 'react';
import { X, Link2, CheckSquare, Upload } from 'lucide-react';
import { UPLOAD_ENDPOINT } from '../../config/api';

export default function ModalAddLinkedCert({ isOpen, onClose, onSave }) {
  const [certData, setCertData] = useState({
    jenisSertifikat: '', noSertifikat: '', instansi: '',
    terbit: '', expired: '', status: 'Aktif', pdfName: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setCertData({ jenisSertifikat: '', noSertifikat: '', instansi: '', terbit: '', expired: '', status: 'Aktif', pdfName: '' });
    setPdfFile(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        certPayload: {
          jenisSertifikat: certData.jenisSertifikat,
          noSertifikat: certData.noSertifikat,
          instansi: certData.instansi || null,
          terbit: certData.terbit || undefined,
          expired: certData.expired || undefined,
          status: certData.status || 'Aktif',
        },
        pdfFile,
      });
      handleClose();
    } catch (err) {
      // Error handled by parent hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#005ea4] flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Tambah Sertifikat Terhubung</h4>
              <p className="text-[11px] text-blue-300 font-mono-data">Hubungkan jenis perizinan / sertifikat baru ke item ini</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-mono-data">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Jenis / Nama Sertifikat <span className="text-rose-500">*</span></label>
            <input
              type="text" required
              value={certData.jenisSertifikat}
              onChange={(e) => setCertData({ ...certData, jenisSertifikat: e.target.value })}
              placeholder="Contoh: PBG, SLF, HGB, Amdal, SNI, Halal BPJPH"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">No. SK / Sertifikat <span className="text-rose-500">*</span></label>
            <input
              type="text" required
              value={certData.noSertifikat}
              onChange={(e) => setCertData({ ...certData, noSertifikat: e.target.value })}
              placeholder="Contoh: PBG-64.74/DPMPTSP/2024"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs text-[#005ea4]"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Instansi Penerbit</label>
            <input
              type="text"
              value={certData.instansi}
              onChange={(e) => setCertData({ ...certData, instansi: e.target.value })}
              placeholder="Contoh: DPMPTSP Kota Bontang, BPN, KLHK RI"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Tgl Terbit</label>
              <input
                type="date" value={certData.terbit}
                onChange={(e) => setCertData({ ...certData, terbit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired</label>
              <input
                type="date" value={certData.expired}
                onChange={(e) => setCertData({ ...certData, expired: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Status</label>
            <select
              value={certData.status}
              onChange={(e) => setCertData({ ...certData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs cursor-pointer"
            >
              <option value="Aktif">Aktif</option>
              <option value="Perpanjang">Perpanjang</option>
              <option value="Expired">Expired</option>
              <option value="Afkir">Afkir</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Unggah Berkas PDF Sertifikat</label>
            <div className="border border-dashed border-slate-300 hover:border-[#005ea4] rounded-lg p-3 text-center bg-slate-50 transition-colors">
              <input
                type="file" accept=".pdf" className="hidden" id="add-linked-cert-pdf-input"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { setPdfFile(file); setCertData(prev => ({ ...prev, pdfName: file.name })); }
                }}
              />
              <label
                htmlFor="add-linked-cert-pdf-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer text-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#005ea4]" />
                <span>Pilih Berkas PDF</span>
              </label>
              {certData.pdfName
                ? <span className="block text-emerald-700 font-bold text-[11px] mt-1.5">✓ Terpilih: {certData.pdfName}</span>
                : <span className="block text-slate-400 text-[10px] mt-1">Format: PDF (Opsional)</span>
              }
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer">
              Batal
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Sertifikat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
