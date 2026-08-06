import React, { useState } from 'react';
import { X, History, FileCheck, ExternalLink, Trash2, PlusCircle, AlertTriangle } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, documentItem, onUpdateCertificates }) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  const [historyList, setHistoryList] = useState([
    {
      id: "HIST-01",
      period: "Periode 2024 - 2027 (Aktif)",
      certificateNo: documentItem?.certificateNo || "CERT-P1A-2024-V3",
      issuer: documentItem?.issuer || "Disnaker Kaltim",
      issueDate: "2024-01-15",
      expiryDate: documentItem?.expiryDate || "2027-01-15",
      status: "Aktif",
      fileName: `Sertifikat_Terbaru_${documentItem?.code || "DOC"}.pdf`
    },
    {
      id: "HIST-02",
      period: "Periode 2021 - 2024 (Lama)",
      certificateNo: "CERT-P1A-2021-V2",
      issuer: "Disnaker Kaltim",
      issueDate: "2021-01-10",
      expiryDate: "2024-01-10",
      status: "Expired / Perpanjang",
      fileName: `Sertifikat_History_2021_${documentItem?.code || "DOC"}.pdf`
    },
    {
      id: "HIST-03",
      period: "Periode 2018 - 2021 (Arsip)",
      certificateNo: "CERT-P1A-2018-V1",
      issuer: "Sucofindo / Disnaker",
      issueDate: "2018-01-05",
      expiryDate: "2021-01-05",
      status: "Expired / Perpanjang",
      fileName: `Sertifikat_History_2018_${documentItem?.code || "DOC"}.pdf`
    }
  ]);

  if (!isOpen || !documentItem) return null;

  // Add new certificate version
  const handleAddNewVersion = () => {
    const fakeCertNo = prompt("Masukkan No. Sertifikat Versi Baru:", `CERT-NEW-${Math.floor(1000 + Math.random() * 9000)}`);
    if (fakeCertNo) {
      const newVersion = {
        id: `HIST-${Date.now()}`,
        period: `Periode Terbaru ${new Date().getFullYear()}`,
        certificateNo: fakeCertNo,
        issuer: "Disnaker Kaltim",
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: "2029-12-31",
        status: "Aktif",
        fileName: `Sertifikat_${fakeCertNo}.pdf`
      };
      setHistoryList(prev => [newVersion, ...prev]);
    }
  };

  // Trigger Confirmation Modal
  const requestDeleteCertificate = (idx) => {
    setPendingDeleteIndex(idx);
    setConfirmModalOpen(true);
  };

  const confirmDeleteCertificate = () => {
    setHistoryList(prev => prev.filter((_, i) => i !== pendingDeleteIndex));
    setConfirmModalOpen(false);
    setPendingDeleteIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-[#005ea4]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Riwayat & Kelola Sertifikat
              </h3>
              <p className="text-xs text-slate-600 font-mono-data">
                {documentItem.code || documentItem.tipe} - {documentItem.title || documentItem.merekItem}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header inside Modal */}
        <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-200 flex items-center justify-between">
          <span className="text-xs font-bold text-[#005ea4] font-mono-data">
            Total Berkas Sertifikat: {historyList.length} Versi
          </span>
          <button
            onClick={handleAddNewVersion}
            className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Versi Sertifikat</span>
          </button>
        </div>

        {/* Body Timeline */}
        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {historyList.map((item, idx) => (
            <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono-data text-[#005ea4]">{item.period}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono-data font-bold rounded ${
                    item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.status}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => requestDeleteCertificate(idx)}
                    className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                    title="Hapus Sertifikat Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono-data block">No Sertifikat</span>
                  <p className="font-mono-data font-bold text-slate-900">{item.certificateNo}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono-data block">Lembaga Penerbit</span>
                  <p className="font-medium text-slate-800">{item.issuer}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono-data block">Tanggal Terbit</span>
                  <p className="font-mono-data text-slate-700">{item.issueDate}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono-data block">Tanggal Kadaluarsa</span>
                  <p className="font-mono-data font-bold text-slate-900">{item.expiryDate}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-mono-data flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                  {item.fileName}
                </span>
                <button className="text-[#005ea4] font-bold text-[11px] hover:underline flex items-center gap-1">
                  <span>Pratinjau PDF Sertifikat</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {historyList.length === 0 && (
            <div className="py-8 text-center text-slate-500 font-mono-data text-xs">
              Belum ada berkas sertifikat yang tersimpan. Klik "+ Tambah Versi Sertifikat" di atas.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-300">
            Tutup
          </button>
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL BEFORE DELETION */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Konfirmasi Penghapusan</h4>
              <p className="text-xs text-slate-600 font-medium">
                Apakah Anda yakin ingin menghapus berkas sertifikat ini? Berkas yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCertificate}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Ya, Hapus Sertifikat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
