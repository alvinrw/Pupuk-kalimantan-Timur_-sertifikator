import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Loader2,
  History,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function CsvImportModal({ isOpen, onClose, onImportSuccess }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'history'
  const [step, setStep] = useState('upload'); // upload -> preview -> success
  const [file, setFile] = useState(null);

  // Upload History State with explicit success, duplicate, fail metrics
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: "CSV-HIST-01",
      fileName: "master_perizinan_multi_unit_q2_2026.csv",
      uploadDate: "2026-07-20 14:30",
      totalRows: 128,
      successCount: 124,
      duplicateCount: 3,
      failCount: 1,
      status: "Selesai"
    },
    {
      id: "CSV-HIST-02",
      fileName: "perizinan_bejana_pabrik2_3.csv",
      uploadDate: "2026-06-15 09:15",
      totalRows: 64,
      successCount: 62,
      duplicateCount: 2,
      failCount: 0,
      status: "Selesai"
    }
  ]);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (!isOpen) return null;

  const mockParsedData = [
    { code: "PERIZ-P1A-001", title: "Izin Operasional Boiler Pabrik 1A", unit: "Pabrik 1A (Amonia)", certificateNo: "CERT-P1A-2024", expiry: "2026-08-15" },
    { code: "PERIZ-P2-089", title: "Sertifikat Bejana Tekan Ammonia Receiver", unit: "Pabrik 2 (Urea)", certificateNo: "SUCO-P2-9901", expiry: "2026-09-30" },
    { code: "PERIZ-P3-112", title: "Izin Lingkungan IPLC Effluent Silo", unit: "Pabrik 3 (Urea)", certificateNo: "KLHK-IPLC-2023", expiry: "2026-07-28" },
    { code: "PERIZ-P5-442", title: "SKKNI Overhead Crane 50 Ton", unit: "Pabrik 5 (Utility)", certificateNo: "DISNAKER-PAA-881", expiry: "2027-01-10" },
  ];

  const handleFileChange = (e) => {
    const selected = (e.target.files && e.target.files[0]) || { name: "master_perizinan_multi_unit.csv" };
    setFile(selected);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    const newHist = {
      id: `CSV-HIST-${Date.now()}`,
      fileName: file?.name || "master_perizinan_multi_unit.csv",
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalRows: 4,
      successCount: 3,
      duplicateCount: 1,
      failCount: 0,
      status: "Selesai"
    };

    setUploadHistory(prev => [newHist, ...prev]);
    onImportSuccess(mockParsedData);
    setStep('upload');
    setFile(null);
    onClose();
  };

  const handleDeleteHistory = (id) => {
    setUploadHistory(prev => prev.filter(h => h.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Impor CSV Master Perizinan
              </h3>
              <p className="text-xs text-slate-500 font-mono-data">
                Unggah berkas CSV gabungan dari unit kerja pabrik 1-5
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-100/50 flex gap-6 text-xs font-bold font-mono-data">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-[#005ea4] text-[#005ea4]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Berkas</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#005ea4] text-[#005ea4]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Upload ({uploadHistory.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'upload' && (
            <>
              {step === 'upload' && (
                <div
                  onClick={() => handleFileChange({})}
                  className="border-2 border-dashed border-slate-300 hover:border-[#005ea4] rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 relative cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-10 h-10 text-[#005ea4] mb-2" />
                  <p className="text-sm font-bold text-slate-800 mb-1">
                    Klik atau Tarik Berkas CSV ke Sini
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Format mendukung CSV / Excel gabungan multi-unit
                  </p>
                  <span className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs">
                    Pilih Berkas CSV
                  </span>
                </div>
              )}

              {step === 'preview' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono-data bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">
                      Terdeteksi {mockParsedData.length} baris data perizinan
                    </span>
                    <span className="text-slate-500">{file?.name}</span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[260px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase font-mono-data text-[10px] sticky top-0">
                        <tr>
                          <th className="p-2.5">KODE/TIPE</th>
                          <th className="p-2.5">NAMA ITEM</th>
                          <th className="p-2.5">UNIT PABRIK</th>
                          <th className="p-2.5">NO SERTIFIKAT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {mockParsedData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold font-mono-data text-[#005ea4]">{row.code}</td>
                            <td className="p-2.5 font-medium text-slate-800">{row.title}</td>
                            <td className="p-2.5 font-mono-data text-slate-600">{row.unit}</td>
                            <td className="p-2.5 font-mono-data text-slate-700">{row.certificateNo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* HISTORY TAB WITH EXPLICIT BERHASIL, DUPLIKAT & GAGAL METRICS */}
          {activeTab === 'history' && (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {uploadHistory.map((item) => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 font-mono-data block">{item.fileName}</span>
                    <span className="text-[11px] text-slate-600 font-mono-data">
                      {item.uploadDate} — Total {item.totalRows} baris (<span className="text-emerald-700 font-bold">{item.successCount} Berhasil</span>, <span className="text-amber-700 font-bold">{item.duplicateCount} Duplikat</span>, <span className="text-rose-700 font-bold">{item.failCount} Gagal</span>)
                    </span>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg">
            Batal
          </button>
          {activeTab === 'upload' && step === 'preview' && (
            <button onClick={handleConfirmImport} className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs">
              Simpan ke Database
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Hapus Riwayat Upload</h4>
            <p className="text-xs text-slate-500">Apakah Anda yakin ingin menghapus riwayat upload ini?</p>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                Batal
              </button>
              <button onClick={() => handleDeleteHistory(confirmDeleteId)} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
