import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermitDto {
  @ApiProperty({ description: 'ID of the related Master Item (Pabrik)' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ description: 'Jenis Izin' })
  @IsString()
  @IsNotEmpty()
  jenisIzin: string;

  @ApiPropertyOptional({ description: 'Nomor Izin' })
  @IsString()
  @IsOptional()
  noIzin?: string;

  @ApiPropertyOptional({ description: 'Instansi Penerbit' })
  @IsString()
  @IsOptional()
  instansi?: string;

  @ApiPropertyOptional({ description: 'Tanggal Terbit (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  terbit?: string;

  @ApiPropertyOptional({ description: 'Tanggal Expired (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  expired?: string;

  @ApiPropertyOptional({ description: 'Status Izin' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Keterangan Tambahan' })
  @IsString()
  @IsOptional()
  keterangan?: string;
}
