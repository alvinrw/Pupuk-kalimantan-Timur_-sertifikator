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
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (token) {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub || payload.id;
        
        if (userId) {
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
