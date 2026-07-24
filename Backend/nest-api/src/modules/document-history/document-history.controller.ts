import 'multer';
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { DocumentHistoryService } from './document-history.service';

@ApiTags('Document History')
@Controller('document-history')
export class DocumentHistoryController {
  constructor(private readonly documentHistoryService: DocumentHistoryService) {}

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
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran 5 MB
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
}
