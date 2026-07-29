import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export default function StatusWorkflowGuide({ type, statusColorsGuide, workflowSteps }) {
  if (type === 'status') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Sistem Penandaan Warna Status Baris Tabel (Hitam, Merah, Kuning, Clean)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {statusColorsGuide.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div key={idx} className={`p-6 rounded-2xl border ${st.bgCard} shadow-xs space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-6 h-6 ${st.iconColor}`} />
                    <h4 className="font-extrabold text-sm tracking-tight">{st.title}</h4>
                  </div>
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${st.code}`}>
                    {st.badge}
                  </span>
                </div>
                <p className="text-xs font-mono-data leading-relaxed opacity-90">
                  {st.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'workflow') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#005ea4]" />
            <span>Alur Kerja (Workflow Step-by-Step) Pengelolaan Dokumen</span>
          </h3>
        </div>

        <div className="space-y-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#005ea4] text-white flex items-center justify-center font-extrabold text-base shrink-0 font-mono-data shadow-xs">
                  {step.step}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#005ea4] shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                  </div>
                  <p className="pl-6 text-xs text-slate-600 font-mono-data leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
