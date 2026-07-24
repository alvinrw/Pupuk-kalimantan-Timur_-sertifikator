import { Injectable } from '@nestjs/common';
import {
  MonitoringStatus,
  SortField,
  SortOrder,
  MonitoringOverviewQueryDto,
  MonitoringExpiryListQueryDto,
} from './dto/monitoring-query.dto';
import {
  MonitoringItemDto,
  MonitoringOverviewResponseDto,
  MonitoringExpiryListResponseDto,
} from './dto/monitoring-response.dto';

@Injectable()
export class MonitoringService {
  // Realistic mock data store representing certificates across 5 permit categories
  private readonly mockCertificates = [
    {
      id: 'CERT-001',
      namaItem: 'Bejana Tekan Air Compressor 01',
      nomorSertifikat: '500/DISNAKER/2021',
      kategori: 'Peralatan Pabrik',
      divisi: 'Pabrik 1A',
      tanggalTerbit: '2021-05-10T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(5), // Expiring in 5 days (PERPANJANG)
      isAfkir: false,
    },
    {
      id: 'CERT-002',
      namaItem: 'Overhead Crane 20 Ton',
      nomorSertifikat: '501/DISNAKER/2020',
      kategori: 'Peralatan Pabrik',
      divisi: 'Pabrik 2',
      tanggalTerbit: '2020-01-15T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(-10), // Expired 10 days ago (EXPIRED)
      isAfkir: false,
    },
    {
      id: 'CERT-003',
      namaItem: 'Tangki Penyimpanan Amoniak B3',
      nomorSertifikat: 'KLHK/B3/2022/99',
      kategori: 'Peralatan Pabrik',
      divisi: 'Pabrik 1B',
      tanggalTerbit: '2022-03-20T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(120), // Valid 120 days (AKTIF)
      isAfkir: false,
    },
    {
      id: 'CERT-004',
      namaItem: 'Izin Mendirikan Bangunan (PBG) Gedung Kantor Utama',
      nomorSertifikat: 'PBG-7712/PTP/2019',
      kategori: 'Perizinan Aset',
      divisi: 'General Affairs',
      tanggalTerbit: '2019-08-01T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(365), // Valid (AKTIF)
      isAfkir: false,
    },
    {
      id: 'CERT-005',
      namaItem: 'Sertifikat Laik Fungsi (SLF) Warehouse 03',
      nomorSertifikat: 'SLF-009/PU/2021',
      kategori: 'Perizinan Aset',
      divisi: 'Logistik',
      tanggalTerbit: '2021-11-11T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(25), // Expiring in 25 days (PERPANJANG)
      isAfkir: false,
    },
    {
      id: 'CERT-006',
      namaItem: 'Sertifikat SNI Pupuk NPK Granul',
      nomorSertifikat: 'SNI-012/BSN/2023',
      kategori: 'Sertifikasi Produk',
      divisi: 'Quality Assurance',
      tanggalTerbit: '2023-01-10T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(2), // Expiring in 2 days (PERPANJANG)
      isAfkir: false,
    },
    {
      id: 'CERT-007',
      namaItem: 'Sertifikat Halal Produk Urea Pro',
      nomorSertifikat: 'HALAL-8891/BPJPH/2022',
      kategori: 'Sertifikasi Produk',
      divisi: 'Quality Assurance',
      tanggalTerbit: '2022-06-01T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(-2), // Expired 2 days ago (EXPIRED)
      isAfkir: false,
    },
    {
      id: 'CERT-008',
      namaItem: 'Izin Lingkungan AMDAL Proyek Expansion 2024',
      nomorSertifikat: 'AMDAL/KLHK/2020/04',
      kategori: 'Perizinan Proyek',
      divisi: 'Engineering',
      tanggalTerbit: '2020-04-12T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(200), // Valid (AKTIF)
      isAfkir: false,
    },
    {
      id: 'CERT-009',
      namaItem: 'Paten Metode Granulasi Pupuk Efisiensi Tinggi (HAKI)',
      nomorSertifikat: 'HAKI-P002021008',
      kategori: 'Administrasi Lainnya',
      divisi: 'R&D Innovation',
      tanggalTerbit: '2021-02-14T00:00:00.000Z',
      tanggalExpired: this.getRelativeDateOffset(500), // Valid (AKTIF)
      isAfkir: false,
    },
    {
      id: 'CERT-010',
      namaItem: 'Boiler Pembangkit Listrik Lama (Decommissioned)',
      nomorSertifikat: 'BOILER-OLD-1998',
      kategori: 'Peralatan Pabrik',
      divisi: 'Pabrik 1A',
      tanggalTerbit: '1998-01-01T00:00:00.000Z',
      tanggalExpired: '2020-01-01T00:00:00.000Z',
      isAfkir: true, // AFKIR
    },
  ];

