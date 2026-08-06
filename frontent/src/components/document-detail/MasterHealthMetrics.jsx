import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function MasterHealthMetrics({ hook }) {
  const { certStats } = hook;
  
  if (!certStats) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-data mb-6">
      <div className="flex flex-col gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/80 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Sertifikat Terhubung Aktif</span>
        </div>
        <div>
          <span className="font-bold text-2xl text-emerald-600">{certStats.active} Dokumen</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100/80 shadow-xs">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Mendekati Expired (&lt;30 Hari)</span>
        </div>
        <div>
          <span className="font-bold text-2xl text-amber-600">{certStats.expiring} Dokumen</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100/80 shadow-xs">
        <div className="flex items-center gap-2 text-rose-700">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Expired / Butuh Perpanjangan</span>
        </div>
        <div>
          <span className="font-bold text-2xl text-rose-600">{certStats.expired} Dokumen</span>
        </div>
      </div>
    </div>
  );
}
