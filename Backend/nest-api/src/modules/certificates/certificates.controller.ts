import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User', 'Viewer')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Roles('Super Admin', 'Admin', 'User')
  @Post()
  create(@Body() createCertificateDto: CreateCertificateDto, @Req() req: any) {
    // Otomatis isi uploadedBy dari JWT user yang sedang login
    const nama = req.user?.nama || req.user?.username || 'Sistem';
    const npk = req.user?.npk || '-';
    createCertificateDto.uploadedBy = `${nama} (${npk})`;
    return this.certificatesService.create(createCertificateDto);
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
  update(@Param('id') id: string, @Body() updateCertificateDto: UpdateCertificateDto, @Req() req: any) {
    // Jika ada update fileUrl baru (upload ulang), catat juga siapa yang mengupdate
    if (updateCertificateDto.fileUrl && !updateCertificateDto.uploadedBy) {
      const nama = req.user?.nama || req.user?.username || 'Sistem';
      const npk = req.user?.npk || '-';
      updateCertificateDto.uploadedBy = `${nama} (${npk})`;
    }
    return this.certificatesService.update(id, updateCertificateDto);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificatesService.remove(id);
  }
}
