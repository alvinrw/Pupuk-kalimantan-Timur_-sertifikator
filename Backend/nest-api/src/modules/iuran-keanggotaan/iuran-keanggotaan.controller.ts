import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { IuranKeanggotaanService } from './iuran-keanggotaan.service';
import { CreateIuranDto } from './dto/create-iuran.dto';
import { UpdateIuranDto } from './dto/update-iuran.dto';
import { PrismaService } from '../../database/prisma.service';

@Controller('iuran-keanggotaan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'User', 'Viewer')
export class IuranKeanggotaanController {
  constructor(
    private readonly iuranService: IuranKeanggotaanService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles('Super Admin', 'Admin', 'User')
  @Post()
  async create(@Body() createIuranDto: CreateIuranDto, @Req() req: any) {
    const item = await this.iuranService.create(createIuranDto);
    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'INSERT',
        targetTable: 'iuran_keanggotaan',
        targetId: item.nama || item.id,
        details: JSON.stringify({ message: `Menambah data Iuran Keanggotaan: ${item.nama || item.id}` }),
      },
    }).catch(() => {});
    return item;
  }

  @Get()
  findAll() {
    return this.iuranService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.iuranService.findOne(id);
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateIuranDto: UpdateIuranDto, @Req() req: any) {
    const item = await this.iuranService.update(id, updateIuranDto);
    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        targetTable: 'iuran_keanggotaan',
        targetId: item.nama || item.id,
        details: JSON.stringify({ message: `Memperbarui data Iuran Keanggotaan: ${item.nama || item.id}` }),
      },
    }).catch(() => {});
    return item;
  }

  @Roles('Super Admin', 'Admin', 'User')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const item = await this.iuranService.remove(id);
    await this.prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        targetTable: 'iuran_keanggotaan',
        targetId: item.nama || item.id,
        details: JSON.stringify({ message: `Menghapus data Iuran Keanggotaan: ${item.nama || item.id}` }),
      },
    }).catch(() => {});
    return item;
  }
}
