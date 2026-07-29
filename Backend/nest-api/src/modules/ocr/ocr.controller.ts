import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService, OcrScanResult } from './ocr.service';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('scan-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async scanPdf(@UploadedFile() file: Express.Multer.File): Promise<{ success: boolean; data: OcrScanResult }> {
    if (!file) {
      throw new BadRequestException('File PDF wajib diunggah!');
    }

    if (!file.mimetype.includes('pdf') && !file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Format file harus berupa .pdf!');
    }

    const result = await this.ocrService.scanPdf(file.buffer);

    return {
      success: true,
      data: result,
    };
  }
}
