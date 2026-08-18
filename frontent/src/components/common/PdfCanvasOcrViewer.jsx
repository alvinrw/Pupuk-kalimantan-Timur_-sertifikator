import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FileText, ChevronLeft, ChevronRight, Crosshair, Loader2, X, ScanLine, ZoomIn, ZoomOut } from 'lucide-react';
import { API_BASE } from '../../config/api';
import Tesseract from 'tesseract.js';
import 'pdfjs-dist/web/pdf_viewer.css';

// Label yang ditampilkan di overlay saat scan mode aktif
const SCAN_LABELS = {
  jenisSertifikat: 'Jenis / Nama Sertifikat',
  noSertifikat: 'No. Sertifikat',
  terbit: 'Tanggal Terbit',
  expired: 'Tanggal Berakhir',
  instansi: 'Instansi Penerbit',
};

const SCAN_COLORS = {
  jenisSertifikat: '#f59e0b',
  noSertifikat: '#005ea4',
  terbit: '#059669',
  expired: '#dc2626',
  instansi: '#8b5cf6',
};

export default function PdfCanvasOcrViewer({
  pdfUrl,
  scanMode,
  onScanComplete,
  onScanCancel,
}) {
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const textLayerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1); // UI Zoom Level
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

        const pdfjsLib = await import('pdfjs-dist');
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
        setZoomLevel(1); // Reset zoom
        await renderPage(pdfDoc, 1, 1);
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

  // ─── Re-render saat halaman berubah atau zoom ─────────────────────────────
  useEffect(() => {
    if (pdfDocRef.current && currentPage) {
      renderPage(pdfDocRef.current, currentPage, zoomLevel);
    }
  }, [currentPage, zoomLevel]);

  // ─── Render halaman PDF ke canvas ─────────────────────────────────────────
  const renderPage = async (pdfDoc, pageNum, currentZoom) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const page = await pdfDoc.getPage(pageNum);
    
    // Gunakan scrollContainer (parent dari wrapper) untuk referensi baseScale
    // agar ukurannya tidak ikut membesar secara rekursif saat canvas membesar.
    const wrapper = canvas.parentElement;
    const scrollContainer = wrapper?.parentElement;
    const containerWidth = (scrollContainer?.clientWidth || 600) - 32; // kurangi padding

    const viewport = page.getViewport({ scale: 1 });
    const baseScale = containerWidth / viewport.width;
    const finalScale = baseScale * currentZoom;

    const scaledViewport = page.getViewport({ scale: finalScale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    if (selectionCanvasRef.current) {
      selectionCanvasRef.current.width = scaledViewport.width;
      selectionCanvasRef.current.height = scaledViewport.height;
    }

    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

    // ─── Render Text Layer untuk Native Selection ───
    try {
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = '';
        const textContent = await page.getTextContent();
        const pdfjsLib = await import('pdfjs-dist');
        textLayerRef.current.style.setProperty('--scale-factor', finalScale);
        textLayerRef.current.style.setProperty('--user-unit', '1');
        textLayerRef.current.style.setProperty('--total-scale-factor', finalScale);

        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerRef.current,
          viewport: scaledViewport,
        });
        await textLayer.render();
      }
    } catch (e) {
      console.warn('Text layer render failed:', e);
    }

    // ─── Draw Watermark ───
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userName = user.name || user.nama || user.username || 'USER';
        const userCode = user.nik || user.employeeId || 'PKT';
        const dateStr = new Date().toLocaleString('id-ID', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const watermarkText = `DIKUNJUNGI OLEH ${userName.toUpperCase()} (${userCode}) PADA ${dateStr}`;
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6); // -30 degrees
        
        const fontSize = Math.max(16, canvas.width / 25);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(watermarkText, 0, 0);
        ctx.fillText(watermarkText, 0, -canvas.height / 3);
        ctx.fillText(watermarkText, 0, canvas.height / 3);
        
        ctx.restore();
      }
    } catch (e) {
      console.warn('Failed to draw watermark on canvas:', e);
    }
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

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, selCanvas.width, selCanvas.height);
    ctx.clearRect(x, y, w, h);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(x, y, w, h);

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

    if (w < 20 || h < 10) {
      const selCanvas = selectionCanvasRef.current;
      if (selCanvas) selCanvas.getContext('2d').clearRect(0, 0, selCanvas.width, selCanvas.height);
      return;
    }

    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;

    // ─── OCR Pre-processing Pipeline (Super Melek) ───
    // 1. Upscaling 4x agar teks super tajam + Margin (Padding)
    const scaleFactor = 4;
    const padding = 40; // Tesseract sangat butuh "ruang bernafas" (margin putih) di pinggiran teks
    
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = (w * scaleFactor) + (padding * 2);
    cropCanvas.height = (h * scaleFactor) + (padding * 2);
    const cropCtx = cropCanvas.getContext('2d');
    
    // Fill canvas dengan warna putih bersih sebagai background (padding)
    cropCtx.fillStyle = '#ffffff';
    cropCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    
    // Biarkan smoothing menyala (default) karena PaddleOCR butuh garis anti-aliasing yang halus
    // cropCtx.imageSmoothingEnabled = false; 
    
    // Gambar potongan PDF di tengah-tengah area padding
    cropCtx.drawImage(mainCanvas, x, y, w, h, padding, padding, w * scaleFactor, h * scaleFactor);

    // Filter Binarization (Hitam-Putih paksa) DIHAPUS.
    // PaddleOCR adalah AI Deep Learning yang dilatih dengan gambar RGB asli. 
    // Memaksanya jadi hitam putih murni justru merusak akurasi garis bawah dan huruf miring!
    // ─────────────────────────────────────────────────

    try {
      setIsOcrRunning(true);
      setOcrStatusMsg('Mengirim gambar ke OCR Engine...');

      // Convert canvas ke Data URL untuk Tesseract.js
      const dataUrl = cropCanvas.toDataURL('image/png');
      
      setOcrStatusMsg('Sedang mengekstrak teks dengan AI...');
      
      // Menggunakan Tesseract.js secara lokal di browser
      const { data: { text } } = await Tesseract.recognize(dataUrl, 'ind+eng', {
        logger: m => console.log(m)
      });
      
      setOcrStatusMsg('Selesai!');
      console.log('OCR Result:', text);
      
      // Cleanup teks: hapus spasi berlebih
      const cleanText = (text || '').replace(/\n/g, ' ').trim();
      onScanComplete(scanMode, cleanText);
      
      // Reset scan mode in Modal (parent will call onScanComplete which might not reset scanMode immediately, but ModalAddLinkedCert does reset it via onScanComplete callback if we pass the right signature)
      // Wait, ModalAddLinkedCert expects onScanComplete(text) if we change it?
      // In ModalAddLinkedCert: handleOcrResult = (text) => { ... }
      // So wait, Modal expects ONLY 1 argument? Let me check ModalAddLinkedCert.jsx
    } catch (err) {
      console.error('Tesseract OCR error:', err.message, err);
      setOcrStatusMsg(`Error: Gagal mengekstrak teks.`);
      setTimeout(() => setOcrStatusMsg(''), 4000);
    } finally {
      setIsOcrRunning(false);
      const selCanvas = selectionCanvasRef.current;
      if (selCanvas) selCanvas.getContext('2d').clearRect(0, 0, selCanvas.width, selCanvas.height);
    }
  }, [scanMode, onScanComplete]);

  const activeScanColor = scanMode ? SCAN_COLORS[scanMode] : '#005ea4';
  const activeScanLabel = scanMode ? SCAN_LABELS[scanMode] : '';

  return (
    <div className="flex flex-col w-full h-full">
      {/* Toolbar */}
      <div className="h-10 bg-slate-800 flex items-center px-4 text-white shrink-0 gap-2">
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

        {/* Zoom Controls */}
        {pdfUrl && !isLoading && (
          <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-0.5 ml-auto">
            <button
              onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
              className="p-1 hover:bg-slate-600 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold w-9 text-center font-mono-data">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))}
              className="p-1 hover:bg-slate-600 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 text-xs font-mono-data ml-2 border-l border-slate-600 pl-3">
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

        {pdfUrl && (
        <div className="relative w-max h-max mx-auto shadow-xl" style={{ lineHeight: 0 }}>
          <canvas ref={canvasRef} className="block bg-white shadow-xl" />

          <div 
            ref={textLayerRef}
            className="textLayer"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              pointerEvents: scanMode ? 'none' : 'auto',
            }}
          />

          <canvas
            ref={selectionCanvasRef}
            className="absolute top-0 left-0"
            style={{ 
              cursor: scanMode ? 'crosshair' : 'default',
              pointerEvents: scanMode ? 'auto' : 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        )}

        {/* OCR Running overlay */}
        {isOcrRunning && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 z-50">
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

        {/* Scan mode instruction overlay hint */}
        {scanMode && !isOcrRunning && pdfUrl && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
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
