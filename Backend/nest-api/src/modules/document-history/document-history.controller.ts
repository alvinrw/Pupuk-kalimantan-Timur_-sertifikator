import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import 'multer';
import { Controller, Post, Get, Query, Req, Res, UseInterceptors, UploadedFile, BadRequestException, Body , UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { DocumentHistoryService } from './document-history.service';
import { PdfWatermarkService } from './pdf-watermark.service';
import { Response } from 'express';

@ApiTags('Document History')
@Controller('document-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User', 'Viewer')
export class DocumentHistoryController {
  constructor(
    private readonly documentHistoryService: DocumentHistoryService,
    private readonly pdfWatermarkService: PdfWatermarkService,
  ) {}

  @Roles('Super Admin', 'Admin', 'User')
  @Post('upload')
  @ApiOperation({ summary: 'Unggah file (PDF/Image) ke MinIO Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File yang akan diunggah (PDF, JPG, PNG, Maks. 5MB)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 20 * 1024 * 1024 }, // Batas ukuran 20 MB
    fileFilter: (req, file, cb) => {
      // Hanya izinkan PDF dan Gambar
      if (!file.mimetype.match(/\/(pdf|jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Format file tidak didukung! Hanya PDF, JPG, dan PNG yang diizinkan.'), false);
      }
      cb(null, true);
    }
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan atau format dilarang!');
    }

    const uploadResult = await this.documentHistoryService.uploadFile(file);

    return {
      statusCode: 201,
      message: 'File berhasil diunggah ke storage MinIO!',
      data: uploadResult,
    };
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Post('upload-temp')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(pdf|jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Format file tidak didukung!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadTempFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File tidak ditemukan!');
    const uploadResult = await this.documentHistoryService.uploadTempFile(file);
    return {
      statusCode: 201,
      message: 'File berhasil diunggah ke temporary storage!',
      data: uploadResult,
    };
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Post('move-temp')
  async moveTemp(@Body() body: { tempUrl: string }) {
    if (!body || !body.tempUrl) {
      throw new BadRequestException('tempUrl wajib diberikan');
    }
    const finalUrl = await this.documentHistoryService.moveTempToFinal(body.tempUrl);
    return {
      statusCode: 200,
      message: 'File berhasil dipindahkan ke final storage',
      data: { url: finalUrl }
    };
  }

  @Get('view-watermarked')
  @ApiOperation({ summary: 'Melihat file PDF/Gambar dengan watermark dinamis' })
  async viewWatermarked(
    @Query('filePath') filePath: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    if (!filePath) {
      throw new BadRequestException('filePath wajib diberikan');
    }

    try {
      const bucketName = this.documentHistoryService['bucketName'] || 'sertifikator-docs';
      let objectKey = '';
      
      if (filePath.includes(`/${bucketName}/`)) {
        objectKey = filePath.split(`/${bucketName}/`)[1];
      } else {
        objectKey = filePath;
      }

      const buffer = await this.documentHistoryService.getFileBuffer(objectKey);
      
      let contentType = 'application/octet-stream';
      if (objectKey.toLowerCase().endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else if (objectKey.toLowerCase().endsWith('.png')) {
        contentType = 'image/png';
      } else if (objectKey.toLowerCase().endsWith('.jpg') || objectKey.toLowerCase().endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      }

      res.setHeader('Content-Type', contentType);

      if (contentType === 'application/pdf') {
        const userDesc = `${req.user.username.toUpperCase()} (${req.user.npk || '-'})`;
        const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }); // WITA (Bontang time)
        const watermarkText = `DIKUNJUNGI OLEH ${userDesc} PADA ${dateStr} WITA`;
        
        const watermarkedBuffer = await this.pdfWatermarkService.addWatermark(buffer, watermarkText);
        res.setHeader('Content-Length', watermarkedBuffer.length);
        res.send(watermarkedBuffer);
      } else {
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
      }
    } catch (error) {
      throw new BadRequestException(`Gagal memuat dokumen: ${error.message}`);
    }
  }

}