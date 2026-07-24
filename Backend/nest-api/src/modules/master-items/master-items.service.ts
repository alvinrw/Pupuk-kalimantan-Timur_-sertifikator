import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMasterItemDto } from './dto/create-master-item.dto';
import { UpdateMasterItemDto } from './dto/update-master-item.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MasterItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createMasterItemDto: CreateMasterItemDto) {
    return this.prisma.masterItem.create({
      data: createMasterItemDto,
    });
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
        }
      }
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateMasterItemDto: UpdateMasterItemDto) {
    await this.findOne(id); // Check if exists
    return this.prisma.masterItem.update({
      where: { id },
      data: updateMasterItemDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.masterItem.delete({
      where: { id },
    });
  }
}