  /**
   * Helper to generate ISO date string relative to current date (days)
   */
  private getRelativeDateOffset(days: number): string {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return targetDate.toISOString();
  }

  /**
   * Calculate dynamic status & sisaHari based on current date
   */
  private calculateDynamicItem(item: (typeof this.mockCertificates)[0]): MonitoringItemDto {
    const today = new Date();
    const expDate = new Date(item.tanggalExpired);

    // Reset time part for accurate day difference
    const utc1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const utc2 = Date.UTC(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
    const sisaHari = Math.ceil((utc2 - utc1) / (1000 * 60 * 60 * 24));

    let statusDinamis: MonitoringStatus;

    if (item.isAfkir) {
      statusDinamis = MonitoringStatus.AFKIR;
    } else if (sisaHari <= 0) {
      statusDinamis = MonitoringStatus.EXPIRED;
    } else if (sisaHari <= 30) {
      statusDinamis = MonitoringStatus.PERPANJANG;
    } else {
      statusDinamis = MonitoringStatus.AKTIF;
    }

    return {
      id: item.id,
      namaItem: item.namaItem,
      nomorSertifikat: item.nomorSertifikat,
      kategori: item.kategori,
      divisi: item.divisi,
      tanggalTerbit: item.tanggalTerbit,
      tanggalExpired: item.tanggalExpired,
      sisaHari,
      statusDinamis,
      isAfkir: item.isAfkir,
    };
  }

  /**
   * GET /api/monitoring/overview
   */
  getOverview(query: MonitoringOverviewQueryDto): MonitoringOverviewResponseDto {
    let list = this.mockCertificates.map((cert) => this.calculateDynamicItem(cert));

    // Optional category & divisi filter
    if (query.category) {
      list = list.filter((item) => item.kategori.toLowerCase() === query.category.toLowerCase());
    }
    if (query.divisi) {
      list = list.filter((item) => item.divisi.toLowerCase() === query.divisi.toLowerCase());
    }

    const total = list.length;
    const aktif = list.filter((i) => i.statusDinamis === MonitoringStatus.AKTIF).length;
    const perpanjang = list.filter((i) => i.statusDinamis === MonitoringStatus.PERPANJANG).length;
    const expired = list.filter((i) => i.statusDinamis === MonitoringStatus.EXPIRED).length;
    const afkir = list.filter((i) => i.statusDinamis === MonitoringStatus.AFKIR).length;

    const calcPercentage = (val: number) => (total > 0 ? Number(((val / total) * 100).toFixed(2)) : 0);

    return {
      statusCode: 200,
      message: 'Berhasil mengambil data statistik monitoring',
      data: {
        totalDocuments: total,
        aktif,
        perpanjang,
        expired,
        afkir,
        percentage: {
          aktif: calcPercentage(aktif),
          perpanjang: calcPercentage(perpanjang),
          expired: calcPercentage(expired),
          afkir: calcPercentage(afkir),
        },
      },
    };
  }

  /**
   * GET /api/monitoring/expiry-list
   */
  getExpiryList(query: MonitoringExpiryListQueryDto): MonitoringExpiryListResponseDto {
    let list = this.mockCertificates.map((cert) => this.calculateDynamicItem(cert));

    // Filter status
    if (query.status) {
      list = list.filter((item) => item.statusDinamis === query.status);
    }

    // Filter category
    if (query.category) {
      list = list.filter((item) => item.kategori.toLowerCase() === query.category.toLowerCase());
    }

    // Filter search keyword
    if (query.search) {
      const kw = query.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.namaItem.toLowerCase().includes(kw) ||
          item.nomorSertifikat.toLowerCase().includes(kw) ||
          item.divisi.toLowerCase().includes(kw),
      );
    }

    // Sorting logic
    const sortBy = query.sortBy || SortField.SISA_HARI;
    const order = query.order || SortOrder.ASC;
    const orderFactor = order === SortOrder.ASC ? 1 : -1;

    list.sort((a, b) => {
      if (sortBy === SortField.SISA_HARI) {
        return (a.sisaHari - b.sisaHari) * orderFactor;
      }
      if (sortBy === SortField.EXPIRED_DATE) {
        return (new Date(a.tanggalExpired).getTime() - new Date(b.tanggalExpired).getTime()) * orderFactor;
      }
      if (sortBy === SortField.NAMA_ITEM) {
        return a.namaItem.localeCompare(b.namaItem) * orderFactor;
      }
      return 0;
    });

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = list.slice(startIndex, startIndex + limit);

    return {
      statusCode: 200,
      message: 'Berhasil mengambil daftar monitoring sertifikat',
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
      data: paginatedData,
    };
  }
}
