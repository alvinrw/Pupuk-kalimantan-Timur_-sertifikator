import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Send,
  FolderKanban,
  Building,
  CheckCheck
} from 'lucide-react';

export default function MonitoringSertifikasi({ equipmentList, renewalBatches = [] }) {
  const [filterKelayakan, setFilterKelayakan] = useState('All');
  const [activeSubTab, setActiveSubTab] = useState('matrix'); // matrix vs progress

  const countLayak = equipmentList.filter((i) => i.statusKelayakan === 'Layak').length;
  const countRepair = equipmentList.filter((i) => i.statusKelayakan === 'Repair').length;
  const countTidakLayak = equipmentList.filter((i) => i.statusKelayakan === 'Tidak Layak').length;

  const defaultBatches = renewalBatches.length > 0 ? renewalBatches : [
    {
      batchId: "BATCH-2026-01",
      name: "Paket Resertifikasi Boiler & Bejana Tekan Pabrik 1A",
      agency: "Disnaker Kaltim",
      itemsCount: 5,
      status: "Sedang Inspeksi Lapangan",
      createdDate: "2026-07-10",
      progressPercent: 60,
    },
    {
      batchId: "BATCH-2026-02",
      name: "Pengajuan Izin Lingkungan IPLC & WWTP 2026",
      agency: "KLHK RI",
      itemsCount: 3,
      status: "Menunggu TTD SK Menteri",
      createdDate: "2026-06-25",
      progressPercent: 85,
    }
  ];

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-900">
            Monitoring Kelayakan & Progress Resertifikasi
          </h2>
          <p className="text-xs text-slate-600 font-mono-data">
            Matrix kepatuhan kelayakan operasional & tracking progress pengajuan paket resertifikasi
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-lg text-xs font-bold font-mono-data">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matrix Audit Kelayakan
          </button>
          <button
            onClick={() => setActiveSubTab('progress')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'progress' ? 'bg-[#005ea4] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Progress Resertifikasi Batch ({defaultBatches.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'matrix' && (
        <>
          {/* Compliance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setFilterKelayakan('Layak')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterKelayakan === 'Layak'
                  ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-400'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-data font-bold uppercase text-emerald-800">
                  STATUS KELAYAKAN: LAYAK
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-900">
                  {countLayak} Aset
                </span>
                <span className="text-xs font-mono-data font-bold text-emerald-700">
                  Aman Operasional
                </span>
              </div>
            </div>

            <div
              onClick={() => setFilterKelayakan('Repair')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterKelayakan === 'Repair'
                  ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-data font-bold uppercase text-amber-800">
                  STATUS KELAYAKAN: REPAIR
                </span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-900">
                  {countRepair} Aset
                </span>
                <span className="text-xs font-mono-data font-bold text-amber-700">
                  Perlu Perbaikan
                </span>
              </div>
            </div>

            <div
              onClick={() => setFilterKelayakan('Tidak Layak')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterKelayakan === 'Tidak Layak'
                  ? 'bg-rose-50 border-rose-500 shadow-md ring-2 ring-rose-400'
                  : 'bg-white border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-data font-bold uppercase text-rose-800">
                  STATUS KELAYAKAN: TIDAK LAYAK
                </span>
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-rose-900">
                  {countTidakLayak} Aset
                </span>
                <span className="text-xs font-mono-data font-bold text-rose-700">
                  Stop Operasi
                </span>
              </div>
            </div>
          </div>

          {/* Monitoring Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">TAG & PERALATAN</th>
                    <th className="py-3 px-4 font-bold">LEMBAGA INSPEKSI</th>
                    <th className="py-3 px-4 font-bold">TANGGAL EXPIRY</th>
                    <th className="py-3 px-4 font-bold text-center">KELAYAKAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {equipmentList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono-data font-bold text-[#005ea4] block">
                          {item.tagNumber}
                        </span>
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {item.inspectionBody}
                      </td>
                      <td className="py-3 px-4 font-mono-data font-bold text-slate-900">
                        {item.expiryDate}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono-data font-bold rounded-full ${
                          item.statusKelayakan === 'Layak'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.statusKelayakan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Progress Monitoring Sub-tab */}
      {activeSubTab === 'progress' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs">
            <h4 className="font-bold text-[#005ea4] text-sm mb-1">Status Tracking Progress Resertifikasi Paket</h4>
            <p className="text-slate-600 font-medium">
              Monitoring langsung proses pengurusan dokumen yang telah dikelompokkan oleh unit kerja ke instansi inspeksi (Disnaker / Sucofindo / KLHK).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {defaultBatches.map((batch, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono-data font-bold text-[#005ea4] uppercase">{batch.batchId} • Instansi: {batch.agency}</span>
                    <h3 className="font-bold text-base text-slate-900">{batch.name}</h3>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-[#005ea4] rounded-full text-xs font-bold font-mono-data self-start md:self-auto">
                    {batch.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono-data font-bold text-slate-700">
                    <span>Progress Pengurusan ({batch.itemsCount || 4} Dokumen)</span>
                    <span>{batch.progressPercent || 60}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#005ea4] rounded-full transition-all duration-300"
                      style={{ width: `${batch.progressPercent || 60}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
