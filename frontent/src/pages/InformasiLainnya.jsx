import React from 'react';
import { Layers, ShieldAlert, RotateCcw, PlusCircle, FileText } from 'lucide-react';
import DocumentDetailPage from './DocumentDetailPage';

import { useInformasiLainnya } from '../hooks/useInformasiLainnya';
import ModuleCategoryGuide from '../components/informasi-lainnya/ModuleCategoryGuide';
import StatusWorkflowGuide from '../components/informasi-lainnya/StatusWorkflowGuide';
import VideoTutorials from '../components/informasi-lainnya/VideoTutorials';
import ColumnsGuide from '../components/informasi-lainnya/ColumnsGuide';

export default function InformasiLainnya() {
  const data = useInformasiLainnya();

  if (data.selectedDocDetail) {
    return (
      <DocumentDetailPage
        item={data.selectedDocDetail}
        onBack={() => data.setSelectedDocDetail(null)}
        onSaveUpdate={(updatedDoc) => {
          alert(`Sertifikat ${updatedDoc.id} berhasil diperbarui.`);
        }}
        onQuickRenew={(id) => {
          alert(`Inisiasi perpanjangan untuk sertifikat ${id}.`);
        }}
        onQuickDecommission={(id) => {
          alert(`Status sertifikat ${id} ditandai sebagai Afkir.`);
        }}
      />
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans-clean max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <h1 className="font-logo-sutasoma text-2xl md:text-3xl font-bold tracking-tight text-[#005ea4] select-none">
            SERTIFIKATOR
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-mono-data leading-relaxed">
            Sistem Informasi Pengelolaan, Pemantauan Masa Berlaku, dan Resertifikasi Perizinan Peralatan Pabrik, Aset, Proyek, Produk, dan HAKI Terpadu.
          </p>
        </div>
      </div>

      {/* Navigation Guide Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 font-mono-data">
        <button
          onClick={() => data.setActiveGuideTab('overview')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            data.activeGuideTab === 'overview'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Modul Aplikasi</span>
        </button>

        <button
          onClick={() => data.setActiveGuideTab('status')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            data.activeGuideTab === 'status'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>2. Warna Status Dokumen</span>
        </button>

        <button
          onClick={() => data.setActiveGuideTab('workflow')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            data.activeGuideTab === 'workflow'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>3. Alur Kerja & AI OCR</span>
        </button>

        <button
          onClick={() => data.setActiveGuideTab('multicert')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            data.activeGuideTab === 'multicert'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>4. Panduan Tambah Item & Sertifikat Terhubung</span>
        </button>

        <button
          onClick={() => data.setActiveGuideTab('columns')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            data.activeGuideTab === 'columns'
              ? 'bg-[#005ea4] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>5. Struktur Kolom & Templat Impor CSV</span>
        </button>
      </div>

      {data.activeGuideTab === 'overview' && <ModuleCategoryGuide modulesGuide={data.modulesGuide} />}
      {data.activeGuideTab === 'status' && <StatusWorkflowGuide type="status" statusColorsGuide={data.statusColorsGuide} />}
      {data.activeGuideTab === 'workflow' && <StatusWorkflowGuide type="workflow" workflowSteps={data.workflowSteps} />}
      
      {data.activeGuideTab === 'multicert' && (
        <VideoTutorials
          selectedJenisTutorial={data.selectedJenisTutorial}
          setSelectedJenisTutorial={data.setSelectedJenisTutorial}
        />
      )}

      {data.activeGuideTab === 'columns' && (
        <ColumnsGuide
          activeCategoryTab={data.activeCategoryTab}
          setActiveCategoryTab={data.setActiveCategoryTab}
          categoryColumnsDetail={data.categoryColumnsDetail}
          categoryTemplates={data.categoryTemplates}
          handleDownloadSelectedCsv={data.handleDownloadSelectedCsv}
        />
      )}
    </div>
  );
}
