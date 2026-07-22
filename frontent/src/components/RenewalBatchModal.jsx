import React, { useState } from 'react';
import { X, FolderPlus, Clock, CheckCircle2, Send, ShieldAlert } from 'lucide-react';

export default function RenewalBatchModal({ isOpen, onClose, selectedItems, onConfirmBatch }) {
  const [batchName, setBatchName] = useState(`Paket Resertifikasi Batch - Q3 ${new Date().getFullYear()}`);
  const [assignedAgency, setAssignedAgency] = useState('Disnaker Kaltim');

  if (!isOpen || !selectedItems || selectedItems.length === 0) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmBatch({
      batchId: `BATCH-${Math.floor(100 + Math.random() * 900)}`,
      name: batchName,
      agency: assignedAgency,
      itemsCount: selectedItems.length,
      items: selectedItems,
      status: "Pengajuan Dibuat (Draft)",
      createdDate: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Kelompokkan Dokumen untuk Pengajuan Resertifikasi
              </h3>
              <p className="text-xs text-slate-600 font-mono-data">
                {selectedItems.length} Dokumen Perizinan Terpilih
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-900 block mb-1">Nama Paket Batch Resertifikasi</label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1">Lembaga Inspeksi / Instansi Tujuan</label>
            <select
              value={assignedAgency}
              onChange={(e) => setAssignedAgency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#005ea4] focus:outline-none"
            >
              <option value="Disnaker Kaltim">Disnaker Kalimantan Timur</option>
              <option value="Sucofindo">Sucofindo</option>
              <option value="RINA Indonesia">RINA Indonesia</option>
              <option value="KLHK RI">Kementerian LHK RI</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1.5">Daftar Dokumen yang Dikelompokkan ({selectedItems.length})</label>
            <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-100 bg-slate-50 p-2">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="py-1.5 px-2 flex justify-between items-center">
                  <span className="font-bold font-mono-data text-[#005ea4]">{item.code || item.tagNumber}</span>
                  <span className="text-slate-800 font-medium truncate max-w-[240px]">{item.title || item.name}</span>
                  <span className="text-rose-700 font-mono-data font-bold">{item.expiryDate || item.expiry}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-[#005ea4] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#004881] flex items-center gap-1.5">
              <Send className="w-4 h-4" />
              <span>Kirim ke Monitoring Progress</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
