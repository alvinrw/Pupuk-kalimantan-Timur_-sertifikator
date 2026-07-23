import React from 'react';

// Official Pupuk Kaltim (PKT) Emblem Logo Component
export function PupukKaltimLogo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* PKT Geometric Shield & Flower Emblem */}
      <svg className="h-7 w-7 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#005ea4" />
        <polygon points="50,15 80,30 80,70 50,85 20,70 20,30" fill="#059669" />
        <circle cx="50" cy="50" r="20" fill="#f59e0b" />
        <path d="M50 35 L55 45 L65 50 L55 55 L50 65 L45 55 L35 50 L45 45 Z" fill="#ffffff" />
      </svg>
      <div className="flex flex-col leading-none font-sans-clean">
        <span className="font-extrabold text-[13px] text-[#005ea4] tracking-tight">PUPUK KALTIM</span>
        <span className="text-[8px] font-bold text-slate-500 tracking-wider font-mono-data">MEMBER OF PUPUK INDONESIA</span>
      </div>
    </div>
  );
}

// Official Pupuk Indonesia (Persero) Holding Logo Component
export function PupukIndonesiaLogo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Pupuk Indonesia Leaf Shield Logo */}
      <svg className="h-7 w-7 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 C75 10 90 30 90 55 C90 80 65 90 50 90 C35 90 10 80 10 55 C10 30 25 10 50 10 Z" fill="#005ea4" />
        <path d="M50 20 C68 20 78 36 78 55 C78 74 58 80 50 80 C42 80 22 74 22 55 C22 36 32 20 50 20 Z" fill="#10b981" />
        <path d="M50 30 C30 50 40 75 50 75 C60 75 70 50 50 30 Z" fill="#ffffff" />
      </svg>
      <div className="flex flex-col leading-none font-sans-clean">
        <span className="font-black text-[12px] text-[#005ea4] tracking-tighter">PUPUK INDONESIA</span>
        <span className="text-[8px] font-bold text-emerald-700 tracking-wider">HOLDING BUMN</span>
      </div>
    </div>
  );
}

// Official Danantara (Daya Anagata Nusantara) Sovereign Wealth Fund Logo
export function DanantaraLogo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Danantara Gold Eagle Crown Logo */}
      <svg className="h-7 w-7 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="80" rx="16" fill="#0f172a" />
        <path d="M50 22 L75 42 L65 78 L35 78 L25 42 Z" fill="#d97706" />
        <path d="M50 30 L65 45 L58 70 L42 70 L35 45 Z" fill="#fbbf24" />
        <circle cx="50" cy="50" r="10" fill="#ffffff" />
      </svg>
      <div className="flex flex-col leading-none font-sans-clean">
        <span className="font-extrabold text-[12px] text-slate-900 tracking-widest uppercase">DANANTARA</span>
        <span className="text-[8px] font-bold text-amber-700 tracking-tight font-mono-data">DAYA ANAGATA NUSANTARA</span>
      </div>
    </div>
  );
}

// Full Rebranding Corporate Logos Badge Group
export default function CorporateLogosGroup() {
  return (
    <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
      <PupukKaltimLogo />
      <span className="h-5 w-[1px] bg-slate-300" />
      <PupukIndonesiaLogo />
      <span className="h-5 w-[1px] bg-slate-300" />
      <DanantaraLogo />
    </div>
  );
}
