import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  X,
  Edit2,
  AlertTriangle,
  Settings,
  History,
  Columns,
  ChevronDown
} from 'lucide-react';
import useIuranKeanggotaan from '../hooks/useIuranKeanggotaan';
import { deleteIuranKeanggotaan } from '../services/iuranService';
import IuranFormModal from '../components/IuranFormModal';

export default function IuranKeanggotaan() {
  const {
    data,
    loading,
    error,
    isModalOpen,
    modalMode,
    formData,
    isSubmitting,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
    handleDelete: defaultHandleDelete,
    setData,
  } = useIuranKeanggotaan();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKompartemen, setFilterKompartemen] = useState('');
  const [isKompartemenFilterOpen, setIsKompartemenFilterOpen] = useState(false);

  const uniqueKompartemen = useMemo(() => {
    const list = data.map(item => item.kompartemen).filter(Boolean);
    return [...new Set(list)].sort();
  }, [data]);

  const [rowConfirmModalOpen, setRowConfirmModalOpen] = useState(false);
  const [pendingDeleteRowItem, setPendingDeleteRowItem] = useState(null);
  const [historyModalItem, setHistoryModalItem] = useState(null);

  // Column Selection
  const allColumns = [
    { key: "kompartemen", label: "KOMPARTEMEN" },
    { key: "unitKerja", label: "UNIT KERJA" },
    { key: "asosiasi", label: "ASOSIASI" },
    { key: "periode", label: "TAHUN AKTIF" },
    { key: "nominal", label: "NOMINAL" },
    { key: "status", label: "STATUS" },
    { key: "nama", label: "NAMA" },
    { key: "npk", label: "NPK" },
    { key: "keterangan", label: "KETERANGAN" }
  ];

  const [visibleColumnKeys, setVisibleColumnKeys] = useState(allColumns.map(c => c.key));
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map(c => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  const requestDeleteRow = (item) => {
    setPendingDeleteRowItem(item);
    setRowConfirmModalOpen(true);
  };

  const confirmDeleteRow = async () => {
    if (!pendingDeleteRowItem) return;
    try {
      await deleteIuranKeanggotaan(pendingDeleteRowItem.id);
      setData(prev => prev.filter(item => item.id !== pendingDeleteRowItem.id));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data dari database.');
    } finally {
      setRowConfirmModalOpen(false);
      setPendingDeleteRowItem(null);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        (item.kompartemen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.unitKerja || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.asosiasi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.npk || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchKompartemen = filterKompartemen
        ? item.kompartemen === filterKompartemen
        : true;

      return matchSearch && matchKompartemen;
    });
  }, [data, searchTerm, filterKompartemen]);

  return (
    <div className="p-6 space-y-6 font-sans-clean">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-[#0F172A]">
            Iuran Keanggotaan Sertifikasi & Profesi
          </h2>
          <p className="text-xs text-[#64748B] font-mono-data">
            Daftar iuran keanggotaan institusi, sertifikasi badan usaha, dan asosiasi profesi karyawan
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Input Data Iuran</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-3 relative">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707783]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan Kompartemen, Unit Kerja, Asosiasi, Nama, atau NPK..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
            {filteredData.length} data ditemukan
          </div>

          {filterKompartemen && (
            <button
              onClick={() => setFilterKompartemen('')}
              className="text-xs font-bold text-rose-700 hover:underline px-2.5 py-1 bg-rose-50 rounded border border-rose-200 cursor-pointer"
            >
              Reset Filter Kompartemen
            </button>
          )}

          {/* Column Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs cursor-pointer"
            >
              <Columns className="w-4 h-4 text-[#005ea4]" />
              <span>Pilih Kolom ({visibleColumnKeys.length}/{allColumns.length})</span>
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute right-0 top-10 z-40 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 space-y-2 text-xs font-sans-clean">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-xs">Centang Kolom yang Tampil</span>
                  <button
                    onClick={selectAllColumns}
                    className="text-[11px] font-mono-data font-bold text-[#005ea4] hover:underline cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {allColumns.map((col) => {
                    const checked = isVisible(col.key);
                    return (
                      <label
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-blue-50 text-[#005ea4] font-semibold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-slate-300 accent-[#005ea4]"
                        />
                        <span className="text-xs">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none text-center align-middle">
                <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">NO.</th>
                {isVisible('kompartemen') && (
                  <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap bg-blue-50/60 text-center align-middle border-r border-slate-200/50">
                    <div className="flex items-center justify-center gap-1.5 relative">
                      <span>KOMPARTEMEN</span>
                      <button
                        onClick={() => setIsKompartemenFilterOpen(!isKompartemenFilterOpen)}
                        className="p-1 hover:bg-white/80 rounded transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      {isKompartemenFilterOpen && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-left font-normal normal-case">
                          <button
                            onClick={() => { setFilterKompartemen(''); setIsKompartemenFilterOpen(false); }}
                            className={`w-full px-3 py-1.5 text-xs hover:bg-slate-50 text-left ${!filterKompartemen ? 'font-bold text-[#005ea4]' : 'text-slate-700'}`}
                          >
                            Semua Kompartemen
                          </button>
                          {uniqueKompartemen.map((k, idx) => (
                            <button
                              key={idx}
                              onClick={() => { setFilterKompartemen(k); setIsKompartemenFilterOpen(false); }}
                              className={`w-full px-3 py-1.5 text-xs hover:bg-slate-50 text-left truncate ${filterKompartemen === k ? 'font-bold text-[#005ea4]' : 'text-slate-700'}`}
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                )}
                {isVisible('unitKerja') && <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">UNIT KERJA</th>}
                {isVisible('asosiasi') && <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">ASOSIASI</th>}
                {isVisible('periode') && (
                  <>
                    <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">TAHUN PENDAFTARAN</th>
                    <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">TAHUN AKTIF</th>
                  </>
                )}
                {isVisible('nominal') && <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">NOMINAL</th>}
                {isVisible('status') && <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">STATUS</th>}
                {isVisible('nama') && <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">NAMA</th>}
                {isVisible('npk') && <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">NPK</th>}
                {isVisible('keterangan') && <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">KETERANGAN</th>}
                <th rowSpan={2} className="py-3.5 px-4 font-bold text-center whitespace-nowrap align-middle">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-rose-500">
                    {error}
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-[#64748B] font-mono-data">
                    Tidak ada data yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors font-mono-data text-xs border-b border-slate-200 align-middle">
                    <td className="py-3.5 px-4 font-bold text-slate-700 text-center align-middle">{index + 1}</td>
                    {isVisible('kompartemen') && <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap text-center align-middle">{item.kompartemen || '-'}</td>}
                    {isVisible('unitKerja') && <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">{item.unitKerja || '-'}</td>}
                    {isVisible('asosiasi') && <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap text-center align-middle">{item.asosiasi || '-'}</td>}
                    {isVisible('periode') && (() => {
                      let tDaftar = '-';
                      let tAkhir = '-';
                      if (item.periode && item.periode.includes(' s/d ')) {
                        const parts = item.periode.split(' s/d ');
                        tDaftar = parts[0].substring(0, 4);
                        tAkhir = parts[1].substring(0, 4);
                      } else if (item.periode) {
                        tDaftar = item.periode.substring(0, 4);
                        tAkhir = '-';
                      }
                      return (
                        <>
                          <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle font-semibold text-[#005ea4] bg-blue-50/20">{tDaftar}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle font-semibold text-rose-600 bg-rose-50/20">{tAkhir}</td>
                        </>
                      );
                    })()}
                    {isVisible('nominal') && (
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap text-center align-middle">
                        {item.nominal ? `Rp ${item.nominal.toLocaleString('id-ID')}` : '-'}
                      </td>
                    )}
                    {isVisible('status') && (
                      <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          item.status === 'Perusahaan' ? 'bg-blue-100 text-blue-700' : 
                          item.status === 'Karyawan' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status || '-'}
                        </span>
                      </td>
                    )}
                    {isVisible('nama') && <td className="py-3.5 px-4 font-medium whitespace-nowrap text-center align-middle">{item.nama || '-'}</td>}
                    {isVisible('npk') && <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-center align-middle">{item.npk || '-'}</td>}
                    {isVisible('keterangan') && <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-center align-middle">{item.keterangan || '-'}</td>}
                    <td className="py-3 px-4 text-center whitespace-nowrap align-middle">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setHistoryModalItem(item);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-[#005ea4] text-[#005ea4] rounded-lg shadow-sm font-bold text-[10px] hover:bg-blue-50 transition-colors mt-1 w-full max-w-[90px] cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Riwayat</span>
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

      {/* Input / Edit Form Modal */}
      <IuranFormModal
        isOpen={isModalOpen}
        modalMode={modalMode}
        formData={formData}
        isSubmitting={isSubmitting}
        handleCloseModal={handleCloseModal}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      {rowConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-8 text-center space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-xl text-slate-900 mt-2">Konfirmasi Hapus Data</h4>
              <p className="text-sm text-slate-600 font-medium">
                Apakah Anda yakin ingin menghapus seluruh data untuk <br />
                <span className="font-bold text-slate-800">"{pendingDeleteRowItem?.asosiasi || '-'}"</span> ?<br />
                Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="w-full border-t border-slate-100 mt-4 pt-6"></div>
              
              <div className="flex justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setRowConfirmModalOpen(false);
                    setPendingDeleteRowItem(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors border border-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteRow}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
                >
                  Ya, Hapus Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-sans-clean" onClick={() => setHistoryModalItem(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                Riwayat Input Data
              </h3>
              <button 
                onClick={() => setHistoryModalItem(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Data ini pertama kali diinput pada:</p>
              <p className="text-lg font-bold text-slate-800">
                {historyModalItem.createdAt 
                  ? new Date(historyModalItem.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Baru saja'}
              </p>
            </div>
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleOpenEditModal(historyModalItem);
                    setHistoryModalItem(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Data
                </button>
              </div>
              <button
                onClick={() => setHistoryModalItem(null)}
                className="w-full px-4 py-2 text-sm font-bold text-white bg-[#005ea4] rounded-lg hover:bg-[#004d88] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
