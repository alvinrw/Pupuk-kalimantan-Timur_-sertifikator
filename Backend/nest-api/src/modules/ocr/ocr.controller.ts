import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('upload-scan')
  @UseInterceptors(FileInterceptor('file'))
  async uploadScanFile(@UploadedFile() file: any) {
    // Fungsi ini menerima file dari Frontend (lewat form-data ber-key 'file')
    // Lalu dilempar ke service untuk diteruskan ke Python
    return this.ocrService.processScan(file);
  }
}
