import { IsString, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  jenisSertifikat?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  namaSertifikat?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  noSertifikat?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  instansi?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  terbit?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  expired?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  status?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  fileUrl?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  uploadedBy?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== undefined)
  @IsString()
  keterangan?: string | null;
}
