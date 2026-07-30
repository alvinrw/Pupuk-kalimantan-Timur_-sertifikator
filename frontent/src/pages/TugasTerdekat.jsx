import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Eye,
  RefreshCw,
  Bell,
  ArrowUpDown
} from 'lucide-react';
import { API_BASE } from '../config/api';
import DocumentDetailPage from './DocumentDetailPage';

export default function TugasTerdekat() {
  const [data, setData] = useState({ stats: null, bannerTasks: [], allTasks: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Sort State
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('prioritas'); // prioritas, terdekat, expired, nama
  
  // Navigation State
  const [selectedDetailDoc, setSelectedDetailDoc] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/master-items/reminders/tasks`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Gagal mengambil data Tugas Terdekat", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Badge Color
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Expired': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Segera Expired': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Mulai Hari Ini': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reminder Aktif': return 'bg-blue-100 text-[#005ea4] border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200'; // Belum Aktif
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 1: return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 2: return <Clock className="w-4 h-4 text-orange-600" />;
      case 3: return <Bell className="w-4 h-4 text-amber-600" />;
      case 4: return <CheckCircle2 className="w-4 h-4 text-[#005ea4]" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  // Filter Logic (Frontend only filters the data provided by Backend)
  let filteredTasks = data.allTasks.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.namaPeralatan?.toLowerCase().includes(q) &&
        !t.nomorSertifikat?.toLowerCase().includes(q) &&
        !t.namaSertifikat?.toLowerCase().includes(q) &&
        !t.unitPabrik?.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Reminder Aktif') return t.isTriggered;
    if (activeFilter === 'Expired') return t.statusReminder === 'Expired';
    if (activeFilter === 'Hari Ini') return t.statusReminder === 'Mulai Hari Ini';

    // We don't have explicit minggu/bulan tags per task from backend yet, 
    // but we can fallback to 'isTriggered' or simply 'Semua' for now, 
    // or we can just filter by stats if backend provided them. 
    // For simplicity, assuming backend already provided 'isTriggered'.
    if (activeFilter === 'Belum Aktif') return !t.isTriggered;

    return true;
  });

  // Sort Logic
  filteredTasks.sort((a, b) => {
    if (sortBy === 'prioritas') {
      if (a.prioritas !== b.prioritas) return a.prioritas - b.prioritas;
      return a.sisaHari - b.sisaHari;
    }
    if (sortBy === 'terdekat') {
      return a.sisaHari - b.sisaHari;
    }
    if (sortBy === 'expired') {
      return new Date(a.tanggalExpired).getTime() - new Date(b.tanggalExpired).getTime();
    }
    if (sortBy === 'nama') {
      return (a.namaPeralatan || '').localeCompare(b.namaPeralatan || '');
    }
    return 0;
  });

  // Drag to scroll logic for banner
  const scrollRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (selectedDetailDoc) {
    return (
      <DocumentDetailPage 
        item={selectedDetailDoc}
        onBack={() => {
          setSelectedDetailDoc(null);
          fetchData(); // Refresh data in case something was resolved
        }}
        onSaveUpdate={(updatedItem) => {
          setSelectedDetailDoc(updatedItem);
          fetchData();
        }}
        onDeleteSuccess={() => setSelectedDetailDoc(null)}
        onRefreshRequired={fetchData}
      />
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 font-sans-clean">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#005ea4]" />
            Tugas Terdekat
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pusat aktivitas dan pengingat (Reminder) untuk perpanjangan sertifikat & perizinan.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveFilter('Reminder Aktif')}
          className={`bg-white p-4 rounded-xl border cursor-pointer hover:border-[#005ea4] transition-colors ${activeFilter === 'Reminder Aktif' ? 'border-[#005ea4] ring-1 ring-[#005ea4]' : 'border-slate-200'}`}
        >
          <div className="text-sm text-slate-500 mb-1">Reminder Aktif</div>
          <div className="text-2xl font-bold text-[#005ea4]">{data.stats?.aktif || 0}</div>
        </div>
        <div
          onClick={() => setActiveFilter('Hari Ini')}
          className={`bg-white p-4 rounded-xl border cursor-pointer hover:border-amber-400 transition-colors ${activeFilter === 'Hari Ini' ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-200'}`}
        >
          <div className="text-sm text-slate-500 mb-1">Mulai Hari Ini</div>
          <div className="text-2xl font-bold text-amber-600">{data.stats?.hariIni || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 opacity-70">
          <div className="text-sm text-slate-500 mb-1">Minggu Ini</div>
          <div className="text-2xl font-bold text-slate-700">{data.stats?.mingguIni || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 opacity-70">
          <div className="text-sm text-slate-500 mb-1">Bulan Ini</div>
          <div className="text-2xl font-bold text-slate-700">{data.stats?.bulanIni || 0}</div>
        </div>
        <div
          onClick={() => setActiveFilter('Expired')}
          className={`bg-white p-4 rounded-xl border cursor-pointer hover:border-rose-400 transition-colors ${activeFilter === 'Expired' ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'}`}
        >
          <div className="text-sm text-slate-500 mb-1">Dokumen Expired</div>
          <div className="text-2xl font-bold text-rose-600">{data.stats?.expired || 0}</div>
        </div>
      </div>

      {/* BANNER PRIORITAS */}
      {data.bannerTasks.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Segera Tindak Lanjuti
            </h3>
          </div>
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-rose-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-rose-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-rose-400`}
          >
            {data.bannerTasks.map((t, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-between shrink-0 w-72 snap-start">
                <div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-3 border ${getBadgeStyle(t.statusReminder)}`}>
                    {t.statusReminder}
                  </div>
                  <div className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug mb-1" title={t.namaPeralatan}>{t.namaPeralatan}</div>
                  <div className="text-xs text-slate-500 font-mono-data truncate" title={t.nomorSertifikat}>{t.nomorSertifikat}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Expired: {t.tanggalExpired}
                  </div>
                  <button 
                    onClick={() => setSelectedDetailDoc(t.rawItem)}
                    className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors shrink-0"
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER & TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['Semua', 'Reminder Aktif', 'Hari Ini', 'Belum Aktif', 'Expired'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${activeFilter === f
                    ? 'bg-[#005ea4] text-white'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari aset atau sertifikat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#005ea4] focus:outline-none w-full sm:w-64"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005ea4] appearance-none pr-8 bg-white"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
            >
              <option value="prioritas">Sort: Prioritas Tertinggi</option>
              <option value="terdekat">Sort: Reminder Terdekat</option>
              <option value="expired">Sort: Tanggal Expired</option>
              <option value="nama">Sort: Nama Peralatan</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wider">
                <th className="p-3 font-bold">Prioritas</th>
                <th className="p-3 font-bold">Peralatan / Aset</th>
                <th className="p-3 font-bold">Lokasi & PIC</th>
                <th className="p-3 font-bold">Sertifikat</th>
                <th className="p-3 font-bold">Tgl Mulai Reminder</th>
                <th className="p-3 font-bold">Tgl Expired</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-sm">
                    Memuat data tugas...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-sm">
                    Tidak ada data tugas yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center">
                      <div className="flex justify-center" title={`Prioritas ${task.prioritas}`}>
                        {getPriorityIcon(task.prioritas)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800 text-xs">{task.namaPeralatan}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800 text-xs">{task.unitPabrik}</div>
                      <div className="text-[10px] text-slate-500 font-mono-data">{task.penanggungJawab}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#005ea4] text-xs">{task.namaSertifikat}</div>
                      <div className="text-[10px] text-slate-500 font-mono-data">{task.nomorSertifikat}</div>
                    </td>
                    <td className="p-3 text-xs text-slate-600 font-mono-data">
                      {task.tanggalMulaiReminder}
                    </td>
                    <td className="p-3 text-xs text-rose-600 font-bold font-mono-data">
                      {task.tanggalExpired}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold border rounded-lg whitespace-nowrap ${getBadgeStyle(task.statusReminder)}`}>
                        {task.statusReminder}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedDetailDoc(task.rawItem)}
                          className="p-1.5 text-slate-400 hover:text-[#005ea4] hover:bg-blue-50 rounded transition-colors" title="Lihat Detail & Perpanjang"
                        >
                          <Eye className="w-4 h-4" />
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

    </div>
  );
}
