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
          where: targetCategoryKey ? { categoryKey: targetCategoryKey } : undefined,
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
          const k = Object.keys(r).find(key => {
            const cleanKey = String(key).trim().toLowerCase();
            return keys.some(target => cleanKey === target.toLowerCase() || cleanKey.replace(/\s+/g, '') === target.toLowerCase().replace(/\s+/g, ''));
          });
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
            let rawTitle = getVal(row, [
              'nama aset', 'nama_aset', 'namaaset',
              'merek / nama peralatan', 'merek/nama peralatan', 'nama peralatan', 'nama_peralatan',
              'nama produk', 'judul ciptaan', 'judul_ciptaan', 'nama proyek', 'nama perizinan proyek',
              'jenis peralatan', 'jenis_peralatan',
              'title', 'nama', 'name'
            ]);

            let rawCode = getVal(row, [
              'nomor seri asset', 'nomor seri aset', 'nomor_seri_asset',
              'nomor seri proyek', 'nomor_seri_proyek', 'nomor seri produk', 'nomor_seri_produk',
              'nomor seri', 'nomor_seri', 'no seri', 'sn',
              'kode proyek', 'kode produk', 'code', 'kode',
              'merek / nama peralatan', 'tipe'
            ]);

            if (!rawTitle && rawCode) {
              rawTitle = rawCode;
            } else if (rawTitle && !rawCode) {
              rawCode = rawTitle;
            }

            if (!rawTitle && !rawCode) {
              continue; // Skip baris kosong atau baris panduan Excel
            }

            if (rawTitle.toLowerCase().includes('keterangan kolom') || rawTitle.toLowerCase().includes('keterangan_kolom')) {
              continue; // Skip baris keterangan di template Excel
            }

            const rawCategory = targetCategoryKey || getVal(row, ['categorykey', 'category', 'kategori']) || 'peralatan-pabrik';
            
            let unitPabrik = getVal(row, ['unit pabrik', 'unit_pabrik', 'unit']);
            let lokasi = getVal(row, ['lokasi', 'unit location', 'unitlocation', 'area']);
            let rawLocation = (unitPabrik && lokasi) ? `${unitPabrik} - ${lokasi}` : (unitPabrik || lokasi || 'Umum');

            const cleanTipe = getVal(row, ['tipe', 'jenis aset', 'jenis peralatan', 'jenis ciptaan', 'jenis produk', 'jenis proyek', 'kategori proyek']);
            const cleanNoSeri = getVal(row, ['nomor seri asset', 'nomor seri aset', 'nomor seri proyek', 'nomor seri produk', 'nomor seri', 'nomor_seri', 'sn']);
            const cleanPenanggungJawab = getVal(row, ['penanggung jawab', 'penanggung_jawab', 'user', 'instansi']);
            const cleanNoSertifikat = getVal(row, ['no. sertifikat', 'no sertifikat', 'nomor sertifikat', 'nosertifikat']);
            const cleanNamaSertifikat = getVal(row, ['nama sertifikat', 'namasertifikat', 'nama_sertifikat']);
            const cleanKeteranganAsli = getVal(row, ['keterangan', 'description']);

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

            const luasM2Val = getVal(row, ['luas (m²)', 'luas m2', 'luasm2', 'luas_m2']) || (row.luasM2 != null ? String(row.luasM2) : null);
            const luasHaVal = getVal(row, ['luas (ha)', 'luas ha', 'luasha', 'luas_ha']) || (row.luasHa != null ? String(row.luasHa) : null);
            const peruntukanVal = getVal(row, ['peruntukan', 'peruntukan lahan']) || row.peruntukan || null;
            const issueDateVal = getVal(row, ['tanggal terbit', 'tanggal_terbit', 'terbit', 'issuedate', 'tanggal awal pengajuan']) || row.issueDate || null;
            const expiryDateVal = getVal(row, ['tanggal berakhir', 'tanggal_berakhir', 'expired', 'expirydate', 'masa berlaku']) || row.expiryDate || null;

            let importStatus = getVal(row, ['status']) || row.status || 'Aktif';
            if (rawCategory === 'perizinan-proyek' || String(rawCategory).toLowerCase().includes('proyek')) {
              const cleanSt = String(importStatus).trim().toLowerCase();
              if (cleanSt === 'selesai') {
                importStatus = 'Spare';
              } else if (cleanSt === 'ditunda') {
                importStatus = 'Rusak';
              } else if (cleanSt === 'aktif') {
                importStatus = 'Aktif';
              }
            }

            const dataToSave = {
              code: rawCode,
              title: rawTitle,
              categoryKey: rawCategory,
              unitLocation: rawLocation,
              status: importStatus,
              luasM2: luasM2Val,
              luasHa: luasHaVal,
              peruntukan: peruntukanVal,
              issueDate: issueDateVal,
              expiryDate: expiryDateVal,
              keterangan: jsonKeterangan,
              documentStatus: existing ? existing.documentStatus : 'PENDING_DOC',
              updatedAt: new Date()
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

            if (cleanNoSertifikat && cleanNoSertifikat !== '-' && cleanNoSertifikat !== 'Tanpa Sertifikat') {
              try {
                await this.prisma.certificate.create({
                  data: {
                    itemId: idToUse,
                    jenisSertifikat: cleanTipe || 'Sertifikat Utama',
                    namaSertifikat: cleanNamaSertifikat || 'Sertifikat Master',
                    noSertifikat: cleanNoSertifikat,
                    instansi: cleanPenanggungJawab || 'Instansi Penerbit',
                    terbit: issueDateVal || '',
                    expired: expiryDateVal || '',
                    status: 'Aktif'
                  }
                });
              } catch(e) {}
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

  async processBulkNested(groupedData: any[], categoryKey: string) {
    let successCount = 0;
    const createdMasters = [];

    for (const group of groupedData) {
      const masterData = {
        title: group.master.title || '',
        code: group.master.code || `CSV-${randomUUID().substring(0, 8)}`,
        unitLocation: group.master.unitLocation || '',
        status: group.master.status || 'Aktif',
        keterangan: JSON.stringify({
          tipe: group.master.tipe,
          penanggungJawab: group.master.penanggungJawab,
        }),
        categoryKey: categoryKey || '',
        documentStatus: 'PENDING_DOC',
      };

      const createdMaster = await this.prisma.masterItem.create({
        data: masterData,
      });

      for (const cert of group.certificates) {
        await this.prisma.certificate.create({
          data: {
            itemId: createdMaster.id,
            jenisSertifikat: cert.namaSertifikat || 'Umum',
            namaSertifikat: cert.namaSertifikat,
            noSertifikat: cert.noSertifikat,
            terbit: cert.terbit,
            expired: cert.expired,
            status: 'Aktif',
          },
        });
        successCount++;
      }
      
      if (group.certificates.length === 0) successCount++;
      createdMasters.push(createdMaster);
    }

    return {
      success: true,
      importedCount: createdMasters.length,
      successCount: successCount,
      failedRows: [],
      masters: createdMasters,
    };
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
