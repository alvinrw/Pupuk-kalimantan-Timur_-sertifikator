import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async create(createCertificateDto: CreateCertificateDto) {
    if (createCertificateDto.itemId && createCertificateDto.noSertifikat) {
      const existingCert = await this.prisma.certificate.findFirst({
        where: {
          itemId: createCertificateDto.itemId,
          noSertifikat: createCertificateDto.noSertifikat,
          OR: [
            { fileUrl: null },
            { fileUrl: '' }
          ]
        }
      });

      if (existingCert) {
        const cert = await this.prisma.certificate.update({
          where: { id: existingCert.id },
          data: {
            ...createCertificateDto,
            jenisSertifikat: createCertificateDto.jenisSertifikat || existingCert.jenisSertifikat || 'Sertifikat Utama'
          },
        });

        await this.prisma.reminderNotification.updateMany({
          where: { itemId: createCertificateDto.itemId, isResolved: false },
          data: { isResolved: true, resolvedAt: new Date() },
        }).catch(() => {});

        await this.prisma.masterItem.update({
          where: { id: createCertificateDto.itemId },
          data: { 
            isManuallyEdited: true,
            lastEditSource: 'MANUAL',
            exemptionNote: null,
          },
        }).catch(() => {});

        return cert;
      }
    }

    const cert = await this.prisma.certificate.create({
      data: {
        ...createCertificateDto,
        jenisSertifikat: createCertificateDto.jenisSertifikat || 'Sertifikat Utama'
      },
    });

    if (createCertificateDto.itemId) {
      await this.prisma.reminderNotification.updateMany({
        where: { itemId: createCertificateDto.itemId, isResolved: false },
        data: { isResolved: true, resolvedAt: new Date() },
      }).catch(() => {});

      await this.prisma.masterItem.update({
        where: { id: createCertificateDto.itemId },
        data: { 
          issueDate: createCertificateDto.terbit || null,
          expiryDate: createCertificateDto.expired || null,
          isManuallyEdited: true,
          lastEditSource: 'MANUAL',
          exemptionNote: null,
        },
      }).catch(() => {});
    }

    return cert;
  }

  async findByItemId(itemId: string) {
    return this.prisma.certificate.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
    });
    if (!cert) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return cert;
  }

  async update(id: string, updateCertificateDto: UpdateCertificateDto) {
    const cert = await this.findOne(id);
    
    // Auto-activate certificate if it was EXEMPT but is now being updated
    const updatedStatus = cert.status === 'EXEMPT' ? 'Aktif' : undefined;

    const result = await this.prisma.certificate.update({
      where: { id },
      data: {
        ...updateCertificateDto,
        status: updateCertificateDto.status || updatedStatus || cert.status,
      },
    });

    if (cert.itemId) {
      await this.prisma.reminderNotification.updateMany({
        where: { itemId: cert.itemId, isResolved: false },
        data: { isResolved: true, resolvedAt: new Date() },
      }).catch(() => {});

      // Only update housekeeping metadata — do NOT auto-promote documentStatus.
      // The master item moves to Data Utama only when the user explicitly clicks "Pindah ke Utama".
      await this.prisma.masterItem.update({
        where: { id: cert.itemId },
        data: {
          isManuallyEdited: true,
          lastEditSource: 'MANUAL',
          ...(updateCertificateDto.terbit !== undefined ? { issueDate: updateCertificateDto.terbit } : {}),
          ...(updateCertificateDto.expired !== undefined ? { expiryDate: updateCertificateDto.expired } : {}),
        }
      }).catch(() => {});
    }

    return result;
  }

  async remove(id: string) {
    const cert = await this.findOne(id);
    const result = await this.prisma.certificate.delete({
      where: { id },
    });

    // Update MasterItem status and dates based on remaining certificates
    if (cert.itemId) {
      const remainingCerts = await this.prisma.certificate.findMany({
        where: { itemId: cert.itemId },
        orderBy: { createdAt: 'desc' },
      });

      if (remainingCerts.length === 0) {
        await this.prisma.masterItem.update({
          where: { id: cert.itemId },
          data: {
            documentStatus: 'EXEMPT',
            exemptionNote: 'Semua sertifikat telah dihapus',
            issueDate: null,
            expiryDate: null,
          },
        }).catch(() => {});
      } else {
        const latest = remainingCerts[0];
        await this.prisma.masterItem.update({
          where: { id: cert.itemId },
          data: {
            issueDate: latest.terbit,
            expiryDate: latest.expired,
          },
        }).catch(() => {});
      }
    }

    return result;
  }
}

