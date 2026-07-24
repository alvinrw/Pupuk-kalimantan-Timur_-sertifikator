import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  FileText,
  Calendar,
  CheckCircle2,
  Filter,
  Download,
  ExternalLink,
  Building2,
  Factory,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';
import { masterRenewalHistoryLogs } from '../data/masterDataset';

export default function RiwayatPerpanjangan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTahun, setFilterTahun] = useState('All');
  const [filterUnit, setFilterUnit] = useState('All');
  const [selectedDetailDoc, setSelectedDetailDoc] = useState(null);

  // Connected Master Renewal Audit Logs Dataset
  const historyData = masterRenewalHistoryLogs;

  // Filtering Logic
  const filteredData = useMemo(() => {
    return historyData.filter(item => {
      const matchesSearch =
        item.merekItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jenisItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.noSertifikatBaru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unitPabrik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pelaksana.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTahun = filterTahun === 'All' || item.tglTerbit.startsWith(filterTahun);
      const matchesUnit = filterUnit === 'All' || item.unitPabrik === filterUnit;

      return matchesSearch && matchesTahun && matchesUnit;
    });
  }, [searchTerm, filterTahun, filterUnit]);

  if (selectedDetailDoc) {
    return (
      <DocumentDetailPage
        item={selectedDetailDoc}
        onBack={() => setSelectedDetailDoc(null)}
        onSaveUpdate={() => {}}
        onQuickRenew={(id) => {
          alert(`Inisiasi Perpanjangan untuk log ${id}.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Menandai log ${id} sebagai Afkir.`);
        }}
      />
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans-clean max-w-7xl mx-auto">
      {/* Header Title */}
      <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl text-slate-900 flex items-center gap-2 tracking-tight">
            <History className="w-6 h-6 text-[#005ea4]" />
            Riwayat Perpanjangan & Rekam Jejak Audit
          </h2>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            Arsip lengkap hasil resertifikasi, riwayat perpanjangan SK, dan dokumen pendukung perizinan
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono-data">
          <span className="text-xs font-bold text-[#005ea4] bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
            {filteredData.length} Total Riwayat Tercatat
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Header */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 font-mono-data">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tahun */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700">Tahun:</span>
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#005ea4]"
              >
                <option value="All">Semua Tahun</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            {/* Filter Unit */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700">Unit Pabrik:</span>
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#005ea4]"
              >
                <option value="All">Semua Unit</option>
                <option value="UBS 6">UBS 6</option>
                <option value="Pabrik NPK">Pabrik NPK</option>
                <option value="Diklat B">Diklat B</option>
                <option value="Pabrik 2">Pabrik 2</option>
                <option value="Pabrik 3">Pabrik 3</option>
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari riwayat, nomor SK, alat..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans-clean">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                <th className="py-3 px-3 text-center font-bold whitespace-nowrap">NO.</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap text-[#005ea4]">NAMA ITEM & UNIT</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">NO. SERTIFIKAT BARU</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">TGL INSPEKSI</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">TGL TERBIT SK</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap text-rose-700">TGL EXPIRATION</th>
                <th className="py-3 px-3 font-bold whitespace-nowrap">INSTANSI / PENGUJI</th>
                <th className="py-3 px-3 font-bold text-center whitespace-nowrap">DOKUMEN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-mono-data">
              {filteredData.length > 0 ? (
                filteredData.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 text-center font-bold text-slate-500 whitespace-nowrap">
                      {index + 1}
                    </td>

                    {/* Nama Item & Unit */}
                    <td
                      onClick={() => setSelectedDetailDoc(log)}
                      className="py-3.5 px-3 whitespace-nowrap cursor-pointer group"
                      title="Klik untuk Lihat Detail Penuh"
                    >
                      <div className="font-bold text-slate-900 group-hover:text-[#005ea4] group-hover:underline font-sans">{log.merekItem}</div>
                      <div className="text-[11px] text-slate-500 font-mono-data flex items-center gap-1.5 mt-0.5">
                        <span>{log.jenisItem}</span>
                        <span>•</span>
                        <span className="font-bold text-[#005ea4] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 text-[10px]">
                          {log.unitPabrik}
                        </span>
                      </div>
                    </td>

                    {/* No. Sertifikat Baru */}
                    <td className="py-3.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {log.noSertifikatBaru}
                      <span className="block text-[10px] font-normal text-slate-400">
                        (Lama: {log.noSertifikatLama})
                      </span>
                    </td>

                    {/* Tanggal Inspeksi */}
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap font-medium">
                      {log.tglInspeksi}
                    </td>

                    {/* Tanggal Terbit */}
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap font-medium">
                      {log.tglTerbit}
                    </td>

                    {/* Tanggal Expired */}
                    <td className="py-3.5 px-3 text-rose-700 whitespace-nowrap font-bold">
                      {log.tglExpiredBaru}
                    </td>

                    {/* Pelaksana / Penguji */}
                    <td className="py-3.5 px-3 text-slate-800 whitespace-nowrap font-medium font-sans">
                      {log.pelaksana}
                    </td>

                    {/* Action Download / Preview */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => alert(`Membuka berkas sertifikat terlampir: ${log.fileName}`)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#005ea4] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 mx-auto cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#005ea4]" />
                        <span>PDF</span>
                        <ExternalLink className="w-3 h-3 text-[#005ea4]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-mono-data">
                    Tidak ada riwayat perpanjangan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
