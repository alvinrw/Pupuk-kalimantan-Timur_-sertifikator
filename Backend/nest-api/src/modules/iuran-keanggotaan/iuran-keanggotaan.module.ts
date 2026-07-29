import { Module } from '@nestjs/common';
import { IuranKeanggotaanService } from './iuran-keanggotaan.service';
import { IuranKeanggotaanController } from './iuran-keanggotaan.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IuranKeanggotaanController],
  providers: [IuranKeanggotaanService],
})
export class IuranKeanggotaanModule {}
