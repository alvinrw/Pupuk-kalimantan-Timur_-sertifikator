import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async create(createCertificateDto: CreateCertificateDto) {
    const cert = await this.prisma.certificate.create({
      data: createCertificateDto,
    });

    if (createCertificateDto.itemId) {
      await this.prisma.masterItem.update({
        where: { id: createCertificateDto.itemId },
        data: { documentStatus: 'COMPLETED' },
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
    await this.findOne(id);
    return this.prisma.certificate.update({
      where: { id },
      data: updateCertificateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.certificate.delete({
      where: { id },
    });
  }
}

