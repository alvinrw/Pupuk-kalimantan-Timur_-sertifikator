import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { PrismaService } from '../../database/prisma.service';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User', 'Viewer')
export class CertificatesController {
  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles('Super Admin', 'Admin', 'User')
  @Post()
  async create(@Body() createCertificateDto: CreateCertificateDto, @Req() req: any) {
    // Otomatis isi uploadedBy dari JWT user yang sedang login
    const nama = req.user?.nama || req.user?.username || 'Sistem';
    const npk = req.user?.npk || '-';
    createCertificateDto.uploadedBy = `${nama} (${npk})`;
    
    const cert = await this.certificatesService.create(createCertificateDto);
    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'INSERT',
        targetTable: 'certificates',
        targetId: cert.noSertifikat || cert.id,
        details: JSON.stringify({ message: `Mengunggah Sertifikat: ${cert.namaSertifikat} (No: ${cert.noSertifikat})` }),
      },
    }).catch(() => {});
    return cert;
  }

  @Get('item/:itemId')
  findByItemId(@Param('itemId') itemId: string) {
    return this.certificatesService.findByItemId(itemId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCertificateDto: UpdateCertificateDto, @Req() req: any) {
    // Catat siapa yang mengupdate sertifikat ini
    if (!updateCertificateDto.uploadedBy) {
      const nama = req.user?.nama || req.user?.username || 'Sistem';
      const npk = req.user?.npk || '-';
      updateCertificateDto.uploadedBy = `${nama} (${npk})`;
    }
    
    const original = await this.certificatesService.findOne(id).catch(() => null);
    const result = await this.certificatesService.update(id, updateCertificateDto);
    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        targetTable: 'certificates',
        targetId: result.noSertifikat || id,
        details: JSON.stringify({
          message: `Mengupdate Sertifikat: ${result.namaSertifikat}`,
          changes: {
            before: original ? { noSertifikat: original.noSertifikat, namaSertifikat: original.namaSertifikat } : {},
            after: { noSertifikat: result.noSertifikat, namaSertifikat: result.namaSertifikat }
          }
        }),
      },
    }).catch(() => {});
    return result;
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const original = await this.certificatesService.findOne(id).catch(() => null);
    const result = await this.certificatesService.remove(id);

    let targetCategory = 'certificates';
    let targetName = id;

    if (original?.itemId) {
      const parentItem = await this.prisma.masterItem.findUnique({
        where: { id: original.itemId },
      }).catch(() => null);

      if (parentItem) {
        if (parentItem.categoryKey) {
          targetCategory = parentItem.categoryKey;
        }
        targetName = parentItem.title;
      }
    }

    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        targetTable: targetCategory,
        targetId: targetName,
        details: JSON.stringify({
          message: `Menghapus Sertifikat: ${original?.namaSertifikat || 'Sertifikat'} (No: ${original?.noSertifikat || '-'})`,
        }),
      },
    }).catch(() => {});
    return result;
  }
}
