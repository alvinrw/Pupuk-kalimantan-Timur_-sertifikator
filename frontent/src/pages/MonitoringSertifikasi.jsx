import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  X,
  Save,
  Clock,
  ShieldAlert,
  Calendar,
  Layers,
  Edit3
} from 'lucide-react';

export default function MonitoringSertifikasi() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryTab, setExpiryTab] = useState('all'); // 'all' | 'expired' | 'critical30' | 'warning1yr' | 'in_progress'

  // Modal States
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [selectedStage, setSelectedStage] = useState('');
  const [resertifikasiNotes, setResertifikasiNotes] = useState('');

  // Master List of all Documents across categories
  const [allCertificates, setAllCertificates] = useState([
    {
      id: "MON-01",
      code: "B-201-P2",
      title: "Primary Reformer Boiler 120 Bar",
      category: "Perizinan Peralatan Pabrik",
      unit: "Pabrik 2 (Area Reformer)",
      certificateNo: "CERT-7734/DISNAKER-KT/2023",
      validityPeriod: "3 Tahun",
      issueDate: "2023-04-15",
      expiryDate: "2026-08-15",
      expiryCategory: "critical30",
      workflowStatus: "in_progress",
      currentStage: "Tahap 3: Inspeksi Lapangan & Uji Beban",
      agency: "Disnaker Kaltim",
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
      currentStage: "-",
      agency: "Sucofindo Inspeksi",
      notes: ""
    },
    {
      id: "MON-03",
      code: "ST-501-P5",
      title: "Ammonia Storage Tank #2 (30.000 MT)",
      category: "Perizinan Peralatan Pabrik",
      unit: "Pabrik 5 (Dermaga & Offsite)",
      certificateNo: "PERIZ-B3-8891-PKT",
      validityPeriod: "5 Tahun",
      issueDate: "2021-09-01",
      expiryDate: "2026-06-30",
      expiryCategory: "expired",
      workflowStatus: "in_progress",
      currentStage: "Tahap 2: Pengajuan Berkas ke Instansi",
      agency: "Disnaker Kaltim / Sucofindo",
      notes: "Berkas permohonan sudah dikirim ke Disnaker"
    },
    {
      id: "MON-04",
      code: "HGB-PABRIK-04",
      title: "Sertifikat HGB & Izin Kawasan Industri Pabrik 4",
      category: "Perizinan Aset & Bangunan",
      unit: "Pabrik 4 (Amuria Loop)",
      certificateNo: "BPN-HGB-88192-2017",
      validityPeriod: "10 Tahun",
      issueDate: "2017-03-01",
      expiryDate: "2027-03-01",
      expiryCategory: "warning1yr",
      workflowStatus: "not_started",
      currentStage: "-",
      agency: "BPN Bontang",
      notes: ""
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
      currentStage: "-",
      agency: "Dirjen KI Kemenkumham",
      notes: ""
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
      expiryDate: "2026-08-01",
      expiryCategory: "critical30",
      workflowStatus: "in_progress",
      currentStage: "Tahap 4: Review Draft SK Menteri",
      agency: "Kementerian PUPR",
      notes: "Menunggu penandatanganan SK Menteri PUPR"
    }
  ]);

  // Standard 5-Step Resertifikasi Workflow Stages
  const WORKFLOW_STAGES = [
    "Tahap 1: Verifikasi & Audit Dokumen Internal",
    "Tahap 2: Pengajuan Berkas ke Instansi",
    "Tahap 3: Inspeksi Lapangan & Uji Beban",
    "Tahap 4: Review Draft SK / LPT",
    "Tahap 5: Penerbitan Sertifikat Baru (Selesai)"
  ];

  // Filtering Logic
  const filteredCertificates = useMemo(() => {
    return allCertificates.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchTerm.toLowerCase());

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

      return matchesSearch && matchesTab;
    });
  }, [allCertificates, searchTerm, expiryTab]);

  // Open Modal
  const openProcessModal = (item) => {
    setActiveModalItem(item);
    setSelectedStage(item.currentStage !== '-' ? item.currentStage : WORKFLOW_STAGES[0]);
    setResertifikasiNotes(item.notes || '');
  };

  // Confirm Stage Change
  const handleSaveStageChange = (e) => {
    e.preventDefault();
    if (!activeModalItem) return;

    setAllCertificates(prev =>
      prev.map(item => {
        if (item.id === activeModalItem.id) {
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
            Rekapitulasi perizinan, tenggat expired, dan pemantauan tahap perpanjangan
          </p>
        </div>
      </div>

      {/* CLEAN ENTERPRISE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
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

        {/* Card 2 */}
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

        {/* Card 3 */}
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

        {/* Card 4 */}
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

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Clean Filter Tabs */}
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

        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari perizinan..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005ea4]"
          />
        </div>
      </div>

      {/* CLEAN MINIMAL ENTERPRISE TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">KODE & DOKUMEN</th>
                <th className="py-3 px-4 font-bold">MASA BERLAKU & KADALUARSA</th>
                <th className="py-3 px-4 font-bold">STATUS RISIKO</th>
                <th className="py-3 px-4 font-bold">PROGRESS PERPANJANGAN</th>
                <th className="py-3 px-4 font-bold text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((doc) => {
                  const isInProgress = doc.workflowStatus === 'in_progress';
                  const isCompleted = doc.workflowStatus === 'completed';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Kode & Dokumen */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono-data font-bold text-xs text-[#005ea4] block">{doc.code}</span>
                        <span className="font-bold text-slate-900 block">{doc.title}</span>
                        <span className="text-[11px] text-slate-500 font-mono-data">{doc.category} — {doc.unit}</span>
                      </td>

                      {/* Masa & Kadaluarsa */}
                      <td className="py-3.5 px-4 font-mono-data">
                        <span className="text-slate-600 block text-[11px]">Masa: {doc.validityPeriod}</span>
                        <span className="font-bold text-slate-900 block">Berakhir: {doc.expiryDate}</span>
                        <span className="text-[10px] text-slate-500">{doc.agency}</span>
                      </td>

                      {/* Status Risiko */}
                      <td className="py-3.5 px-4">
                        {doc.expiryCategory === 'expired' && (
                          <span className="px-2 py-0.5 text-[11px] font-bold font-mono-data text-rose-700 bg-rose-50 border border-rose-200 rounded">
                            Expired
                          </span>
                        )}
                        {doc.expiryCategory === 'critical30' && (
                          <span className="px-2 py-0.5 text-[11px] font-bold font-mono-data text-amber-700 bg-amber-50 border border-amber-200 rounded">
                            &lt; 30 Hari
                          </span>
                        )}
                        {doc.expiryCategory === 'warning1yr' && (
                          <span className="px-2 py-0.5 text-[11px] font-bold font-mono-data text-[#005ea4] bg-blue-50 border border-blue-200 rounded">
                            &lt; 1 Tahun
                          </span>
                        )}
                        {doc.expiryCategory === 'safe' && (
                          <span className="px-2 py-0.5 text-[11px] font-bold font-mono-data text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                            Valid
                          </span>
                        )}
                      </td>

                      {/* Progress Perpanjangan (Clean Simple Text) */}
                      <td className="py-3.5 px-4">
                        {isInProgress ? (
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{doc.currentStage}</span>
                            {doc.notes && (
                              <span className="text-[11px] text-slate-500 font-mono-data block">
                                {doc.notes}
                              </span>
                            )}
                          </div>
                        ) : isCompleted ? (
                          <span className="text-emerald-700 font-bold text-xs">
                            Selesai (Sertifikat Baru Terbit)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono-data text-xs">-</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openProcessModal(doc)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#005ea4]" />
                          <span>{isInProgress ? "Update Progress" : "Kelola Perpanjangan"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono-data">
                    Tidak ada perizinan yang sesuai dengan kriteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROCESS MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Kelola Tahap Perpanjangan Sertifikat</h4>
                <p className="text-[11px] text-slate-400 font-mono-data">{activeModalItem.title}</p>
              </div>
              <button onClick={() => setActiveModalItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStageChange} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Tahap Progress Sertifikasi</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none font-bold text-slate-900 text-xs"
                >
                  {WORKFLOW_STAGES.map((stage, idx) => (
                    <option key={idx} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Catatan Progress Lapangan</label>
                <textarea
                  value={resertifikasiNotes}
                  onChange={(e) => setResertifikasiNotes(e.target.value)}
                  placeholder="Catatan perkembangan berkas atau jadwal pengujian..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] focus:outline-none text-xs"
                />
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
