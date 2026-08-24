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

    const defaultConfigs = this.getDefaultConfigs(categoryKey);

    if (configs.length === 0) {
      if (defaultConfigs.length > 0) {
        await this.prisma.columnConfig.createMany({
          data: defaultConfigs,
        });
        configs = await this.prisma.columnConfig.findMany({
          where: { categoryKey },
          orderBy: { position: 'asc' },
        });
      }
    } else {
      const missing = defaultConfigs.filter(
        def => !configs.some(c => c.fieldKey === def.fieldKey)
      );
      if (missing.length > 0) {
        const maxPos = configs.length > 0 ? Math.max(...configs.map(c => c.position)) : -1;
        const toCreate = missing.map((item, idx) => ({
          ...item,
          position: maxPos + 1 + idx,
        }));
        await this.prisma.columnConfig.createMany({
          data: toCreate,
        });
        configs = await this.prisma.columnConfig.findMany({
          where: { categoryKey },
          orderBy: { position: 'asc' },
        });
      }
    }

    return configs;
  }

  private getModuleLabel(categoryKey: string): string {
    switch (categoryKey) {
      case 'peralatan-pabrik': return 'Peralatan Pabrik';
      case 'perizinan-aset': return 'Perizinan Aset';
      case 'perizinan-proyek': return 'Perizinan Proyek';
      case 'perizinan-produk': return 'Perizinan Produk';
      default: return categoryKey;
    }
  }

  async create(categoryKey: string, data: { fieldKey: string; label: string; type: string }, userId?: string) {
    const lastConfig = await this.prisma.columnConfig.findFirst({
      where: { categoryKey },
      orderBy: { position: 'desc' },
    });
    const nextPosition = lastConfig ? lastConfig.position + 1 : 0;

    const result = await this.prisma.columnConfig.create({
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

    if (userId) {
      const moduleLabel = this.getModuleLabel(categoryKey);
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'INSERT',
          targetTable: categoryKey,
          targetId: data.label,
          details: JSON.stringify({ message: `Menambahkan kolom kustom "${data.label}" pada modul ${moduleLabel}` }),
        },
      }).catch(() => {});
    }

    return result;
  }

  async reorder(categoryKey: string, items: { fieldKey: string; position: number; isVisible: boolean }[], userId?: string) {
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

    if (userId) {
      const moduleLabel = this.getModuleLabel(categoryKey);
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'UPDATE',
          targetTable: categoryKey,
          targetId: 'COLUMN_ORDER',
          details: JSON.stringify({ message: `Mengubah susunan atau visibilitas kolom pada modul ${moduleLabel}` }),
        },
      }).catch(() => {});
    }

    return { success: true };
  }

  async remove(categoryKey: string, fieldKey: string, userId?: string) {
    const config = await this.prisma.columnConfig.findUnique({
      where: {
        categoryKey_fieldKey: {
          categoryKey,
          fieldKey,
        },
      },
    });

    const result = await this.prisma.columnConfig.delete({
      where: {
        categoryKey_fieldKey: {
          categoryKey,
          fieldKey,
        },
      },
    });

    if (userId && config) {
      const moduleLabel = this.getModuleLabel(categoryKey);
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'DELETE',
          targetTable: categoryKey,
          targetId: config.label,
          details: JSON.stringify({ message: `Menghapus kolom kustom "${config.label}" pada modul ${moduleLabel}` }),
        },
      }).catch(() => {});
    }

    return result;
  }
  private getDefaultConfigs(categoryKey: string) {
    if (categoryKey.endsWith('-child')) {
      return [
        { categoryKey, fieldKey: 'no', label: 'NO.', type: 'text', position: 0, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'masterTitle', label: 'ITEM INDUK', type: 'text', position: 1, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'namaSertifikat', label: 'NAMA SERTIFIKAT', type: 'text', position: 2, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'noSertifikat', label: 'NOMOR SERTIFIKAT', type: 'text', position: 3, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'instansi', label: 'INSTANSI PENERBIT', type: 'text', position: 4, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'terbit', label: 'TANGGAL TERBIT', type: 'date', position: 5, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'expired', label: 'TANGGAL EXPIRED', type: 'date', position: 6, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'status', label: 'STATUS', type: 'text', position: 7, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'keterangan', label: 'KETERANGAN / CATATAN', type: 'text', position: 8, isVisible: true, isCustom: false },
      ];
    }

    if (categoryKey === 'peralatan-pabrik') {
      return [
        { categoryKey, fieldKey: 'no', label: 'NO.', type: 'text', position: 0, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'title', label: 'NAMA ALAT', type: 'text', position: 1, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'code', label: 'NOMOR TAG / KODE ALAT', type: 'text', position: 2, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'jenisPeralatan', label: 'JENIS PERALATAN PABRIK', type: 'text', position: 3, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'unitLocation', label: 'LOKASI', type: 'text', position: 4, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'user', label: 'PENANGGUNG JAWAB', type: 'text', position: 5, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'terbit', label: 'TANGGAL TERBIT', type: 'text', position: 6, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'berakhir', label: 'TANGGAL EXPIRED', type: 'text', position: 7, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'certCount', label: 'SERTIFIKAT TERHUBUNG', type: 'text', position: 8, isVisible: true, isCustom: false },
        { categoryKey, fieldKey: 'status', label: 'STATUS', type: 'text', position: 9, isVisible: true, isCustom: false },
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
