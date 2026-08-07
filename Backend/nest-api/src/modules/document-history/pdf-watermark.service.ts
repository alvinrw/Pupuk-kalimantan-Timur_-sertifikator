import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

@Injectable()
export class PdfWatermarkService {
  private readonly logger = new Logger(PdfWatermarkService.name);

  async addWatermark(pdfBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Render diagonal watermark across the page (two instances for better coverage)
        page.drawText(watermarkText, {
          x: width / 12,
          y: height / 3,
          size: 20,
          rotate: degrees(30),
          color: rgb(0.8, 0.2, 0.2), // Reddish watermark to make it distinct
          opacity: 0.35, // Clearer transparency
        });

        page.drawText(watermarkText, {
          x: width / 12,
          y: (height * 2) / 3,
          size: 20,
          rotate: degrees(30),
          color: rgb(0.8, 0.2, 0.2),
          opacity: 0.35,
        });
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
