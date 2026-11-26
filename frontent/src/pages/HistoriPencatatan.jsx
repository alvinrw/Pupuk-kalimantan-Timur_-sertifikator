import React, { useState, useEffect } from 'react';
import { 
  History, FileText, Search, User, SlidersHorizontal, Trash2, ChevronDown, 
  ChevronLeft, ChevronRight, Eye, X, Info, Code, CheckCircle, Clock, Shield
} from 'lucide-react';
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Modals & Notifications
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
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

  // Reset pagination to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedUser, selectedAction]);

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

  // State for raw JSON toggle in modal
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  const parseDetails = (detailsStr) => {
    if (!detailsStr) return null;
    try {
      return JSON.parse(detailsStr);
    } catch (e) {
      return null;
    }
  };

  const parseKeteranganValue = (val) => {
    if (typeof val === 'string' && val.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(val);
        if (parsed.keteranganAsli) return parsed.keteranganAsli;
        if (parsed.keterangan) return parsed.keterangan;
        if (parsed.text) return parsed.text;
      } catch(e) {}
    }
    return val;
  };

  const getFriendlyTargetName = (log) => {
    const target = log?.target || '';
    const parsed = parseDetails(log?.details);
    if (!parsed) return target;

    const searchObj = parsed.after || parsed.body || parsed.data || parsed;
    if (searchObj && typeof searchObj === 'object') {
      const name = searchObj.title || searchObj.jenisPeralatan || searchObj.namaSertifikat || searchObj.merekItem || searchObj.namaPegawai || searchObj.nama_asosiasi || searchObj.code || searchObj.noSertifikat;
      if (name && typeof name === 'string') {
        const shortId = target.length > 15 ? target.split('-')[0] : target;
        return `${name} (${shortId})`;
      }
    }
    return target;
  };

  const renderDetailsPreview = (detailsStr, log) => {
    if (!detailsStr && !log) return '-';
    const action = log?.action;
    const target = getFriendlyTargetName(log);
    const parsed = parseDetails(detailsStr);
    
    if (parsed) {
      if (parsed.message) return parsed.message;
      if (parsed.url) {
        if (parsed.url.includes('notification-setting')) return `Perubahan Pengaturan Notifikasi Pengingat (${target})`;
        if (parsed.url.includes('bulk-nested') || parsed.url.includes('csv-import')) return `Impor Data Massal (${target})`;
      }
    }

    if (action === 'INSERT') return `Menambahkan data baru: ${target}`;
    if (action === 'UPDATE') return `Mengubah / memperbarui data: ${target}`;
    if (action === 'DELETE') return `Menghapus data: ${target}`;
    if (action === 'LOGIN') return `Akses Login Pengguna: ${log?.user}`;

    return detailsStr || `${action} ${target}`;
  };

  const renderHumanReadableDetails = (detailsStr, log) => {
    const action = log?.action || 'AKTIFA';
    const user = log?.user || 'Pengguna';
    const target = getFriendlyTargetName(log);
    const moduleName = (log?.module || 'Sistem').replace(/-/g, ' ');

    let parsed = parseDetails(detailsStr);
    if (typeof parsed?.data === 'string') {
      try { parsed.data = JSON.parse(parsed.data); } catch (_) {}
    }
    if (typeof parsed?.body === 'string') {
      try { parsed.body = JSON.parse(parsed.body); } catch (_) {}
    }

    // Header Banner berdasarkan jenis Aksi (INSERT, UPDATE, DELETE, LOGIN)
    const getActionBanner = () => {
      if (action === 'INSERT') {
        return (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">Aksi: INSERT (Penambahan Data Baru)</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Pengguna <span className="font-bold text-slate-900">{user}</span> telah <span className="font-extrabold text-emerald-700 underline">menambahkan</span> data <span className="font-bold text-slate-900">{target}</span> baru pada modul <span className="font-bold text-slate-900 capitalize">{moduleName}</span>.
              </p>
            </div>
          </div>
        );
      }

      if (action === 'UPDATE') {
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 bg-[#005ea4] text-white rounded-xl shrink-0 shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#005ea4] uppercase tracking-wider">Aksi: UPDATE (Perubahan / Edit Data)</h4>
              <p className="text-xs text-slate-700 mt-0.5">
                Pengguna <span className="font-bold text-slate-900">{user}</span> telah <span className="font-extrabold text-[#005ea4] underline">memperbarui / mengubah</span> data <span className="font-bold text-slate-900">{target}</span> pada modul <span className="font-bold text-slate-900 capitalize">{moduleName}</span>.
              </p>
            </div>
          </div>
        );
      }

      if (action === 'DELETE') {
        return (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-rose-900 uppercase tracking-wider">Aksi: DELETE (Penghapusan Data)</h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Pengguna <span className="font-bold text-slate-900">{user}</span> telah <span className="font-extrabold text-rose-700 underline">menghapus</span> data <span className="font-bold text-slate-900">{target}</span> dari modul <span className="font-bold text-slate-900 capitalize">{moduleName}</span>.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-slate-700 text-white rounded-xl shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Aksi: {action} (Akses Masuk System)</h4>
            <p className="text-xs text-slate-700 mt-0.5">
              Pengguna <span className="font-bold text-slate-900">{user}</span> berhasil melakukan login ke dalam aplikasi PERISAI.
            </p>
          </div>
        </div>
      );
    };

    const bulkItems = Array.isArray(parsed?.data) ? parsed.data : (Array.isArray(parsed?.items) ? parsed.items : null);
    const changes = parsed?.changes || (parsed?.before && parsed?.after ? { before: parsed.before, after: parsed.after } : null);
    const bodyData = parsed?.body || (typeof parsed === 'object' && !parsed?.message && !changes && !bulkItems ? parsed : null);

    return (
      <div className="space-y-4 font-sans">
        {/* Header Penjelasan Aksi */}
        {getActionBanner()}

        {/* Catatan Tambahan */}
        {parsed?.message && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#005ea4] shrink-0" />
            <span>{parsed.message}</span>
          </div>
        )}

        {/* Rincian Bulk Import */}
        {bulkItems && bulkItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rincian {bulkItems.length} Data Yang Dimasukkan (CSV Import)</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="px-3.5 py-2.5 w-10">No</th>
                    <th className="px-3.5 py-2.5">Nama Item / Alat</th>
                    <th className="px-3.5 py-2.5">Kode Tag</th>
                    <th className="px-3.5 py-2.5">Tipe & Lokasi</th>
                    <th className="px-3.5 py-2.5">Sertifikat Terkait</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {bulkItems.map((item, idx) => {
                    const m = item.master || item;
                    const certs = item.certificates || m.certificates || [];
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3.5 py-2 font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-3.5 py-2 font-bold text-slate-900">{m.title || '-'}</td>
                        <td className="px-3.5 py-2 font-mono text-slate-600 font-semibold">{m.code || '-'}</td>
                        <td className="px-3.5 py-2 text-slate-600">
                          <div className="font-medium text-slate-800">{m.tipe || '-'}</div>
                          <div className="text-[11px] text-slate-500">{m.unitLocation || '-'}</div>
                        </td>
                        <td className="px-3.5 py-2 text-slate-600">
                          {certs.length > 0 ? (
                            <div className="space-y-1">
                              {certs.map((c, cIdx) => (
                                <div key={cIdx} className="text-[11px] bg-blue-50 text-[#005ea4] px-2 py-0.5 rounded border border-blue-100 font-semibold">
                                  {c.namaSertifikat} ({c.noSertifikat})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Tanpa sertifikat</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabel Komparatif Perubahan (Sebelumnya -> Sesudah) */}
        {changes && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#005ea4]" />
              <span>Perbandingan Nilai Perubahan (Sebelumnya → Sesudah)</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Field / Atribut</th>
                    <th className="px-4 py-2.5 text-rose-700 bg-rose-50/70">Nilai Sebelum (Lama)</th>
                    <th className="px-4 py-2.5 text-emerald-700 bg-emerald-50/70">Nilai Sesudah (Baru)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans text-xs">
                  {Object.keys({ ...(changes.after || {}), ...(changes.before || {}) }).map((key) => {
                    let valBefore = changes.before ? changes.before[key] : '-';
                    let valAfter = changes.after ? changes.after[key] : '-';
                    
                    valBefore = parseKeteranganValue(valBefore);
                    valAfter = parseKeteranganValue(valAfter);
                    
                    if (valBefore === valAfter) return null;
                    return (
                      <tr key={key} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-slate-800">{key}</td>
                        <td className="px-4 py-2.5 text-rose-700 bg-rose-50/30 font-medium break-all">{String(valBefore ?? '-')}</td>
                        <td className="px-4 py-2.5 text-emerald-700 bg-emerald-50/30 font-bold break-all">{String(valAfter ?? '-')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* General Parameter Key-Value */}
        {!bulkItems && !changes && bodyData && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rincian Data Parameter ({action})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(bodyData).map(([key, val]) => {
                if (key === 'method' || key === 'url') return null;
                let label = key;
                if (key === 'certificateId') label = 'ID Sertifikat Terhubung';
                else if (key === 'isEnabled') label = 'Status Alarm Notifikasi';
                else if (key === 'triggerType') label = 'Tipe Pengingat Waktu';
                else if (key === 'triggerDays') label = 'Set Pengingat (Hari Sebelum Expired)';
                else if (key === 'penanggungJawab') label = 'Penanggung Jawab';
                else if (key === 'unitLocation') label = 'Lokasi Unit';

                let formattedVal = parseKeteranganValue(val);
                if (typeof formattedVal === 'boolean') formattedVal = formattedVal ? 'Aktif (Berjalan)' : 'Nonaktif (Mati)';
                else if (formattedVal === null || formattedVal === undefined) formattedVal = '-';
                else if (typeof formattedVal === 'object') formattedVal = JSON.stringify(formattedVal);

                return (
                  <div key={key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                    <span className="text-xs font-bold text-slate-800 font-sans break-all">{String(formattedVal)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
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

  // Pagination calculation
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

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
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]/30 bg-white"
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
        <div className="flex items-center gap-2 text-xs relative z-30">
          <label className="font-bold text-slate-600">Pengguna:</label>
          <div className="relative">
            <button
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
                setIsActionDropdownOpen(false);
              }}
              className="flex items-center justify-between gap-2 min-w-[160px] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005ea4]/20 cursor-pointer"
            >
              <span className="truncate">{selectedUser || 'Semua Pengguna'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute left-0 top-full mt-1 w-full min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto max-h-64 origin-top transition-all duration-200 ease-out ${isUserDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'}`}>
              <button
                onClick={() => { setSelectedUser(''); setIsUserDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${selectedUser === '' ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                Semua Pengguna
              </button>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUser(u.nama); setIsUserDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${selectedUser === u.nama ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {u.nama} ({u.npk || '-'})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action filter */}
        <div className="flex items-center gap-2 text-xs relative z-20">
          <label className="font-bold text-slate-600">Aksi:</label>
          <div className="relative">
            <button
              onClick={() => {
                setIsActionDropdownOpen(!isActionDropdownOpen);
                setIsUserDropdownOpen(false);
              }}
              className="flex items-center justify-between gap-2 min-w-[140px] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005ea4]/20 cursor-pointer"
            >
              <span className="truncate">
                {selectedAction === '' ? 'Semua Aksi' : 
                 selectedAction === 'INSERT' ? 'INSERT (Tambah)' :
                 selectedAction === 'UPDATE' ? 'UPDATE (Edit)' :
                 selectedAction === 'DELETE' ? 'DELETE (Hapus)' :
                 'LOGIN (Masuk)'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isActionDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`absolute left-0 top-full mt-1 w-full min-w-[160px] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden origin-top transition-all duration-200 ease-out ${isActionDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'}`}>
              {[
                { value: '', label: 'Semua Aksi' },
                { value: 'INSERT', label: 'INSERT (Tambah)' },
                { value: 'UPDATE', label: 'UPDATE (Edit)' },
                { value: 'DELETE', label: 'DELETE (Hapus)' },
                { value: 'LOGIN', label: 'LOGIN (Masuk)' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSelectedAction(opt.value); setIsActionDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${selectedAction === opt.value ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
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

      {/* TABLE DATA */}
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
                paginatedLogs.map((log) => (
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
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 max-w-xl">
                          <div className="font-bold text-slate-800 font-mono-data">{log.target}</div>
                          <div className="text-slate-500 text-[11px] line-clamp-2 break-all font-mono">
                            {renderDetailsPreview(log.details, log)}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedLogDetail(log)}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005ea4] bg-blue-50 hover:bg-[#005ea4] hover:text-white rounded-lg border border-blue-200 transition-all cursor-pointer shadow-xs"
                          title="Lihat Detail & Aksi Lebih Lanjut"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Detail</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!isLoading && filteredLogs.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
            <div className="text-xs text-slate-500">
              Menampilkan <span className="font-bold text-slate-800">{totalItems > 0 ? startIndex + 1 : 0}</span> sampai <span className="font-bold text-slate-800">{endIndex}</span> dari <span className="font-bold text-slate-800">{totalItems}</span> data
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-200/70 rounded-lg">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-[#005ea4] rounded-lg">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Rincian Activity Log</h3>
                  <p className="text-xs text-slate-500">Detail data dan histori perubahan aktivitas pengguna</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLogDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Waktu & Tanggal</span>
                  <span className="font-semibold text-slate-800 font-mono-data">
                    {new Date(selectedLogDetail.timestamp).toLocaleString('id-ID', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Nama Pengguna</span>
                  <span className="font-bold text-slate-900">{selectedLogDetail.user}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Role</span>
                  <span className="font-semibold text-slate-700">{selectedLogDetail.role}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Aksi</span>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getBadgeColor(selectedLogDetail.action)}`}>
                    {selectedLogDetail.action}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Modul Target</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {(selectedLogDetail.module || '').replace(/-/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Target Key / Ref</span>
                  <span className="font-mono font-semibold text-[#005ea4]">
                    {getFriendlyTargetName(selectedLogDetail)}
                  </span>
                </div>
              </div>

              {/* Human Readable Details Section */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-[#005ea4]" />
                    <span>Rincian & Informasi Perubahan</span>
                  </div>

                  <button
                    onClick={() => setShowRawJsonModal(!showRawJsonModal)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-[#005ea4] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{showRawJsonModal ? 'Sembunyikan JSON Mentah' : 'Lihat JSON Mentah (Dev Mode)'}</span>
                  </button>
                </div>

                {/* Main Human-Readable Render */}
                {!showRawJsonModal ? (
                  renderHumanReadableDetails(selectedLogDetail.details, selectedLogDetail)
                ) : (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-80 border border-slate-800 animate-in fade-in">
                    {parseDetails(selectedLogDetail.details) ? (
                      <pre className="whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(parseDetails(selectedLogDetail.details), null, 2)}
                      </pre>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
                        {selectedLogDetail.details || 'Tidak ada rincian tambahan.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      
      <DeleteConfirmModal 
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={executeClearHistory}
        itemName="Seluruh Histori Pencatatan"
      />
    </div>
  );
}

