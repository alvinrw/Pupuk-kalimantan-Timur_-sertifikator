import React from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import useIuranKeanggotaan from '../hooks/useIuranKeanggotaan';

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
    handleDelete,
  } = useIuranKeanggotaan();

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <UserGroupIcon className="w-8 h-8 text-[#005ea4]" />
                Iuran Keanggotaan
              </h1>
              <p className="text-slate-500 mt-1">Kelola data pemantauan anggaran iuran asosiasi</p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-[#005ea4] hover:bg-[#004780] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Tambah Iuran
            </button>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Nomer</th>
                    <th className="px-6 py-4">Asosiasi / Kompartemen</th>
                    <th className="px-6 py-4">Unit Kerja</th>
                    <th className="px-6 py-4">Nama / NPK</th>
                    <th className="px-6 py-4">Periode</th>
                    <th className="px-6 py-4">Nominal</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-slate-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-rose-500">
                        {error}
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-slate-500">
                        Belum ada data iuran.
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{index + 1}</td>
                        <td className="px-6 py-4">{item.nomer || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-700">{item.asosiasi || '-'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.kompartemen || '-'}</div>
                        </td>
                        <td className="px-6 py-4">{item.unitKerja || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{item.nama || '-'}</div>
                          <div className="text-xs text-slate-500">{item.npk ? `NPK: ${item.npk}` : '-'}</div>
                        </td>
                        <td className="px-6 py-4">{item.periode || '-'}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {item.nominal ? `Rp ${item.nominal.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status || 'Belum Lunas'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Data"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Data"
                            >
                              <TrashIcon className="w-4 h-4" />
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
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {modalMode === 'add' ? 'Tambah Iuran Baru' : 'Edit Iuran'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="iuranForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomer</label>
                    <input
                      type="text"
                      name="nomer"
                      value={formData.nomer}
                      onChange={handleInputChange}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Kompartemen</label>
                    <input
                      type="text"
                      name="kompartemen"
                      value={formData.kompartemen}
                      onChange={handleInputChange}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit Kerja</label>
                    <input
                      type="text"
                      name="unitKerja"
                      value={formData.unitKerja}
                      onChange={handleInputChange}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Asosiasi</label>
                    <input
                      type="text"
                      name="asosiasi"
                      value={formData.asosiasi}
                      onChange={handleInputChange}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama</label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">NPK</label>
                    <input
                      type="text"
                      name="npk"
                      value={formData.npk}
                      onChange={handleInputChange}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Periode</label>
                    <input
                      type="text"
                      name="periode"
                      value={formData.periode}
                      onChange={handleInputChange}
                      placeholder="e.g. 2026 atau Semester 1"
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nominal (Rp)</label>
                    <input
                      type="number"
                      name="nominal"
                      value={formData.nominal}
                      onChange={handleInputChange}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none bg-white"
                    >
                      <option value="Belum Lunas">Belum Lunas</option>
                      <option value="Lunas">Lunas</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Keterangan</label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005ea4] outline-none resize-none"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="iuranForm"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#005ea4] hover:bg-[#004780] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
