import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Loader2,
  History,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { uploadCsv, getCsvHistory, deleteCsvHistory } from '../services/csvService';

export default function CsvImportModal({ isOpen, onClose, onImportSuccess, importType = 'master_items', categoryKey = '', moduleName = '' }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'history'
  const [step, setStep] = useState('upload'); // upload -> preview -> success
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Compute readable Module Title based on categoryKey
  const getCategoryLabel = (key) => {
    if (moduleName) return moduleName;
    switch (key) {
      case 'peralatan-pabrik': return 'Peralatan Pabrik';
      case 'perizinan-aset': return 'Perizinan Aset & Bangunan';
      case 'perizinan-proyek': return 'Perizinan Proyek & Lingkungan';
      case 'sertifikat-ciptaan': return 'Sertifikat Hak Cipta & Paten';
      case 'administrasi-lainnya': return 'Administrasi & Perizinan Lainnya';
      default: return 'Master Perizinan & Dokumen';
    }
  };

  const currentCategoryTitle = getCategoryLabel(categoryKey);

  // Upload History State (Strictly real history from API/localStorage)
  const [uploadHistory, setUploadHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`csv_upload_history_${categoryKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => !item.id?.startsWith('CSV-HIST-0'));
        }
      }
      return [];
    } catch {
      return [];
    }
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [viewFailedRows, setViewFailedRows] = useState(null);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const logs = await getCsvHistory(categoryKey);
        if (logs === null) {
          // Do nothing if API failed
          return;
        }
        
        if (logs && logs.length > 0) {
          const mappedLogs = logs.map(log => {
            let detail = {};
            try { detail = JSON.parse(log.detail); } catch {}
            return {
              id: log.id,
              fileName: detail.fileName || 'file_impor.csv',
              targetCategory: getCategoryLabel(detail.categoryKey || categoryKey),
              uploadDate: new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 19),
              totalRows: detail.totalRows ?? detail.importedCount ?? 1,
              successCount: detail.successCount ?? detail.importedCount ?? 1,
              duplicateCount: detail.duplicateCount ?? 0,
              failCount: detail.failCount ?? 0,
              failedRows: detail.failedRows || [],
              status: log.status === 'SUCCESS' ? 'Selesai' : 'Gagal'
            };
          });
          setUploadHistory(mappedLogs);
        } else {
          setUploadHistory([]);
        }
      } catch (err) {
        console.error("Error fetching CSV history:", err);
      }
    };

    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, categoryKey]);

  React.useEffect(() => {
    try {
      localStorage.setItem(`csv_upload_history_${categoryKey}`, JSON.stringify(uploadHistory));
    } catch (e) {
      console.error("Failed to save upload history:", e);
    }
  }, [uploadHistory, categoryKey]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setFiles(prev => [...prev, ...selected]);
      setStep('preview');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== indexToRemove);
      if (updated.length === 0) setStep('upload');
      return updated;
    });
  };

  const handleConfirmImport = async () => {
    if (files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      const newHistories = [];
      let anySuccess = false;
      
      for (const f of files) {
        try {
          const res = await uploadCsv(f, importType, categoryKey);
          newHistories.push({
            id: `CSV-REAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName: f.name,
            targetCategory: currentCategoryTitle,
            uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            totalRows: res.totalRows ?? res.importedCount ?? 1,
            successCount: res.successCount ?? res.importedCount ?? 1,
            duplicateCount: res.duplicateCount ?? 0,
            failCount: res.failCount ?? 0,
            failedRows: res.failedRows || [],
            status: "Selesai"
          });
          anySuccess = true;
        } catch (err) {
          console.error(`Gagal upload ${f.name}`, err);
          newHistories.push({
            id: `CSV-REAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName: f.name,
            targetCategory: currentCategoryTitle,
            uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            totalRows: 0,
            successCount: 0,
            duplicateCount: 0,
            failCount: 1,
            failedRows: [{ title: f.name, reason: err.message || 'Server error' }],
            status: "Gagal"
          });
        }
      }
      
      await new Promise(r => setTimeout(r, 800));

      setUploadHistory(prev => [...newHistories.reverse(), ...prev]);
      setStep('upload');
      setFiles([]);
      if (anySuccess && onImportSuccess) {
        await onImportSuccess();
      }
      onClose();
    } catch (error) {
      console.error("CSV Batch Upload failed", error);
      alert("Terjadi kesalahan sistem saat mengimpor.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteCsvHistory(id);
    } catch (e) {
      console.error("Failed to delete history log from backend:", e);
    }
    setUploadHistory(prev => prev.filter(h => h.id !== id));
    setConfirmDeleteId(null);
    if (onImportSuccess) {
      onImportSuccess();
    }
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
                Impor CSV - <span className="text-[#005ea4]">{currentCategoryTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono-data">
                Unggah berkas CSV khusus untuk modul perizinan {currentCategoryTitle}
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
              <input type="file" ref={fileInputRef} accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" multiple className="hidden" onChange={handleFileChange} />
              
              {step === 'upload' && (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#005ea4] rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 relative cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-10 h-10 text-[#005ea4] mb-2" />
                    <p className="text-sm font-bold text-slate-800 mb-1">
                      Klik atau Tarik Berkas CSV / Excel ke Sini
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      Format mendukung CSV / Excel gabungan multi-unit
                    </p>
                    <span className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs">
                      Pilih Berkas CSV / Excel
                    </span>
                  </div>
                </>
              )}

              {step === 'preview' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-xs font-mono-data block">
                      Berkas Terpilih ({files.length})
                    </span>
                    <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-mono-data bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[#005ea4] font-bold truncate">{f.name}</span>
                          <button onClick={() => handleRemoveFile(i)} className="text-slate-400 hover:text-rose-600 transition-colors ml-2 flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {!isUploading && (
                      <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-full mt-2 py-2 border border-dashed border-[#005ea4] text-[#005ea4] rounded-lg text-xs font-bold hover:bg-[#005ea4]/5 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Tambah Berkas Lainnya
                      </button>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4] mb-3" />
                        <p className="font-bold text-slate-800 text-sm">Sedang Mengimpor Data...</p>
                        <p className="text-xs text-slate-500 mt-1">Harap tunggu, jangan tutup jendela ini.</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-3">
                           <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-800 text-sm">File Siap Diimpor</p>
                        <p className="text-xs text-slate-500 mt-1">Klik tombol 'Simpan ke Database' untuk memulai impor.</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* HISTORY TAB WITH EXPLICIT BERHASIL, DUPLIKAT & GAGAL METRICS */}
          {activeTab === 'history' && (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {uploadHistory.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                  <History className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">Belum Ada Riwayat Upload</p>
                  <p className="text-xs text-slate-500 font-mono-data mt-0.5">Unggah berkas CSV baru untuk mencatat riwayat impor asli</p>
                </div>
              ) : (
                uploadHistory.map((item) => (
                  <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono-data">{item.fileName}</span>
                        {item.targetCategory && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-[#005ea4] border border-blue-200 font-mono-data">
                            {item.targetCategory}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-600 font-mono-data block mt-1">
                        {item.uploadDate}  -  Total {item.totalRows} baris (<span className="text-emerald-700 font-bold">{item.successCount} Berhasil</span>, <span className="text-amber-700 font-bold">{item.duplicateCount} Duplikat (Diperbarui)</span>, <span className="text-rose-700 font-bold">{item.failCount} Gagal</span>)
                      </span>
                      {item.failCount > 0 && item.failedRows?.length > 0 && (
                        <button 
                          onClick={() => setViewFailedRows(item.failedRows)} 
                          className="mt-1 text-[10px] text-rose-600 hover:text-rose-800 font-bold underline bg-rose-50 px-2 py-0.5 rounded-full inline-block"
                        >
                          Lihat Detail Gagal
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button 
            onClick={onClose} 
            disabled={isUploading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          {activeTab === 'upload' && step === 'preview' && (
            <button 
              onClick={handleConfirmImport} 
              disabled={isUploading}
              className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all ${
                isUploading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-[#005ea4] hover:bg-[#004881]'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan ke Database</span>
              )}
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

      {/* View Failed Rows Modal */}
      {viewFailedRows && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Rincian Baris Gagal ({viewFailedRows.length})
              </h4>
              <button onClick={() => setViewFailedRows(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto bg-slate-50">
              <div className="space-y-2">
                {viewFailedRows.map((fr, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg text-xs">
                    <div className="font-bold text-slate-800 font-mono-data mb-1 flex justify-between">
                      <span>{fr.title}</span>
                      <span className="text-slate-500 font-normal">Baris: {fr.rowNumber || '-'}</span>
                    </div>
                    <div className="text-rose-600 font-mono-data">
                      {fr.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-white flex justify-end">
              <button onClick={() => setViewFailedRows(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
