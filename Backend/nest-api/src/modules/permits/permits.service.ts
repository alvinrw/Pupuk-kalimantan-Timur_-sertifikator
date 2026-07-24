import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermitDto } from './dto/create-permit.dto';
import { UpdatePermitDto } from './dto/update-permit.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPermitDto: CreatePermitDto) {
    return this.prisma.permit.create({
      data: createPermitDto,
    });
  }

  async findAll() {
    return this.prisma.permit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        item: true, // Includes MasterItem relation
      }
    });
  }

  async findByItemId(itemId: string) {
    return this.prisma.permit.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const permit = await this.prisma.permit.findUnique({
      where: { id },
      include: {
        item: true,
      }
    });
    if (!permit) {
      throw new NotFoundException(`Permit with ID ${id} not found`);
    }
    return permit;
  }

  async update(id: string, updatePermitDto: UpdatePermitDto) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.permit.update({
      where: { id },
      data: updatePermitDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.permit.delete({
      where: { id },
    });
  }
}
