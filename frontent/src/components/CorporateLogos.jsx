import React from 'react';
import danantaraImg from '../../logo/Danantara_logo.png';
import piImg from '../../logo/PI logo.png';
import pktImg from '../../logo/PKt_logo.jpg';

export function PupukKaltimLogo({ className = "h-7" }) {
  return (
    <img
      src={pktImg}
      alt="Logo Pupuk Kaltim"
      className={`object-contain object-center max-w-full block ${className}`}
      style={{ minWidth: 'auto' }}
    />
  );
}

export function PupukIndonesiaLogo({ className = "h-7" }) {
  return (
    <img
      src={piImg}
      alt="Logo Pupuk Indonesia"
      className={`object-contain object-center max-w-full block ${className}`}
      style={{ minWidth: 'auto' }}
    />
  );
}

export function DanantaraLogo({ className = "h-7" }) {
  return (
    <img
      src={danantaraImg}
      alt="Logo Danantara"
      className={`object-contain object-center max-w-full block ${className}`}
      style={{ minWidth: 'auto' }}
    />
  );
}

export default function CorporateLogosGroup() {
  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200/90 shadow-2xs font-sans-clean">
      {/* Pupuk Kaltim Container */}
      <div className="flex items-center justify-center h-8 shrink-0">
        <img
          src={pktImg}
          alt="Pupuk Kaltim"
          className="h-7 w-auto max-w-[130px] object-contain object-center"
        />
      </div>

      <span className="h-5 w-[1px] bg-slate-200 shrink-0" />

      {/* Pupuk Indonesia Container */}
      <div className="flex items-center justify-center h-8 shrink-0">
        <img
          src={piImg}
          alt="Pupuk Indonesia"
          className="h-7 w-auto max-w-[110px] object-contain object-center"
        />
      </div>

      <span className="h-5 w-[1px] bg-slate-200 shrink-0" />

      {/* Danantara Container */}
      <div className="flex items-center justify-center h-8 shrink-0">
        <img
          src={danantaraImg}
          alt="Danantara"
          className="h-7 w-auto max-w-[120px] object-contain object-center"
        />
      </div>
    </div>
  );
}
