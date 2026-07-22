import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  CheckCheck,
  ChevronRight
} from 'lucide-react';

export default function NotifikasiSertifikasi({ notifications, onMarkAllRead }) {
  const [filterTab, setFilterTab] = useState('all'); // all, unread, warning

  const filteredNotifs = notifications.filter((item) => {
    if (filterTab === 'unread') return !item.isRead;
    if (filterTab === 'warning') return item.type === 'warning' || item.type === 'error';
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title font-bold text-xl text-[#0F172A]">
            Center Notifikasi & Warning Sertifikasi
          </h2>
          <p className="text-xs text-[#64748B] font-mono-data">
            Pemberitahuan otomatis resertifikasi, masa berlaku dokumen, dan peringatan audit K3
          </p>
        </div>
        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8fo] text-[#005ea4] hover:bg-[#f2f4f6] text-xs font-semibold rounded-md shadow-2xs transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Tandai Semua Dibaca</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2e8fo] pb-2 text-xs font-semibold">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-md font-mono-data transition-colors ${
            filterTab === 'all'
              ? 'bg-[#005ea4] text-white'
              : 'text-[#64748B] hover:bg-[#f2f4f6]'
          }`}
        >
          Semua Notifikasi ({notifications.length})
        </button>
        <button
          onClick={() => setFilterTab('unread')}
          className={`px-3 py-1.5 rounded-md font-mono-data transition-colors ${
            filterTab === 'unread'
              ? 'bg-[#005ea4] text-white'
              : 'text-[#64748B] hover:bg-[#f2f4f6]'
          }`}
        >
          Belum Dibaca ({notifications.filter(n => !n.isRead).length})
        </button>
        <button
          onClick={() => setFilterTab('warning')}
          className={`px-3 py-1.5 rounded-md font-mono-data transition-colors ${
            filterTab === 'warning'
              ? 'bg-[#005ea4] text-white'
              : 'text-[#64748B] hover:bg-[#f2f4f6]'
          }`}
        >
          Urgent Warnings
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-lg border border-[#e2e8fo] shadow-2xs divide-y divide-[#e2e8fo] overflow-hidden">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((item) => {
            const getIcon = () => {
              if (item.type === 'error') return <AlertTriangle className="w-5 h-5 text-[#EF4444]" />;
              if (item.type === 'warning') return <Clock className="w-5 h-5 text-[#F59E0B]" />;
              if (item.type === 'success') return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />;
              return <Info className="w-5 h-5 text-[#0EA5E9]" />;
            };

            return (
              <div
                key={item.id}
                className={`p-4 flex items-start gap-4 transition-colors ${
                  !item.isRead ? 'bg-blue-50/40' : 'hover:bg-[#f8fafc]'
                }`}
              >
                <div className="p-2 rounded bg-white border border-[#e2e8fo] shadow-2xs">
                  {getIcon()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono-data font-bold uppercase text-[#005ea4]">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono-data text-[#94a3b8]">
                      {item.time}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A] mt-0.5 font-serif-title">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#404752] mt-1">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-[#64748B] font-mono-data text-xs">
            Tidak ada notifikasi dalam kategori ini.
          </div>
        )}
      </div>
    </div>
  );
}
