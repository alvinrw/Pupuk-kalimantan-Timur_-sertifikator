import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityInterceptor } from './common/interceptors/activity.interceptor';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

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
import { IuranKeanggotaanModule } from './modules/iuran-keanggotaan/iuran-keanggotaan.module';
import { UsersModule } from './modules/users/users.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';
import { ColumnConfigsModule } from './modules/column-configs/column-configs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
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
    IuranKeanggotaanModule,
    UsersModule,
    ActivityLogsModule,
    WebsocketsModule,
    ColumnConfigsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor,
    }
  ],
})
export class AppModule {}
