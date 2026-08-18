import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateMasterItemDto } from './dto/create-master-item.dto';
import { UpdateMasterItemDto } from './dto/update-master-item.dto';
import { PrismaService } from '../../database/prisma.service';
import { recalculateStagingStatuses } from '../csv-import/staging-validation.helper';

@Injectable()
export class MasterItemsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.runDeadlineCheck().catch(err => console.error('Error running startup deadline check:', err));
    setInterval(() => {
      this.runDeadlineCheck().catch(err => console.error('Error running interval deadline check:', err));
    }, 24 * 60 * 60 * 1000);
  }

  async create(createMasterItemDto: CreateMasterItemDto) {
    return this.prisma.masterItem.create({
      data: createMasterItemDto,
    });
  }

  async checkDuplicate(data: { title: string, code: string, unitLocation: string, nomorSeri: string, excludeId?: string }) {
    const { title, code, unitLocation, nomorSeri, excludeId } = data;
    
    const items = await this.prisma.masterItem.findMany({
      where: {
        title: { equals: title, mode: 'insensitive' },
        code: { equals: code, mode: 'insensitive' },
        unitLocation: { equals: unitLocation, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });

    for (const item of items) {
      let dbNomorSeri = '';
      try {
        if (item.keterangan && item.keterangan.startsWith('{')) {
          const meta = JSON.parse(item.keterangan);
          dbNomorSeri = meta.nomorSeri || '';
        }
      } catch (e) {}

      if ((dbNomorSeri || '').trim().toLowerCase() === (nomorSeri || '').trim().toLowerCase()) {
        return {
          isDuplicate: true,
          isInStaging: item.documentStatus === 'PENDING_DOC',
          matchedItem: item
        };
      }
    }

    return {
      isDuplicate: false,
      isInStaging: false,
      matchedItem: null
    };
  }

  async findAll(categoryKey?: string, search?: string) {
    const where: any = {};
    
    if (categoryKey) {
      where.categoryKey = categoryKey;
    }
    
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return this.prisma.masterItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        certificates: true,
        permits: true,
        documentHistories: {
          orderBy: { createdAt: 'desc' }
        },
        notificationSetting: true,
        reminderNotifications: {
          where: { isResolved: false }
        }
      }
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.masterItem.findUnique({
      where: { id },
      include: {
        certificates: true,
        permits: true,
        documentHistories: {
          orderBy: { createdAt: 'desc' }
        },
        notificationSetting: true,
        reminderNotifications: {
          where: { isResolved: false }
        }
      }
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateMasterItemDto: UpdateMasterItemDto) {
    const item = await this.findOne(id); // Check if exists

    // Resolve any active notifications on manual update/renewal
    await this.prisma.reminderNotification.updateMany({
      where: { itemId: id, isResolved: false },
      data: { isResolved: true, resolvedAt: new Date() }
    }).catch(() => {});

    const updated = await this.prisma.masterItem.update({
      where: { id },
      data: {
        ...updateMasterItemDto,
        isManuallyEdited: true,
        lastEditSource: 'MANUAL',
      },
    });

    await recalculateStagingStatuses(this.prisma, updated.categoryKey);
    return updated;
  }

  async remove(id: string) {
    const item = await this.findOne(id); // Check if exists
    const deleted = await this.prisma.masterItem.delete({
      where: { id },
    });
    await recalculateStagingStatuses(this.prisma, item.categoryKey);
    return deleted;
  }

  async resolveExemption(id: string, note: string) {
    const item = await this.findOne(id);

    // Resolve active reminders
    await this.prisma.reminderNotification.updateMany({
      where: { itemId: id, isResolved: false },
      data: { isResolved: true, resolvedAt: new Date() }
    }).catch(() => {});

    // Note: We do NOT auto-promote the master item to COMPLETED/EXEMPT here.
    // The master item only moves to Data Utama when the user explicitly clicks "Pindah ke Utama".
    // Just store the exemption note for reference.
    const updated = await this.prisma.masterItem.update({
      where: { id },
      data: {
        exemptionNote: note || 'Tidak memerlukan sertifikat',
        isManuallyEdited: true,
        lastEditSource: 'MANUAL',
      },
    });

    await recalculateStagingStatuses(this.prisma, item.categoryKey);
    return updated;
  }

  // === NOTIFICATION SETTINGS & REMINDERS ===

  async updateNotificationSetting(itemId: string, data: { isEnabled: boolean; triggerType: string; triggerDays: number; triggerDate?: string | null }) {
    await this.findOne(itemId); // Ensure item exists
    return this.prisma.notificationSetting.upsert({
      where: { itemId },
      create: {
        itemId,
        isEnabled: data.isEnabled,
        triggerType: data.triggerType || 'DAYS',
        triggerDays: data.triggerDays,
        triggerDate: data.triggerDate ? new Date(data.triggerDate) : null,
      },
      update: {
        isEnabled: data.isEnabled,
        triggerType: data.triggerType || 'DAYS',
        triggerDays: data.triggerDays,
        triggerDate: data.triggerDate ? new Date(data.triggerDate) : null,
      },
    });
  }

  async findActiveReminders() {
    return this.prisma.reminderNotification.findMany({
      where: { isResolved: false },
      include: {
        item: {
          include: {
            certificates: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTaskCenterData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await this.prisma.masterItem.findMany({
      where: {
        documentStatus: {
          in: ['COMPLETED', 'EXEMPT']
        }
      },
      include: {
        notificationSetting: true,
        certificates: {
          include: {
            notificationSetting: true
          }
        }
      }
    });

    const allTasks = [];
    const stats = {
      aktif: 0,
      hariIni: 0,
      mingguIni: 0,
      bulanIni: 0,
      expired: 0
    };

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    for (const item of items) {
      const certs = item.certificates || [];
      const activeCerts = certs.filter(c => c.status === 'Aktif' || c.status === 'Active' || !c.status);

      // Parse metadata for penanggung jawab
      let meta: any = {};
      try {
        meta = JSON.parse(item.keterangan || '{}');
      } catch (e) {
        meta = { keteranganAsli: item.keterangan };
      }
      const penanggungJawab = meta.penanggungJawab || item.unitLocation || 'Dept. Operasi';

      const evaluateTarget = (expiryStr: string | null, targetSetting: any, displayName: string, displayNo: string, certId?: string) => {
        if (!expiryStr || expiryStr === '-' || expiryStr.trim() === '') return;

        let expiry = new Date(expiryStr);
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(expiryStr)) {
          const parts = expiryStr.split('/');
          expiry = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        if (isNaN(expiry.getTime())) return;
        expiry.setHours(0, 0, 0, 0);

        const sisaHari = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const isEnabled = targetSetting ? targetSetting.isEnabled : (item.notificationSetting ? item.notificationSetting.isEnabled : true);
        if (!isEnabled) return; // Skip if disabled

        const triggerType = targetSetting ? targetSetting.triggerType : (item.notificationSetting ? item.notificationSetting.triggerType : 'DAYS');
        const triggerDays = targetSetting ? targetSetting.triggerDays : (item.notificationSetting?.triggerDays ?? 30);
        const triggerDate = targetSetting ? targetSetting.triggerDate : item.notificationSetting?.triggerDate;

        let isTriggered = false;
        let activeDate = new Date();

        if (triggerType === 'DATE' && triggerDate) {
          const tDate = new Date(triggerDate);
          tDate.setHours(0, 0, 0, 0);
          isTriggered = today >= tDate;
          activeDate = tDate;
        } else {
          isTriggered = sisaHari <= triggerDays;
          activeDate = new Date(expiry);
          activeDate.setDate(activeDate.getDate() - triggerDays);
          activeDate.setHours(0,0,0,0);
        }

        const isExpired = sisaHari < 0;
        const isMulaiHariIni = isEnabled && activeDate.getTime() === today.getTime();
        const sisaHariReminder = Math.ceil((activeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let priority = 5;
        let statusBadge = "Belum Aktif";

        if (isExpired) {
          priority = 1;
          statusBadge = "Expired";
        } else if (isTriggered) {
          if (sisaHari <= 14) {
            priority = 2;
            statusBadge = "Segera Expired";
          } else if (isMulaiHariIni) {
            priority = 3;
            statusBadge = "Mulai Hari Ini";
          } else {
            priority = 4;
            statusBadge = "Reminder Aktif";
          }
        }

        const isMingguIni = !isExpired && expiry >= startOfWeek && expiry <= endOfWeek;
        const isBulanIni = !isExpired && expiry >= startOfMonth && expiry <= endOfMonth;

        // Fill stats
        if (isEnabled) stats.aktif++;
        if (isExpired) stats.expired++;
        if (isMulaiHariIni) stats.hariIni++;
        if (isMingguIni) stats.mingguIni++;
        if (isBulanIni) stats.bulanIni++;

        allTasks.push({
          id: item.id,
          certificateId: certId || null,
          prioritas: priority,
          namaPeralatan: item.title,
          unitPabrik: item.unitLocation || 'Umum',
          lokasi: item.unitLocation || 'Umum',
          categoryKey: item.categoryKey,
          namaSertifikat: displayName,
          nomorSertifikat: displayNo,
          tanggalMulaiReminder: activeDate.toISOString().split('T')[0],
          tanggalExpired: expiry.toISOString().split('T')[0],
          statusReminder: statusBadge,
          penanggungJawab: penanggungJawab,
          sisaHari: sisaHari,
          sisaHariReminder: sisaHariReminder,
          isTriggered: isTriggered,
          isNotificationEnabled: isEnabled,
          isMingguIni: isMingguIni,
          isBulanIni: isBulanIni,
          rawItem: item
        });
      };

      if (activeCerts.length > 0) {
        const primaryCert = activeCerts.slice().sort((a, b) => {
          const dA = new Date(a.expired && a.expired !== '-' ? a.expired : '1970-01-01').getTime();
          const dB = new Date(b.expired && b.expired !== '-' ? b.expired : '1970-01-01').getTime();
          if (dA !== dB) return dB - dA;
          const hasPdfA = !!a.fileUrl;
          const hasPdfB = !!b.fileUrl;
          if (hasPdfA !== hasPdfB) return hasPdfB ? 1 : -1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        })[0];

        evaluateTarget(
          primaryCert.expired && primaryCert.expired !== '-' ? primaryCert.expired : item.expiryDate,
          primaryCert.notificationSetting,
          primaryCert.namaSertifikat || primaryCert.jenisSertifikat || item.title || '-',
          primaryCert.noSertifikat || item.code || '-',
          primaryCert.id
        );
      } else {
        evaluateTarget(
          item.expiryDate,
          item.notificationSetting,
          '-',
          item.code || '-'
        );
      }
    }

    // Sort by priority, then by sisaHari (closest to expiry first)
    allTasks.sort((a, b) => {
      if (a.prioritas !== b.prioritas) return a.prioritas - b.prioritas;
      return a.sisaHari - b.sisaHari;
    });

    const bannerTasks = allTasks.filter(t => t.sisaHari < 0 || t.sisaHariReminder <= 0).slice(0, 5);

    return {
      stats,
      bannerTasks,
      allTasks
    };
  }

  async runDeadlineCheck() {
    console.log('[SCHEDULER] Running daily deadline check for MasterItems and Certificates...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await this.prisma.masterItem.findMany({
      where: {
        documentStatus: { not: 'EXEMPT' },
      },
      include: {
        notificationSetting: true,
        certificates: {
          include: {
            notificationSetting: true
          }
        }
      }
    });

    let triggeredCount = 0;

    for (const item of items) {
      const certs = item.certificates || [];
      const activeCerts = certs.filter(c => c.status === 'Aktif' || c.status === 'Active' || !c.status);

      const evaluateAndSave = async (expiryStr: string | null, targetSetting: any, displayName: string, displayNo: string, certId?: string) => {
        if (!expiryStr || expiryStr === '-' || expiryStr.trim() === '') return;

        const expiry = new Date(expiryStr);
        if (isNaN(expiry.getTime())) return;
        expiry.setHours(0, 0, 0, 0);

        const sisaHari = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const isEnabled = targetSetting ? targetSetting.isEnabled : (item.notificationSetting ? item.notificationSetting.isEnabled : true);
        if (!isEnabled) return; // Skip if disabled

        const triggerType = targetSetting ? targetSetting.triggerType : (item.notificationSetting ? item.notificationSetting.triggerType : 'DAYS');
        const triggerDays = targetSetting ? targetSetting.triggerDays : (item.notificationSetting?.triggerDays ?? 30);
        const triggerDate = targetSetting ? targetSetting.triggerDate : item.notificationSetting?.triggerDate;

        let isTriggered = false;
        if (triggerType === 'DATE' && triggerDate) {
          const tDate = new Date(triggerDate);
          tDate.setHours(0, 0, 0, 0);
          isTriggered = today >= tDate;
        } else {
          isTriggered = sisaHari <= triggerDays;
        }

        if (isTriggered && isEnabled) {
          let msg = '';
          if (sisaHari === 0) {
            msg = `Peringatan: Dokumen "${item.title}" - "${displayName}" (${displayNo}) habis masa berlaku HARI INI!`;
          } else if (sisaHari < 0) {
            msg = `Peringatan: Dokumen "${item.title}" - "${displayName}" (${displayNo}) sudah EXPIRED sejak ${Math.abs(sisaHari)} hari yang lalu!`;
          } else {
            msg = `Peringatan: Dokumen "${item.title}" - "${displayName}" (${displayNo}) akan kadaluarsa dalam ${sisaHari} hari (Deadline: ${expiryStr.substring(0, 10)}).`;
          }

          const existingReminder = await this.prisma.reminderNotification.findFirst({
            where: {
              itemId: item.id,
              certificateId: certId || null,
              isResolved: false
            }
          });

          if (!existingReminder) {
            await this.prisma.reminderNotification.create({
              data: {
                itemId: item.id,
                certificateId: certId || null,
                message: msg,
                isResolved: false
              }
            });
            triggeredCount++;
          } else {
            await this.prisma.reminderNotification.update({
              where: { id: existingReminder.id },
              data: { message: msg }
            });
          }
        }
      };

      if (activeCerts.length > 0) {
        const primaryCert = activeCerts.slice().sort((a, b) => {
          const dA = new Date(a.expired && a.expired !== '-' ? a.expired : '1970-01-01').getTime();
          const dB = new Date(b.expired && b.expired !== '-' ? b.expired : '1970-01-01').getTime();
          if (dA !== dB) return dB - dA;
          const hasPdfA = !!a.fileUrl;
          const hasPdfB = !!b.fileUrl;
          if (hasPdfA !== hasPdfB) return hasPdfB ? 1 : -1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        })[0];

        await evaluateAndSave(
          primaryCert.expired,
          primaryCert.notificationSetting,
          primaryCert.namaSertifikat || primaryCert.jenisSertifikat || '-',
          primaryCert.noSertifikat || '-',
          primaryCert.id
        );
      } else {
        await evaluateAndSave(
          item.expiryDate,
          item.notificationSetting,
          '-',
          item.code || '-'
        );
      }
    }

    return {
      message: `Deadline check completed. Processed ${items.length} items. Triggered ${triggeredCount} new active alerts.`,
      checkedCount: items.length,
      triggeredCount
    };
  }
}

