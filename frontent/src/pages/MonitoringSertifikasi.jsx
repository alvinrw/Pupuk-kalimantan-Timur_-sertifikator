import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  PlusCircle,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  X,
  Save,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

export default function MonitoringSertifikasi() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expiryTab, setExpiryTab] = useState('all'); // 'all' | 'expired' | 'critical30' | 'warning1yr' | 'in_progress'

  // Modal States
  const [registerModalItem, setRegisterModalItem] = useState(null);
  const [updateStageModalItem, setUpdateStageModalItem] = useState(null);
  const [selectedStage, setSelectedStage] = useState('');
  const [resertifikasiNotes, setResertifikasiNotes] = useState('');

  // Consolidated Master List of all Documents across all categories
  const [allCertificates, setAllCertificates] = useState([
    {
      id: "MON-01",
      code: "B-201-P2",
      title: "Primary Reformer Boiler 120 Bar",
      category: "Perizinan Peralatan Pabrik",
      unit: "Pabrik 2 (Area Reformer)",
      certificateNo: "CERT-7734/DISNAKER-KT/2023",
      validityPeriod: "3 Tahun", // Masa berlaku
      issueDate: "2023-04-15",
      expiryDate: "2026-08-15", // ~24 Hari lagi (<30 hari)
      expiryCategory: "critical30", // <30 Hari (sertifikat 1-2/3 thn)
      workflowStatus: "in_progress",
      currentStage: "Tahap 3: Inspeksi Lapangan & Uji Beban Kelayakan",
      agency: "Disnaker Kalimantan Timur",
      notes: "Jadwal NDT & Uji Tekanan Tanggal 28 Juli 2026"
    },
    {
      id: "MON-02",
      code: "CR-402-P3",
      title: "Overhead Crane 50 Ton SWL",
      category: "Perizinan Peralatan Pabrik",
      unit: "Pabrik 3 (Urea Silo B)",
      certificateNo: "SUCO-PAA-88219-2024",
      validityPeriod: "3 Tahun",
      issueDate: "2024-01-10",
      expiryDate: "2027-01-10",
      expiryCategory: "safe",
      workflowStatus: "not_started",
      currentStage: "Belum Didaftarkan Perpanjangan",
      agency: "Sucofindo Inspeksi",
      notes: "Kondisi fisik aktif, siap operasi"
    },
    {
      id: "MON-03",
      code: "ST-501-P5",
      title: "Ammonia Storage Tank #2 (30.000 MT)",
      category: "Perizinan Peralatan Pabrik",
      unit: "Pabrik 5 (Dermaga & Offsite)",
      certificateNo: "PERIZ-B3-8891-PKT",
      validityPeriod: "5 Tahun", // Masa berlaku > 5 thn
      issueDate: "2021-09-01",
      expiryDate: "2026-06-30", // sudah expired
      expiryCategory: "expired",
      workflowStatus: "in_progress",
      currentStage: "Tahap 2: Pengajuan & Permohonan ke Instansi",
      agency: "Sucofindo / Disnaker Kaltim",
      notes: "Dokumen berkas permohonan sudah masuk ke Disnaker"
    },
    {
      id: "MON-04",
      code: "HGB-PABRIK-04",
      title: "Sertifikat HGB & Izin Kawasan Industri Pabrik 4",
      category: "Perizinan Aset & Bangunan",
      unit: "Pabrik 4 (Amuria Loop)",
      certificateNo: "BPN-HGB-88192-2017",
      validityPeriod: "10 Tahun", // Masa berlaku > 5 tahun
      issueDate: "2017-03-01",
      expiryDate: "2027-03-01", // ~7 bulan lagi (<1 tahun)
      expiryCategory: "warning1yr", // < 1 Tahun (Masa berlaku >5 Thn)
      workflowStatus: "not_started",
      currentStage: "Belum Didaftarkan Perpanjangan",
      agency: "Kantor Pertanahan (BPN) Bontang",
      notes: "Masa berlaku 10 tahun, masuk periode evaluasi perpanjangan"
    },
    {
      id: "MON-05",
      code: "CIP-SOFTWARE-01",
      title: "Hak Cipta E-Licensing & Calibration System",
      category: "Administrasi Ciptaan (HAKI)",
      unit: "Dept. TI & Sistem Informasi",
      certificateNo: "EC00202400192",
      validityPeriod: "5 Tahun",
      issueDate: "2024-03-10",
      expiryDate: "2029-03-10",
      expiryCategory: "safe",
      workflowStatus: "not_started",
      currentStage: "Belum Didaftarkan Perpanjangan",
      agency: "Dirjen Kekayaan Intelektual Kemenkumham",
      notes: "Hak Cipta Terdaftar Resmi"
    },
    {
      id: "MON-06",
      code: "SLF-PROYEK-P6",
      title: "Sertifikat Laik Fungsi Proyek Expansion Pabrik 6",
      category: "Perizinan Proyek & Konstruksi",
      unit: "Proyek Kaltim-6",
      certificateNo: "PUPR-SLF-2023-0012",
      validityPeriod: "3 Tahun",
      issueDate: "2023-05-10",
      expiryDate: "2026-08-01", // <30 Hari
      expiryCategory: "critical30",
      workflowStatus: "in_progress",
      currentStage: "Tahap 4: Review Draft LPT / SK Menteri",
      agency: "Dinas PUPR & Kementerian PUPR",
      notes: "Menunggu penandatanganan SK Menteri PUPR"
    }
  ]);

  // Standard 5-Step Resertifikasi Workflow Stages
  const WORKFLOW_STAGES = [
    "Tahap 1: Verifikasi & Audit Dokumen Internal",
    "Tahap 2: Pengajuan & Permohonan ke Instansi (Disnaker/Sucofindo/KLHK)",
    "Tahap 3: Inspeksi Lapangan & Uji Beban Kelayakan",
    "Tahap 4: Review Draft LPT / SK Menteri",
    "Tahap 5: Pengesahan & Penerbitan Sertifikat Baru (Selesai)"
  ];

  // Filtering Logic
  const filteredCertificates = useMemo(() => {
    return allCertificates.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

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

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [allCertificates, searchTerm, categoryFilter, expiryTab]);

  // Open Resertifikasi Registration Modal
  const openRegisterModal = (item) => {
    setRegisterModalItem(item);
    setSelectedStage(WORKFLOW_STAGES[0]);
    setResertifikasiNotes(item.notes || '');
  };

  // Open Update Stage Modal
  const openUpdateStageModal = (item) => {
    setUpdateStageModalItem(item);
    setSelectedStage(item.currentStage.includes("Tahap") ? item.currentStage : WORKFLOW_STAGES[0]);
    setResertifikasiNotes(item.notes || '');
  };

  // Confirm Registration / Stage Change
  const handleSaveStageChange = (e) => {
    e.preventDefault();
    const targetId = registerModalItem ? registerModalItem.id : updateStageModalItem?.id;
    if (!targetId) return;

    setAllCertificates(prev =>
      prev.map(item => {
        if (item.id === targetId) {
          const isDone = selectedStage.includes("Tahap 5");
          return {
            ...item,
            workflowStatus: isDone ? "completed" : "in_progress",
            currentStage: selectedStage,
            notes: resertifikasiNotes
          };
        }
        return item;
      })
    );

    setRegisterModalItem(null);
    setUpdateStageModalItem(null);
  };

  // Counts for Tabs
  const countExpired = allCertificates.filter(c => c.expiryCategory === 'expired').length;
  const countCritical30 = allCertificates.filter(c => c.expiryCategory === 'critical30').length;
  const countWarning1yr = allCertificates.filter(c => c.expiryCategory === 'warning1yr').length;
  const countInProgress = allCertificates.filter(c => c.workflowStatus === 'in_progress').length;

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-bold text-xl text-slate-900">
            Monitoring & Evaluasi Perpanjangan Sertifikat
          </h2>
          <p className="text-xs text-slate-600 font-mono-data">
            Evaluasi risiko kadaluarsa perizinan pabrik & pemantauan alur (workflow) tahap perpanjangan
          </p>
        </div>
      </div>

      {/* SUMMARY STATS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setExpiryTab('expired')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            expiryTab === 'expired'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-900 uppercase">Kadaluarsa (Expired)</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-700">{countExpired}</span>
            <span className="text-[10px] font-mono-data font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
              Perlu Tindakan
            </span>
          </div>
        </div>

        <div
          onClick={() => setExpiryTab('critical30')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            expiryTab === 'critical30'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 uppercase">&lt; 30 Hari (Masa 1-2 Thn)</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-700">{countCritical30}</span>
            <span className="text-[10px] font-mono-data font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Kritis Sebulan
            </span>
          </div>
        </div>

        <div
          onClick={() => setExpiryTab('warning1yr')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            expiryTab === 'warning1yr'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#005ea4] uppercase">&lt; 1 Tahun (Masa &gt; 5 Thn)</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-[#005ea4]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#005ea4]">{countWarning1yr}</span>
            <span className="text-[10px] font-mono-data font-bold text-[#005ea4] bg-blue-100 px-2 py-0.5 rounded">
              Perlu Evaluasi
            </span>
          </div>
        </div>

        <div
          onClick={() => setExpiryTab('in_progress')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            expiryTab === 'in_progress'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-900 uppercase">Workflow Perpanjangan</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700">{countInProgress}</span>
            <span className="text-[10px] font-mono-data font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Sedang Berjalan
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold font-mono-data">
          <button
            onClick={() => setExpiryTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              expiryTab === 'all' ? 'bg-[#005ea4] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua ({allCertificates.length})
          </button>
          <button
            onClick={() => setExpiryTab('expired')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              expiryTab === 'expired' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Expired ({countExpired})
          </button>
          <button
            onClick={() => setExpiryTab('critical30')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              expiryTab === 'critical30' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            &lt; 30 Hari ({countCritical30})
          </button>
          <button
            onClick={() => setExpiryTab('warning1yr')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              expiryTab === 'warning1yr' ? 'bg-[#005ea4] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            &lt; 1 Tahun ({countWarning1yr})
          </button>
          <button
            onClick={() => setExpiryTab('in_progress')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              expiryTab === 'in_progress' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Workflow Aktif ({countInProgress})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Kode, Judul Perizinan, Unit, Instansi..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>
      </div>

      {/* MONITORING & WORKFLOW TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">KODE & PERIZINAN</th>
                <th className="py-3 px-4 font-bold">MASA BERLAKU & EXPIRATION</th>
                <th className="py-3 px-4 font-bold">STATUS RISIKO KADALUARSA</th>
                <th className="py-3 px-4 font-bold">TAHAP WORKFLOW RESERTIFIKASI</th>
                <th className="py-3 px-4 font-bold text-right">AKSI / PROSES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((doc) => {
                  const isInProgress = doc.workflowStatus === 'in_progress';
                  const isCompleted = doc.workflowStatus === 'completed';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      {/* Kode & Perizinan */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono-data font-bold text-xs text-[#005ea4] block">{doc.code}</span>
                        <span className="font-bold text-slate-900 block">{doc.title}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{doc.category} — {doc.unit}</span>
                      </td>

                      {/* Masa Berlaku & Expiration */}
                      <td className="py-3.5 px-4 font-mono-data">
                        <span className="text-slate-600 block text-[11px]">Masa: <b>{doc.validityPeriod}</b></span>
                        <span className="font-bold text-rose-700 block">Berakhir: {doc.expiryDate}</span>
                        <span className="text-[10px] text-slate-400">{doc.agency}</span>
                      </td>

                      {/* Status Risiko Kadaluarsa */}
                      <td className="py-3.5 px-4">
                        {doc.expiryCategory === 'expired' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-rose-100 text-rose-900 border border-rose-300">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                            <span>Expired (Lewat Tanggal)</span>
                          </span>
                        )}
                        {doc.expiryCategory === 'critical30' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Kritis (&lt; 30 Hari)</span>
                          </span>
                        )}
                        {doc.expiryCategory === 'warning1yr' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-100 text-[#005ea4] border border-blue-300">
                            <Calendar className="w-3.5 h-3.5 text-[#005ea4]" />
                            <span>Perlu Perhatian (&lt; 1 Thn)</span>
                          </span>
                        )}
                        {doc.expiryCategory === 'safe' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sertifikat Berlaku Valid</span>
                          </span>
                        )}
                      </td>

                      {/* Tahap Workflow Progress (Text Keterangan Jelas) */}
                      <td className="py-3.5 px-4">
                        {isInProgress ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md font-bold text-[#005ea4] text-[11px] block">
                              {doc.currentStage}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono-data block italic">
                              Catatan: {doc.notes}
                            </span>
                          </div>
                        ) : isCompleted ? (
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md font-bold text-emerald-800 text-[11px] inline-block">
                            ✅ Resertifikasi Selesai (Sertifikat Baru Terbit)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono-data text-[11px]">
                            Belum Didaftarkan
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isInProgress ? (
                          <button
                            onClick={() => openUpdateStageModal(doc)}
                            className="px-3 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1"
                          >
                            <span>⚡ Update Tahap Progress</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openRegisterModal(doc)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Daftarkan Resertifikasi</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono-data">
                    Tidak ada perizinan yang sesuai dengan filter monitoring ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER / UPDATE WORKFLOW STAGE MODAL */}
      {(registerModalItem || updateStageModalItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">
                  {registerModalItem ? "Daftarkan Alur Resertifikasi Baru" : "Update Tahap Progress Sertifikasi"}
                </h4>
                <p className="text-[11px] text-blue-300 font-mono-data">
                  Dokumen: {(registerModalItem || updateStageModalItem)?.title}
                </p>
              </div>
              <button
                onClick={() => { setRegisterModalItem(null); setUpdateStageModalItem(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStageChange} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Pilih Tahap Progress Sertifikasi Sekarang
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-[#005ea4] text-xs"
                >
                  {WORKFLOW_STAGES.map((stage, idx) => (
                    <option key={idx} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Keterangan / Catatan Progress Lapangan
                </label>
                <textarea
                  value={resertifikasiNotes}
                  onChange={(e) => setResertifikasiNotes(e.target.value)}
                  placeholder="misal: Jadwal NDT tanggal 28 Juli 2026, berkas kelengkapan sudah dikirim ke Sucofindo..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setRegisterModalItem(null); setUpdateStageModalItem(null); }}
                  className="px-3.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Progress</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
