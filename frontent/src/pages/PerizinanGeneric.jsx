import React, { useState } from 'react';
import { Search, FileSpreadsheet, History, Eye } from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import HistoryModal from '../components/HistoryModal';
import DocumentDetailPage from './DocumentDetailPage';
import { masterCertificatesData } from '../data/masterDataset';

export default function PerizinanGeneric({ title, subtitle, categoryName }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);

  // Dynamic Filtering from connected Master Dataset
  const [documents, setDocuments] = useState(masterCertificatesData);

  const filteredDocs = documents.filter(doc => {
    // Filter by Category if categoryKey or categoryName matches
    if (categoryName) {
      const catLower = categoryName.toLowerCase();
      const isMatchCategory =
        (doc.kategoriDokumen || '').toLowerCase().includes(catLower) ||
        (doc.categoryKey || '').toLowerCase().includes(catLower) ||
        (doc.jenisItem || doc.jenisPeralatan || doc.jenisCiptaan || '').toLowerCase().includes(catLower);
      
      if (!isMatchCategory && !doc.id?.startsWith('DOC-CSV')) return false;
    }

    const titleStr = doc.title || doc.merekItem || doc.judulCiptaan || '';
    const codeStr = doc.code || doc.id || doc.noSertifikat || '';
    const unitStr = doc.unit || doc.unitPabrik || doc.lokasi || '';
    const certStr = doc.certificateNo || doc.noSertifikat || '';

    return (
      titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      codeStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unitStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certStr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCsvImported = (newItems) => {
    const formatted = newItems.map((item, idx) => ({
      id: `DOC-CSV-${Date.now()}-${idx}`,
      code: item.code,
      title: item.title,
      unit: item.unit,
      issuer: "Imp. CSV Multi-Unit",
      issueDate: "2024-01-01",
      expiryDate: item.expiry,
      certificateNo: item.certificateNo,
      status: "Aktif",
      merekItem: item.title,
      jenisPeralatan: categoryName,
      unitPabrik: item.unit,
      berakhir: item.expiry,
      noSertifikat: item.certificateNo
    }));
    setDocuments(prev => [...formatted, ...prev]);
  };

  const handleZipMatched = () => {
    alert("Berhasil menghubungkan file PDF ZIP ke baris tabel!");
  };

  if (detailModalItem) {
    return (
      <DocumentDetailPage
        item={detailModalItem}
        onBack={() => setDetailModalItem(null)}
        onSaveUpdate={(updatedDoc) => {
          setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? { ...d, ...updatedDoc, title: updatedDoc.merekItem || d.title } : d));
        }}
        onQuickRenew={(id) => {
          alert(`Inisiasi Perpanjangan untuk dokumen ${id}. Menuju menu Monitoring.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Menandai dokumen ${id} sebagai Afkir.`);
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Header & Workflow Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-600 font-mono-data">
            {subtitle}
          </p>
        </div>

        {/* Workflow Triggers */}
        <div className="flex flex-wrap items-center gap-2 font-mono-data">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Impor CSV Master</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Cari dokumen ${categoryName}...`}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider">
              <th className="py-3 px-4 font-bold">KODE PERIZINAN</th>
              <th className="py-3 px-4 font-bold">NAMA DOKUMEN</th>
              <th className="py-3 px-4 font-bold">UNIT PABRIK</th>
              <th className="py-3 px-4 font-bold">NO. SERTIFIKAT</th>
              <th className="py-3 px-4 font-bold">MASA BERLAKU</th>
              <th className="py-3 px-4 font-bold text-center">STATUS</th>
              <th className="py-3 px-4 font-bold text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs font-mono-data">
            {filteredDocs.map((doc) => {
              const statusStr = (doc.status || '').toLowerCase();
              const isAfkir = statusStr === 'afkir' || statusStr === 'decommissioned';
              const isExpired = statusStr === 'expired';
              const isPerpanjang = statusStr === 'perpanjang' || statusStr === 'perpanjangan' || statusStr === 'in progress' || statusStr === 'proses';

              const rowClass = isAfkir
                ? 'bg-[#0f172a] text-white hover:bg-slate-900 border-b border-slate-700'
                : isExpired
                ? 'bg-rose-50/90 text-rose-950 hover:bg-rose-100 border-b border-rose-200'
                : isPerpanjang
                ? 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border-b border-amber-200'
                : 'hover:bg-slate-50 border-b border-slate-200 text-slate-800';

              return (
                <tr key={doc.id} className={`transition-colors font-mono-data text-xs ${rowClass}`}>
                  <td className={`py-3 px-4 font-bold ${isAfkir ? 'text-slate-200' : 'text-[#005ea4]'}`}>
                    {doc.code || doc.id || doc.noSertifikat}
                  </td>
                  {/* Clickable Document Name */}
                  <td
                    onClick={() => setDetailModalItem(doc)}
                    className={`py-3 px-4 font-bold cursor-pointer hover:underline font-sans ${
                      isAfkir ? 'text-white' : 'text-slate-900 hover:text-[#005ea4]'
                    }`}
                    title="Klik untuk Lihat Detail"
                  >
                    {doc.title || doc.merekItem || doc.judulCiptaan}
                  </td>
                  <td className="py-3 px-4">
                    {doc.unit || doc.unitPabrik || doc.lokasi}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {doc.certificateNo || doc.noSertifikat}
                  </td>
                  <td className={`py-3 px-4 font-bold ${isAfkir ? 'text-slate-300' : 'text-rose-700'}`}>
                    {doc.expiryDate || doc.berakhir}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                      isAfkir
                        ? 'bg-slate-800 text-white border-slate-600'
                        : isExpired
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : isPerpanjang
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  {/* LIHAT DETAIL BUTTON */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setDetailModalItem(doc)}
                      className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleCsvImported}
      />

      <HistoryModal
        isOpen={!!historyTargetItem}
        onClose={() => setHistoryTargetItem(null)}
        documentItem={historyTargetItem}
      />
    </div>
  );
}
