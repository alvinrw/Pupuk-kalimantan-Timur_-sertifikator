import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - Reusable Animated Select Component
 * Provides smooth micro-interactions, spring/fade transitions, and accessible behavior.
 */
export default function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Pilih opsi...',
  className = '',
  buttonClassName = '',
  disabled = false,
  dropUp = false,
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

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder,
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[11px] font-bold text-slate-600 block mb-1">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 text-xs border rounded-lg flex items-center justify-between text-left transition-all duration-200 ease-out bg-white ${
          isOpen
            ? 'border-[#005ea4] ring-2 ring-[#005ea4]/20 shadow-xs'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'} ${buttonClassName}`}
      >
        <span className="truncate text-slate-800 font-medium">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-180 text-[#005ea4]' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu with smooth transition */}
      <div
        className={`absolute left-0 right-0 ${
          dropUp ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
        } z-50 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-300/40 p-1 overflow-hidden transition-all duration-200 ease-out transform ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : `opacity-0 scale-95 ${dropUp ? 'translate-y-2' : '-translate-y-2'} pointer-events-none`
        }`}
      >
        <div className="space-y-0.5 max-h-56 overflow-y-auto">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 text-[#005ea4] font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="truncate block font-medium">
                  {opt.label}
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 shrink-0 text-[#005ea4] ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
