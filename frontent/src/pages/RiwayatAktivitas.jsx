import React from 'react';
import { History, UserCheck, Shield, Sparkles, FileText, Search } from 'lucide-react';

export default function RiwayatAktivitas({ activityLogs }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif-title font-bold text-xl text-[#0F172A]">
          Riwayat Aktivitas & Audit Trail OCR
        </h2>
        <p className="text-xs text-[#64748B] font-mono-data">
          Catatan tidak terbantahkan (immutable log) dari seluruh interaksi pengguna, unggahan PDF, dan perubahan status sertifikat
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-[#e2e8fo] shadow-2xs p-6">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-[#e2e8fo]">
          {activityLogs.map((log) => (
            <div key={log.id} className="relative pl-10">
              {/* Dot */}
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#005ea4] -translate-x-1/2 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#005ea4]" />
              </div>

              {/* Log Card */}
              <div className="bg-[#f8fafc] border border-[#e2e8fo] rounded-lg p-4 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={log.avatar}
                      alt={log.user}
                      className="w-6 h-6 rounded-full object-cover border border-[#cbd5e1]"
                    />
                    <span className="text-xs font-bold text-[#0F172A]">{log.user}</span>
                  </div>
                  <span className="text-[11px] font-mono-data text-[#64748B]">{log.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded ${log.badgeColor}`}>
                    {log.action}
                  </span>
                </div>

                <p className="text-xs text-[#404752] font-sans-body">
                  {log.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
