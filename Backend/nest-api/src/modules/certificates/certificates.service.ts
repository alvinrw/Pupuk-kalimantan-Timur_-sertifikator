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
          data: { documentStatus: 'COMPLETED' },
        }).catch(() => {});

        await this.prisma.documentHistory.create({
          data: {
            itemId: cert.itemId,
            action: 'UPDATED_CERTIFICATE',
            description: `Sertifikat / dokumen lampiran "${cert.namaSertifikat || cert.jenisSertifikat}" telah diperbarui.`,
            changedBy: 'System / User'
          }
        });

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
          documentStatus: 'COMPLETED',
          issueDate: createCertificateDto.terbit || null,
          expiryDate: createCertificateDto.expired || null,
        },
      }).catch(() => {});
      await this.prisma.documentHistory.create({
        data: {
          itemId: createCertificateDto.itemId,
          action: 'ADDED_CERTIFICATE',
          description: `Sertifikat / dokumen lampiran baru "${cert.namaSertifikat || cert.jenisSertifikat}" telah diunggah.`,
          changedBy: 'System / User'
        }
      });
    }

    return cert;
  }

  async findByItemId(itemId: string) {
    return this.prisma.certificate.findMany({
      where: { itemId, isDeleted: false },
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

  async update(id: string, updateCertificateDto: UpdateCertificateDto, currentUser?: string) {
    const cert = await this.findOne(id);
    const result = await this.prisma.certificate.update({
      where: { id },
      data: updateCertificateDto,
    });

    if (cert.itemId) {
      await this.prisma.reminderNotification.updateMany({
        where: { itemId: cert.itemId, isResolved: false },
        data: { isResolved: true, resolvedAt: new Date() },
      }).catch(() => {});

      await this.prisma.masterItem.update({
        where: { id: cert.itemId },
        data: {
          documentStatus: 'COMPLETED',
          issueDate: updateCertificateDto.terbit !== undefined ? updateCertificateDto.terbit : undefined,
          expiryDate: updateCertificateDto.expired !== undefined ? updateCertificateDto.expired : undefined,
        }
      }).catch(() => {});
      const changes = [];
      if (updateCertificateDto.namaSertifikat && updateCertificateDto.namaSertifikat !== cert.namaSertifikat) {
        changes.push(`Nama Sertifikat diubah dari '${cert.namaSertifikat || '-'}' menjadi '${updateCertificateDto.namaSertifikat}'`);
      }
      if (updateCertificateDto.noSertifikat && updateCertificateDto.noSertifikat !== cert.noSertifikat) {
        changes.push(`No. SK diubah dari '${cert.noSertifikat || '-'}' menjadi '${updateCertificateDto.noSertifikat}'`);
      }
      if (updateCertificateDto.terbit && updateCertificateDto.terbit !== cert.terbit) {
        changes.push(`Tgl Terbit diubah dari '${cert.terbit || '-'}' menjadi '${updateCertificateDto.terbit}'`);
      }
      if (updateCertificateDto.expired && updateCertificateDto.expired !== cert.expired) {
        changes.push(`Tgl Expired diubah dari '${cert.expired || '-'}' menjadi '${updateCertificateDto.expired}'`);
      }
      if (updateCertificateDto.status && updateCertificateDto.status !== cert.status) {
        changes.push(`Status diubah dari '${cert.status || '-'}' menjadi '${updateCertificateDto.status}'`);
      }
      if (updateCertificateDto.instansi && updateCertificateDto.instansi !== cert.instansi) {
        changes.push(`Instansi diubah dari '${cert.instansi || '-'}' menjadi '${updateCertificateDto.instansi}'`);
      }

      let descriptionText = `Informasi sertifikat / lampiran "${result.namaSertifikat || result.jenisSertifikat}" telah diedit.`;
      if (changes.length > 0) {
        descriptionText = `Perubahan data pada "${result.namaSertifikat || result.jenisSertifikat}": ` + changes.join(', ') + '.';
      }

      await this.prisma.documentHistory.create({
        data: {
          itemId: cert.itemId,
          action: 'UPDATED_CERTIFICATE',
          description: descriptionText,
          changedBy: currentUser || updateCertificateDto.uploadedBy || 'System / User'
        }
      });
    }

    return result;
  }

  async remove(id: string, currentUser?: string) {
    const cert = await this.findOne(id);
    const result = await this.prisma.certificate.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    if (cert.itemId) {
      await this.prisma.documentHistory.create({
        data: {
          itemId: cert.itemId,
          targetId: cert.id,
          action: 'SOFT_DELETED_CERTIFICATE',
          description: `Dokumen "${cert.namaSertifikat || cert.jenisSertifikat}" beserta lampirannya telah dipindahkan ke tempat sampah.`,
          changedBy: currentUser || 'System / User'
        }
      });

      const remainingCerts = await this.prisma.certificate.findMany({
        where: { itemId: cert.itemId, isDeleted: false },
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

  async restore(id: string, currentUser?: string) {
    const cert = await this.findOne(id);
    const result = await this.prisma.certificate.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });

    if (cert.itemId) {
      await this.prisma.documentHistory.create({
        data: {
          itemId: cert.itemId,
          targetId: cert.id,
          action: 'RESTORED_CERTIFICATE',
          description: `Dokumen "${cert.namaSertifikat || cert.jenisSertifikat}" berhasil dipulihkan dari tempat sampah.`,
          changedBy: currentUser || 'System / User'
        }
      });

      // Update the master item status to reflect the restored certificate
      await this.prisma.masterItem.update({
        where: { id: cert.itemId },
        data: {
          documentStatus: 'COMPLETED',
          issueDate: result.terbit !== undefined ? result.terbit : undefined,
          expiryDate: result.expired !== undefined ? result.expired : undefined,
        }
      }).catch(() => {});
    }

    return result;
  }
}

