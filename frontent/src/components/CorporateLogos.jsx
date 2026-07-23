import React from 'react';

// Official Pupuk Kaltim (PKT) Vector Logo
export function PupukKaltimLogo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Authentic PKT Hexagonal Emblem */}
      <svg className="h-8 w-8 shrink-0" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="60,6 110,32 110,88 60,114 10,88 10,32" fill="#005ea4" />
        <polygon points="60,18 96,39 96,81 60,102 24,81 24,39" fill="#ff6b00" />
        <polygon points="60,28 84,45 84,75 60,92 36,75 36,45" fill="#00a859" />
        <circle cx="60" cy="60" r="16" fill="#ffffff" />
        <path d="M60 48 L64 56 L72 60 L64 64 L60 72 L56 64 L48 60 L56 56 Z" fill="#005ea4" />
      </svg>
      <div className="flex flex-col leading-tight font-sans-clean">
        <span className="font-black text-xs text-[#005ea4] tracking-tight">Pupuk Kaltim</span>
        <span className="text-[9px] font-bold text-slate-500 tracking-wider font-mono-data">PT PUPUK KALIMANTAN TIMUR</span>
      </div>
    </div>
  );
}

// Official Pupuk Indonesia Holding Logo
export function PupukIndonesiaLogo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Authentic Pupuk Indonesia Shield & Leaf */}
      <svg className="h-8 w-8 shrink-0" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 8 C88 8 108 30 108 60 C108 90 82 110 60 110 C38 110 12 90 12 60 C12 30 32 8 60 8 Z" fill="#004b87" />
        <path d="M60 20 C80 20 96 38 96 60 C96 82 76 98 60 98 C44 98 24 82 24 60 C24 38 40 20 60 20 Z" fill="#00a651" />
        <path d="M60 30 C40 52 50 82 60 82 C70 82 80 52 60 30 Z" fill="#ffffff" />
        <circle cx="60" cy="46" r="6" fill="#004b87" />
      </svg>
      <div className="flex flex-col leading-tight font-sans-clean">
        <span className="font-black text-xs text-[#004b87] tracking-tight">PUPUK INDONESIA</span>
        <span className="text-[9px] font-extrabold text-[#00a651] tracking-wider uppercase">HOLDING BUMN</span>
      </div>
    </div>
  );
}

// Official Danantara (Daya Anagata Nusantara) Sovereign Wealth Fund Logo
export function DanantaraLogo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Authentic Danantara "D" Emblem with Red-White Eagle Wing */}
      <svg className="h-8 w-8 shrink-0" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="104" height="104" rx="20" fill="#0f172a" />
        {/* Bold D Shape */}
        <path d="M30 24 H62 C82 24 96 38 96 60 C96 82 82 96 62 96 H30 V24 Z" fill="#b91c1c" />
        {/* Inner White Cutout & Red-White Wing */}
        <path d="M46 38 H60 C70 38 78 46 78 60 C78 74 70 82 60 82 H46 V38 Z" fill="#ffffff" />
        <path d="M46 38 L68 60 L46 82 Z" fill="#d97706" />
      </svg>
      <div className="flex flex-col leading-tight font-sans-clean">
        <span className="font-black text-xs text-slate-900 tracking-widest uppercase">DANANTARA</span>
        <span className="text-[9px] font-bold text-amber-700 tracking-tight font-mono-data">DAYA ANAGATA NUSANTARA</span>
      </div>
    </div>
  );
}

// Group Bar for Corporate Header
export default function CorporateLogosGroup() {
  return (
    <div className="flex items-center gap-4 bg-slate-50/90 px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
      <PupukKaltimLogo />
      <span className="h-6 w-[1px] bg-slate-300" />
      <PupukIndonesiaLogo />
      <span className="h-6 w-[1px] bg-slate-300" />
      <DanantaraLogo />
    </div>
  );
}
