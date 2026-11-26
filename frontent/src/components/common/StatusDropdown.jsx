import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function StatusDropdown({
  label = 'Status',
  value = 'Aktif',
  onChange,
  options = [
    { value: 'Aktif', label: 'Aktif' },
    { value: 'Spare', label: 'Spare' },
    { value: 'Rusak', label: 'Rusak' },
  ],
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption =
    normalizedOptions.find((opt) => opt.value === value) || {
      value,
      label: value,
    };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="font-bold text-slate-700 block mb-1 text-xs">{label}</label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between text-left transition-all duration-200 ease-out bg-white ${
          isOpen
            ? 'border-[#005ea4] ring-2 ring-[#005ea4]/20 shadow-xs'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
      >
        <span className="font-bold text-xs truncate text-slate-800">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-180 text-[#005ea4]' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu with smooth transitions preserved */}
      <div
        className={`absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-300/40 p-1 overflow-hidden transition-all duration-200 ease-out origin-top transform ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="space-y-0.5">
          {normalizedOptions.map((opt) => {
            const isSelected = value === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (onChange) onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150 group cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:translate-x-0.5'
                }`}
              >
                <div className="min-w-0">
                  <span className="text-xs block truncate font-medium">
                    {opt.label}
                  </span>

                </div>
                {isSelected && (
                  <Check className="w-4 h-4 shrink-0 text-[#005ea4]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
