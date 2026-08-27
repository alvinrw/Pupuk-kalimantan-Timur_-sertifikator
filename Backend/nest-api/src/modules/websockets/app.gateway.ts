import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private disconnectTimeouts = new Map<string, NodeJS.Timeout>();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (token) {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub || payload.id;
        
        if (userId) {
          // Cancel pending disconnect timeout if exists (user refreshed page)
          if (this.disconnectTimeouts.has(userId)) {
            clearTimeout(this.disconnectTimeouts.get(userId));
            this.disconnectTimeouts.delete(userId);
          }

          // Update DB
          await this.prisma.user.update({
            where: { id: userId },
            data: { lastActive: new Date() },
          });

          // Join room user id untuk private messages
          client.join(`user_${userId}`);
          
          // Emit broadcast bahwa user ini online
          this.server.emit('user_status_changed', { userId, isOnline: true });
        }
      }
    } catch (error) {
      console.log('Socket connection error:', error.message);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (token) {
        // Abaikan validasi expiry saat disconnect, karena token mungkin saja sudah expired
        const payload = this.jwtService.verify(token, { ignoreExpiration: true });
        const userId = payload.sub || payload.id;
        
        if (userId) {
          // Set lastActive ke 0 menandakan offline
          await this.prisma.user.update({
            where: { id: userId },
            data: { lastActive: new Date(0) },
          });
          
          // Emit broadcast bahwa user ini offline
          this.server.emit('user_status_changed', { userId, isOnline: false });

          // Schedule logout activity log in case they closed the tab (not just refreshed)
          const timeout = setTimeout(async () => {
            try {
              // Verifikasi apakah user masih offline (lastActive = 0)
              const user = await this.prisma.user.findUnique({ where: { id: userId } });
              if (user && user.lastActive.getTime() === 0) {
                // Catat log aktivitas logout karena tab di close
                await this.prisma.activityLog.create({
                  data: {
                    userId: userId,
                    action: 'LOGOUT',
                    targetTable: 'users',
                    targetId: userId,
                    details: JSON.stringify({ message: 'User logged out (Tab Closed)' }),
                  },
                });
              }
            } catch (err) {
              console.log('Error creating disconnect log:', err.message);
            } finally {
              this.disconnectTimeouts.delete(userId);
            }
          }, 5000); // Tunggu 5 detik, jika reconnect (refresh page), timeout akan dibatalkan di handleConnection

          this.disconnectTimeouts.set(userId, timeout);
        }
      }
    } catch (error) {
      console.log('Socket disconnect error:', error.message);
    }
  }

  // Jika dibutuhkan fitur heartbeat via socket
  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (token) {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub || payload.id;
        if (userId) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { lastActive: new Date() },
          });
          this.server.emit('user_status_changed', { userId, isOnline: true });
        }
      }
    } catch (error) {}
  }
}
