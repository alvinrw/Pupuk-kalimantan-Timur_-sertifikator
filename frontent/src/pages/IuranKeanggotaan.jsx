import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  X,
  Save,
  Trash2,
  Edit2,
  AlertTriangle,
  Settings,
  History,
  Columns,
  ChevronDown
} from 'lucide-react';
import useIuranKeanggotaan from '../hooks/useIuranKeanggotaan';
import { deleteIuranKeanggotaan } from '../services/iuranService';

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
  const [selectedFile, setSelectedFile] = useState(null);

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
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  };

  const selectAllColumns = () => setVisibleColumnKeys(allColumns.map(c => c.key));
  const isVisible = (key) => visibleColumnKeys.includes(key);

  const confirmDeleteRow = async () => {
    if (!pendingDeleteRowItem) return;
    try {
      await deleteIuranKeanggotaan(pendingDeleteRowItem.id);
      setData(prev => prev.filter(item => item.id !== pendingDeleteRowItem.id));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus baris dari database.");
    } finally {
      setRowConfirmModalOpen(false);
      setPendingDeleteRowItem(null);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = (
        (item.asosiasi || '').toLowerCase().includes(searchLower) ||
        (item.nama || '').toLowerCase().includes(searchLower) ||
        (item.unitKerja || '').toLowerCase().includes(searchLower)
      );
      
      const matchKompartemen = filterKompartemen === '' || item.kompartemen === filterKompartemen;
      
      return matchSearch && matchKompartemen;
    });
  }, [data, searchTerm, filterKompartemen]);

  return (
    <>
      <div className="p-6 space-y-6 font-sans-clean min-h-full bg-slate-50">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-xl text-[#0F172A]">
              Manajemen Iuran & Anggaran
            </h2>
            <p className="text-xs text-[#64748B] font-mono-data">
              Sistem pemantauan status iuran keanggotaan dan alokasi anggaran asosiasi.
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setSelectedFile(null);
                handleOpenAddModal();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Data</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-sm flex flex-wrap items-center justify-between gap-3 relative">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama, Asosiasi, atau Unit Kerja..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono-data">
              {filteredData.length} data ditemukan
            </div>
            
            {/* COLUMN VISIBILITY */}
            <div className="relative">
              <button
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-sm transition-colors"
              >
                <Columns className="w-4 h-4 text-[#005ea4]" />
                <span>Kolom & Filter</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isColumnMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Popover */}
              <div 
                className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 space-y-1 text-xs font-sans-clean z-40 transition-all duration-300 ease-out origin-top-right ${
                  isColumnMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 px-1 pt-1">
                  <span className="font-bold text-slate-900 text-xs">Visibilitas Kolom</span>
                    <button
                      onClick={selectAllColumns}
                      className="text-[10px] font-mono-data font-bold text-[#005ea4] hover:underline"
                    >
                      Pilih Semua
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1 pt-1">
                    {allColumns.map((col) => (
                      <div key={col.key} className="flex flex-col">
                        <label className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isVisible(col.key)}
                            onChange={() => toggleColumn(col.key)}
                            className="rounded border-slate-300 accent-[#005ea4] w-3.5 h-3.5"
                          />
                          <span className="text-xs font-medium text-slate-700">{col.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none text-center align-middle">
                  <th rowSpan={2} className="py-3.5 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">NO.</th>
                  {isVisible('kompartemen') && (
                    <th rowSpan={2} className="py-2 px-4 font-bold whitespace-nowrap text-center align-middle border-r border-slate-200/50">
                      <div className="flex flex-row items-center justify-center gap-2 relative">
                        <span>KOMPARTEMEN</span>
                        <button
                          onClick={() => setIsKompartemenFilterOpen(!isKompartemenFilterOpen)}
                          className="flex items-center justify-between px-2 py-1 bg-white border border-slate-300 rounded text-[10px] w-40 text-slate-700 hover:border-blue-400 transition-colors font-normal shadow-sm gap-2"
                        >
                          <span className="truncate">{filterKompartemen || "Semua Kompartemen"}</span>
                          <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isKompartemenFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <>
                          {isKompartemenFilterOpen && (
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setIsKompartemenFilterOpen(false)}
                            />
                          )}
                          <div 
                            className={`absolute top-[110%] left-1/2 -translate-x-1/2 mt-1 w-48 min-w-max bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col font-normal text-left transition-all duration-300 ease-out origin-top ${
                              isKompartemenFilterOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                          >
                            <button
                              onClick={() => { setFilterKompartemen(''); setIsKompartemenFilterOpen(false); }}
                              className={`text-left px-3 py-2 text-xs hover:bg-slate-50 ${filterKompartemen === '' ? 'font-bold text-[#005ea4] bg-slate-50' : 'text-slate-700'}`}
                            >
                              Semua Kompartemen
                            </button>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div className="max-h-48 overflow-y-auto flex flex-col">
                              {uniqueKompartemen.map((k) => (
                                <button
                                  key={k}
                                  onClick={() => { setFilterKompartemen(k); setIsKompartemenFilterOpen(false); }}
                                  className={`text-left px-3 py-2 text-xs hover:bg-slate-50 truncate ${filterKompartemen === k ? 'font-bold text-[#005ea4] bg-slate-50' : 'text-slate-700'}`}
                                >
                                  {k}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
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
                {/* Baris sub-header dihilangkan karena TAHUN PENDAFTARAN & AKTIF sudah naik ke rowSpan 2 */}
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
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-[#005ea4] text-[#005ea4] rounded-lg shadow-sm font-bold text-[10px] hover:bg-blue-50 transition-colors mt-1 w-full max-w-[90px]"
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
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-sans-clean">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#005ea4] text-white flex-shrink-0">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {modalMode === 'add' ? 'Input Data Iuran Baru' : 'Edit Data Iuran'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Lengkapi form di bawah dengan data yang valid
                  </p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 mt-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="iuranForm" onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Kompartemen <span className="text-red-500">*</span></label>
                  <select
                    name="kompartemen"
                    value={formData.kompartemen}
                    onChange={handleInputChange}
                    required
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  >
                    <option value="">-- Pilih Kompartemen --</option>
                    <option value="Manajemen Keuangan">Manajemen Keuangan</option>
                    <option value="Satuan Pengawasan Intern">Satuan Pengawasan Intern</option>
                    <option value="Sekretaris Perusahaan">Sekretaris Perusahaan</option>
                    <option value="HSE dan Teknologi">HSE dan Teknologi</option>
                    <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Unit Kerja <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="unitKerja"
                    value={formData.unitKerja}
                    onChange={handleInputChange}
                    required
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Asosiasi <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="asosiasi"
                      value={formData.asosiasi}
                      onChange={handleInputChange}
                      required
                      placeholder="misal: Asosiasi Profesi Keuangan"
                      className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Nama <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      required
                      className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Status <span className="text-red-500">*</span></label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    >
                      <option value="">-- Pilih Status --</option>
                      <option value="Karyawan">Karyawan</option>
                      <option value="Perusahaan">Perusahaan</option>
                    </select>
                  </div>
                  {formData.status === 'Karyawan' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">NPK</label>
                      <input
                        type="text"
                        name="npk"
                        value={formData.npk}
                        onChange={handleInputChange}
                        className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Tahun Pendaftaran <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="2024"
                        name="tanggalMulai"
                        value={formData.tanggalMulai}
                        onChange={handleInputChange}
                        required
                        className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none font-mono-data"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Tahun Aktif</label>
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="2025"
                        name="tanggalSelesai"
                        value={formData.tanggalSelesai}
                        onChange={handleInputChange}
                        className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none font-mono-data"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Nominal (Rp) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="nominal"
                      value={formData.nominal}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                      className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Keterangan</label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:bg-white focus:border-[#005ea4] focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white hover:text-slate-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="iuranForm"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#005ea4] hover:bg-[#004780] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL BEFORE DELETING ROW */}
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
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteRow}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors"
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
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Data
                </button>
              </div>
              <button
                onClick={() => setHistoryModalItem(null)}
                className="w-full px-4 py-2 text-sm font-bold text-white bg-[#005ea4] rounded-lg hover:bg-[#004d88] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
