import React from 'react';
import { Clock, Ban, AlertCircle } from 'lucide-react';

export default function DocumentStatusBar({ hook, item }) {
  const { currentStatus, isAfkirStatus, formData } = hook;
  
  const expiryStr = formData?.berakhir || item?.berakhir || item?.expiryDate;
  let sisaHari = 0;
  if (expiryStr && expiryStr !== '-') {
    let expDate = new Date(expiryStr);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(expiryStr)) {
      const parts = expiryStr.split('/');
      expDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    if (!isNaN(expDate.getTime())) {
      sisaHari = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
    }
  }

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
          <div className="flex items-center gap-2">
            {isAfkirStatus ? <Ban className="w-4 h-4 shrink-0" /> : <Clock className="w-4 h-4 shrink-0" />}
            <span className="font-bold text-sm text-slate-900">
              {isAfkirStatus ? 'Non-Aktif' : sisaHari <= 0 ? `Expired (${Math.abs(sisaHari)} hari lalu)` : `${sisaHari.toLocaleString()} Hari`}
            </span>
            {!isAfkirStatus && sisaHari <= 0 && <AlertCircle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />}
          </div>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Tanggal Expired</span>
        <span className="font-bold text-xs text-slate-700">{expiryStr || '-'}</span>
      </div>
    </div>
  );
}
