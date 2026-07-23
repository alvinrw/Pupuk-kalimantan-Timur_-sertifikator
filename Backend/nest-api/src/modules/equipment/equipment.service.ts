import { Injectable, NotFoundException } from '@nestjs/common';
import { Equipment } from './entities/equipment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentQueryDto } from './dto/equipment-query.dto';
import { StatusKelayakan, StatusSertifikasi } from './enums/permit-status.enum';

@Injectable()
export class EquipmentService {
  // In-Memory Storage (Seeded dengan data dari mockData.js)
  private equipmentList: Equipment[] = [
    {
      id: "EQ-PL2-B01",
      tagNumber: "B-201-P2",
      name: "Primary Reformer Boiler Unit 2",
      category: "Bejana Tekan / Boiler",
      plantUnit: "Pabrik 2 (Amonia)",
      location: "Area Reformer - Zone A",
      inspectionBody: "Disnaker Kaltim",
      certificateNo: "CERT-7734/DISNAKER-KT/2023",
      issueDate: "2023-04-15",
      expiryDate: "2026-08-15",
      statusKelayakan: StatusKelayakan.LAYAK,
      statusSertifikasi: StatusSertifikasi.AKAN_EXPIRED,
      confidenceScore: 98.2,
      lastInspectedBy: "Ir. Haryanto, S.T. (Disnaker)",
      pdfFileName: "Sertifikat_Boiler_B201P2_2023.pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "EQ-PL3-CR04",
      tagNumber: "CR-402-P3",
      name: "Overhead Crane 50 Ton Urea Silo",
      category: "Pesawat Angkat & Angkut",
      plantUnit: "Pabrik 3 (Urea)",
      location: "Silo Warehouse B",
      inspectionBody: "Sucofindo",
      certificateNo: "SUCO-PAA-88219-2024",
      issueDate: "2024-01-10",
      expiryDate: "2027-01-10",
      statusKelayakan: StatusKelayakan.LAYAK,
      statusSertifikasi: StatusSertifikasi.AKTIF,
      confidenceScore: 99.1,
      lastInspectedBy: "Tim Inspector Sucofindo",
      pdfFileName: "SUCO_Crane_50T_P3.pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "EQ-PL5-ST02",
      tagNumber: "ST-501-P5",
      name: "Ammonia Storage Tank #2 (30.000 MT)",
      category: "Tangki Timbun B3",
      plantUnit: "Pabrik 5 (Amonia)",
      location: "Dermaga & Offsite",
      inspectionBody: "RINA Indonesia / Kemenperin",
      certificateNo: "PERIZ-B3-8891-PKT",
      issueDate: "2021-09-01",
      expiryDate: "2026-06-30",
      statusKelayakan: StatusKelayakan.REPAIR,
      statusSertifikasi: StatusSertifikasi.EXPIRED,
      confidenceScore: 94.5,
      lastInspectedBy: "Bambang Suherman (RINA)",
      pdfFileName: "Izin_Tangki_Ammonia_P5_2021.pdf",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findAll(query: EquipmentQueryDto) {
    let result = [...this.equipmentList];

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.tagNumber.toLowerCase().includes(searchLower) ||
          item.certificateNo.toLowerCase().includes(searchLower),
      );
    }

    if (query.category) {
      result = result.filter((item) => item.category === query.category);
    }

    if (query.plantUnit) {
      result = result.filter((item) => item.plantUnit === query.plantUnit);
    }

    if (query.statusKelayakan) {
      result = result.filter((item) => item.statusKelayakan === query.statusKelayakan);
    }

    if (query.statusSertifikasi) {
      result = result.filter((item) => item.statusSertifikasi === query.statusSertifikasi);
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedItems = result.slice(startIndex, startIndex + limit);

    return {
      statusCode: 200,
      message: 'Berhasil mengambil list perizinan peralatan pabrik',
      meta: {
        total: result.length,
        page,
        limit,
        totalPages: Math.ceil(result.length / limit),
      },
      data: paginatedItems,
    };
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = this.equipmentList.find((item) => item.id === id);
    if (!equipment) {
      throw new NotFoundException(`Data Peralatan dengan ID '${id}' tidak ditemukan`);
    }
    return equipment;
  }

  async create(createDto: CreateEquipmentDto): Promise<Equipment> {
    const newEquipment: Equipment = {
      id: `EQ-${Date.now()}`,
      ...createDto,
      confidenceScore: createDto.confidenceScore || 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.equipmentList.unshift(newEquipment);
    return newEquipment;
  }

  async update(id: string, updateDto: UpdateEquipmentDto): Promise<Equipment> {
    const equipmentIndex = this.equipmentList.findIndex((item) => item.id === id);
    if (equipmentIndex === -1) {
      throw new NotFoundException(`Data Peralatan dengan ID '${id}' tidak ditemukan`);
    }

    const updatedEquipment = {
      ...this.equipmentList[equipmentIndex],
      ...updateDto,
      updatedAt: new Date(),
    };

    this.equipmentList[equipmentIndex] = updatedEquipment;
    return updatedEquipment;
  }

  async remove(id: string): Promise<{ message: string }> {
    const equipmentIndex = this.equipmentList.findIndex((item) => item.id === id);
    if (equipmentIndex === -1) {
      throw new NotFoundException(`Data Peralatan dengan ID '${id}' tidak ditemukan`);
    }
    this.equipmentList.splice(equipmentIndex, 1);
    return { message: `Data Peralatan ID '${id}' berhasil dihapus` };
  }
}
