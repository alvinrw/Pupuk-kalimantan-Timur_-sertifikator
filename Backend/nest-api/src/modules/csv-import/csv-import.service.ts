import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class CsvImportService {
  constructor(private readonly prisma: PrismaService) {}

  async processCsv(file: any, type: string, targetCategoryKey?: string) {
    const results: any[] = [];

    // Parse CSV from memory buffer
    await new Promise((resolve, reject) => {
      Readable.from(file.buffer)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      throw new HttpException('CSV is empty', HttpStatus.BAD_REQUEST);
    }

    try {
      if (type === 'master_items') {
        const itemIds = results.map(r => r.id).filter(Boolean);
        const itemCodes = results.map(r => r.code).filter(Boolean);

        const existingItems = await this.prisma.masterItem.findMany({
          where: {
            OR: [
              ...(itemIds.length ? [{ id: { in: itemIds } }] : []),
              ...(itemCodes.length ? [{ code: { in: itemCodes } }] : [])
            ]
          },
          select: { id: true, code: true }
        });

        const existingSet = new Set([
          ...existingItems.map(e => e.id),
          ...existingItems.map(e => e.code).filter(Boolean)
        ]);

        const newItems = results.filter(row => (!row.id || !existingSet.has(row.id)) && (!row.code || !existingSet.has(row.code)));
        const duplicateCount = results.length - newItems.length;

        let successCount = 0;
        let failCount = 0;

        if (newItems.length > 0) {
          const insertRes = await this.prisma.masterItem.createMany({
            data: newItems.map((row) => ({
              id: row.id,
              code: row.code,
              title: row.title || row.nama || 'Untitled Item',
              categoryKey: targetCategoryKey || row.categoryKey || 'peralatan-pabrik',
              unitLocation: row.unitLocation || row.lokasi || 'Umum',
              status: row.status || 'Aktif',
              luasM2: row.luasM2 != null ? String(row.luasM2) : null,
              luasHa: row.luasHa != null ? String(row.luasHa) : null,
              peruntukan: row.peruntukan || null,
              issueDate: row.issueDate || null,
              expiryDate: row.expiryDate || null,
              keterangan: row.keterangan || null,
            })),
            skipDuplicates: true,
          });
          successCount = insertRes.count;
          failCount = newItems.length - successCount;
        }

        const importedIds = newItems.map(r => r.id).filter(Boolean);
        const importedCodes = newItems.map(r => r.code).filter(Boolean);

        // Save to MonitoringLog
        await this.prisma.monitoringLog.create({
          data: {
            action: 'CSV_IMPORT',
            status: 'SUCCESS',
            detail: JSON.stringify({
              fileName: file.originalname || 'uploaded_file.csv',
              totalRows,
              successCount,
              duplicateCount,
              failCount,
              importedIds,
              importedCodes,
              type: 'master_items',
              categoryKey: targetCategoryKey || 'peralatan-pabrik'
            })
          }
        });

        return {
          message: `Impor CSV selesai: ${successCount} Berhasil, ${duplicateCount} Duplikat, ${failCount} Gagal.`,
          totalRows,
          successCount,
          duplicateCount,
          failCount
        };

      } else if (type === 'certificates') {
        // Bulk insert to Certificate
        await this.prisma.certificate.createMany({
          data: results.map((row) => ({
            itemId: row.itemId,
            jenisSertifikat: row.jenisSertifikat,
            noSertifikat: row.noSertifikat,
            instansi: row.instansi,
            terbit: row.terbit,
            expired: row.expired,
            status: row.status,
          })),
          skipDuplicates: true,
        });

        await this.prisma.monitoringLog.create({
          data: {
            action: 'CSV_IMPORT',
            status: 'SUCCESS',
            detail: JSON.stringify({
              fileName: file.originalname || 'uploaded_certificates.csv',
              importedCount: results.length,
              type: 'certificates'
            })
          }
        });

        return { message: `Successfully imported ${results.length} certificates`, importedCount: results.length };

      } else if (type === 'permits') {
        // Bulk insert to Permit
        await this.prisma.permit.createMany({
          data: results.map((row) => ({
            itemId: row.itemId,
            jenisIzin: row.jenisIzin,
            noIzin: row.noIzin,
            instansi: row.instansi,
            terbit: row.terbit,
            expired: row.expired,
            status: row.status,
            keterangan: row.keterangan,
          })),
          skipDuplicates: true,
        });

        await this.prisma.monitoringLog.create({
          data: {
            action: 'CSV_IMPORT',
            status: 'SUCCESS',
            detail: JSON.stringify({
              fileName: file.originalname || 'uploaded_permits.csv',
              importedCount: results.length,
              type: 'permits'
            })
          }
        });

        return { message: `Successfully imported ${results.length} permits`, importedCount: results.length };
        
      } else {
        throw new HttpException('Invalid type', HttpStatus.BAD_REQUEST);
      }
    } catch (error: any) {
      throw new HttpException(
        `Failed to import data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getImportHistory() {
    return this.prisma.monitoringLog.findMany({
      where: { action: 'CSV_IMPORT' },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteImportHistory(id: string) {
    try {
      const log = await this.prisma.monitoringLog.findUnique({
        where: { id }
      });

      if (log && log.detail) {
        let detailObj: any = {};
        try { detailObj = JSON.parse(log.detail); } catch {}

        const idsToDelete = detailObj.importedIds || [];
        const codesToDelete = detailObj.importedCodes || [];

        if (idsToDelete.length > 0 || codesToDelete.length > 0) {
          await this.prisma.masterItem.deleteMany({
            where: {
              OR: [
                ...(idsToDelete.length ? [{ id: { in: idsToDelete } }] : []),
                ...(codesToDelete.length ? [{ code: { in: codesToDelete } }] : [])
              ]
            }
          });
        }
      }

      await this.prisma.monitoringLog.delete({
        where: { id }
      });
      return { message: 'History record and imported data deleted successfully' };
    } catch (e) {
      return { message: 'Record removed' };
    }
  }
}
