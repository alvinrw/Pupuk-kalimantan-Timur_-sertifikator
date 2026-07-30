import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  jenisSertifikat: string;

  @IsString()
  @IsOptional()
  namaSertifikat?: string;

  @IsString()
  @IsOptional()
  noSertifikat?: string;

  @IsString()
  @IsOptional()
  instansi?: string;

  @IsString()
  @IsOptional()
  terbit?: string;

  @IsString()
  @IsOptional()
  expired?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}
