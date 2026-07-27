import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';

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
        const existingItems = await this.prisma.masterItem.findMany({
          select: { id: true, code: true, title: true, unitLocation: true, categoryKey: true }
        });

        const existingById = new Map(existingItems.filter(e => e.id).map(e => [e.id, e]));
        const existingByCode = new Map(existingItems.filter(e => e.code && e.code !== '-').map(e => [e.code, e]));
        const existingByFallback = new Map(
          existingItems.map(e => [
            `${(e.title || '').trim().toLowerCase()}_${(e.unitLocation || '').trim().toLowerCase()}_${(e.categoryKey || '').trim().toLowerCase()}`,
            e
          ])
        );

        let successCount = 0;
        let failCount = 0;
        let duplicateCount = 0;
        const failedRows = [];
        const importedIds = [];
        const importedCodes = [];

        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          try {
            let rawTitle = (row.title || row.nama || row.jenisPeralatan || '').trim();
            if (!rawTitle) rawTitle = '-';

            let rawCode = (row.code || row.merek || row.kode || '').trim();
            if (!rawCode) rawCode = '-';

            const rawCategory = targetCategoryKey || row.categoryKey || 'peralatan-pabrik';
            const rawLocation = (row.unitLocation || row.lokasi || 'Umum').trim();

            let existing = null;
            if (row.id && existingById.has(row.id)) {
              existing = existingById.get(row.id);
            } else if (rawCode !== '-' && existingByCode.has(rawCode)) {
              existing = existingByCode.get(rawCode);
            } else {
              const fallbackKey = `${rawTitle.toLowerCase()}_${rawLocation.toLowerCase()}_${rawCategory.toLowerCase()}`;
              if (existingByFallback.has(fallbackKey)) {
                existing = existingByFallback.get(fallbackKey);
              }
            }

            const isDuplicate = !!existing;
            if (isDuplicate) duplicateCount++;

            const idToUse = existing ? existing.id : (row.id || randomUUID());

            const dataToSave = {
              code: rawCode,
              title: rawTitle,
              categoryKey: targetCategoryKey || row.categoryKey || 'peralatan-pabrik',
              unitLocation: row.unitLocation || row.lokasi || 'Umum',
              status: row.status || 'Aktif',
              luasM2: row.luasM2 != null ? String(row.luasM2) : null,
              luasHa: row.luasHa != null ? String(row.luasHa) : null,
              peruntukan: row.peruntukan || null,
              issueDate: row.issueDate || null,
              expiryDate: row.expiryDate || null,
              keterangan: row.keterangan || null,
              documentStatus: 'PENDING_DOC',
            };

            if (existing) {
              await this.prisma.masterItem.update({
                where: { id: existing.id },
                data: dataToSave
              });
            } else {
              await this.prisma.masterItem.create({
                data: {
                  id: idToUse,
                  ...dataToSave
                }
              });
            }
            
            if (!isDuplicate) {
              successCount++;
            }
            
            importedIds.push(idToUse);
            if (dataToSave.code) importedCodes.push(dataToSave.code);

          } catch (err) {
            failCount++;
            failedRows.push({
              rowNumber: i + 1,
              title: row.title || row.nama || row.code || `Baris ${i + 1}`,
              reason: err.message || 'Validation error'
            });
          }
        }

        const totalRows = results.length;

        // Save to MonitoringLog
        await this.prisma.monitoringLog.create({
          data: {
            action: 'CSV_IMPORT',
            status: failCount === totalRows ? 'FAILED' : 'SUCCESS',
            detail: JSON.stringify({
              fileName: file.originalname || 'uploaded_file.csv',
              totalRows,
              successCount,
              duplicateCount, // Duplicate count here means "Updated records"
              failCount,
              failedRows,
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

  async getImportHistory(categoryKey?: string) {
    const logs = await this.prisma.monitoringLog.findMany({
      where: { action: 'CSV_IMPORT' },
      orderBy: { createdAt: 'desc' }
    });

    if (!categoryKey) return logs;

    return logs.filter(log => {
      if (!log.detail) return true;
      try {
        const detailObj = JSON.parse(log.detail);
        return !detailObj.categoryKey || detailObj.categoryKey === categoryKey;
      } catch {
        return true;
      }
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
