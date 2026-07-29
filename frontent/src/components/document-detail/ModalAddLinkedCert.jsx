import React, { useState } from 'react';
import { X, Link2, CheckSquare, Upload, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';
import { UPLOAD_ENDPOINT } from '../../config/api';
import { scanPdfDocument } from '../../services/ocrService';

export default function ModalAddLinkedCert({ isOpen, onClose, onSave }) {
  const [certData, setCertData] = useState({
    jenisSertifikat: '', noSertifikat: '', instansi: '',
    terbit: '', expired: '', status: 'Aktif', pdfName: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sertifikatMode, setSertifikatMode] = useState('dengan'); // 'dengan' | 'tanpa'
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setCertData({ jenisSertifikat: '', noSertifikat: '', instansi: '', terbit: '', expired: '', status: 'Aktif', pdfName: '' });
    setPdfFile(null);
    setSertifikatMode('dengan');
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) { 
      setPdfFile(file); 
      setCertData(prev => ({ ...prev, pdfName: file.name })); 

      if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          setIsScanningOcr(true);
          const ocrData = await scanPdfDocument(file);
          if (ocrData) {
            setCertData(prev => ({
              ...prev,
              jenisSertifikat: ocrData.jenisSertifikat || prev.jenisSertifikat || '',
              noSertifikat: ocrData.noSertifikat || '',
              terbit: ocrData.terbit || '',
              expired: ocrData.expired || '',
              instansi: ocrData.instansi || prev.instansi,
            }));
            
            if (!ocrData.noSertifikat && !ocrData.terbit && !ocrData.expired) {
              setOcrErrorMsg("AI tidak dapat mendeteksi informasi pada dokumen ini. Silakan isi data secara manual.");
            } else if (!ocrData.noSertifikat || !ocrData.terbit || !ocrData.expired) {
              setOcrErrorMsg("AI hanya berhasil mendeteksi sebagian informasi. Silakan lengkapi data yang kosong secara manual.");
            } else {
              setOcrErrorMsg("");
            }
          }
        } catch (err) {
          console.error("Gagal melakukan scan AI:", err);
          setOcrErrorMsg("Gagal melakukan pemindaian dokumen.");
        } finally {
          setIsScanningOcr(false);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        certPayload: {
          jenisSertifikat: certData.jenisSertifikat,
          noSertifikat: sertifikatMode === 'tanpa' ? 'Tanpa Sertifikat' : (certData.noSertifikat || `CERT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`),
          instansi: certData.instansi || null,
          terbit: certData.terbit || undefined,
          expired: certData.expired || undefined,
          status: certData.status || 'Aktif',
        },
        pdfFile: sertifikatMode === 'dengan' ? pdfFile : null,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
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
          
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
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
              <span>Dengan Berkas (PDF)</span>
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

          {/* Upload Section (Only visible if 'dengan') */}
          {sertifikatMode === 'dengan' && (
            <div className="pb-2 border-b border-slate-200 mb-2">
              <label className="font-bold text-slate-900 block mb-1">Lampirkan Berkas Sertifikat (PDF)</label>
              <div className="border border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50/50 p-3 rounded-xl flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#005ea4]" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">
                      {pdfFile ? certData.pdfName : 'Belum ada berkas PDF'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isScanningOcr ? 'Sedang mengekstrak data AI...' : (pdfFile ? 'Berkas siap diunggah' : 'Format didukung: PDF')}
                    </span>
                  </div>
                </div>
                <input
                  type="file" accept=".pdf" className="hidden" id="add-linked-cert-pdf-input"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="add-linked-cert-pdf-input"
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 hover:text-[#005ea4] text-slate-700 font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  {isScanningOcr ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Pilih File</span>}
                </label>
              </div>
              {ocrErrorMsg && (
                <div className="flex items-start gap-2 text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{ocrErrorMsg}</span>
                </div>
              )}
            </div>
          )}

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
            <label className="font-bold text-slate-800 block mb-1">No. SK / Sertifikat {sertifikatMode === 'dengan' && <span className="text-rose-500">*</span>}</label>
            <input
              type="text" required={sertifikatMode === 'dengan'}
              disabled={sertifikatMode === 'tanpa'}
              value={sertifikatMode === 'tanpa' ? 'Tanpa Sertifikat' : certData.noSertifikat}
              onChange={(e) => setCertData({ ...certData, noSertifikat: e.target.value })}
              placeholder="Contoh: PBG-64.74/DPMPTSP/2024"
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] font-bold text-xs ${sertifikatMode === 'tanpa' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'text-[#005ea4]'}`}
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1 text-rose-700">Tgl Expired</label>
              <input
                type="date" value={certData.expired}
                onChange={(e) => setCertData({ ...certData, expired: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] text-xs font-bold text-rose-600"
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

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 mt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer">
              Batal
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Sertifikat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
