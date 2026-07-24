import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusKelayakan, StatusSertifikasi } from '../enums/permit-status.enum';

export class EquipmentQueryDto {
  @ApiPropertyOptional({ description: 'Pencarian berdasarkan Nama, Tag, atau No Sertifikat' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan Kategori' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan Unit Pabrik' })
  @IsOptional()
  @IsString()
  plantUnit?: string;

  @ApiPropertyOptional({ enum: StatusKelayakan, description: 'Filter Status Kelayakan' })
  @IsOptional()
  @IsEnum(StatusKelayakan)
  statusKelayakan?: StatusKelayakan;

  @ApiPropertyOptional({ enum: StatusSertifikasi, description: 'Filter Status Sertifikasi' })
  @IsOptional()
  @IsEnum(StatusSertifikasi)
  statusSertifikasi?: StatusSertifikasi;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
