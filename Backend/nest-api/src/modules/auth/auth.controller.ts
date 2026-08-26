import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // [FIX H-03] Rate limit ketat untuk login: maks 5 percobaan per menit per IP
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: Record<string, any>) {
    return this.authService.login(signInDto.username, signInDto.password);
  }

  @SkipThrottle() // Heartbeat dipanggil sering, tidak perlu dibatasi
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('heartbeat')
  heartbeat() {
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Request() req) {
    // req.user contains the decoded JWT payload
    const userId = req.user.id || req.user.sub;
    return this.authService.logout(userId);
  }
}
