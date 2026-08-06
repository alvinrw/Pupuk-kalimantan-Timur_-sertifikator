import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { DatabaseModule } from '../../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [AppGateway],
})
export class WebsocketsModule {}
