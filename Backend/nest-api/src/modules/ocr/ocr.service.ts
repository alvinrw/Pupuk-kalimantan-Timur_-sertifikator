import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

@Injectable()
export class OcrService {
  constructor(private readonly httpService: HttpService) {}

  async processScan(file: any) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    try {
      // Siapkan FormData untuk dikirim ke Python
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      // Panggil endpoint FastAPI (Python) yang ada di port 8000
      const response = await firstValueFrom(
        this.httpService.post('http://127.0.0.1:8000/api/v1/ocr/process-pdf', formData, {
          headers: formData.getHeaders(),
        }),
      ) as any;

      return response.data;
    } catch (error: any) {
      // Tangkap error jika server Python mati atau gagal nge-proses
      const errorMessage = error.response?.data?.detail || error.message;
      throw new HttpException(
        `AI OCR Service Error: ${errorMessage}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
