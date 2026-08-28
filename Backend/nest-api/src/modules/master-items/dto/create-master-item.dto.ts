import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateMasterItemDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  categoryKey: string;

  @IsString()
  @IsOptional()
  unitLocation?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  luasM2?: string;

  @IsString()
  @IsOptional()
  luasHa?: string;

  @IsString()
  @IsOptional()
  peruntukan?: string;

  @IsString()
  @IsOptional()
  issueDate?: string;

  @IsString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  keterangan?: string;

  @IsString()
  @IsOptional()
  documentStatus?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
