/**
 * PdfCanvasOcrViewer.jsx
 * 
 * Komponen PDF Viewer berbasis canvas (pdfjs-dist) dengan fitur Drag-to-Select + OCR (tesseract.js).
 * Menggantikan <iframe> agar konten PDF bisa diakses dan di-crop untuk OCR.
 *
 * Props:
 * - pdfUrl: string - URL PDF yang akan dirender (dari MinIO)
 * - scanMode: 'noSertifikat' | 'terbit' | 'expired' | null - field yang sedang ditarget scan
 * - onScanComplete: (fieldKey: string, rawText: string) => void - callback hasil OCR
 * - onScanCancel: () => void - callback saat scan dibatalkan
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FileText, ChevronLeft, ChevronRight, Crosshair, Loader2, X, ScanLine } from 'lucide-react';

// Label yang ditampilkan di overlay saat scan mode aktif
const SCAN_LABELS = {
  noSertifikat: 'No. Sertifikat',
  terbit: 'Tanggal Terbit',
  expired: 'Tanggal Berakhir',
};

const SCAN_COLORS = {
  noSertifikat: '#005ea4',
  terbit: '#059669',
  expired: '#dc2626',
};

export default function PdfCanvasOcrViewer({
  pdfUrl,
  scanMode,
  onScanComplete,
  onScanCancel,
}) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const pdfDocRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [ocrStatusMsg, setOcrStatusMsg] = useState('');

  // Drag selection state
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, endX: 0, endY: 0 });
  const selectionCanvasRef = useRef(null);

  // ─── Load PDF menggunakan pdfjs-dist ───────────────────────────────────────
  useEffect(() => {
    if (!pdfUrl) return;

    let cancelled = false;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import untuk code-splitting
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set worker path (menggunakan CDN untuk kemudahan, juga bisa lokal)
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
        await renderPage(pdfDoc, 1);
      } catch (err) {
        if (!cancelled) {
          console.error('PDF load error:', err);
          setError('Gagal memuat PDF. Pastikan koneksi ke server aktif.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPdf();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // ─── Re-render saat halaman berubah ───────────────────────────────────────
  useEffect(() => {
    if (pdfDocRef.current && currentPage) {
      renderPage(pdfDocRef.current, currentPage);
    }
  }, [currentPage]);

  // ─── Render halaman PDF ke canvas ─────────────────────────────────────────
  const renderPage = async (pdfDoc, pageNum) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const page = await pdfDoc.getPage(pageNum);
    const container = canvas.parentElement;
    const containerWidth = container?.clientWidth || 600;

    const viewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Sync ukuran selection canvas
    if (selectionCanvasRef.current) {
      selectionCanvasRef.current.width = scaledViewport.width;
      selectionCanvasRef.current.height = scaledViewport.height;
    }

    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
  };

  // ─── Drag-to-Select Logic ──────────────────────────────────────────────────
  const getCanvasPos = useCallback((e) => {
    const canvas = selectionCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const drawSelection = useCallback(() => {
    const selCanvas = selectionCanvasRef.current;
    if (!selCanvas) return;
    const ctx = selCanvas.getContext('2d');
    ctx.clearRect(0, 0, selCanvas.width, selCanvas.height);

    const d = dragRef.current;
    if (!d.isDragging) return;

    const x = Math.min(d.startX, d.endX);
    const y = Math.min(d.startY, d.endY);
    const w = Math.abs(d.endX - d.startX);
    const h = Math.abs(d.endY - d.startY);

    const color = SCAN_COLORS[scanMode] || '#005ea4';

    // Overlay gelap di luar selection
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, selCanvas.width, selCanvas.height);

    // Clear area selection
    ctx.clearRect(x, y, w, h);

    // Border selection
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(x, y, w, h);

    // Corner handles
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    const handleSize = 6;
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([hx, hy]) => {
      ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
    });
  }, [scanMode]);

  const handleMouseDown = useCallback((e) => {
    if (!scanMode || isOcrRunning) return;
    const pos = getCanvasPos(e);
    dragRef.current = { isDragging: true, startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y };
    drawSelection();
  }, [scanMode, isOcrRunning, getCanvasPos, drawSelection]);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.isDragging) return;
    const pos = getCanvasPos(e);
    dragRef.current.endX = pos.x;
    dragRef.current.endY = pos.y;
    drawSelection();
  }, [getCanvasPos, drawSelection]);

  const handleMouseUp = useCallback(async (e) => {
    if (!dragRef.current.isDragging || !scanMode) return;
    dragRef.current.isDragging = false;

    const d = dragRef.current;
    const x = Math.min(d.startX, d.endX);
    const y = Math.min(d.startY, d.endY);
    const w = Math.abs(d.endX - d.startX);
    const h = Math.abs(d.endY - d.startY);

    // Minimum area
    if (w < 20 || h < 10) {
      const selCanvas = selectionCanvasRef.current;
      if (selCanvas) selCanvas.getContext('2d').clearRect(0, 0, selCanvas.width, selCanvas.height);
      return;
    }

    // Crop area dari main canvas
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = w;
    cropCanvas.height = h;
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.drawImage(mainCanvas, x, y, w, h, 0, 0, w, h);

    // Jalankan Tesseract OCR
    try {
      setIsOcrRunning(true);
      setOcrStatusMsg('Membaca area yang dipilih...');

      const Tesseract = await import('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(
        cropCanvas,
        'ind+eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrStatusMsg(`Memindai... ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      setOcrStatusMsg('Selesai!');
      onScanComplete(scanMode, text);
    } catch (err) {
      console.error('Tesseract OCR error:', err);
      setOcrStatusMsg('OCR gagal. Coba pilih area lebih besar.');
      setTimeout(() => setOcrStatusMsg(''), 3000);
    } finally {
      setIsOcrRunning(false);
      // Clear selection overlay
      const selCanvas = selectionCanvasRef.current;
      if (selCanvas) selCanvas.getContext('2d').clearRect(0, 0, selCanvas.width, selCanvas.height);
    }
  }, [scanMode, onScanComplete]);

  // ─── Render ────────────────────────────────────────────────────────────────
  const activeScanColor = scanMode ? SCAN_COLORS[scanMode] : '#005ea4';
  const activeScanLabel = scanMode ? SCAN_LABELS[scanMode] : '';

  return (
    <div className="flex flex-col w-full h-full">
      {/* Toolbar */}
      <div className="h-10 bg-slate-800 flex items-center justify-between px-4 text-white shrink-0 gap-2">
        <div className="flex items-center gap-2 text-xs font-bold font-mono-data">
          <FileText className="w-4 h-4" />
          {scanMode ? (
            <span style={{ color: activeScanColor }} className="animate-pulse">
              ✂️ Mode Scan: {activeScanLabel} — Drag area di PDF
            </span>
          ) : (
            <span>Preview PDF (Live Verification)</span>
          )}
        </div>
        {/* Page navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 text-xs font-mono-data">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-auto bg-slate-200">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#005ea4] mb-2" />
            <span className="text-xs font-bold text-slate-600">Memuat PDF...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-20 p-6 text-center">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        )}

        {!pdfUrl && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-3">
            <FileText className="w-16 h-16 opacity-25" />
            <div>
              <h5 className="font-bold text-slate-600 text-sm">Preview Belum Tersedia</h5>
              <p className="text-xs mt-1 max-w-xs text-slate-400">
                Pilih file PDF di panel sebelah kiri untuk menampilkan preview di sini.
              </p>
            </div>
          </div>
        )}

        {/* Main PDF canvas */}
        <canvas ref={canvasRef} className="block w-full" style={{ display: pdfUrl ? 'block' : 'none' }} />

        {/* Overlay canvas untuk drag selection — mounted di atas main canvas */}
        {pdfUrl && (
          <canvas
            ref={selectionCanvasRef}
            className="absolute top-0 left-0 w-full"
            style={{
              cursor: scanMode && !isOcrRunning ? 'crosshair' : 'default',
              opacity: scanMode ? 1 : 0,
              pointerEvents: scanMode ? 'all' : 'none',
              zIndex: 10,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        )}

        {/* OCR Running overlay */}
        {isOcrRunning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 max-w-xs text-center">
              <ScanLine className="w-8 h-8 text-[#005ea4] animate-pulse" />
              <p className="font-bold text-sm text-slate-800">Memindai Area...</p>
              <p className="text-xs text-slate-500 font-mono-data">{ocrStatusMsg}</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#005ea4] h-1.5 rounded-full animate-pulse" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Scan mode instruction overlay hint (hanya saat scanMode aktif, sebelum drag) */}
        {scanMode && !isOcrRunning && pdfUrl && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-white text-xs font-bold font-mono-data"
              style={{ backgroundColor: activeScanColor + 'ee' }}
            >
              <Crosshair className="w-4 h-4" />
              <span>Drag untuk pilih area <strong>{activeScanLabel}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
