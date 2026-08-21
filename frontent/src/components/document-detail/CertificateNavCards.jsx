/**
 * CertificateNavCards - Kartu navigasi "Sertifikat Terhubung".
 * Ditampilkan ketika suatu entitas (Proyek/Aset/Produk) memiliki >1 jenis sertifikat.
 * User dapat mengklik kartu untuk berganti context sertifikat aktif.
 */
import React from 'react';
import { Link2, PlusCircle, Eye, Trash2, FileText } from 'lucide-react';
import { getFullFileUrl } from '../../config/api';

export default function CertificateNavCards({
  linkedCerts,
  activeCertId,
  onSelectCert,
  onAddCert,
  onDeleteCert,
  sortDateOrder,
  setSortDateOrder
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#005ea4]" />
            <span>Sertifikat Terhubung ({linkedCerts.length} Dokumen)</span>
          </h4>
          <p className="text-xs text-slate-500 font-mono-data mt-0.5">
            Klik kartu untuk berpindah detail sertifikat yang aktif dilihat
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0 shrink-0">
          {/* Sort Dropdown */}
          <select
            value={sortDateOrder}
            onChange={(e) => setSortDateOrder(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#005ea4] cursor-pointer shadow-xs font-mono-data"
          >
            <option value="desc">Expired Paling Lama</option>
            <option value="asc">Expired Terdekat</option>
          </select>
          <button
            onClick={onAddCert}
            className="px-3.5 py-2 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-mono-data"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Sertifikat Terhubung</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {linkedCerts.length === 0 ? (
        <div className="py-8 text-center text-slate-400 font-mono-data text-xs">
          <Link2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Belum ada sertifikat terhubung.</p>
          <p className="text-[11px] mt-1 text-slate-300">Klik &ldquo;+ Tambah Sertifikat Terhubung&rdquo; untuk mulai menambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {linkedCerts.map((cert) => {
            const isActive = activeCertId === cert.id;
            const certStatusLower = (cert.status || '').toLowerCase();
            const certIsExpired = certStatusLower === 'expired';
            const certIsPerpanjang = certStatusLower === 'perpanjang' || certStatusLower === 'perpanjangan';
            const certIsAfkir = certStatusLower === 'afkir';
            let certSisaHari = null;
            if (cert.expired) {
              certSisaHari = Math.ceil((new Date(cert.expired) - new Date()) / (1000 * 60 * 60 * 24));
            }

            const statusClass = certIsAfkir
              ? 'bg-slate-800 text-white border-slate-600'
              : certIsExpired || (certSisaHari !== null && certSisaHari <= 0)
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : cert.status?.toLowerCase() === 'direvisi' || cert.status?.toLowerCase() === 'diperpanjang'
                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                  : certIsPerpanjang || (certSisaHari !== null && certSisaHari > 0 && certSisaHari <= 30)
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

            return (
              <div
                key={cert.id}
                onClick={() => onSelectCert(cert.id)}
                className={`rounded-xl p-4 space-y-3 font-mono-data text-xs relative group transition-all cursor-pointer ${isActive
                    ? 'bg-blue-50/50 border-2 border-[#005ea4] shadow-md'
                    : 'bg-slate-50 border border-slate-200 hover:border-[#005ea4]/50 hover:bg-slate-100'
                  }`}
              >
                {/* Active badge */}
                {isActive && (
                  <div className="absolute -top-3 -right-3">
                    <span className="bg-[#005ea4] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Aktif Dilihat
                    </span>
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteCert(cert.id); }}
                  className="absolute top-3 right-3 p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Hapus Sertifikat Terhubung Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="pr-6">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Nama Sertifikat</span>
                  <span className="font-bold text-slate-900 text-[13px] leading-tight block mt-0.5">{cert.namaSertifikat || cert.jenisSertifikat || 'Sertifikat Terhubung'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">No. SK / Sertifikat</span>
                  <span className="font-bold text-[#005ea4] text-xs block mt-0.5">{cert.noSertifikat}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Instansi Penerbit</span>
                  <span className="text-slate-700 font-sans text-xs block mt-0.5">{cert.instansi}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Terbit</span>
                    <span className="text-slate-700 text-xs block mt-0.5">{cert.terbit || '-'}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Expired</span>
                    <span className={`text-xs font-bold block mt-0.5 ${certIsExpired || (certSisaHari !== null && certSisaHari <= 0) ? 'text-rose-700' : 'text-slate-700'}`}>
                      {cert.expired || '-'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                    {cert.status || 'Aktif'}
                  </span>
                  {certSisaHari !== null && !certIsAfkir && (
                    <span className="text-[10px] text-slate-500 font-bold">
                      {certSisaHari <= 0 ? `${Math.abs(certSisaHari)}h lalu` : `${certSisaHari.toLocaleString()} hr lagi`}
                    </span>
                  )}
                </div>

                <div className="pt-1 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCert(cert.id);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${isActive
                        ? 'bg-[#005ea4] text-white shadow-2xs hover:bg-blue-700'
                        : 'bg-blue-50 text-[#005ea4] border border-blue-200 hover:bg-blue-100'
                      }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Sedang Dilihat (Buka Edit)' : 'Kelola & Edit Sertifikat Ini →'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = cert.fileUrl || cert.pdfName;
                      if (url && (url.startsWith('http') || url.startsWith('/'))) {
                        window.open(getFullFileUrl(url), '_blank');
                      } else {
                        alert(`Berkas PDF ${cert.pdfName || ''} belum tersedia di storage.`);
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${cert.hasPdf || cert.fileUrl
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    disabled={!cert.hasPdf && !cert.fileUrl}
                  >
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>{cert.hasPdf || cert.fileUrl ? `PDF: ${cert.pdfName || 'Terlampir'}` : 'Tanpa Berkas PDF'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
