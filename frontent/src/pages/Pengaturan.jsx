import React, { useState } from 'react';
import { Settings, Sliders, Shield, Bell, Save, Sparkles } from 'lucide-react';

export default function Pengaturan() {
  const [ocrThreshold, setOcrThreshold] = useState(90);
  const [autoVerify, setAutoVerify] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif-title font-bold text-xl text-[#0F172A]">
          Pengaturan Sistem & Parameter AI OCR
        </h2>
        <p className="text-xs text-[#64748B] font-mono-data">
          Konfigurasi ambang batas ekstraksi AI, interval notifikasi otomatis resertifikasi, dan hak akses user
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-md text-xs font-semibold font-mono-data">
          ✓ Pengaturan berhasil disimpan ke sistem local state!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Parameter OCR AI */}
        <div className="bg-white rounded-lg border border-[#e2e8fo] shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e2e8fo] pb-3">
            <Sparkles className="w-5 h-5 text-[#005ea4]" />
            <h3 className="font-serif-title font-bold text-base text-[#0F172A]">
              Parameter AI OCR & Auto-Linking
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#0F172A]">
                  Ambang Batas Kepercayaan (Confidence Threshold): {ocrThreshold}%
                </label>
              </div>
              <input
                type="range"
                min="70"
                max="99"
                value={ocrThreshold}
                onChange={(e) => setOcrThreshold(e.target.value)}
                className="w-full h-2 bg-[#e2e8fo] rounded-lg appearance-none cursor-pointer accent-[#005ea4]"
              />
              <p className="text-[11px] text-[#64748B] mt-1 font-mono-data">
                Dokumen dengan confidence &ge; {ocrThreshold}% akan di-verifikasi secara otomatis.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-semibold text-[#0F172A] block">Auto-Link Master Data Equipment</span>
                <span className="text-[11px] text-[#64748B]">Hubungkan Tag Number otomatis ke database pabrik</span>
              </div>
              <input
                type="checkbox"
                checked={autoVerify}
                onChange={(e) => setAutoVerify(e.target.checked)}
                className="w-4 h-4 text-[#005ea4] rounded accent-[#005ea4]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Rules Notifikasi */}
        <div className="bg-white rounded-lg border border-[#e2e8fo] shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e2e8fo] pb-3">
            <Bell className="w-5 h-5 text-[#005ea4]" />
            <h3 className="font-serif-title font-bold text-base text-[#0F172A]">
              Aturan Warning & Notifikasi Email
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#0F172A] block">Peringatan Expired 60 & 30 Hari</span>
                <span className="text-[11px] text-[#64748B]">Kirimkan alert otomatis ke Admin K3 & Plant Manager</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-[#005ea4] rounded accent-[#005ea4]"
              />
            </div>

            <div className="pt-2">
              <label className="font-semibold text-[#0F172A] block mb-1">Email Penerima Peringatan Utama</label>
              <input
                type="email"
                defaultValue="k3lh-compliance@pupukkaltim.com"
                className="w-full px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8fo] rounded text-xs font-mono-data focus:outline-none focus:ring-1 focus:ring-[#005ea4]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#005ea4] hover:bg-[#004881] text-white text-xs font-bold rounded-md shadow-xs transition-colors ml-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Pengaturan</span>
        </button>
      </div>
    </div>
  );
}
