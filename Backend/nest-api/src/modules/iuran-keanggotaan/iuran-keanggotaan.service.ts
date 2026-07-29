import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIuranDto } from './dto/create-iuran.dto';
import { UpdateIuranDto } from './dto/update-iuran.dto';

@Injectable()
export class IuranKeanggotaanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIuranDto: CreateIuranDto) {
    return this.prisma.iuranKeanggotaan.create({
      data: createIuranDto,
    });
  }

  async findAll() {
    return this.prisma.iuranKeanggotaan.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const iuran = await this.prisma.iuranKeanggotaan.findUnique({
      where: { id },
    });
    if (!iuran) throw new NotFoundException(`Iuran dengan ID ${id} tidak ditemukan`);
    return iuran;
  }

  async update(id: string, updateIuranDto: UpdateIuranDto) {
    await this.findOne(id); // pastikan ada
    return this.prisma.iuranKeanggotaan.update({
      where: { id },
      data: updateIuranDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.iuranKeanggotaan.delete({
      where: { id },
    });
  }
}
