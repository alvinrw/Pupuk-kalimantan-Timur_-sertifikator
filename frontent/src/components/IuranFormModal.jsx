import React from 'react';
import { PlusCircle, X, Save } from 'lucide-react';

export default function IuranFormModal({
  isOpen,
  modalMode,
  formData,
  isSubmitting,
  handleCloseModal,
  handleInputChange,
  handleSubmit,
  onDelete,
}) {
  if (!isOpen) return null;

  return (
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
          <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 mt-1 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto">
          <form id="iuranForm" onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Kompartemen <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Unit Kerja <span className="text-red-500">*</span>
              </label>
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
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Asosiasi <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Nama <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
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
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Tahun Pendaftaran <span className="text-red-500">*</span>
                  </label>
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
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Nominal (Rp) <span className="text-red-500">*</span>
                </label>
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex items-center justify-between">
          <div>
            {modalMode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  onDelete();
                }}
                className="px-4 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                Hapus Data
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white hover:text-slate-900 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="iuranForm"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#005ea4] hover:bg-[#004780] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
    </div>
  );
}
