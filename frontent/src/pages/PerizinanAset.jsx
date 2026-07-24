import React, { useState } from 'react';
import { Search, FileSpreadsheet, FileArchive, History, Columns, PlusCircle, ChevronDown } from 'lucide-react';
import CsvImportModal from '../components/CsvImportModal';
import ZipOcrModal from '../components/ZipOcrModal';
import HistoryModal from '../components/HistoryModal';
import SingleEntryAsetModal from '../components/SingleEntryAsetModal';

export default function PerizinanAset({ title, subtitle }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  
  const [historyTargetItem, setHistoryTargetItem] = useState(null);

  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const [documents, setDocuments] = useState([
    {
      id: "ASET-01",
      certificateNo: "HGB-12345-2020",
      location: "Kawasan Industri Kaltim Zone 1",
      areaSqm: "100000",
      areaHa: "10",
      purpose: "Area Pabrik Amonia",
      condition: "Sangat Baik",
      description: "Hak Guna Bangunan Pabrik 1A",
      submissionDate: "2020-01-15",
      validityPeriod: "2050-01-15",
    },
    {
      id: "ASET-02",
      certificateNo: "IMB-9988-2015",
      location: "Kawasan Industri Kaltim Zone 2",
      areaSqm: "50000",
      areaHa: "5",
      purpose: "Gudang Penyimpanan Urea",
      condition: "Baik",
      description: "Izin Mendirikan Bangunan Gudang",
      submissionDate: "2015-06-10",
      validityPeriod: "Selamanya",
    },
    {
      id: "ASET-03",
      certificateNo: "AMDAL-776-2022",
      location: "Area Pengolahan Limbah",
      areaSqm: "25000",
      areaHa: "2.5",
      purpose: "Fasilitas WWTP",
      condition: "Dalam Pemeliharaan",
      description: "Izin Lingkungan IPLC",
      submissionDate: "2022-03-01",
      validityPeriod: "2027-03-01",
    }
  ]);

  const allColumns = [
    { key: "certificateNo", label: "Nomer Sertifikat" },
    { key: "location", label: "Lokasi" },
    { key: "areaSqm", label: "Luas (m²)" },
    { key: "areaHa", label: "Luas (Ha)" },
    { key: "purpose", label: "Peruntukan" },
    { key: "submissionDate", label: "Tanggal Awal Pengajuan" },
    { key: "validityPeriod", label: "Masa Berlaku Produk" },
    { key: "condition", label: "Kondisi" },
    { key: "description", label: "Keterangan" },
  ];

  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allColumns.map(c => c.key));

  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map(c => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  const filteredDocs = documents.filter(doc =>
    doc.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCsvImported = (newItems) => {
    alert("Fitur Impor CSV berhasil!");
  };

  const handleZipMatched = () => {
    alert("Berhasil menghubungkan file PDF ZIP ke baris tabel!");
  };

  const handleSingleAdded = (newItem) => {
    setDocuments(prev => [newItem, ...prev]);
  };

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Header & Workflow Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-[#0F172A]">
            {title || "Perizinan Aset"}
          </h2>
          <p className="text-xs text-[#64748B] font-mono-data">
            {subtitle || "Manajemen sertifikat aset, lokasi, luas, dan kondisi"}
          </p>
        </div>

        {/* UNIFIED SINGLE ACTION DROPDOWN BUTTON */}
        <div className="relative">
          <button
            onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Kelola / Impor Dokumen</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Unified Popover Menu */}
          {isImportMenuOpen && (
            <div className="absolute right-0 top-11 z-40 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-1 space-y-1 text-xs font-sans-clean">
              <button
                onClick={() => { setIsSingleModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800"
              >
                <PlusCircle className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">+ Input 1 Data Manual</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Termasuk unggah berkas PDF sertifikat</span>
                </div>
              </button>

              <button
                onClick={() => { setIsCsvModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="block">Impor CSV Master</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Muat CSV gabungan multi-unit</span>
                </div>
              </button>

              <button
                onClick={() => { setIsZipModalOpen(true); setIsImportMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 font-bold text-slate-800"
              >
                <FileArchive className="w-4 h-4 text-[#005ea4]" />
                <div>
                  <span className="block">Bulk Upload ZIP PDF (AI)</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono-data">Ekstraksi ribuan sertifikat ZIP</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search, Filter Data Count, & Column Selector */}
      <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3 relative">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707783]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan Nomer Sertifikat atau Lokasi..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
            {filteredDocs.length} data ditemukan
          </div>

          {/* COLUMN VISIBILITY */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs"
            >
              <Columns className="w-4 h-4 text-[#005ea4]" />
              <span>Pilih Kolom Tampil ({visibleColumnKeys.length}/{allColumns.length})</span>
            </button>

            {/* Dropdown Popover */}
            {isColumnDropdownOpen && (
              <div className="absolute right-0 top-10 z-40 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 space-y-2 text-xs font-sans-clean">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-xs">Centang Kolom yang Tampil</span>
                  <button
                    onClick={selectAllColumns}
                    className="text-[11px] font-mono-data font-bold text-[#005ea4] hover:underline"
                  >
                    Pilih Semua
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {allColumns.map((col) => {
                    const checked = isVisible(col.key);
                    return (
                      <label
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-slate-300 accent-[#005ea4]"
                        />
                        <span className="text-xs">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                {isVisible("certificateNo") && <th className="py-3.5 px-4 font-bold">Nomer Sertifikat</th>}
                {isVisible("location") && <th className="py-3.5 px-4 font-bold">Lokasi</th>}
                {isVisible("areaSqm") && <th className="py-3.5 px-4 font-bold text-right">Luas (m²)</th>}
                {isVisible("areaHa") && <th className="py-3.5 px-4 font-bold text-right">Luas (Ha)</th>}
                {isVisible("purpose") && <th className="py-3.5 px-4 font-bold">Peruntukan</th>}
                {isVisible("submissionDate") && <th className="py-3.5 px-4 font-bold">Tanggal Awal Pengajuan</th>}
                {isVisible("validityPeriod") && <th className="py-3.5 px-4 font-bold">Masa Berlaku Produk</th>}
                {isVisible("condition") && <th className="py-3.5 px-4 font-bold">Kondisi</th>}
                {isVisible("description") && <th className="py-3.5 px-4 font-bold">Keterangan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredDocs.map((doc) => {
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    {isVisible("certificateNo") && (
                      <td className="py-3.5 px-4 font-mono-data font-bold text-[#005ea4]">
                        {doc.certificateNo}
                      </td>
                    )}
                    {isVisible("location") && (
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {doc.location}
                      </td>
                    )}
                    {isVisible("areaSqm") && (
                      <td className="py-3.5 px-4 font-mono-data text-right text-slate-700">
                        {Number(doc.areaSqm).toLocaleString('id-ID')}
                      </td>
                    )}
                    {isVisible("areaHa") && (
                      <td className="py-3.5 px-4 font-mono-data text-right text-slate-700">
                        {Number(doc.areaHa).toLocaleString('id-ID')}
                      </td>
                    )}
                    {isVisible("purpose") && (
                      <td className="py-3.5 px-4 text-slate-700">
                        {doc.purpose}
                      </td>
                    )}
                    {isVisible("submissionDate") && (
                      <td className="py-3.5 px-4 font-mono-data text-slate-700">
                        {doc.submissionDate}
                      </td>
                    )}
                    {isVisible("validityPeriod") && (
                      <td className="py-3.5 px-4 font-mono-data font-bold text-rose-700">
                        {doc.validityPeriod}
                      </td>
                    )}
                    {isVisible("condition") && (
                      <td className="py-3.5 px-4 text-slate-700">
                        {doc.condition}
                      </td>
                    )}
                    {isVisible("description") && (
                      <td className="py-3.5 px-4 text-slate-700 truncate max-w-[150px]" title={doc.description}>
                        {doc.description}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={visibleColumnKeys.length} className="py-8 text-center text-slate-500 font-mono-data">
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SingleEntryAsetModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onAddSuccess={handleSingleAdded}
      />

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
