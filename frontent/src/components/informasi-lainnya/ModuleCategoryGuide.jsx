import React from 'react';
import { Layers } from 'lucide-react';

export default function ModuleCategoryGuide({ modulesGuide }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#005ea4]" />
          <span>Modul & Kategori Perizinan di Dalam Sistem</span>
        </h3>
        <span className="text-xs font-mono-data text-slate-500 font-bold">6 Modul Utama Terkoneksi</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modulesGuide.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#005ea4] transition-all space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-[#005ea4] rounded-xl border border-blue-100">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">{mod.title}</h4>
              </div>
              <p className="text-xs text-slate-600 font-mono-data leading-relaxed">
                <span className="font-bold text-slate-800">Cakupan Data:</span> {mod.items}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
