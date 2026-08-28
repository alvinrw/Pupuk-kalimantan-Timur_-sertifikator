import React from 'react';
import { Download, FileText, Info } from 'lucide-react';

export default function ColumnsGuide({
  activeCategoryTab,
  setActiveCategoryTab,
  categoryColumnsDetail,
  categoryTemplates,
  handleDownloadSelectedCsv
}) {
  return (
    <div className="space-y-8 font-sans-clean">
      <div className="p-6 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#005ea4]" />
            <h4 className="font-bold text-base text-slate-900">
              Unduh {categoryTemplates[activeCategoryTab]?.title || 'Templat CSV Master'}
            </h4>
          </div>
          <p className="text-xs text-slate-600 font-mono-data">
            Gunakan templat CSV spesifik ini untuk mengunggah data <b>{categoryColumnsDetail[activeCategoryTab]?.categoryTitle}</b> sekaligus.
          </p>
        </div>

        <button
          onClick={() => handleDownloadSelectedCsv(activeCategoryTab)}
          className="px-5 py-2.5 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all font-mono-data cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-white" />
          <span>Download CSV {categoryTemplates[activeCategoryTab]?.fileName}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#005ea4]" />
            <span>Rincian Struktur Kolom 5 Kategori Perizinan</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono-data">
          {['peralatan', 'aset', 'proyek', 'produk', 'haki'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveCategoryTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategoryTab === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {idx + 1}. {tab === 'peralatan' ? 'Peralatan Pabrik' : tab === 'aset' ? 'Perizinan Aset' : tab === 'proyek' ? 'Perizinan Proyek' : tab === 'produk' ? 'Sertifikasi Produk' : 'Administrasi / HAKI'}
            </button>
          ))}
        </div>

        {categoryColumnsDetail[activeCategoryTab] && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 bg-slate-900 text-white font-bold text-xs flex items-center justify-between font-mono-data">
              <span>{categoryColumnsDetail[activeCategoryTab].categoryTitle}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Total {categoryColumnsDetail[activeCategoryTab].columns.length} Kolom Data
              </span>
            </div>
            <table className="w-full text-left border-collapse font-mono-data text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-bold w-1/4">NAMA KOLOM TABEL</th>
                  <th className="py-3.5 px-4 font-bold">DESKRIPSI & FUNGSI ISIAN DATA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categoryColumnsDetail[activeCategoryTab].columns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#005ea4] whitespace-nowrap">
                      {col.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {col.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-mono-data text-xs">
        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#005ea4]" />
          <span>Petunjuk Format Pengisian CSV Master yang Valid</span>
        </h4>
        <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
          <li><b>Encoding File</b>: Gunakan format penyimpan file <b>CSV (Comma Delimited) (*.csv)</b> dengan encoding <b>UTF-8</b>.</li>
          <li><b>Header Kolom Wajib</b>: `code`, `title`, `category`, `unit`, `certificateNo`, `issueDate`, `expiryDate`, `status`.</li>
          <li><b>Format Tanggal</b>: Gunakan format ISO standar <b>YYYY-MM-DD</b> (contoh: 2026-08-15).</li>
          <li><b>Pencocokan Otomatis</b>: Setelah CSV diunggah, data akan langsung dipetakan ke modul yang bersangkutan dan dihitung sisa harinya secara otomatis di menu Monitoring.</li>
        </ul>
      </div>
    </div>
  );
}
