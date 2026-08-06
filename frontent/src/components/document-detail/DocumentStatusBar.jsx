import React from 'react';

export default function DocumentStatusBar({ hook, item }) {
  const { currentStatus, isAfkirStatus, formData } = hook;
  
  const expiryStr = formData?.berakhir || item?.berakhir || item?.expiryDate;
  const sisaHari = expiryStr
    ? Math.ceil((new Date(expiryStr) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono-data text-xs">
      <div className="flex items-center gap-6">
        <div>
          <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Status Dokumen</span>
          <span className="font-bold text-sm text-slate-900">{currentStatus}</span>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
        <div>
          <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Sisa Masa Berlaku</span>
          <span className="font-bold text-sm text-slate-900">
            {isAfkirStatus ? 'Afkir / Non-Aktif' : sisaHari <= 0 ? `Expired (${Math.abs(sisaHari)} hari lalu)` : `${sisaHari.toLocaleString()} Hari`}
          </span>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Tanggal Expired</span>
        <span className="font-bold text-xs text-slate-700">{expiryStr || '-'}</span>
      </div>
    </div>
  );
}
