import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Post, Body, Param, Delete, Put , UseGuards, Request } from '@nestjs/common';
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
  create(@Request() req, @Body() createCertificateDto: CreateCertificateDto) {
    createCertificateDto.uploadedBy = req.user.nama;
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
  update(@Param('id') id: string, @Request() req, @Body() updateCertificateDto: UpdateCertificateDto) {
    updateCertificateDto.uploadedBy = req.user.nama;
    return this.certificatesService.update(id, updateCertificateDto, req.user.nama);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.certificatesService.remove(id, req.user.nama);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Put(':id/restore')
  restore(@Param('id') id: string, @Request() req) {
    return this.certificatesService.restore(id, req.user.nama);
  }
}

