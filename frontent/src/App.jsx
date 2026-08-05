import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Dashboard from './pages/Dashboard';
import PeralatanPabrik from './pages/PeralatanPabrik';
import MonitoringSertifikasi from './pages/MonitoringSertifikasi';
import PerizinanGeneric from './pages/PerizinanGeneric';
import AdministrasiLainnya from './pages/AdministrasiLainnya';
import PerizinanAset from './pages/PerizinanAset';
import RiwayatPerpanjangan from './pages/RiwayatPerpanjangan';
import InformasiLainnya from './pages/InformasiLainnya';
import IuranKeanggotaan from './pages/IuranKeanggotaan';
import TugasTerdekat from './pages/TugasTerdekat';

import {
  mockStats,
  mockEquipmentList,
  mockOcrExtractions,
  mockActivityLogs
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [equipmentList] = useState(mockEquipmentList);
  const [ocrExtractions] = useState(mockOcrExtractions);
  const [activityLogs] = useState(mockActivityLogs);

  const [renewalBatches, setRenewalBatches] = useState([
    {
      batchId: "BATCH-2026-01",
      name: "Paket Resertifikasi Boiler & Bejana Tekan Pabrik 1A",
      agency: "Disnaker Kaltim",
      itemsCount: 5,
      status: "Sedang Inspeksi Lapangan",
      createdDate: "2026-07-10",
      progressPercent: 60,
    },
    {
      batchId: "BATCH-2026-02",
      name: "Pengajuan Izin Lingkungan IPLC & WWTP 2026",
      agency: "KLHK RI",
      itemsCount: 3,
      status: "Menunggu TTD SK Menteri",
      createdDate: "2026-06-25",
      progressPercent: 85,
    }
  ]);

  const handleAddRenewalBatch = (newBatch) => {
    setRenewalBatches(prev => [newBatch, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={mockStats}
            equipmentList={equipmentList}
            ocrExtractions={ocrExtractions}
            setActiveTab={setActiveTab}
          />
        );
      case 'peralatan-pabrik':
        return (
          <PeralatanPabrik
            equipmentList={equipmentList}
            onAddRenewalBatch={handleAddRenewalBatch}
          />
        );
      case 'monitoring':
        return (
          <MonitoringSertifikasi
            equipmentList={equipmentList}
            renewalBatches={renewalBatches}
          />
        );
      case 'perizinan-aset':
        return (
          <PerizinanGeneric
            title="Perizinan Aset & Bangunan Pabrik"
            subtitle="Izin lokasi, sertifikat HGB, kelayakan bangunan, dan AMDAL kawasan pabrik"
            categoryName="Aset & Bangunan"
            onAddRenewalBatch={handleAddRenewalBatch}
          />
        );

      case 'perizinan-proyek':
        return (
          <PerizinanGeneric
            title="Perizinan Proyek & Konstruksi Fabrikasi"
            subtitle="PBG/IMB konstruksi, sertifikat laik fungsi proyek ekspansi pabrik baru"
            categoryName="Proyek & Konstruksi"
            onAddRenewalBatch={handleAddRenewalBatch}
          />
        );
      case 'perizinan-produk':
        return (
          <PerizinanGeneric
            title="Perizinan & Sertifikasi Produk Fertilizer"
            subtitle="Sertifikasi SNI Urea, NPK, sertifikat Halal, dan registrasi edar Kementerian Pertanian"
            categoryName="Sertifikasi Produk"
            onAddRenewalBatch={handleAddRenewalBatch}
          />
        );
      case 'riwayat-perpanjangan':
        return <RiwayatPerpanjangan />;
      case 'informasi-lainnya':
        return <InformasiLainnya />;
      case 'iuran-keanggotaan':
        return <IuranKeanggotaan />;
      case 'tugas-terdekat':
        return <TugasTerdekat setActiveTab={setActiveTab} />;
      default:
        return (
          <Dashboard
            stats={mockStats}
            equipmentList={equipmentList}
            ocrExtractions={ocrExtractions}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f9fb] font-sans-clean overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          activeTab={activeTab}
        />

        <main className="flex-1 pb-12">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
