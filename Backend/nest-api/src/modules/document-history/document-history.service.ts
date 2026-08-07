import 'multer';
import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
      } else {
        this.logger.log(`Bucket '${this.bucketName}' ready.`);
      }

      // Selalu pastikan policy diset ke Public Read agar file PDF bisa dibuka tanpa AccessDenied
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
      this.logger.log(`🔓 Bucket policy '${this.bucketName}' diset ke Public Read.`);
    } catch (error) {
      this.logger.warn(`MinIO connection warning: ${error.message}`);
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


  async uploadTempFile(file: Express.Multer.File) {
    if (!file) throw new InternalServerErrorException('File is missing');
    try {
      const timestamp = Date.now();
      const safeOriginalName = file.originalname.replace(/\s+/g, '_');
      const fileName = `temp-certificates/${timestamp}-${safeOriginalName}`;

      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );

      const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
      const port = this.configService.get<string>('MINIO_PORT', '9000');
      const protocol = this.configService.get<string>('MINIO_USE_SSL') === 'true' ? 'https' : 'http';
      
      const fileUrl = `${protocol}://${endPoint}:${port}/${this.bucketName}/${fileName}`;
      this.logger.log(`Temporary file uploaded successfully: ${fileName}`);

      return {
        originalName: file.originalname,
        fileName: fileName,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to upload temp file: ${error.message}`);
      throw new InternalServerErrorException('Gagal mengunggah file temporary ke MinIO');
    }
  }

  async moveTempToFinal(tempUrl: string) {
    if (!tempUrl || !tempUrl.includes('temp-certificates/')) return tempUrl;
    
    try {
      const urlParts = tempUrl.split('/');
      const fileName = urlParts.slice(urlParts.indexOf(this.bucketName) + 1).join('/');
      if (!fileName.startsWith('temp-certificates/')) return tempUrl;

      const finalFileName = fileName.replace('temp-certificates/', 'certificates/');

      const conds = new Minio.CopyConditions();
      await this.minioClient.copyObject(
        this.bucketName,
        finalFileName,
        `/${this.bucketName}/${fileName}`,
        conds
      );
      
      await this.minioClient.removeObject(this.bucketName, fileName);

      const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
      const port = this.configService.get<string>('MINIO_PORT', '9000');
      const protocol = this.configService.get<string>('MINIO_USE_SSL') === 'true' ? 'https' : 'http';
      
      return `${protocol}://${endPoint}:${port}/${this.bucketName}/${finalFileName}`;
    } catch (error) {
      this.logger.error(`Failed to move temp file to final: ${error.message}`);
      throw new InternalServerErrorException('Gagal memindahkan file ke final bucket');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupTempFiles() {
    this.logger.log('Running cleanup for temp-certificates...');
    const objectsToRemove = [];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stream = this.minioClient.listObjectsV2(this.bucketName, 'temp-certificates/', true);
    
    stream.on('data', (obj) => {
      if (obj.lastModified < yesterday) {
        objectsToRemove.push(obj.name);
      }
    });

    stream.on('end', async () => {
      if (objectsToRemove.length > 0) {
        try {
          await this.minioClient.removeObjects(this.bucketName, objectsToRemove);
          this.logger.log(`Cleaned up ${objectsToRemove.length} temporary files.`);
        } catch (e) {
          this.logger.error(`Error removing temp files: ${e.message}`);
        }
      } else {
        this.logger.log('No temporary files needed cleanup.');
      }
    });
    
    stream.on('error', (err) => {
      this.logger.error(`Error listing temp files for cleanup: ${err.message}`);
    });
  }

  async getFileBuffer(objectName: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      this.minioClient.getObject(this.bucketName, objectName, (err, dataStream) => {
        if (err) return reject(err);
        dataStream.on('data', chunk => chunks.push(Buffer.from(chunk)));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', e => reject(e));
      });
    });
  }

}