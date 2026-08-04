import { Module } from '@nestjs/common';
import { IuranKeanggotaanService } from './iuran-keanggotaan.service';
import { IuranKeanggotaanController } from './iuran-keanggotaan.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [IuranKeanggotaanController],
  providers: [IuranKeanggotaanService],
})
export class IuranKeanggotaanModule {}
