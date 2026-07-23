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

export default function RiwayatPerpanjangan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTahun, setFilterTahun] = useState('All');
  const [filterUnit, setFilterUnit] = useState('All');
  const [selectedDetailDoc, setSelectedDetailDoc] = useState(null);

  // Comprehensive Audit Log Dataset for Renewal History
  const historyData = [
    {
      id: "LOG-2026-001",
      merekItem: "Penyalur Petir Konvensional JT 8 (2896)",
      jenisItem: "Instalasi Penyalur Petir",
      unitPabrik: "UBS 6",
      kategori: "Perizinan Peralatan Pabrik",
      noSertifikatBaru: "0502/INS-IPP/LFS-IV/2026",
      noSertifikatLama: "0401/INS-IPP/LFS-IV/2024",
      tglInspeksi: "2026-04-05",
      tglTerbit: "2026-04-07",
      tglExpiredBaru: "2028-04-07",
      pelaksana: "Disnaker Kaltim / PT. Lentera Fokus Safetindo",
      status: "Resertifikasi Berhasil",
      notes: "Tahanan pembumian: 0.53 Ω (Uji grounding memenuhi standar K3).",
      fileName: "Sertifikat_Penyalur_Petir_2026.pdf"
    },
    {
      id: "LOG-2026-002",
      merekItem: "Timbangan Elektronik Mettler Toledo IND930",
      jenisItem: "Timbangan Metrologi",
      unitPabrik: "Pabrik NPK",
      kategori: "Perizinan Peralatan Pabrik",
      noSertifikatBaru: "500.2.3.15 / 034 / UPTMETROLOGI / 2026",
      noSertifikatLama: "500.2.3.15 / 012 / UPTMETROLOGI / 2025",
      tglInspeksi: "2026-02-15",
      tglTerbit: "2026-02-18",
      tglExpiredBaru: "2027-02-18",
      pelaksana: "UPT Metrologi Legal Kota Bontang",
      status: "Tera Ulang Sah",
      notes: "Tera sah 2026, kalibrasi ulang bobot 60kg akurat.",
      fileName: "Tera_Sah_Timbangan_2026.pdf"
    },
    {
      id: "LOG-2025-003",
      merekItem: "Fire Alarm System Notifier SFP-10UD",
      jenisItem: "Fire Alarm System",
      unitPabrik: "Diklat B",
      kategori: "Perizinan Peralatan Pabrik",
      noSertifikatBaru: "500.15.18.2 / 5674 / DTKT - III",
      noSertifikatLama: "500.15.18.2 / 4102 / DTKT - II",
      tglInspeksi: "2025-06-10",
      tglTerbit: "2025-06-16",
      tglExpiredBaru: "2026-06-16",
      pelaksana: "PT. Sucofindo / Disnaker Kaltim",
      status: "Resertifikasi Berhasil",
      notes: "Pengujian 40 smoke detector & 21 heat detector siap siaga.",
      fileName: "Cert_FireAlarm_DiklatB.pdf"
    },
    {
      id: "LOG-2024-004",
      merekItem: "Primary Reformer Boiler 120 Bar",
      jenisItem: "Bejana Tekan / Boiler",
      unitPabrik: "Pabrik 2",
      kategori: "Perizinan Peralatan Pabrik",
      noSertifikatBaru: "CERT-7734/DISNAKER-KT/2023",
      noSertifikatLama: "CERT-5510/DISNAKER-KT/2020",
      tglInspeksi: "2023-02-20",
      tglTerbit: "2023-03-01",
      tglExpiredBaru: "2026-03-01",
      pelaksana: "Disnaker Kaltim",
      status: "Resertifikasi Berhasil",
      notes: "NDT Uji Tekanan Hydrotest 120 Bar lulus kelayakan.",
      fileName: "Boiler_Reformer_Pabrik2.pdf"
    },
    {
      id: "LOG-2024-005",
      merekItem: "Overhead Crane 50 Ton SWL",
      jenisItem: "Pesawat Angkat & Angkut",
      unitPabrik: "Pabrik 3",
      kategori: "Perizinan Peralatan Pabrik",
      noSertifikatBaru: "SUCO-PAA-88219-2024",
      noSertifikatLama: "SUCO-PAA-66102-2021",
      tglInspeksi: "2024-05-10",
      tglTerbit: "2024-05-15",
      tglExpiredBaru: "2026-05-15",
      pelaksana: "Sucofindo Inspeksi",
      status: "Resertifikasi Berhasil",
      notes: "Pengujian beban SWL 50 Ton & kelayakan rem hoist.",
      fileName: "Crane_SWL_50T_Pabrik3.pdf"
    }
  ];

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
