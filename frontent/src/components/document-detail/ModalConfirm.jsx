/**
 * ModalConfirm ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Reusable generic confirmation modal.
 * Menggantikan 5 blok modal konfirmasi yang hampir identik di DocumentDetailPage.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onConfirm: () => void | Promise<void>
 *  - isLoading?: boolean
 *  - title: string
 *  - description: ReactNode
 *  - confirmLabel?: string
 *  - confirmClassName?: string  (tailwind class untuk tombol konfirmasi)
 *  - icon?: ReactElement
 *  - iconBgClassName?: string
 */
import React from 'react';

export default function ModalConfirm({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmLabel = 'Ya, Konfirmasi',
  confirmClassName = 'bg-rose-600 hover:bg-rose-700 text-white',
  icon,
  iconBgClassName = 'bg-rose-100 text-rose-600'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 text-center space-y-3">
          {icon && (
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${iconBgClassName}`}>
              {icon}
            </div>
          )}
          <h4 className="font-bold text-base text-slate-900">{title}</h4>
          <div className="text-xs text-slate-600 font-medium pb-2">{description}</div>
          <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 ${confirmClassName}`}
            >
              {isLoading ? 'Memproses...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
