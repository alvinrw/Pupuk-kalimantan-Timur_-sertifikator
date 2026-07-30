import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { randomUUID, createHash } from 'crypto';
import * as xlsx from 'xlsx';

@Injectable()
export class CsvImportService {
  constructor(private readonly prisma: PrismaService) {}

  async processCsv(file: any, type: string, targetCategoryKey?: string) {
    const results: any[] = [];
    const fileName = file.originalname || '';
    const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');

    if (isExcel) {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(sheet, { raw: false }) as any[];
      results.push(...json);
    } else {
      // Parse CSV from memory buffer
      await new Promise((resolve, reject) => {
        Readable.from(file.buffer)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
    }

    if (results.length === 0) {
      throw new HttpException('CSV is empty', HttpStatus.BAD_REQUEST);
    }

    try {
      if (type === 'master_items') {
        const existingItems = await this.prisma.masterItem.findMany({
          select: {
            id: true,
            code: true,
            title: true,
            unitLocation: true,
            categoryKey: true,
            keterangan: true,
            updatedAt: true
          }
        });

        // Helper untuk lookup case-insensitive
        const getVal = (r: any, keys: string[]) => {
          const k = Object.keys(r).find(key => keys.includes(String(key).trim().toLowerCase()));
          return k ? String(r[k]).trim() : '';
        };

        // Helper untuk generate MD5 hash dari 6 kolom utama
        const generateRowHash = (
          code: string,
          title: string,
          namaSertifikat: string,
          tipe: string,
          nomorSeri: string,
          unitLocation: string,
        ): string => {
          const clean = (val: string) => (val || '').trim().toLowerCase();
          const combined = [
            clean(code),
            clean(title),
            clean(namaSertifikat),
            clean(tipe),
            clean(nomorSeri),
            clean(unitLocation)
          ].join('|');

          return createHash('md5').update(combined).digest('hex');
        };

        // Bangun hash map dari data yang sudah ada di sistem
        const hashMap = new Map<string, any>();
        for (const item of existingItems) {
          let tipe = '';
          let nomorSeri = '';
          let namaSertifikat = '';
          try {
            if (item.keterangan && item.keterangan.startsWith('{')) {
              const meta = JSON.parse(item.keterangan);
              tipe = meta.tipe || '';
              nomorSeri = meta.nomorSeri || '';
              namaSertifikat = meta.namaSertifikat || '';
            }
          } catch (e) {}

          const hash = generateRowHash(
            item.code || '',
            item.title || '',
            namaSertifikat,
            tipe,
            nomorSeri,
            item.unitLocation || ''
          );

          // Jika ada beberapa data duplikat di DB, simpan yang paling baru (updatedAt paling akhir)
          const existingInMap = hashMap.get(hash);
          if (!existingInMap || new Date(item.updatedAt) > new Date(existingInMap.updatedAt)) {
            hashMap.set(hash, item);
          }
        }

        let successCount = 0;
        let failCount = 0;
        let duplicateCount = 0;
        const failedRows = [];
        const importedIds = [];
        const importedCodes = [];

        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          try {
            let rawTitle = String(row['Jenis Peralatan'] || row.jenisPeralatan || row.title || row.nama || '').trim();
            let rawCode = String(row['Merek / Nama Peralatan'] || row.merek || row.code || row.kode || '').trim();

            if (!rawTitle && !rawCode) {
              continue; // Skip baris kosong atau baris panduan Excel (misal: "Keterangan Kolom")
            }

            if (!rawTitle) rawTitle = '-';
            if (!rawCode) rawCode = '-';

            const rawCategory = targetCategoryKey || row.categoryKey || 'peralatan-pabrik';
            
            let rawLocation = String(row['Unit Pabrik'] || row['Lokasi'] || row.unitLocation || row.lokasi || 'Umum').trim();
            if (row['Unit Pabrik'] && row['Lokasi']) {
              rawLocation = `${row['Unit Pabrik']} - ${row['Lokasi']}`;
            }

            const cleanTipe = String(row['Tipe'] || row.tipe || '').trim();
            const cleanNoSeri = String(row['Nomor Seri'] || row.nomorSeri || '').trim();
            const cleanPenanggungJawab = String(row['Penanggung Jawab'] || row.penanggungJawab || '').trim();
            const cleanNoSertifikat = String(row['No. Sertifikat'] || row.noSertifikat || '').trim();
            const cleanNamaSertifikat = getVal(row, ['nama sertifikat', 'namasertifikat', 'nama_sertifikat']);
            const cleanKeteranganAsli = String(row.keterangan || '').trim();

            const extraData = {
              tipe: cleanTipe,
              nomorSeri: cleanNoSeri,
              penanggungJawab: cleanPenanggungJawab,
              noSertifikat: cleanNoSertifikat,
              namaSertifikat: cleanNamaSertifikat,
              keteranganAsli: cleanKeteranganAsli
            };
            const jsonKeterangan = JSON.stringify(extraData);

            // Hitung hash baris baru
            const newRowHash = generateRowHash(
              rawCode,
              rawTitle,
              cleanNamaSertifikat,
              cleanTipe,
              cleanNoSeri,
              rawLocation
            );

            // Bandingkan dengan DB hash map
            const existing = hashMap.get(newRowHash);

            const isDuplicate = !!existing;
            if (isDuplicate) duplicateCount++;

            const idToUse = existing ? existing.id : (row.id || randomUUID());

            const dataToSave = {
              code: rawCode,
              title: rawTitle,
              categoryKey: rawCategory,
              unitLocation: rawLocation,
              status: row['Status'] || row.status || 'Aktif',
              luasM2: row.luasM2 != null ? String(row.luasM2) : null,
              luasHa: row.luasHa != null ? String(row.luasHa) : null,
              peruntukan: row.peruntukan || null,
              issueDate: row['Tanggal Terbit'] || row.issueDate || null,
              expiryDate: row['Tanggal Berakhir'] || row.expiryDate || null,
              keterangan: jsonKeterangan,
              documentStatus: existing ? existing.documentStatus : 'PENDING_DOC',
              updatedAt: new Date() // Pastikan waktu terupdate ke yang paling baru
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
              duplicateCount,
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
          message: `Impor CSV selesai: ${successCount} Berhasil, ${duplicateCount} Duplikat (Diperbarui), ${failCount} Gagal.`,
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
