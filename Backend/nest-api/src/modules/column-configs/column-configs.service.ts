import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ColumnConfigsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryKey: string) {
    let configs = await this.prisma.columnConfig.findMany({
      where: { categoryKey },
      orderBy: { position: 'asc' },
    });

    if (configs.length === 0) {
      const defaultConfigs = this.getDefaultConfigs(categoryKey);
      if (defaultConfigs.length > 0) {
        await this.prisma.columnConfig.createMany({
          data: defaultConfigs,
        });
        configs = await this.prisma.columnConfig.findMany({
          where: { categoryKey },
          orderBy: { position: 'asc' },
        });
      }
    }

    return configs;
  }

  async create(categoryKey: string, data: { fieldKey: string; label: string; type: string }) {
    const lastConfig = await this.prisma.columnConfig.findFirst({
      where: { categoryKey },
      orderBy: { position: 'desc' },
    });
    const nextPosition = lastConfig ? lastConfig.position + 1 : 0;

    return this.prisma.columnConfig.create({
      data: {
        categoryKey,
        fieldKey: data.fieldKey,
        label: data.label,
        type: data.type || 'text',
        position: nextPosition,
        isVisible: true,
        isCustom: true,
      },
    });
  }

  async reorder(categoryKey: string, items: { fieldKey: string; position: number; isVisible: boolean }[]) {
    await this.prisma.$transaction(
      items.map(item =>
        this.prisma.columnConfig.update({
          where: {
            categoryKey_fieldKey: {
              categoryKey,
              fieldKey: item.fieldKey,
            },
          },
          data: {
            position: item.position,
            isVisible: item.isVisible,
          },
        })
      )
    );
    return { success: true };
  }

  async remove(categoryKey: string, fieldKey: string) {
    return this.prisma.columnConfig.delete({
      where: {
        categoryKey_fieldKey: {
          categoryKey,
          fieldKey,
        },
      },
    });
  }

  private getDefaultConfigs(categoryKey: string) {
    if (categoryKey === 'peralatan-pabrik') {
      return [
        { categoryKey, fieldKey: 'no', label: 'NO.', type: 'text', position: 0, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'title', label: 'NAMA ALAT', type: 'text', position: 1, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'code', label: 'NOMOR TAG / KODE ALAT', type: 'text', position: 2, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'jenisPeralatan', label: 'JENIS PERALATAN PABRIK', type: 'text', position: 3, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'unitLocation', label: 'LOKASI', type: 'text', position: 4, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'user', label: 'PENANGGUNG JAWAB', type: 'text', position: 5, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'certCount', label: 'SERTIFIKAT TERHUBUNG', type: 'text', position: 6, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'status', label: 'STATUS', type: 'text', position: 7, isVisible: true, isCustom: false },
      ];
    }

    const isProyek = categoryKey.includes('proyek');
    const isProduk = categoryKey.includes('produk') || categoryKey.includes('ciptaan');
    const configs = [
      { categoryKey, fieldKey: 'no', label: 'NO.', type: 'text', position: 0, isVisible: true, isCustom: false },
      { categoryKey, fieldKey: 'title', label: isProyek ? 'NAMA PROYEK' : isProduk ? 'NAMA PRODUK' : 'NAMA ITEM', type: 'text', position: 1, isVisible: true, isCustom: false },
      { categoryKey, fieldKey: 'code', label: isProyek ? 'KODE PROYEK' : isProduk ? 'KODE PRODUK' : 'KODE REGISTRASI', type: 'text', position: 2, isVisible: true, isCustom: false },
      { categoryKey, fieldKey: 'jenisItem', label: isProyek ? 'KATEGORI PROYEK' : isProduk ? 'JENIS PRODUK' : 'JENIS ITEM', type: 'text', position: 3, isVisible: true, isCustom: false },
    ];

    let pos = 4;
    if (!isProduk) {
      configs.push({ categoryKey, fieldKey: 'unitLocation', label: isProyek ? 'LOKASI PROYEK' : 'LOKASI', type: 'text', position: pos++, isVisible: true, isCustom: false });
    }
    configs.push({ categoryKey, fieldKey: 'user', label: 'PENANGGUNG JAWAB', type: 'text', position: pos++, isVisible: true, isCustom: false });
    configs.push({ categoryKey, fieldKey: 'certCount', label: 'SERTIFIKAT TERHUBUNG', type: 'text', position: pos++, isVisible: true, isCustom: false });
    if (!isProduk) {
      configs.push({ categoryKey, fieldKey: 'status', label: 'STATUS', type: 'text', position: pos++, isVisible: true, isCustom: false });
    }

    return configs;
  }
}
