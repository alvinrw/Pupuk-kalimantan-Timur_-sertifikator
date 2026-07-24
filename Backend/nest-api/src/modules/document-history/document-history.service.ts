import 'multer';
import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class DocumentHistoryService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;
  private readonly logger = new Logger(DocumentHistoryService.name);

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'sertifikator-docs');
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully.`);
        
        // Mengatur policy agar file bisa diakses publik secara baca
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      } else {
        this.logger.log(`Bucket '${this.bucketName}' ready.`);
      }
    } catch (error) {
      this.logger.warn(`MinIO connection warning (ignorable if minio is offline): ${error.message}`);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('File is missing');
    }

    try {
      // Buat nama unik berdasarkan waktu saat ini
      const timestamp = Date.now();
      const safeOriginalName = file.originalname.replace(/\s+/g, '_');
      const fileName = `${timestamp}-${safeOriginalName}`;

      // Upload *buffer* file langsung ke MinIO
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );

      // Membuat URL akses publik
      const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
      const port = this.configService.get<string>('MINIO_PORT', '9000');
      const protocol = this.configService.get<string>('MINIO_USE_SSL') === 'true' ? 'https' : 'http';
      
      const fileUrl = `${protocol}://${endPoint}:${port}/${this.bucketName}/${fileName}`;

      this.logger.log(`File uploaded successfully: ${fileName}`);

      return {
        originalName: file.originalname,
        fileName: fileName,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file to MinIO: ${error.message}`);
      throw new InternalServerErrorException('Gagal mengunggah file ke MinIO storage (pastikan container MinIO hidup)');
    }
  }
}
