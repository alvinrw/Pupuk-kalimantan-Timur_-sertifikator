import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Controller, Get, Query , UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import {
  MonitoringOverviewQueryDto,
  MonitoringExpiryListQueryDto,
} from './dto/monitoring-query.dto';

@ApiTags('Monitoring & Expiry Engine')
@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin 1', 'Admin 2', 'Admin 3', 'User', 'Viewer')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Mendapatkan statistik overview monitoring sertifikat',
    description: 'Menghasilkan total sertifikat, jumlah aktif, perpanjang (<=30 hari), expired, afkir, beserta kalkulasi persentase.',
  })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil statistik monitoring overview.' })
  getOverview(@Query() query: MonitoringOverviewQueryDto) {
    return this.monitoringService.getOverview(query);
  }

  @Get('expiry-list')
  @ApiOperation({
    summary: 'Mendapatkan daftar monitoring sertifikat berdasarkan sisa hari kadaluarsa',
    description: 'Mengembalikan daftar sertifikat dengan sisa hari dinamis, disortir berdasarkan tingkat urgensi kadaluarsa.',
  })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar monitoring sertifikat.' })
  getExpiryList(@Query() query: MonitoringExpiryListQueryDto) {
    return this.monitoringService.getExpiryList(query);
  }
}
