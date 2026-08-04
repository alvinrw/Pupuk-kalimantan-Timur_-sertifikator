import React from 'react';
import { X, FileText, Download } from 'lucide-react';

export default function ViewDocumentModal({ isOpen, onClose, documentData }) {
  if (!isOpen || !documentData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans-clean">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-[#005ea4]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Pratinjau Dokumen Sertifikat
              </h3>
              <p className="text-xs text-slate-500 font-mono-data">
                Nomer: {documentData.certificateNo}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Detail */}
          <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto shrink-0">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Informasi Aset</h4>
            
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-slate-500 mb-1">Nomer Sertifikat</p>
                <p className="font-bold text-slate-900 font-mono-data">{documentData.certificateNo}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Lokasi</p>
                <p className="font-bold text-slate-900">{documentData.location}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Peruntukan</p>
                <p className="font-bold text-slate-900">{documentData.purpose}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-500 mb-1">Luas (mÃƒâ€šÃ‚Â²)</p>
                  <p className="font-bold text-slate-900 font-mono-data">{documentData.areaSqm}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Luas (Ha)</p>
                  <p className="font-bold text-slate-900 font-mono-data">{documentData.areaHa}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Kondisi</p>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold text-[10px] uppercase tracking-wider">
                  {documentData.condition}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-slate-500 mb-1">Masa Berlaku</p>
                <p className="font-bold text-rose-600 font-mono-data">{documentData.validityPeriod}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Keterangan</p>
                <p className="text-slate-700 leading-relaxed">{documentData.description || '-'}</p>
              </div>
            </div>
          </div>

          {/* PDF Preview Mock */}
          <div className="flex-1 bg-slate-200 p-6 flex flex-col items-center justify-center overflow-hidden relative">
            {/* Toolbar Fake PDF */}
            <div className="absolute top-4 right-4 z-10">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-xs rounded-lg text-xs font-bold text-slate-700 hover:text-[#005ea4] hover:bg-blue-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
              </button>
            </div>
            
            {/* The Document */}
            <div className="w-full max-w-lg aspect-[1/1.4] bg-white shadow-md rounded border border-slate-300 flex flex-col p-8 opacity-90 overflow-y-auto mx-auto my-auto">
              <div className="border-b-2 border-slate-800 pb-4 mb-6 text-center">
                <h1 className="text-xl font-bold font-serif text-slate-900">SERTIFIKAT TANAH / BANGUNAN</h1>
                <p className="text-xs text-slate-500 mt-1">Republik Indonesia</p>
              </div>
              <div className="flex-1 text-sm font-serif space-y-4 text-slate-800">
                <p>Nomer Sertifikat: <strong>{documentData.certificateNo}</strong></p>
                <p>Menerangkan bahwa hak guna atas lahan dan bangunan yang terletak di:</p>
                <p className="p-3 bg-slate-50 border border-slate-200 italic rounded">
                  {documentData.location}<br />
                  Diperuntukkan sebagai: {documentData.purpose}
                </p>
                <p>Dengan rincian luas sebesar <strong>{documentData.areaSqm} mÃƒâ€šÃ‚Â²</strong> (atau setara dengan {documentData.areaHa} Hektar).</p>
                <p>Berlaku hingga: <span className="font-bold underline">{documentData.validityPeriod}</span></p>
              </div>
              <div className="pt-8 flex justify-between items-end text-xs font-serif text-slate-600">
                <div className="text-center">
                  <p className="mb-8">Mengetahui,</p>
                  <p className="border-t border-slate-400 pt-1">Pejabat Berwenang</p>
                </div>
                <div className="text-center">
                  <p className="mb-8">Dikeluarkan pada: <br/>{documentData.submissionDate}</p>
                  <div className="w-16 h-16 border-2 border-rose-600 rounded-full flex items-center justify-center text-rose-600 opacity-50 transform -rotate-12 mx-auto">
                    <span className="font-bold text-[10px]">LEGAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
