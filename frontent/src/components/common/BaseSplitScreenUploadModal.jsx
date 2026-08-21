import React, { useState } from 'react';
import { X, FileText, ClipboardList, Eye } from 'lucide-react';

/**
 * Reusable Base Component untuk Modal Upload & Verification (Split Screen)
 * Menyediakan layout 2 kolom konsisten (Left: Form input, Right: PDF Preview)
 * — Responsif: di mobile, pakai tab switcher antara Form & Preview.
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
  /** Opsional: jika diisi, render komponen ini di sisi kanan (mengganti iframe default) */
  rightPanelContent = null,
  children
}) {
  const [mobileTab, setMobileTab] = useState('form'); // 'form' | 'preview'

  if (!isOpen) return null;

  const hasPreview = !!(tempUrl || rightPanelContent);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 font-sans-clean">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col overflow-hidden max-h-[95dvh] sm:max-h-[90vh]">

        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {HeaderIcon && (
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#005ea4] text-white flex items-center justify-center shrink-0">
                <HeaderIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm truncate">{title}</h3>
              {subtitle && (
                <p className="text-[10px] sm:text-[11px] text-blue-300 font-mono-data mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Mobile Tab Switcher (hanya muncul di layar kecil) ─── */}
        <div className="flex md:hidden shrink-0 border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              mobileTab === 'form'
                ? 'text-[#005ea4] border-[#005ea4] bg-white'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Formulir</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              mobileTab === 'preview'
                ? 'text-[#005ea4] border-[#005ea4] bg-white'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview PDF</span>
            {hasPreview && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            )}
          </button>
        </div>

        {/* ─── Modal Body: Split Screen ─────────────────────────── */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

          {/* Sisi Kiri: Form Input — tampil di desktop selalu, di mobile hanya jika tab 'form' */}
          <div className={`${mobileTab === 'form' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[45%] min-h-0 border-r border-slate-200`}>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs font-mono-data">
              <form id={formId} onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
                {children}
              </form>
            </div>

            {/* Footer Formulir */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 cursor-pointer text-xs transition-colors"
              >
                Batal
              </button>

              {/* Di mobile: tambah shortcut ke Preview */}
              {hasPreview && (
                <button
                  type="button"
                  onClick={() => setMobileTab('preview')}
                  className="flex md:hidden items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#005ea4] bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Lihat PDF
                </button>
              )}

              <button
                type="submit"
                form={formId}
                disabled={submitDisabled}
                className="px-4 sm:px-5 py-2 bg-[#005ea4] hover:bg-[#004881] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs shadow-xs transition-colors ml-auto"
              >
                {SubmitIcon && <SubmitIcon className="w-4 h-4" />}
                <span>{submitText}</span>
              </button>
            </div>
          </div>

          {/* Sisi Kanan: PDF Preview — di desktop selalu tampil, di mobile hanya jika tab 'preview' */}
          <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-col flex-1 md:w-[55%] bg-slate-100 relative overflow-hidden`}>
            {rightPanelContent ? (
              // Custom right panel (e.g. PdfCanvasOcrViewer dengan drag-to-OCR)
              <div className="flex-1 flex flex-col w-full h-full">
                {rightPanelContent}
              </div>
            ) : (
              // Default: iframe PDF preview
              <>
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
              </>
            )}

            {/* Tombol kembali ke form — hanya di mobile */}
            {mobileTab === 'preview' && (
              <div className="flex md:hidden items-center justify-between px-4 py-3 bg-slate-800 border-t border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileTab('form')}
                  className="text-xs font-bold text-blue-300 flex items-center gap-1.5"
                >
                  ← Kembali ke Formulir
                </button>
                <button
                  type="submit"
                  form={formId}
                  disabled={submitDisabled}
                  className="px-4 py-2 bg-[#005ea4] hover:bg-[#004881] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs shadow-xs transition-colors"
                >
                  {SubmitIcon && <SubmitIcon className="w-3.5 h-3.5" />}
                  <span>{submitText}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
