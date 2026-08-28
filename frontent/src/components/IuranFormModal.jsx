import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, X, Save, ChevronDown } from 'lucide-react';

export default function IuranFormModal({
  isOpen,
  modalMode,
  formData,
  isSubmitting,
  handleCloseModal,
  handleInputChange,
  handleSubmit,
}) {
  const [isKompartemenOpen, setIsKompartemenOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const kompartemenRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kompartemenRef.current && !kompartemenRef.current.contains(event.target)) {
        setIsKompartemenOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
            <div ref={kompartemenRef} className="relative z-20">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Kompartemen <span className="text-red-500">*</span>
              </label>
              
              <div 
                onClick={() => setIsKompartemenOpen(!isKompartemenOpen)}
                className={`w-full text-sm px-4 py-2.5 bg-slate-50 border rounded-lg flex items-center justify-between cursor-pointer transition-all outline-none ${
                  isKompartemenOpen ? 'border-[#005ea4] ring-4 ring-blue-50 bg-white' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={formData.kompartemen ? 'text-slate-900' : 'text-slate-500'}>
                  {formData.kompartemen || '-- Pilih Kompartemen --'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isKompartemenOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Custom Dropdown List */}
              <div 
                className={`absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 text-left font-normal normal-case flex flex-col origin-top transition-all duration-200 ease-out overflow-hidden ${
                  isKompartemenOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'
                }`}
              >
                {[
                  { value: "", label: "-- Pilih Kompartemen --" },
                  { value: "Manajemen Keuangan", label: "Manajemen Keuangan" },
                  { value: "Satuan Pengawasan Intern", label: "Satuan Pengawasan Intern" },
                  { value: "Sekretaris Perusahaan", label: "Sekretaris Perusahaan" },
                  { value: "HSE dan Teknologi", label: "HSE dan Teknologi" },
                  { value: "Sumber Daya Manusia", label: "Sumber Daya Manusia" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleInputChange({ target: { name: 'kompartemen', value: item.value } });
                      setIsKompartemenOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                      formData.kompartemen === item.value 
                        ? 'bg-blue-50/70 font-bold text-[#005ea4]' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Hidden select for HTML5 validation */}
              <select
                name="kompartemen"
                value={formData.kompartemen}
                onChange={() => {}}
                required
                className="absolute opacity-0 w-full h-0 pointer-events-none -z-10"
                style={{ bottom: '10px' }}
                tabIndex={-1}
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
              <div ref={statusRef} className="relative z-10">
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                
                <div 
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`w-full text-sm px-4 py-2.5 bg-slate-50 border rounded-lg flex items-center justify-between cursor-pointer transition-all outline-none ${
                    isStatusOpen ? 'border-[#005ea4] ring-4 ring-blue-50 bg-white' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={formData.status ? 'text-slate-900' : 'text-slate-500'}>
                    {formData.status || '-- Pilih Status --'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Custom Dropdown List */}
                <div 
                  className={`absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 text-left font-normal normal-case flex flex-col origin-top transition-all duration-200 ease-out overflow-hidden z-50 ${
                    isStatusOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'
                  }`}
                >
                  {[
                    { value: "", label: "-- Pilih Status --" },
                    { value: "Karyawan", label: "Karyawan" },
                    { value: "Perusahaan", label: "Perusahaan" }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleInputChange({ target: { name: 'status', value: item.value } });
                        setIsStatusOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                        formData.status === item.value 
                          ? 'bg-blue-50/70 font-bold text-[#005ea4]' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Hidden select for HTML5 validation */}
                <select
                  name="status"
                  value={formData.status}
                  onChange={() => {}}
                  required
                  className="absolute opacity-0 w-full h-0 pointer-events-none -z-10"
                  style={{ bottom: '10px' }}
                  tabIndex={-1}
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
        <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end gap-4">
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
  );
}
