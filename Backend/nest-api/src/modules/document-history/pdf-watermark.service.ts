import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

@Injectable()
export class PdfWatermarkService {
  private readonly logger = new Logger(PdfWatermarkService.name);

  async addWatermark(pdfBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 20;
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = font.heightAtSize(fontSize);
      
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const rotation = page.getRotation().angle || 0;
        
        // Add the page's rotation to the 30-degree watermark angle
        // This ensures the watermark is always readable upright, even if the PDF was scanned upside-down (180 deg)
        const rad = (30 + rotation) * (Math.PI / 180);
        const angle = degrees(30 + rotation);

        // Vector from text center to bottom-left corner, rotated by 'rad'
        const dx = (-textWidth / 2) * Math.cos(rad) - (-textHeight / 2) * Math.sin(rad);
        const dy = (-textWidth / 2) * Math.sin(rad) + (-textHeight / 2) * Math.cos(rad);

        // Helper to draw text centered at a given cx, cy
        const drawCentered = (cx: number, cy: number) => {
          page.drawText(watermarkText, {
            x: cx + dx,
            y: cy + dy,
            size: fontSize,
            font: font,
            rotate: angle,
            color: rgb(0.8, 0.2, 0.2),
            opacity: 0.35,
          });
        };

        // Draw two watermarks: roughly at 1/3 and 2/3 of the page
        drawCentered(width / 2, (height * 2) / 3);
        drawCentered(width / 2, height / 3);
      }

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      this.logger.error(`Error adding watermark: ${error.message}`);
      // Fallback: return original buffer if watermarking fails
      return pdfBuffer;
    }
  }
}
