import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfWatermarkService {
  private readonly logger = new Logger(PdfWatermarkService.name);

  async addWatermark(pdfBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    return pdfBuffer;
  }
}
