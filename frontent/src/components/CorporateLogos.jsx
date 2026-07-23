import React from 'react';
import danantaraImg from '../../logo/Danantara_logo.png';
import piImg from '../../logo/PI logo.png';
import pktImg from '../../logo/PKt_logo.jpg';

// Official Pupuk Kaltim (PKT) Logo Component using User Provided Asset
export function PupukKaltimLogo({ className = "h-7 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={pktImg}
        alt="Logo Pupuk Kaltim"
        className="h-7 w-auto object-contain shrink-0"
      />
    </div>
  );
}

// Official Pupuk Indonesia Logo Component using User Provided Asset
export function PupukIndonesiaLogo({ className = "h-7 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={piImg}
        alt="Logo Pupuk Indonesia"
        className="h-7 w-auto object-contain shrink-0"
      />
    </div>
  );
}

// Official Danantara Logo Component using User Provided Asset
export function DanantaraLogo({ className = "h-7 w-auto" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={danantaraImg}
        alt="Logo Danantara"
        className="h-7 w-auto object-contain shrink-0"
      />
    </div>
  );
}

// Corporate Logos Group Banner Component
export default function CorporateLogosGroup() {
  return (
    <div className="flex items-center gap-4 bg-white/90 px-4 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
      <PupukKaltimLogo className="h-7" />
      <span className="h-5 w-[1px] bg-slate-300" />
      <PupukIndonesiaLogo className="h-7" />
      <span className="h-5 w-[1px] bg-slate-300" />
      <DanantaraLogo className="h-7" />
    </div>
  );
}
