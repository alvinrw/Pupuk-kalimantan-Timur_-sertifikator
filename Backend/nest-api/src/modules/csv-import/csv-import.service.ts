import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { randomUUID, createHash } from 'crypto';
import * as xlsx from 'xlsx';
import { validateItem, recalculateStagingStatuses } from './staging-validation.helper';

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
        // Helper untuk lookup case-insensitive
        const getVal = (r: any, keys: string[]) => {
          const k = Object.keys(r).find(key => {
            const cleanKey = String(key).trim().toLowerCase();
            return keys.some(target => cleanKey === target.toLowerCase() || cleanKey.replace(/\s+/g, '') === target.toLowerCase().replace(/\s+/g, ''));
          });
          return k ? String(r[k]).trim() : '';
        };

        // Normalize helper: trim + lowercase + '-' → ''
        const norm = (val: string) => {
          const v = (val || '').trim().toLowerCase();
          return v === '-' ? '' : v;
        };

        let successCount = 0;
        let failCount = 0;
        let duplicateCount = 0;
        let protectedCount = 0;
        const failedRows = [];
        const importedIds = [];
        const importedCodes = [];
        
        // Track normalized keys processed in this batch to detect intra-file duplicates
        const processedKeys = new Set<string>();

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

            // === DUPLIKAT DETECTION: Direct DB lookup (lebih reliable dari hash) ===
            // Key untuk intra-file duplicate check
            const rowKey = `${norm(rawCode)}|${norm(rawTitle)}|${norm(rawLocation)}`;
            if (processedKeys.has(rowKey)) {
              duplicateCount++;
              continue; // duplikat dalam 1 file CSV
            }
            processedKeys.add(rowKey);

            // Cari di DB berdasarkan title + code + categoryKey (case-insensitive)
            const existingInDb = await this.prisma.masterItem.findFirst({
              where: {
                categoryKey: rawCategory,
                title: { equals: rawTitle, mode: 'insensitive' },
                code: { equals: rawCode, mode: 'insensitive' },
              },
              select: { id: true, documentStatus: true, isManuallyEdited: true }
            });
            
            if (i < 2) {
              console.log(`[SEARCH DEBUG] category=${rawCategory} | title=${rawTitle} | code=${rawCode}`);
              console.log(`[SEARCH RESULT]`, existingInDb);
            }

            const isDuplicate = !!existingInDb;
            if (isDuplicate) {
              if (existingInDb.isManuallyEdited) {
                protectedCount++;
                continue; // lindungi data yang sudah diedit manual
              }
              duplicateCount++;
            }

            const idToUse = existingInDb ? existingInDb.id : (row.id || randomUUID());

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
              documentStatus: existingInDb ? existingInDb.documentStatus : 'PENDING_DOC',
              isManuallyEdited: false,
              lastEditSource: 'CSV',
              updatedAt: new Date()
            };

            if (existingInDb) {
              await this.prisma.masterItem.update({
                where: { id: existingInDb.id },
                data: dataToSave,
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
                const existingCert = await this.prisma.certificate.findFirst({
                  where: { itemId: idToUse, noSertifikat: cleanNoSertifikat }
                });
                
                if (!existingCert) {
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
                }
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
              protectedCount,
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
          message: `Impor CSV selesai: ${successCount} Berhasil, ${duplicateCount + protectedCount} Duplikat (Diperbarui), ${failCount} Gagal.`,
          totalRows,
          successCount,
          duplicateCount,
          protectedCount,
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

    const filtered = categoryKey 
      ? logs.filter(log => {
          if (!log.detail) return true;
          try {
            const detailObj = JSON.parse(log.detail);
            return !detailObj.categoryKey || detailObj.categoryKey === categoryKey;
          } catch {
            return true;
          }
        })
      : logs;

    // Urutkan dari terlama ke terbaru untuk melacak timeline "claim" item ID
    const sortedLogs = [...filtered].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const claimedByOlderLogs = new Set<string>();

    const updatedLogs = [];
    for (const log of sortedLogs) {
      if (!log.detail) {
        updatedLogs.push(log);
        continue;
      }

      try {
        const detailObj = JSON.parse(log.detail);
        const importedIds: string[] = detailObj.importedIds || [];
        const originalFailCount = detailObj.failCount || 0;
        const originalProtectedCount = detailObj.protectedCount || 0;

        if (importedIds.length > 0) {
          // Ambil status item di database saat ini
          const items = await this.prisma.masterItem.findMany({
            where: { id: { in: importedIds } },
            select: { id: true, documentStatus: true, validationStatus: true }
          });

          // Peta pencarian cepat berdasarkan ID
          const itemMap = new Map<string, any>();
          for (const item of items) {
            itemMap.set(item.id, item);
          }

          let successCount = 0;
          let duplicateCount = 0;
          let failCount = originalFailCount;

          const seenInThisLog = new Set<string>();

          for (const id of importedIds) {
            const item = itemMap.get(id);
            if (!item) continue; // Data sudah dihapus dari DB

            const isAlreadyClaimed = claimedByOlderLogs.has(id);
            const isIntraFileDuplicate = seenInThisLog.has(id);

            if (isAlreadyClaimed || isIntraFileDuplicate) {
              // Jika sudah diklaim oleh upload sebelumnya ATAU sudah pernah muncul di baris awal file yang sama (intra-file duplicate)
              duplicateCount++;
            } else {
              if (item.documentStatus !== 'PENDING_DOC' || item.validationStatus === 'NEW') {
                successCount++;
              } else if (item.validationStatus === 'DUPLICATE') {
                duplicateCount++;
              } else if (item.validationStatus === 'FAILED') {
                failCount++;
              }
            }
            seenInThisLog.add(id);
          }

          // Tandai semua ID aktif di log ini sebagai ter-klaim agar riwayat upload yang lebih baru mendeteksinya sebagai duplikat
          items.forEach(item => claimedByOlderLogs.add(item.id));

          detailObj.successCount = successCount;
          detailObj.duplicateCount = duplicateCount;
          detailObj.failCount = failCount;
          detailObj.totalRows = successCount + duplicateCount + originalProtectedCount + failCount;
        }

        updatedLogs.push({
          ...log,
          detail: JSON.stringify(detailObj)
        });
      } catch (e) {
        updatedLogs.push(log);
      }
    }

    // Kembalikan ke urutan terbaru dulu (descending) sebelum dikembalikan ke client
    return updatedLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async processBulkNested(groupedData: any[], categoryKey: string, fileName?: string) {
    let successCount = 0;
    let duplicateCount = 0;
    let protectedCount = 0;
    let failCount = 0;
    const failedRows = [];
    const createdMasters = [];
    const processedIds: string[] = [];
    const processedCodes: string[] = [];

    const norm = (val: string) => {
      return (val || '').trim().toLowerCase().replace(/^-$/, '');
    };

    const getCompareKey = (title: string, code: string) => {
      return `${norm(code)}|${norm(title)}`;
    };

    // Track compareKeys processed in this upload session (to detect intra-file duplicates and record their row number)
    const fileProcessedKeys = new Map<string, number>();

    for (let i = 0; i < groupedData.length; i++) {
      const group = groupedData[i];
      const rawTitle = group.master.title || '';
      const rawCode = group.master.code || '';
      const rawLocation = group.master.unitLocation || '';

      if (!rawTitle && !rawCode) {
        continue;
      }

      // 1. Validasi kolom wajib (Mandatory Fields)
      const itemToValidate = {
        title: rawTitle,
        code: rawCode,
        unitLocation: rawLocation,
        categoryKey: categoryKey || '',
        keterangan: JSON.stringify({
          tipe: group.master.tipe || '',
          penanggungJawab: group.master.penanggungJawab || '',
        }),
        issueDate: group.certificates[0]?.terbit || '',
        expiryDate: group.certificates[0]?.expired || '',
      };

      const errors = validateItem(itemToValidate);
      let isFailed = errors.length > 0;

      let finalValidationStatus = 'NEW';
      let finalValidationErrorsJson: string | null = null;

      if (isFailed) {
        finalValidationStatus = 'FAILED';
        finalValidationErrorsJson = JSON.stringify(errors);
        failCount++;
        failedRows.push({
          rowNumber: i + 1,
          title: rawTitle || `Baris ${i + 1}`,
          reason: errors.join(', ')
        });
        continue; // Jangan masukkan ke staging jika gagal
      }

      // 2. Cek Duplikat Internal (dalam File)
      const compareKey = getCompareKey(rawTitle, rawCode);
      const firstSeenRow = fileProcessedKeys.get(compareKey);

      if (firstSeenRow !== undefined) {
        // Baris ini adalah duplikat dari baris sebelumnya di file yang sama
        finalValidationStatus = 'FAILED';
        finalValidationErrorsJson = JSON.stringify([`Duplikat dengan baris ${firstSeenRow}`]);
        failCount++;
        failedRows.push({
          rowNumber: i + 1,
          title: rawTitle || `Baris ${i + 1}`,
          reason: `Duplikat dengan baris ${firstSeenRow}`
        });
        continue; // Jangan masukkan ke staging jika duplikat internal file
      }

      // Catat baris awal kemunculan data unik ini
      fileProcessedKeys.set(compareKey, i + 1);

      // Cari di DB (case-insensitive) untuk duplicate check
      const existingInDb = await this.prisma.masterItem.findFirst({
        where: {
          categoryKey: categoryKey || '',
          title: { equals: rawTitle, mode: 'insensitive' },
          code: { equals: rawCode, mode: 'insensitive' },
        },
        select: { id: true, documentStatus: true, isManuallyEdited: true }
      });

      if (existingInDb && existingInDb.isManuallyEdited) {
        // Lindungi data yang sudah diedit manual
        protectedCount++;
        continue;
      }

      // Tentukan status validasi jika tidak FAILED
      if (!isFailed) {
        if (existingInDb) {
          finalValidationStatus = 'DUPLICATE';
          duplicateCount++;
        } else {
          finalValidationStatus = 'NEW';
          successCount++;
        }
      }

      const masterData = {
        title: rawTitle,
        code: rawCode || `CSV-${randomUUID().substring(0, 8)}`,
        unitLocation: rawLocation,
        status: group.master.status || 'Aktif',
        keterangan: JSON.stringify({
          tipe: group.master.tipe || '',
          nomorSeri: rawCode || '',
          penanggungJawab: group.master.penanggungJawab || '',
          noSertifikat: group.certificates[0]?.noSertifikat || '',
          namaSertifikat: group.certificates[0]?.namaSertifikat || '',
          keteranganAsli: group.certificates[0]?.keterangan || ''
        }),
        categoryKey: categoryKey || '',
        documentStatus: existingInDb ? existingInDb.documentStatus : 'PENDING_DOC',
        isManuallyEdited: false,
        lastEditSource: 'CSV',
        validationStatus: finalValidationStatus,
        validationErrors: finalValidationErrorsJson,
        updatedAt: new Date()
      };

      let currentMasterId: string;
      if (existingInDb) {
        await this.prisma.masterItem.update({
          where: { id: existingInDb.id },
          data: masterData,
        });
        currentMasterId = existingInDb.id;
      } else {
        const createdMaster = await this.prisma.masterItem.create({
          data: masterData,
        });
        currentMasterId = createdMaster.id;
        createdMasters.push(createdMaster);
      }
      processedIds.push(currentMasterId);
      if (masterData.code) {
        processedCodes.push(masterData.code);
      }

      for (const cert of group.certificates) {
        const cleanNoCert = cert.noSertifikat ? String(cert.noSertifikat).trim() : '';
        if (cleanNoCert && cleanNoCert !== '-' && cleanNoCert.toLowerCase() !== 'tanpa sertifikat') {
          // Cari jika sertifikat sudah ada
          const existingCert = await this.prisma.certificate.findFirst({
            where: {
              itemId: currentMasterId,
              noSertifikat: { equals: cleanNoCert, mode: 'insensitive' }
            }
          });

          if (!existingCert) {
            await this.prisma.certificate.create({
              data: {
                itemId: currentMasterId,
                jenisSertifikat: cert.namaSertifikat || 'Umum',
                namaSertifikat: cert.namaSertifikat,
                noSertifikat: cleanNoCert,
                terbit: cert.terbit,
                expired: cert.expired,
                status: 'Aktif',
              },
            });
          }
        }
      }
    }

    // Jalankan recalculation dinamis setelah semua data disimpan ke Staging
    await recalculateStagingStatuses(this.prisma, categoryKey);

    const totalRows = successCount + duplicateCount + protectedCount + failCount;

    await this.prisma.monitoringLog.create({
      data: {
        action: 'CSV_IMPORT',
        status: 'SUCCESS',
        detail: JSON.stringify({
          fileName: fileName || `impor_${categoryKey}.csv`,
          importedCount: totalRows,
          successCount: successCount,
          duplicateCount: duplicateCount,
          protectedCount: protectedCount,
          failCount: failCount,
          failedRows: failedRows,
          categoryKey: categoryKey,
          importedIds: processedIds,
          importedCodes: processedCodes,
          type: 'master_items'
        })
      }
    });

    return {
      success: true,
      importedCount: totalRows,
      successCount: successCount,
      duplicateCount: duplicateCount,
      protectedCount: protectedCount,
      failCount: failCount,
      failedRows: failedRows,
      masters: createdMasters,
    };
  }

  async deleteImportHistory(id: string) {
    try {
      const log = await this.prisma.monitoringLog.findUnique({
        where: { id }
      });

      let categoryKeyToRecalculate = '';

      if (log && log.detail) {
        let detailObj: any = {};
        try { detailObj = JSON.parse(log.detail); } catch {}
        categoryKeyToRecalculate = detailObj.categoryKey || '';

        const idsToDelete: string[] = detailObj.importedIds || [];
        const codesToDelete: string[] = detailObj.importedCodes || [];

        // Cari semua log impor LAINNYA yang masih aktif
        const otherLogs = await this.prisma.monitoringLog.findMany({
          where: {
            action: 'CSV_IMPORT',
            id: { not: id }
          }
        });

        const activeIds = new Set<string>();
        const activeCodes = new Set<string>();

        for (const ol of otherLogs) {
          if (ol.detail) {
            try {
              const od = JSON.parse(ol.detail);
              if (od.importedIds && Array.isArray(od.importedIds)) {
                od.importedIds.forEach((iId: string) => activeIds.add(iId));
              }
              if (od.importedCodes && Array.isArray(od.importedCodes)) {
                od.importedCodes.forEach((iCode: string) => activeCodes.add(iCode));
              }
            } catch {}
          }
        }

        // Hanya hapus item yang TIDAK direferensikan oleh log impor aktif lainnya
        const safeIdsToDelete = idsToDelete.filter(iId => !activeIds.has(iId));
        const safeCodesToDelete = codesToDelete.filter(iCode => !activeCodes.has(iCode));

        if (safeIdsToDelete.length > 0 || safeCodesToDelete.length > 0) {
          await this.prisma.masterItem.deleteMany({
            where: {
              OR: [
                ...(safeIdsToDelete.length ? [{ id: { in: safeIdsToDelete } }] : []),
                ...(safeCodesToDelete.length ? [{ code: { in: safeCodesToDelete } }] : [])
              ]
            }
          });
        }
      }

      await this.prisma.monitoringLog.delete({
        where: { id }
      });

      if (categoryKeyToRecalculate) {
        await recalculateStagingStatuses(this.prisma, categoryKeyToRecalculate);
      }

      return { message: 'History record and imported data deleted successfully' };
    } catch (e) {
      return { message: 'Record removed' };
    }
  }
}
