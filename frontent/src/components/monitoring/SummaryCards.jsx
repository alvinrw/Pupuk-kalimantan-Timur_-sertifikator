import React from 'react';
import { ShieldAlert, Clock, CheckCircle2, RotateCcw, Ban } from 'lucide-react';

/**
 * SummaryCards - 5 kartu statistik di bagian atas MonitoringSertifikasi.
 * Props: countExpired, countUrgent, countValid, countInProgress, countDecommissioned,
 *        expiryTab, setExpiryTab, customUrgentDays, setCustomUrgentDays
 */
export default function SummaryCards({
  countExpired, countUrgent, countValid, countInProgress, countDecommissioned,
  expiryTab, setExpiryTab, customUrgentDays, setCustomUrgentDays
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Inventaris Expired */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'expired' ? 'all' : 'expired')}
        className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
          expiryTab === 'expired' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Inventaris Expired</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-rose-600">{countExpired}</span>
          <span className="text-[10px] text-slate-500 block font-mono-data mt-0.5">Expired (Kadaluarsa)</span>
        </div>
      </div>

      {/* Card 2: Urgent Expiring */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'urgent' ? 'all' : 'urgent')}
        className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
          expiryTab === 'urgent' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Urgent &lt;</span>
            <input
              type="number"
              value={customUrgentDays}
              onChange={(e) => {
                e.stopPropagation();
                setCustomUrgentDays(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1));
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-10 px-1 py-0.5 text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-[#005ea4]"
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Hr</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-slate-700" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-amber-600">{countUrgent}</span>
          <span className="text-[10px] text-slate-500 block font-mono-data mt-0.5">Tenggat Dekat</span>
        </div>
      </div>

      {/* Card 3: Sertifikat Valid */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'valid' ? 'all' : 'valid')}
        className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
          expiryTab === 'valid' ? 'border-[#005ea4] ring-2 ring-[#005ea4]/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Sertifikat Valid</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-emerald-600">{countValid}</span>
          <span className="text-[10px] text-slate-500 block font-mono-data mt-0.5">Masa Berlaku Aman</span>
        </div>
      </div>

      {/* Card 4: Proses Perpanjangan */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'in_progress' ? 'all' : 'in_progress')}
        className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs ${
          expiryTab === 'in_progress' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Proses Perpanjangan</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-amber-600">{countInProgress}</span>
          <span className="text-[10px] text-slate-500 block font-mono-data mt-0.5">Sedang Diperpanjang</span>
        </div>
      </div>

      {/* Card 5: Aset Afkir / Non-Aktif */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'decommissioned' ? 'all' : 'decommissioned')}
        className={`p-4 rounded-xl border cursor-pointer transition-all bg-[#0f172a] text-white shadow-xs ${
          expiryTab === 'decommissioned' ? 'border-black ring-2 ring-slate-400' : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Aset Afkir / Non-Aktif</span>
          <div className="w-7 h-7 rounded-lg bg-slate-800 text-white border border-slate-700 flex items-center justify-center">
            <Ban className="w-3.5 h-3.5 text-slate-200" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-white">{countDecommissioned}</span>
          <span className="text-[10px] text-slate-400 block font-mono-data mt-0.5">Tidak Diperpanjang</span>
        </div>
      </div>
    </div>
  );
}
