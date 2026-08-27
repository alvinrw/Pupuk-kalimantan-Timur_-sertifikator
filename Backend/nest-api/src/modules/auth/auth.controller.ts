import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Res } from '@nestjs/common';
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
  async login(@Body() signInDto: Record<string, any>, @Request() req, @Res({ passthrough: true }) res) {
    const result = await this.authService.login(signInDto.username, signInDto.password);
    
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user: result.user };
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
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    const userId = req.user.id || req.user.sub;
    
    // Blacklist current tokens
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;
    if (accessToken || refreshToken) {
      await this.authService.blacklistTokens([accessToken, refreshToken]);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return this.authService.logout(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Refresh token missing' });
    }

    const result = await this.authService.refreshToken(refreshToken);
    
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return { message: 'Token refreshed successfully' };
  }
}
