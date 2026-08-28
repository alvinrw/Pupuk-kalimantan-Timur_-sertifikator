import React, { useState, useEffect } from 'react';
import { FileText, Download, AlertCircle, HelpCircle, PlayCircle, BookOpen, ChevronDown, ChevronUp, Search, Info } from 'lucide-react';
import VideoTutorials from '../components/informasi-lainnya/VideoTutorials';

const FAQ_DATA = [
  {
    question: "Bagaimana cara mereset password pengguna?",
    answer: "Hubungi Super Admin atau Admin Unit untuk mereset password melalui halaman Manajemen Pengguna. Password default setelah direset biasanya ditentukan oleh Admin."
  },
  {
    question: "Apa bedanya status 'Aktif', 'Mendekati Expired', dan 'Expired'?",
    answer: "Status 'Aktif' (Hijau) berarti masa berlaku sertifikat masih panjang (biasanya lebih dari 90 hari). 'Mendekati Expired' (Kuning) berarti masa berlaku tersisa kurang dari 90 hari. 'Expired' (Merah) berarti masa berlaku sudah habis."
  },
  {
    question: "Mengapa saya tidak bisa menghapus (Delete) data perizinan?",
    answer: "Berdasarkan standar keamanan RBAC, fungsi Hapus permanen dibatasi untuk mencegah hilangnya riwayat data. Jika terjadi kesalahan, Anda dapat mengklik Edit untuk memperbarui data, atau menambahkan catatan 'Data Salah'."
  },
  {
    question: "Apa fungsi fitur 'Pindah Target Sertifikat'?",
    answer: "Fitur ini sangat berguna (terutama di modul Peralatan Pabrik dan HAKI) jika Anda tidak sengaja menautkan file PDF sertifikat ke peralatan yang salah. Anda bisa memindahkan sertifikat tersebut ke peralatan yang benar secara instan tanpa perlu unggah ulang."
  },
  {
    question: "Berapa batas ukuran maksimal file PDF yang bisa diunggah?",
    answer: "Batas maksimal ukuran untuk setiap file PDF dokumen/sertifikat yang diunggah ke sistem adalah 5 MB. Silakan kompres file PDF Anda jika ukurannya melebihi batas ini."
  }
];

export default function InformasiLainnya() {
  const pdfUrl = '/SOP_Sertifikator.pdf';
  const [pdfExists, setPdfExists] = useState(true);
  
  // Tab State: 'faq', 'tutorial', 'pdf'
  const [activeTab, setActiveTab] = useState('faq');
  
  // FAQ Search & Accordion State
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Tutorial State (dipassing ke komponen VideoTutorials)
  const [selectedJenisTutorial, setSelectedJenisTutorial] = useState('jenis1');

  useEffect(() => {
    fetch(pdfUrl, { method: 'HEAD' })
      .then(response => {
        const contentType = response.headers.get('content-type');
        if (!response.ok || (contentType && contentType.includes('text/html'))) {
          setPdfExists(false);
        } else {
          setPdfExists(true);
        }
      })
      .catch(() => setPdfExists(false));
  }, [pdfUrl]);

  const filteredFaqs = FAQ_DATA.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 font-sans-clean max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-[#005ea4] rounded-xl flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Pusat Bantuan & Panduan Pengguna
            </h1>
            <p className="text-sm text-slate-500">
              Temukan solusi, panduan teknis, dan prosedur operasional aplikasi Sertifikator
            </p>
          </div>
        </div>

        {/* Global Search (Visual Only for FAQ) */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari kendala (cth: password, pdf)..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'faq') setActiveTab('faq'); // Pindah ke tab FAQ jika mengetik
            }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]/30"
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 shrink-0">
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'faq' 
              ? 'border-[#005ea4] text-[#005ea4]' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <HelpCircle className="w-4.5 h-4.5" />
          Pertanyaan Umum (FAQ)
        </button>
        <button
          onClick={() => setActiveTab('tutorial')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'tutorial' 
              ? 'border-[#005ea4] text-[#005ea4]' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <PlayCircle className="w-4.5 h-4.5" />
          Panduan Interaktif
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'pdf' 
              ? 'border-[#005ea4] text-[#005ea4]' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <BookOpen className="w-4.5 h-4.5" />
          Dokumen Lengkap (PDF)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
        
        {/* TAB 1: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-4 max-w-4xl">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>Tidak ada jawaban FAQ yang cocok dengan kata kunci "{searchQuery}"</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${
                    openFaqIndex === index ? 'border-[#005ea4] shadow-xs' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                  >
                    <span className="font-bold text-slate-800 pr-8">{faq.question}</span>
                    {openFaqIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-[#005ea4] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <div className="p-4 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            )}
            
            <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#005ea4] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#005ea4]">Tidak menemukan jawaban?</p>
                <p className="text-xs text-slate-600 mt-1">
                  Jika Anda mengalami kendala teknis atau pertanyaan yang tidak ada di daftar FAQ, silakan hubungi tim IT Administrator Sertifikator atau cek tab "Dokumen Lengkap".
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TUTORIAL INTERAKTIF */}
        {activeTab === 'tutorial' && (
          <div className="max-w-5xl">
            <VideoTutorials 
              selectedJenisTutorial={selectedJenisTutorial}
              setSelectedJenisTutorial={setSelectedJenisTutorial}
            />
          </div>
        )}

        {/* TAB 3: DOKUMEN LENGKAP (PDF) */}
        {activeTab === 'pdf' && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-500" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">SOP_Sertifikator.pdf</h3>
                  <p className="text-xs text-slate-500">Versi Resmi - Standar Operasional Prosedur</p>
                </div>
              </div>
              <a 
                href={pdfUrl}
                download="SOP_Sertifikator.pdf"
                className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] hover:bg-[#004d86] text-white font-medium rounded-lg transition-colors cursor-pointer text-sm"
                title="Download PDF SOP"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
              </a>
            </div>

            <div className="bg-white border border-slate-200 shadow-2xs rounded-xl flex-1 min-h-[500px] overflow-hidden flex flex-col justify-center items-center">
              {pdfExists ? (
                <iframe 
                  src={`${pdfUrl}#toolbar=0`} 
                  className="w-full h-full border-none bg-slate-50"
                  title="SOP Viewer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500 space-y-4">
                  <AlertCircle className="w-12 h-12 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-700 text-lg">File PDF Tidak Ditemukan</p>
                    <p className="max-w-md mx-auto mt-2">
                      File <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-pink-600">SOP_Sertifikator.pdf</code> belum tersedia di server. 
                      Silakan tambahkan file tersebut ke dalam folder <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-pink-600">public/</code>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
