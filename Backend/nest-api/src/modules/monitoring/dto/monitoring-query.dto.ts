import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum MonitoringStatus {
  AKTIF = 'AKTIF',
  PERPANJANG = 'PERPANJANG',
  EXPIRED = 'EXPIRED',
  AFKIR = 'AFKIR',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortField {
  SISA_HARI = 'sisaHari',
  EXPIRED_DATE = 'expiredDate',
  NAMA_ITEM = 'namaItem',
}

export class MonitoringOverviewQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  divisi?: string;
}

export class MonitoringExpiryListQueryDto {
  @IsOptional()
  @IsEnum(MonitoringStatus)
  status?: MonitoringStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField = SortField.SISA_HARI;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.ASC;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
