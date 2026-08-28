import React, { useState, useEffect } from 'react';
import { History, FileText, Search, Eye, X } from 'lucide-react';
import api from '../services/api';

export default function HistoriPencatatan() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/activity-logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeColor = (action) => {
    switch (action) {
      case 'INSERT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      case 'LOGIN': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const parseTargetName = (log) => {
    try {
      if (log.details) {
        const parsed = JSON.parse(log.details);
        if (parsed.body) {
          const body = parsed.body;
          if (body.title) return body.title;
          if (body.merekItem) return body.merekItem;
          if (body.namaSertifikat) return body.namaSertifikat;
        }
      }
    } catch(e) {}
    return log.target;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#005ea4]" />
            Histori Pencatatan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat aktivitas pengguna, perubahan dokumen, dan akses ke dalam sistem.
          </p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari histori..." 
            className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Waktu & Tanggal</th>
                <th className="px-6 py-4 font-semibold">Nama Pengguna</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
                <th className="px-6 py-4 font-semibold">Modul Target</th>
                <th className="px-6 py-4 font-semibold">Detail Objek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // 1. LOADING SKELETON STATE
                [...Array(5)].map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 flex justify-between"><div className="h-4 bg-slate-200 rounded w-32"></div><div className="h-6 bg-slate-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                // 2. EMPTY STATE
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <History className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="text-slate-500 font-medium">Belum ada histori pencatatan</div>
                      <p className="text-sm text-slate-400">Data aktivitas pengguna dan sistem akan muncul di sini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // 3. DATA STATE
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{log.user}</td>
                    <td className="px-6 py-4 text-slate-500">{log.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {log.module}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center justify-between gap-4">
                        <span className="truncate max-w-[150px] inline-block font-mono-data text-xs" title={log.target}>
                          {parseTargetName(log)}
                        </span>
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="text-[#005ea4] hover:text-[#004881] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Detail Perubahan Data</h3>
                <p className="text-xs text-slate-500 font-mono-data">Target ID: {selectedLog.target}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-slate-500 mb-1">Aksi:</span>
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getBadgeColor(selectedLog.action)} inline-block`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Modul:</span>
                  <span className="font-semibold text-slate-700">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Waktu:</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(selectedLog.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Pengguna:</span>
                  <span className="font-semibold text-slate-700">{selectedLog.user} ({selectedLog.role})</span>
                </div>
              </div>

              <div className="mt-6">
                <span className="block text-slate-500 mb-2 text-sm font-semibold">Payload Data (Detail Perubahan):</span>
                <div className="bg-slate-800 text-slate-300 p-4 rounded-xl font-mono-data text-xs overflow-x-auto">
                  <pre>
                    {selectedLog.details ? JSON.stringify(JSON.parse(selectedLog.details), null, 2) : 'Tidak ada payload data'}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
