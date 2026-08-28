import React from 'react';
import { PlusCircle, Link2, FileCheck, Info, Eye, Upload, CheckCircle2 } from 'lucide-react';

export default function VideoTutorials({
  selectedJenisTutorial, setSelectedJenisTutorial
}) {
  return (
    <div className="space-y-8 font-sans-clean">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-[#005ea4]" />
          <span>Panduan Tutorial: Cara Menambahkan Item & Sertifikat Terhubung</span>
        </h3>
        <span className="text-xs font-mono-data text-[#005ea4] font-bold">Panduan Langkah demi Langkah</span>
      </div>

      <div className="space-y-2 font-sans-clean">
        <p className="text-xs text-slate-500 font-mono-data font-bold">
          Pilih jenis tutorial alur kerja di bawah ini:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono-data text-xs">
          {/* TYPE 1: MULTI-SERTIFIKAT (CLICKABLE) */}
          <div
            onClick={() => setSelectedJenisTutorial('jenis1')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
              selectedJenisTutorial === 'jenis1'
                ? 'bg-blue-50/70 border-2 border-[#005ea4] shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2.5 text-[#005ea4] font-bold text-sm">
                <Link2 className="w-4.5 h-4.5 shrink-0 text-[#005ea4]" />
                <h4>JENIS 1: Menu Dengan Multi-Sertifikat Terhubung</h4>
              </div>
              {selectedJenisTutorial === 'jenis1' ? (
                <span className="px-2.5 py-0.5 bg-[#005ea4] text-white text-[10px] font-bold rounded-full">
                  Terpilih
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                  Pilih Tutorial
                </span>
              )}
            </div>
            <p className="pl-7 text-slate-700 leading-relaxed text-[11px]">
              <b>Modul</b>: Perizinan Aset, Perizinan Proyek & Konstruksi, dan Sertifikasi Produk.
            </p>
            <ul className="ml-7 pl-4 list-disc list-outside space-y-1 text-slate-600 text-[11px]">
              <li><b>Karakteristik</b>: 1 Entitas dapat memiliki <b>banyak sertifikat terhubung</b> (PBG, SLF, HGB, Amdal, SNI, Halal).</li>
              <li><b>Behavior Tabel Utama</b>: <b>1 baris sertifikat</b> (1 aset/proyek dengan 3 sertifikat = 3 baris di tabel).</li>
            </ul>
          </div>

          {/* TYPE 2: SINGLE SERTIFIKAT (CLICKABLE) */}
          <div
            onClick={() => setSelectedJenisTutorial('jenis2')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
              selectedJenisTutorial === 'jenis2'
                ? 'bg-slate-100 border-2 border-slate-700 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                <FileCheck className="w-4.5 h-4.5 shrink-0 text-slate-700" />
                <h4>JENIS 2: Menu Single Sertifikat & Pindah Target</h4>
              </div>
              {selectedJenisTutorial === 'jenis2' ? (
                <span className="px-2.5 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded-full">
                  Terpilih
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                  Pilih Tutorial
                </span>
              )}
            </div>
            <p className="pl-7 text-slate-700 leading-relaxed text-[11px]">
              <b>Modul</b>: Perizinan Peralatan Pabrik dan Administrasi Lainnya / Hak Cipta (HAKI).
            </p>
            <ul className="ml-7 pl-4 list-disc list-outside space-y-1 text-slate-600 text-[11px]">
              <li><b>Karakteristik</b>: 1 Peralatan/Ciptaan terikat pada <b>1 Sertifikat/SK</b> (dengan opsi Pindah Target).</li>
              <li><b>Behavior Tabel Utama</b>: 1 Item peralatan/ciptaan selalu konsisten <b>1 baris</b> pada tabel utama.</li>
            </ul>
          </div>
        </div>
      </div>

      {selectedJenisTutorial === 'jenis1' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono-data text-xs">
            <span className="font-bold text-[#005ea4] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#005ea4]" />
              <span>Panduan Alur Kerja JENIS 1 (Perizinan Aset, Proyek & Konstruksi, & Sertifikasi Produk)</span>
            </span>
            <span className="text-slate-700 font-bold bg-slate-200 px-2.5 py-0.5 rounded text-[11px]">
              Multi-Sertifikat Terhubung
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#005ea4] text-white flex items-center justify-center font-bold text-lg font-mono-data shadow-xs">
                A
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">1. Cara Menambahkan Data Item / Perizinan Baru (Input 1 Data Manual)</h4>
                <p className="pl-[16px] text-xs text-slate-500 font-mono-data">Untuk menambahkan entitas baru (Aset, Peralatan, Proyek, atau Produk)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono-data text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">1</span>
                  <span>Buka Halaman Perizinan</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Pilih menu perizinan dari Sidebar kiri (misal: <b>Perizinan Aset</b>, <b>Perizinan Peralatan Pabrik</b>, <b>Perizinan Proyek</b>, atau <b>Sertifikasi Produk</b>).
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">2</span>
                  <span>Klik "Impor"</span>
                </div>
                <div className="text-slate-600 leading-relaxed">
                  Pada kanan atas tabel, klik tombol <b>Impor Dokumen</b> lalu pilih opsi <b>Input 1 Data Manual</b>.
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">3</span>
                  <span>Isi Formulir & Simpan</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Isi spesifikasi item (Merek/Nama Item, Tipe, Nomor Seri, Lokasi, No. SK, Tgl Terbit/Expired). Klik <b>Simpan Data</b> untuk menampilkan ke tabel.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 font-mono-data">
              <div className="w-10 h-10 rounded-xl bg-[#005ea4] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                B
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">2. Cara Menambahkan Sertifikat Terhubung (Multi-Sertifikat Item)</h4>
                <p className="pl-[16px] text-xs text-slate-500 font-mono-data">Untuk menghubungkan beberapa dokumen sertifikat (PBG, SLF, Amdal, SNI, Halal) ke satu entitas yang sama</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono-data text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                  <Eye className="w-4 h-4 text-[#005ea4]" />
                  <span>Langkah 1: Lihat Detail</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Klik <b>Lihat Detail</b> (atau klik nama item/no sertifikat) pada baris tabel utama untuk membuka Halaman Detail.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                  <Link2 className="w-4 h-4 text-[#005ea4]" />
                  <span>Langkah 2: Tambah Sertifikat</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Di Halaman Detail, gulir ke bagian <b>Sertifikat Terhubung</b> dan klik tombol <b>+ Tambah Sertifikat Terhubung</b>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                  <Upload className="w-4 h-4 text-[#005ea4]" />
                  <span>Langkah 3: Form & Upload PDF</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Isi Jenis Sertifikat (PBG, SLF, Amdal, SNI), No. SK, Instansi, Tgl Terbit/Expired, lalu klik <b>Pilih Berkas PDF</b> untuk mengunggah sertifikat.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#005ea4] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#005ea4]" />
                  <span>Langkah 4: Otomatis Tambah Baris</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Klik <b>Simpan Sertifikat</b>. Sertifikat baru tersimpan di Detail dan <b>Tabel Utama otomatis menampilkan 1 baris tambahan</b>!
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono-data text-xs text-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-[#005ea4]" />
                <span>Prinsip Kerja Multi-Sertifikat Baris Tabel Utama:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                <li><b>Data Utama Tetap 1 Entitas</b>: Menambahkan sertifikat terhubung tidak membuat aset/alat baru, melainkan menambahkan sertifikat di bawah entitas yang sama.</li>
                <li><b>Tabel Utama Menampilkan Sertifikat</b>: Jika 1 aset punya 3 sertifikat terhubung, tabel utama menampilkan 3 baris terpisah untuk sertifikat tersebut.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedJenisTutorial === 'jenis2' && (
        <div className="space-y-6 font-sans-clean">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono-data text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-700" />
              <span>Panduan Alur Kerja JENIS 2 (Perizinan Peralatan Pabrik & Administrasi Lainnya / HAKI)</span>
            </span>
            <span className="text-slate-700 font-bold bg-slate-200 px-2.5 py-0.5 rounded text-[11px]">
              Single Certificate Model
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 font-mono-data">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                A
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">1. Cara Menambahkan Data Peralatan Pabrik atau Hak Cipta Baru</h4>
                <p className="pl-[16px] text-xs text-slate-500">Input registrasi item baru (Bejana Tekan, Crane, Tangki B3, atau Karya Cipta HAKI)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono-data text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">1</span>
                  <span>Buka Menu Peralatan / Administrasi</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Pilih menu <b>Perizinan Peralatan Pabrik</b> atau <b>Administrasi Lainnya</b> dari Sidebar kiri.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">2</span>
                  <span>Klik "Input Data Manual"</span>
                </div>
                <div className="text-slate-600 leading-relaxed">
                  Klik tombol <b>Impor</b> lalu pilih opsi <b>Input 1 Data Manual</b> untuk membuka formulir registrasi.
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">3</span>
                  <span>Isi Spesifikasi & Simpan</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Isi Kode Tag / Judul Ciptaan, Merek / Jenis, No. Sertifikat SK Disnaker/Kemenkumham, Tanggal Terbit/Expired, lalu klik <b>Simpan Data</b>.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 font-mono-data">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                B
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">2. Fitur Pindah Target Sertifikat (Re-assign Certificate)</h4>
                <p className="pl-[16px] text-xs text-slate-500">Gunakan fitur ini jika nomor SK / berkas PDF ciptaan tertukar antar item</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-data text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">1</span>
                  <span>Klik Menu Aksi Baris</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Pada kolom paling kanan baris ciptaan, klik tombol titik tiga <b>Aksi (...)</b> lalu pilih <b>Pindah Target Sertifikat</b>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">2</span>
                  <span>Pilih Karya Cipta Tujuan</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Cari dan pilih judul ciptaan penerima yang sesuai pada daftar modal pemindahan target sertifikat.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-800">3</span>
                  <span>Konfirmasi Pemindahan</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Klik <b>Pindahkan Sertifikat</b>. Sertifikat beserta berkas PDF otomatis berpindah target ke karya cipta yang baru secara instan.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono-data text-xs text-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-slate-700" />
                <span>Prinsip Kerja Model Single Sertifikat:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                <li><b>Model 1-to-1 Strictly</b>: 1 Peralatan/Ciptaan diwakili oleh 1 Surat SK/Pencatatan resmi.</li>
                <li><b>Konsistensi Baris Tabel</b>: Jumlah baris pada tabel utama selalu tepat sama dengan jumlah entitas yang terdaftar.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
