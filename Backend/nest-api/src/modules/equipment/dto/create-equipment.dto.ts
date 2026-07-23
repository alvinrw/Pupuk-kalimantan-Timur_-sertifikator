import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { StatusKelayakan, StatusSertifikasi } from '../enums/permit-status.enum';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'B-201-P2', description: 'Nomor Tag Peralatan Pabrik' })
  @IsString()
  @IsNotEmpty({ message: 'Tag Number wajib diisi' })
  tagNumber: string;

  @ApiProperty({ example: 'Primary Reformer Boiler Unit 2', description: 'Nama Peralatan Pabrik' })
  @IsString()
  @IsNotEmpty({ message: 'Nama Peralatan wajib diisi' })
  name: string;

  @ApiProperty({ example: 'Bejana Tekan / Boiler', description: 'Kategori Sertifikasi' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Pabrik 2 (Amonia)', description: 'Unit Pabrik' })
  @IsString()
  @IsNotEmpty()
  plantUnit: string;

  @ApiProperty({ example: 'Area Reformer - Zone A', description: 'Lokasi Spesifik' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Disnaker Kaltim', description: 'Instansi Penerbit Sertifikat' })
  @IsString()
  @IsNotEmpty()
  inspectionBody: string;

  @ApiProperty({ example: 'CERT-7734/DISNAKER-KT/2023', description: 'Nomor Sertifikat' })
  @IsString()
  @IsNotEmpty()
  certificateNo: string;

  @ApiProperty({ example: '2023-04-15', description: 'Tanggal Terbit' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ example: '2026-08-15', description: 'Tanggal Berakhir / Expired' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ enum: StatusKelayakan, example: StatusKelayakan.LAYAK })
  @IsEnum(StatusKelayakan)
  statusKelayakan: StatusKelayakan;

  @ApiProperty({ enum: StatusSertifikasi, example: StatusSertifikasi.AKAN_EXPIRED })
  @IsEnum(StatusSertifikasi)
  statusSertifikasi: StatusSertifikasi;

  @ApiPropertyOptional({ example: 98.2, description: 'Confidence Score AI OCR (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore?: number;

  @ApiPropertyOptional({ example: 'Ir. Haryanto, S.T. (Disnaker)' })
  @IsOptional()
  @IsString()
  lastInspectedBy?: string;

  @ApiPropertyOptional({ example: 'Sertifikat_Boiler_B201P2_2023.pdf' })
  @IsOptional()
  @IsString()
  pdfFileName?: string;
}
