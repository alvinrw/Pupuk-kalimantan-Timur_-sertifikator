import React from 'react';
import { useInformasiLainnya } from '../hooks/useInformasiLainnya';
import ModuleCategoryGuide from '../components/informasi-lainnya/ModuleCategoryGuide';
import StatusWorkflowGuide from '../components/informasi-lainnya/StatusWorkflowGuide';
import VideoTutorials from '../components/informasi-lainnya/VideoTutorials';
import ColumnsGuide from '../components/informasi-lainnya/ColumnsGuide';

export default function InformasiLainnya({ activeSection = 'overview' }) {
  const data = useInformasiLainnya();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ModuleCategoryGuide modulesGuide={data.modulesGuide} />;
      case 'status':
        return <StatusWorkflowGuide type="status" statusColorsGuide={data.statusColorsGuide} />;
      case 'workflow':
        return <StatusWorkflowGuide type="workflow" workflowSteps={data.workflowSteps} />;
      case 'multicert':
        return (
          <VideoTutorials
            selectedJenisTutorial={data.selectedJenisTutorial}
            setSelectedJenisTutorial={data.setSelectedJenisTutorial}
          />
        );
      case 'columns':
        return (
          <ColumnsGuide
            activeCategoryTab={data.activeCategoryTab}
            setActiveCategoryTab={data.setActiveCategoryTab}
            categoryColumnsDetail={data.categoryColumnsDetail}
            categoryTemplates={data.categoryTemplates}
            handleDownloadSelectedCsv={data.handleDownloadSelectedCsv}
          />
        );
      default:
        return <ModuleCategoryGuide modulesGuide={data.modulesGuide} />;
    }
  };

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

      {/* Content */}
      {renderContent()}
    </div>
  );
}
