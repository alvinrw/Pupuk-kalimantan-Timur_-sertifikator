import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService, OcrScanResult } from './ocr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// [FIX C-02] Lindungi endpoint OCR agar hanya user terautentikasi yang bisa mengaksesnya
@Controller('ocr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User')
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
