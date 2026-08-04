import React, { useState } from 'react';
import AdministrasiLainnya from './AdministrasiLainnya';
import IuranKeanggotaan from './IuranKeanggotaan';

export default function AdministrasiDanAnggaran() {
  const [activeSubTab, setActiveSubTab] = useState('administrasi');

  return (
    <div className="font-sans-clean flex flex-col h-full bg-[#f7f9fb]">
      <div className="px-6 pt-4 pb-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveSubTab('administrasi')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeSubTab === 'administrasi'
                ? 'border-[#005ea4] text-[#005ea4]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Data Administrasi Umum
          </button>
          <button
            onClick={() => setActiveSubTab('anggaran')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeSubTab === 'anggaran'
                ? 'border-[#005ea4] text-[#005ea4]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Data Keanggotaan
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {activeSubTab === 'administrasi' ? <AdministrasiLainnya /> : <IuranKeanggotaan />}
      </div>
    </div>
  );
}
