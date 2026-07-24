import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { PermitsModule } from './modules/permits/permits.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { StorageModule } from './modules/storage/storage.module';
import { DatabaseModule } from './database/database.module';
import { MasterItemsModule } from './modules/master-items/master-items.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { DocumentHistoryModule } from './modules/document-history/document-history.module';
import { CsvImportModule } from './modules/csv-import/csv-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    EquipmentModule,
    PermitsModule,
    OcrModule,
    StorageModule,
    MasterItemsModule,
    CertificatesModule,
    MonitoringModule,
    DocumentHistoryModule,
    CsvImportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
