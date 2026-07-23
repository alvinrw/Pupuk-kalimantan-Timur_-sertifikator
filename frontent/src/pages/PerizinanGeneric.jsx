import React, { useState } from 'react';
import { Search, FileSpreadsheet, FileArchive, History, Eye } from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import ZipOcrModal from '../components/ZipOcrModal';
import HistoryModal from '../components/HistoryModal';
import DocumentDetailPage from './DocumentDetailPage';

export default function PerizinanGeneric({ title, subtitle, categoryName }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);

  const [documents, setDocuments] = useState([
    {
      id: "DOC-2026-01",
      code: "PERIZ-ENV-991",
      title: `Izin Operasional ${categoryName} - Unit 1`,
      unit: "Pabrik 1A (Amonia)",
      issuer: "Kementerian LHK RI / Dinas Lingkungan",
      issueDate: "2023-01-15",
      expiryDate: "2026-08-15",
      certificateNo: "CERT-ENV-991-2023",
      status: "Akan Expired",
      merekItem: `Izin Operasional ${categoryName} - Unit 1`,
      jenisPeralatan: categoryName,
      unitPabrik: "Pabrik 1A (Amonia)",
      nomorSeri: "PERIZ-ENV-991",
      berakhir: "2026-08-15",
      noSertifikat: "CERT-ENV-991-2023",
      keterangan: "Kementerian LHK RI"
    },
    {
      id: "DOC-2026-02",
      code: "PERIZ-K3-441",
      title: `Sertifikat Kepatuhan Standar ${categoryName} Zone B`,
      unit: "Pabrik 2 (Urea)",
      issuer: "Disnaker Kaltim",
      issueDate: "2022-06-10",
      expiryDate: "2026-09-30",
      certificateNo: "DISNAKER-K3-441-2022",
      status: "Akan Expired",
      merekItem: `Sertifikat Kepatuhan Standar ${categoryName} Zone B`,
      jenisPeralatan: categoryName,
      unitPabrik: "Pabrik 2 (Urea)",
      nomorSeri: "PERIZ-K3-441",
      berakhir: "2026-09-30",
      noSertifikat: "DISNAKER-K3-441-2022",
      keterangan: "Disnaker Kaltim"
    },
    {
      id: "DOC-2026-03",
      code: "PERIZ-ADM-112",
      title: `Dokumen Kelayakan Administrasi & Verifikasi Regulasi`,
      unit: "Pabrik 5 (Utility)",
      issuer: "Kemenperin RI",
      issueDate: "2024-03-01",
      expiryDate: "2029-03-01",
      certificateNo: "KEMENPERIN-ADM-112",
      status: "Aktif",
      merekItem: `Dokumen Kelayakan Administrasi & Verifikasi Regulasi`,
      jenisPeralatan: categoryName,
      unitPabrik: "Pabrik 5 (Utility)",
      nomorSeri: "PERIZ-ADM-112",
      berakhir: "2029-03-01",
      noSertifikat: "KEMENPERIN-ADM-112",
      keterangan: "Kemenperin RI"
    },
  ]);

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          <button
            onClick={() => setIsZipModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileArchive className="w-4 h-4" />
            <span>Bulk Upload ZIP PDF (AI)</span>
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
              return (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#005ea4]">
                    {doc.code}
                  </td>
                  {/* Clickable Document Name */}
                  <td
                    onClick={() => setDetailModalItem(doc)}
                    className="py-3 px-4 font-bold text-slate-900 hover:text-[#005ea4] cursor-pointer hover:underline font-sans"
                    title="Klik untuk Lihat Detail"
                  >
                    {doc.title}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {doc.unit}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {doc.certificateNo}
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-700">
                    {doc.expiryDate}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                      doc.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
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

      <ZipOcrModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        onMatchSuccess={handleZipMatched}
      />

      <HistoryModal
        isOpen={!!historyTargetItem}
        onClose={() => setHistoryTargetItem(null)}
        documentItem={historyTargetItem}
      />
    </div>
  );
}
