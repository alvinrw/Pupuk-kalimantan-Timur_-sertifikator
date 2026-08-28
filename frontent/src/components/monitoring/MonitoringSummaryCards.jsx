import React from 'react';
import { ShieldAlert, Clock, CheckCircle2, Ban, FileX, FileCheck, Database } from 'lucide-react';

/**
 * MonitoringSummaryCards — 7 kartu statistik di bagian atas MonitoringSertifikasi dengan gaya minimalis bersih.
 */
export default function MonitoringSummaryCards({
  counts,
  expiryTab,
  setExpiryTab,
  customUrgentDays,
  setCustomUrgentDays
}) {
  const {
    countExpired, countUrgent, countValid, countDecommissioned,
    countTanpaSertifikat, countAdaSertifikat, countTotal
  } = counts;

  const cardBase = 'p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-2xs';
  const activeRing = 'border-[#005ea4] ring-2 ring-[#005ea4]/20';
  const inactiveCard = 'border-slate-200 hover:border-slate-300';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">

      {/* Card 1: Tanpa Sertifikat */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'exempt' ? 'all' : 'exempt')}
        className={`${cardBase} ${expiryTab === 'exempt' ? activeRing : inactiveCard}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanpa Sertifikat</span>
          <FileX className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-extrabold text-slate-800">{countTanpaSertifikat}</span>
          <span className="text-[10px] text-slate-400 font-mono-data mb-0.5">item</span>
        </div>
      </div>

      {/* Card 2: Ada Sertifikat */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'has_cert' ? 'all' : 'has_cert')}
        className={`${cardBase} ${expiryTab === 'has_cert' ? activeRing : inactiveCard}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ada Sertifikat</span>
          <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-extrabold text-slate-800">{countAdaSertifikat}</span>
          <span className="text-[10px] text-slate-400 font-mono-data mb-0.5">item</span>
        </div>
      </div>

      {/* Card 3: Sertifikat Aktif */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'valid' ? 'all' : 'valid')}
        className={`${cardBase} ${expiryTab === 'valid' ? activeRing : inactiveCard}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sertifikat Aktif</span>
          <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-extrabold text-slate-800">{countValid}</span>
          <span className="text-[10px] text-slate-400 font-mono-data mb-0.5">item</span>
        </div>
      </div>

      {/* Card 4: Inventaris Expired */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'expired' ? 'all' : 'expired')}
        className={`${cardBase} ${expiryTab === 'expired' ? activeRing : inactiveCard}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inventaris Expired</span>
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-extrabold text-slate-800">{countExpired}</span>
          <span className="text-[10px] text-slate-400 font-mono-data mb-0.5">item</span>
        </div>
      </div>

      {/* Card 5: Urgent */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'urgent' ? 'all' : 'urgent')}
        className={`${cardBase} ${expiryTab === 'urgent' ? activeRing : inactiveCard}`}
      >
        <div className="flex items-center justify-between mb-2 gap-1">
          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500 flex items-center gap-1 shrink-0">
            Urgent ≤
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={customUrgentDays}
              onChange={(e) => {
                e.stopPropagation();
                const val = e.target.value.replace(/[^0-9]/g, '');
                setCustomUrgentDays(val === '' ? '' : Math.max(1, parseInt(val) || 1));
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-7 px-0 py-0.5 text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-[#005ea4] focus:bg-white"
            />
          </span>
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-extrabold text-slate-800">{countUrgent}</span>
          <span className="text-[10px] text-slate-400 font-mono-data mb-0.5">item</span>
        </div>
      </div>

      {/* Card 6: Non-Aktif / Afkir */}
      <div
        onClick={() => setExpiryTab(expiryTab === 'decommissioned' ? 'all' : 'decommissioned')}
        className={`${cardBase} ${expiryTab === 'decommissioned' ? activeRing : inactiveCard}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nonaktif</span>
          <Ban className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-extrabold text-slate-800">{countDecommissioned}</span>
          <span className="text-[10px] text-slate-400 font-mono-data mb-0.5">item</span>
        </div>
      </div>

      {/* Card 7: Total Keseluruhan */}
      <div
        onClick={() => setExpiryTab('all')}
        className={`${cardBase} ${expiryTab === 'all' ? activeRing : inactiveCard}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Keseluruhan</span>
          <Database className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-extrabold text-slate-800">{countTotal}</span>
          <span className="text-[10px] text-slate-400 font-mono-data mb-0.5">item</span>
        </div>
      </div>

    </div>
  );
}
