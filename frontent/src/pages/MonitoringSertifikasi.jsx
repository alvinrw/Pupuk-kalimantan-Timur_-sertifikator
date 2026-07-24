import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Save,
  Clock,
  ShieldAlert,
  Calendar,
  Layers,
  Edit3,
  Upload,
  FileText
} from 'lucide-react';

export default function MonitoringSertifikasi() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryTab, setExpiryTab] = useState('all'); // 'all' | 'expired' | 'critical30' | 'warning1yr' | 'in_progress'

  // Inline Column Header Filter States
  const [filterKategori, setFilterKategori] = useState('All');
  const [filterJenis, setFilterJenis] = useState('All');
  const [filterStatusRisiko, setFilterStatusRisiko] = useState('All');

  // Modal States
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [tanggalTerbit, setTanggalTerbit] = useState('');
  const [tanggalExpired, setTanggalExpired] = useState('');
  const [tanggalInspeksi, setTanggalInspeksi] = useState('');
  const [statusPerbaikan, setStatusPerbaikan] = useState('Selesai');
  const [attachedFileName, setAttachedFileName] = useState('');

  // Master List of all Documents across all 5 Perizinan categories
  const [allCertificates, setAllCertificates] = useState([
    {
      id: "MON-01",
      kategoriDokumen: "Perizinan Peralatan Pabrik",
      jenisItem: "Bejana Tekan / Boiler",
      merekItem: "Primary Reformer Boiler 120 Bar",
      nomorSeriTipe: "SN-88219-PKT (B-201-P2)",
      certificateNo: "CERT-7734/DISNAKER-KT/2023",
      validityPeriod: "3 Tahun",
      issueDate: "2023-08-15",
      expiryDate: "2026-08-15",
      inspectionDate: "2026-07-28",
      statusPerbaikan: "Sedang Diproses",
      pdfFile: "Sertifikat_Boiler_2023.pdf",
      expiryCategory: "critical30",
      workflowStatus: "in_progress",
      currentStage: "Tahap 3: Inspeksi Lapangan & Uji Beban",
      agency: "Disnaker Kaltim",
      notes: "Jadwal NDT & Uji Tekanan Tanggal 28 Juli 2026"
    },
    {
      id: "MON-02",
      kategoriDokumen: "Perizinan Peralatan Pabrik",
      jenisItem: "Pesawat Angkat & Angkut",
      merekItem: "Overhead Crane 50 Ton SWL",
      nomorSeriTipe: "SN-CR-9910-TY (CR-402-P3)",
      certificateNo: "SUCO-PAA-88219-2024",
      validityPeriod: "3 Tahun",
      issueDate: "2024-01-10",
      expiryDate: "2027-01-10",
      inspectionDate: "2024-01-05",
      statusPerbaikan: "Selesai",
      pdfFile: "Sertifikat_OverheadCrane_2024.pdf",
      expiryCategory: "safe",
      workflowStatus: "not_started",
      currentStage: "-",
      agency: "Sucofindo Inspeksi",
      notes: ""
    },
    {
      id: "MON-03",
      kategoriDokumen: "Perizinan Peralatan Pabrik",
      jenisItem: "Tangki Timbun B3",
      merekItem: "Ammonia Storage Tank #2 (30.000 MT)",
      nomorSeriTipe: "SN-TK-501-AM (ST-501-P5)",
      certificateNo: "PERIZ-B3-8891-PKT",
      validityPeriod: "5 Tahun",
      issueDate: "2021-06-30",
      expiryDate: "2026-06-30",
      inspectionDate: "2026-06-15",
      statusPerbaikan: "Sedang Diproses",
      pdfFile: "",
      expiryCategory: "expired",
      workflowStatus: "in_progress",
      currentStage: "Tahap 2: Pengajuan Berkas ke Instansi",
      agency: "Disnaker Kaltim / Sucofindo",
      notes: "Berkas permohonan sudah dikirim ke Disnaker"
    },
    {
      id: "MON-04",
      kategoriDokumen: "Perizinan Aset",
      jenisItem: "Sertifikat HGB & Lahan",
      merekItem: "Kawasan Industri Pabrik 4 (Amuria Loop)",
      nomorSeriTipe: "HGB-PABRIK-04",
      certificateNo: "BPN-HGB-88192-2017",
      validityPeriod: "10 Tahun",
      issueDate: "2017-03-01",
      expiryDate: "2027-03-01",
      inspectionDate: "2017-02-20",
      statusPerbaikan: "Selesai",
      pdfFile: "Sertifikat_HGB_Pabrik4.pdf",
      expiryCategory: "warning1yr",
      workflowStatus: "not_started",
      currentStage: "-",
      agency: "BPN Bontang",
      notes: ""
    },
    {
      id: "MON-05",
      kategoriDokumen: "Administrasi Lainnya",
      jenisItem: "Program Komputer (Software)",
      merekItem: "E-Licensing & Calibration System",
      nomorSeriTipe: "CIP-SOFTWARE-01",
      certificateNo: "EC00202400192",
      validityPeriod: "5 Tahun",
      issueDate: "2024-03-10",
      expiryDate: "2029-03-10",
      inspectionDate: "2024-03-01",
      statusPerbaikan: "Selesai",
      pdfFile: "HAKI_Software_System.pdf",
      expiryCategory: "safe",
      workflowStatus: "not_started",
      currentStage: "-",
      agency: "Dirjen KI Kemenkumham",
      notes: ""
    },
    {
      id: "MON-06",
      kategoriDokumen: "Perizinan Proyek",
      jenisItem: "Sertifikat Laik Fungsi (SLF)",
      merekItem: "Proyek Expansion Pabrik 6",
      nomorSeriTipe: "SLF-PROYEK-P6",
      certificateNo: "PUPR-SLF-2023-0012",
      validityPeriod: "3 Tahun",
      issueDate: "2023-08-01",
      expiryDate: "2026-08-01",
      inspectionDate: "2026-07-15",
      statusPerbaikan: "Sedang Diproses",
      pdfFile: "",
      expiryCategory: "critical30",
      workflowStatus: "in_progress",
      currentStage: "Tahap 4: Review Draft SK Menteri",
      agency: "Kementerian PUPR",
      notes: "Menunggu penandatanganan SK Menteri PUPR"
    },
    {
      id: "MON-07",
      kategoriDokumen: "Perizinan Produk",
      jenisItem: "Sertifikasi SNI Fertilizer",
      merekItem: "Pupuk Urea Prill SNI 2801:2010",
      nomorSeriTipe: "SNI-UREA-2024",
      certificateNo: "BSN-SNI-9921-2024",
      validityPeriod: "4 Tahun",
      issueDate: "2024-05-20",
      expiryDate: "2028-05-20",
      inspectionDate: "2024-05-10",
      statusPerbaikan: "Selesai",
      pdfFile: "Sertifikat_SNI_Urea_2024.pdf",
      expiryCategory: "safe",
      workflowStatus: "not_started",
      currentStage: "-",
      agency: "LSPro BSN",
      notes: ""
    }
  ]);

  // Unique options for header dropdown filters
  const uniqueKategori = useMemo(() => ['All', ...new Set(allCertificates.map(i => i.kategoriDokumen))], [allCertificates]);
  const uniqueJenis = useMemo(() => ['All', ...new Set(allCertificates.map(i => i.jenisItem))], [allCertificates]);

  // Filtering Logic
  const filteredCertificates = useMemo(() => {
    return allCertificates.filter((item) => {
      const matchesSearch =
        item.merekItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jenisItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomorSeriTipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategoriDokumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.certificateNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesKategoriHeader = filterKategori === 'All' || item.kategoriDokumen === filterKategori;
      const matchesJenisHeader = filterJenis === 'All' || item.jenisItem === filterJenis;
      const matchesStatusHeader = filterStatusRisiko === 'All' || item.expiryCategory === filterStatusRisiko;

      let matchesTab = true;
      if (expiryTab === 'expired') {
        matchesTab = item.expiryCategory === 'expired';
      } else if (expiryTab === 'critical30') {
        matchesTab = item.expiryCategory === 'critical30';
      } else if (expiryTab === 'warning1yr') {
        matchesTab = item.expiryCategory === 'warning1yr';
      } else if (expiryTab === 'in_progress') {
        matchesTab = item.workflowStatus === 'in_progress';
      }

      return matchesSearch && matchesKategoriHeader && matchesJenisHeader && matchesStatusHeader && matchesTab;
    });
  }, [allCertificates, searchTerm, filterKategori, filterJenis, filterStatusRisiko, expiryTab]);

  // Open Modal
  const openProcessModal = (item) => {
    setActiveModalItem(item);
    setTanggalTerbit(item.issueDate || '2026-07-24');
    setTanggalExpired(item.expiryDate || '2029-07-24');
    setTanggalInspeksi(item.inspectionDate || '2026-07-20');
    setStatusPerbaikan(item.statusPerbaikan || 'Selesai');
    setAttachedFileName(item.pdfFile || '');
  };

  // Handle PDF file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  // Confirm Renewal Dates & Document Change
  const handleSaveRenewal = (e) => {
    e.preventDefault();
    if (!activeModalItem) return;

    setAllCertificates(prev =>
      prev.map(item => {
        if (item.id === activeModalItem.id) {
          return {
            ...item,
            issueDate: tanggalTerbit,
            expiryDate: tanggalExpired,
            inspectionDate: tanggalInspeksi,
            statusPerbaikan: statusPerbaikan,
            pdfFile: attachedFileName || item.pdfFile || `Sertifikat_${item.id}.pdf`,
            expiryCategory: "safe"
          };
        }
        return item;
      })
    );

    setActiveModalItem(null);
  };

  // Counts for Tabs
  const countExpired = allCertificates.filter(c => c.expiryCategory === 'expired').length;
  const countCritical30 = allCertificates.filter(c => c.expiryCategory === 'critical30').length;
  const countWarning1yr = allCertificates.filter(c => c.expiryCategory === 'warning1yr').length;
  const countInProgress = allCertificates.filter(c => c.workflowStatus === 'in_progress').length;

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-xl text-slate-900">
            Monitoring & Evaluasi Perpanjangan Sertifikat
          </h2>
          <p className="text-xs text-slate-500 font-mono-data">
            Rekapitulasi perizinan 5 kategori dokumen, tenggat expired, dan pemantauan perpanjangan
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setExpiryTab('expired')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
            expiryTab === 'expired' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Expired</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-rose-600 border border-slate-200 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-rose-600">{countExpired}</span>
            <span className="text-[11px] text-slate-500 block font-mono-data">Sudah Kadaluarsa</span>
          </div>
        </div>

        <div
          onClick={() => setExpiryTab('critical30')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
            expiryTab === 'critical30' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">&lt; 30 Hari</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-amber-600 border border-slate-200 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-600">{countCritical30}</span>
            <span className="text-[11px] text-slate-500 block font-mono-data">Masa 1–2 Tahun</span>
          </div>
        </div>

        <div
          onClick={() => setExpiryTab('warning1yr')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
            expiryTab === 'warning1yr' ? 'border-[#005ea4] ring-1 ring-[#005ea4]' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">&lt; 1 Tahun</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#005ea4] border border-slate-200 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-[#005ea4]">{countWarning1yr}</span>
            <span className="text-[11px] text-slate-500 block font-mono-data">Masa &gt; 5 Tahun</span>
          </div>
        </div>

        <div
          onClick={() => setExpiryTab('in_progress')}
          className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
            expiryTab === 'in_progress' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Proses Perpanjangan</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-emerald-600 border border-slate-200 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-600">{countInProgress}</span>
            <span className="text-[11px] text-slate-500 block font-mono-data">Workflow Berjalan</span>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR: SEARCH & TABS */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold font-mono-data">
          <button
            onClick={() => setExpiryTab('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              expiryTab === 'all' ? 'bg-[#005ea4] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua ({allCertificates.length})
          </button>
          <button
            onClick={() => setExpiryTab('expired')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              expiryTab === 'expired' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Expired ({countExpired})
          </button>
          <button
            onClick={() => setExpiryTab('critical30')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              expiryTab === 'critical30' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            &lt; 30 Hari ({countCritical30})
          </button>
          <button
            onClick={() => setExpiryTab('warning1yr')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              expiryTab === 'warning1yr' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            &lt; 1 Tahun ({countWarning1yr})
          </button>
          <button
            onClick={() => setExpiryTab('in_progress')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              expiryTab === 'in_progress' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Proses Perpanjangan ({countInProgress})
          </button>
        </div>

        {/* Counter Badge, Reset Button, & Search */}
        <div className="flex items-center gap-3 flex-1 justify-end min-w-[320px]">
          <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
            {filteredCertificates.length} data ditemukan
          </div>

          {(filterKategori !== 'All' || filterJenis !== 'All' || filterStatusRisiko !== 'All') && (
            <button
              onClick={() => { setFilterKategori('All'); setFilterJenis('All'); setFilterStatusRisiko('All'); }}
              className="text-xs font-bold text-rose-700 hover:underline px-2.5 py-1 bg-rose-50 rounded border border-rose-200"
            >
              Reset Filter Header
            </button>
          )}

          <div className="relative w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari item/seri..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005ea4]"
            />
          </div>
        </div>
      </div>

      {/* UNIFIED SINGLE-LINE TABLE WITH INLINE HEADER DROPDOWN FILTERS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                <th className="py-3 px-4 text-center font-bold whitespace-nowrap">NO.</th>

                {/* KATEGORI DOKUMEN INLINE FILTER */}
                <th className="py-3 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                  <div className="flex items-center gap-1.5">
                    <span>KATEGORI DOKUMEN</span>
                    <select
                      value={filterKategori}
                      onChange={(e) => setFilterKategori(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer"
                    >
                      <option value="All">Semua</option>
                      {uniqueKategori.filter(k => k !== 'All').map((k, idx) => (
                        <option key={idx} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </th>

                {/* JENIS ITEM INLINE FILTER */}
                <th className="py-3 px-4 font-bold whitespace-nowrap bg-blue-50/60">
                  <div className="flex items-center gap-1.5">
                    <span>JENIS ITEM</span>
                    <select
                      value={filterJenis}
                      onChange={(e) => setFilterJenis(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer"
                    >
                      <option value="All">Semua</option>
                      {uniqueJenis.filter(j => j !== 'All').map((j, idx) => (
                        <option key={idx} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </th>

                <th className="py-3 px-4 font-bold whitespace-nowrap">MEREK / NAMA ITEM</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">NOMOR SERI / TIPE</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">NO. SERTIFIKAT</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">TANGGAL EXPIRATION</th>

                {/* STATUS RISIKO INLINE FILTER */}
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap bg-blue-50/60">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>STATUS RISIKO</span>
                    <select
                      value={filterStatusRisiko}
                      onChange={(e) => setFilterStatusRisiko(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold cursor-pointer"
                    >
                      <option value="All">Semua</option>
                      <option value="expired">Expired</option>
                      <option value="critical30">&lt; 30 Hari</option>
                      <option value="warning1yr">&lt; 1 Tahun</option>
                      <option value="safe">Valid</option>
                    </select>
                  </div>
                </th>

                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">STATUS</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">RIWAYAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((doc, index) => {
                  const isInProgress = doc.workflowStatus === 'in_progress';
                  const isCompleted = doc.workflowStatus === 'completed';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono-data font-bold text-slate-600 whitespace-nowrap">
                        {index + 1}
                      </td>

                      {/* Kategori Dokumen */}
                      <td className="py-3.5 px-4 font-bold text-[#005ea4] whitespace-nowrap">
                        {doc.kategoriDokumen}
                      </td>

                      {/* Jenis Item */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {doc.jenisItem}
                      </td>

                      {/* Merek / Nama Item */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {doc.merekItem}
                      </td>

                      {/* Nomor Seri / Tipe */}
                      <td className="py-3.5 px-4 font-mono-data font-semibold text-slate-700 whitespace-nowrap">
                        {doc.nomorSeriTipe}
                      </td>

                      {/* No Sertifikat */}
                      <td className="py-3.5 px-4 font-mono-data text-slate-800 whitespace-nowrap">
                        {doc.certificateNo}
                      </td>

                      {/* Tanggal Expiration */}
                      <td className="py-3.5 px-4 font-mono-data font-bold text-rose-700 whitespace-nowrap">
                        {doc.expiryDate}
                      </td>

                      {/* Status Risiko */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {doc.expiryCategory === 'expired' && (
                          <span className="px-2.5 py-0.5 text-[11px] font-bold font-mono-data text-rose-700 bg-rose-50 border border-rose-200 rounded">
                            Expired
                          </span>
                        )}
                        {doc.expiryCategory === 'critical30' && (
                          <span className="px-2.5 py-0.5 text-[11px] font-bold font-mono-data text-amber-700 bg-amber-50 border border-amber-200 rounded">
                            &lt; 30 Hari
                          </span>
                        )}
                        {doc.expiryCategory === 'warning1yr' && (
                          <span className="px-2.5 py-0.5 text-[11px] font-bold font-mono-data text-[#005ea4] bg-blue-50 border border-blue-200 rounded">
                            &lt; 1 Tahun
                          </span>
                        )}
                        {doc.expiryCategory === 'safe' && (
                          <span className="px-2.5 py-0.5 text-[11px] font-bold font-mono-data text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                            Valid
                          </span>
                        )}
                      </td>

                      {/* Status Perpanjangan */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {doc.statusPerbaikan === 'Selesai' && (
                          <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md">
                            Selesai
                          </span>
                        )}
                        {doc.statusPerbaikan === 'Sedang Diproses' && (
                          <span className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
                            Sedang Diproses
                          </span>
                        )}
                      </td>

                      {/* Action Button / Riwayat */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => openProcessModal(doc)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#005ea4]" />
                          <span>Kelola Perpanjangan</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-mono-data">
                    Tidak ada perizinan yang sesuai dengan kriteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KELOLA PERPANJANGAN MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Kelola Perpanjangan Sertifikat</h4>
                <p className="text-[11px] text-slate-400 font-mono-data">{activeModalItem.merekItem} • {activeModalItem.certificateNo}</p>
              </div>
              <button onClick={() => setActiveModalItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRenewal} className="p-5 space-y-4 text-xs">
              {/* Status Perbaikan */}
              <div>
                <label className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#005ea4]" />
                  <span>Status Perbaikan / Hasil Inspeksi</span>
                </label>
                <select
                  value={statusPerbaikan}
                  onChange={(e) => setStatusPerbaikan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-semibold text-slate-900 text-xs"
                >
                  <option value="Selesai">Selesai (Laik Operasi)</option>
                  <option value="Sedang Diproses">Sedang Diproses</option>
                </select>
              </div>

              {/* Tanggal Inspeksi Baru */}
              <div>
                <label className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#005ea4]" />
                  <span>Tanggal Inspeksi Baru</span>
                </label>
                <input
                  type="date"
                  value={tanggalInspeksi}
                  onChange={(e) => setTanggalInspeksi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-semibold text-slate-900 text-xs"
                  required
                />
              </div>

              {/* Tanggal Terbit Baru */}
              <div>
                <label className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#005ea4]" />
                  <span>Tanggal Terbit Baru</span>
                </label>
                <input
                  type="date"
                  value={tanggalTerbit}
                  onChange={(e) => setTanggalTerbit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-semibold text-slate-900 text-xs"
                  required
                />
              </div>

              {/* Tanggal Expired Baru */}
              <div>
                <label className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#005ea4]" />
                  <span>Tanggal Expired Baru</span>
                </label>
                <input
                  type="date"
                  value={tanggalExpired}
                  onChange={(e) => setTanggalExpired(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-semibold text-slate-900 text-xs"
                  required
                />
              </div>

              {/* Unggah Berkas PDF Sertifikat Baru */}
              <div>
                <label className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#005ea4]" />
                  <span>Unggah Berkas PDF Sertifikat Baru</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 text-center transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {attachedFileName ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs py-1">
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span className="truncate max-w-[200px]">{attachedFileName}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono-data">Terlampir</span>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                      <p className="text-slate-600 font-medium text-xs">Klik atau seret berkas PDF sertifikat di sini</p>
                      <p className="text-[10px] text-slate-400 font-mono-data">Maksimal 10 MB (Format PDF)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perpanjangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
