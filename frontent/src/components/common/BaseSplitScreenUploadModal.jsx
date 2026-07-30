import React from 'react';
import { X, FileText } from 'lucide-react';

/**
 * Reusable Base Component untuk Modal Upload & Verification (Split Screen)
 * Menyediakan layout 2 kolom konsisten (Left: Form input, Right: PDF Preview)
 */
export default function BaseSplitScreenUploadModal({
  isOpen,
  onClose,
  title,
  subtitle,
  headerIcon: HeaderIcon,
  formId,
  onSubmit,
  submitDisabled,
  submitText = 'Simpan Final (Submit)',
  submitIcon: SubmitIcon,
  tempUrl,
  pdfPreviewEmptyText = 'Silakan pilih file PDF di panel sebelah kiri untuk menampilkan preview dokumen secara langsung di sini.',
  children
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans-clean">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {HeaderIcon && (
              <div className="p-2 rounded-lg bg-[#005ea4] text-white flex items-center justify-center">
                <HeaderIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm">{title}</h3>
              {subtitle && (
                <p className="text-[11px] text-blue-300 font-mono-data mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Screen */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Sisi Kiri: Form Input slot */}
          <div className="w-full md:w-[45%] flex flex-col min-h-0 border-r border-slate-200">
            <div className="flex-1 overflow-y-auto p-6 text-xs font-mono-data">
              <form id={formId} onSubmit={onSubmit} className="space-y-6">
                {children}
              </form>
            </div>

            {/* Modal Footer (Terikat Sisi Kiri) */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                form={formId}
                disabled={submitDisabled}
                className="px-5 py-2 bg-[#005ea4] hover:bg-[#004881] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs shadow-xs transition-colors"
              >
                {SubmitIcon && <SubmitIcon className="w-4 h-4" />}
                <span>{submitText}</span>
              </button>
            </div>
          </div>

          {/* Sisi Kanan: PDF Preview Iframe */}
          <div className="hidden md:flex flex-col w-[55%] bg-slate-100 relative">
            <div className="absolute top-0 inset-x-0 h-10 bg-slate-800 flex items-center px-4 text-white font-mono-data text-xs font-bold gap-2 z-10 shadow-md">
              <FileText className="w-4 h-4" />
              Preview PDF (Live Verification)
            </div>
            <div className="flex-1 w-full h-full pt-10">
              {tempUrl ? (
                <iframe
                  src={`${tempUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 opacity-30" />
                  <div>
                    <h5 className="font-bold text-slate-600">Preview Belum Tersedia</h5>
                    <p className="text-xs mt-1 max-w-sm">{pdfPreviewEmptyText}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
