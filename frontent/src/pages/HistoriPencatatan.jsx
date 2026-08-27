import React, { useState, useEffect } from 'react';
import { History, FileText, Search, User, SlidersHorizontal, Trash2 } from 'lucide-react';
import api from '../services/api';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function HistoriPencatatan() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  
  // Modals & Notifications
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchLogs();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const confirmClearHistory = () => {
    setIsClearModalOpen(true);
  };

  const executeClearHistory = async () => {
    setIsClearModalOpen(false);
    try {
      setIsLoading(true);
      await api.delete('/activity-logs');
      setLogs([]);
      showNotification('success', 'Berhasil menghapus seluruh histori pencatatan.');
    } catch (error) {
      console.error('Error clearing logs:', error);
      showNotification('error', 'Gagal menghapus histori pencatatan: ' + (error.response?.data?.message || error.message));
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

  const renderDetails = (detailsStr) => {
    if (!detailsStr) return '-';
    try {
      const parsed = JSON.parse(detailsStr);
      if (parsed.message) {
        let msg = parsed.message;
        if (parsed.changes) {
          const changedFields = [];
          const before = parsed.changes.before || {};
          const after = parsed.changes.after || {};
          Object.keys(after).forEach(k => {
            if (before[k] !== after[k]) {
              changedFields.push(`${k}: "${before[k] || '-'}" → "${after[k]}"`);
            }
          });
          if (changedFields.length > 0) {
            msg += ` (${changedFields.join(', ')})`;
          }
        }
        return msg;
      }
      return detailsStr;
    } catch (e) {
      return detailsStr;
    }
  };

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.user || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.module || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesUser = selectedUser === '' || log.user === selectedUser;
    const matchesAction = selectedAction === '' || log.action === selectedAction;

    return matchesSearch && matchesUser && matchesAction;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#005ea4]" />
            Histori Pencatatan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat aktivitas pengguna, perubahan dokumen, dan akses ke dalam sistem.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari histori..." 
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]/30"
            />
          </div>
          
          <button
            onClick={confirmClearHistory}
            className="w-full sm:w-auto px-4.5 py-2 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs font-mono-data"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Histori</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Filter Data:</span>
        </div>
        
        {/* User filter */}
        <div className="flex items-center gap-2 text-xs">
          <label className="font-bold text-slate-600">Pengguna:</label>
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005ea4]/20 cursor-pointer"
          >
            <option value="">Semua Pengguna</option>
            {users.map(u => (
              <option key={u.id} value={u.nama}>{u.nama} ({u.npk || '-'})</option>
            ))}
          </select>
        </div>

        {/* Action filter */}
        <div className="flex items-center gap-2 text-xs">
          <label className="font-bold text-slate-600">Aksi:</label>
          <select 
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005ea4]/20 cursor-pointer"
          >
            <option value="">Semua Aksi</option>
            <option value="INSERT">INSERT (Tambah)</option>
            <option value="UPDATE">UPDATE (Edit)</option>
            <option value="DELETE">DELETE (Hapus)</option>
            <option value="LOGIN">LOGIN (Masuk)</option>
          </select>
        </div>

        {(selectedUser !== '' || selectedAction !== '' || searchQuery !== '') && (
          <button 
            onClick={() => { setSelectedUser(''); setSelectedAction(''); setSearchQuery(''); }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors ml-auto cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`px-4 py-3 rounded-lg border flex items-center gap-3 text-sm font-bold shadow-sm ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold w-48">Waktu & Tanggal</th>
                <th className="px-6 py-4 font-semibold w-48">Nama Pengguna</th>
                <th className="px-6 py-4 font-semibold w-32">Role</th>
                <th className="px-6 py-4 font-semibold w-24">Aksi</th>
                <th className="px-6 py-4 font-semibold w-40">Modul Target</th>
                <th className="px-6 py-4 font-semibold">Detail & Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-data text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500 font-sans italic">Memuat log aktivitas...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500 font-sans italic">Tidak ada histori aktivitas yang sesuai.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{log.user}</td>
                    <td className="px-6 py-4 text-slate-500">{log.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 capitalize">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {(log.module || '').replace(/-/g, ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-sans text-xs">
                      <div className="font-bold text-slate-800 font-mono-data mb-0.5">{log.target}</div>
                      <div>{renderDetails(log.details)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <DeleteConfirmModal 
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={executeClearHistory}
        itemName="Seluruh Histori Pencatatan"
      />
    </div>
  );
}
