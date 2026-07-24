import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'sertifikator-docs');

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  /**
   * Mengecek apakah bucket sudah ada, jika belum maka dibuat secara otomatis.
   */
  async ensureBucketExists() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`✅ Bucket '${this.bucketName}' berhasil dibuat di MinIO secara otomatis!`);
      } else {
        this.logger.log(`ℹ️ Bucket '${this.bucketName}' sudah ada dan siap digunakan.`);
      }
    } catch (error) {
      this.logger.error(`⚠️ Gagal inisialisasi bucket MinIO: ${error.message}`);
    }
  }

  /**
   * Upload file PDF / Dokumen ke MinIO
   */
  async uploadFile(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.minioClient.putObject(this.bucketName, filename, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
    this.logger.log(`📤 File ${filename} berhasil di-upload ke MinIO`);
    return filename;
  }

  /**
   * Mendapatkan URL unduh/preview sementara (Presigned URL)
   */
  async getPresignedUrl(filename: string, expirySeconds: number = 3600): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucketName, filename, expirySeconds);
  }
}
