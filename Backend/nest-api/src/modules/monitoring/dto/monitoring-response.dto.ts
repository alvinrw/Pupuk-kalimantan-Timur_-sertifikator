import { MonitoringStatus } from './monitoring-query.dto';

export interface MonitoringPercentageDto {
  aktif: number;
  perpanjang: number;
  expired: number;
  afkir: number;
}

export interface MonitoringOverviewDataDto {
  totalDocuments: number;
  aktif: number;
  perpanjang: number;
  expired: number;
  afkir: number;
  percentage: MonitoringPercentageDto;
}

export interface MonitoringOverviewResponseDto {
  statusCode: number;
  message: string;
  data: MonitoringOverviewDataDto;
}

export interface MonitoringItemDto {
  id: string;
  namaItem: string;
  nomorSertifikat: string;
  kategori: string;
  divisi: string;
  tanggalTerbit: string;
  tanggalExpired: string;
  sisaHari: number;
  statusDinamis: MonitoringStatus;
  isAfkir: boolean;
}

export interface PaginationMetaDto {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface MonitoringExpiryListResponseDto {
  statusCode: number;
  message: string;
  meta: PaginationMetaDto;
  data: MonitoringItemDto[];
}
