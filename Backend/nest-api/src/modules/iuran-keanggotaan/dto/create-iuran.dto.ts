import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateIuranDto {
  @IsString()
  @IsOptional()
  nomer?: string;

  @IsString()
  @IsOptional()
  kompartemen?: string;

  @IsString()
  @IsOptional()
  unitKerja?: string;

  @IsString()
  @IsOptional()
  asosiasi?: string;

  @IsString()
  @IsOptional()
  periode?: string;

  @IsNumber()
  @IsOptional()
  nominal?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  statusPembayaran?: string;

  @IsString()
  @IsOptional()
  nama?: string;

  @IsString()
  @IsOptional()
  npk?: string;

  @IsString()
  @IsOptional()
  keterangan?: string;
}
