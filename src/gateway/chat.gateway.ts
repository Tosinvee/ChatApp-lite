import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from 'src/presence/presence.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(
    private readonly presence: PresenceService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const { token, deviceId } = client.handshake.auth;
    const payload = this.jwtService.verify(token);
    await this.presence.markActive(payload.userId, deviceId);
    client.data.userId = payload.userId;
    client.data.deviceId = deviceId;
    client.join(`user_${payload.userId}`);
  }

  async handleDisconnect(client: Socket) {
    const { userId, deviceId } = client.data;
    await this.presence.markInactive(userId, deviceId);
  }

  sendToUser(userId: string, payload: any) {
    this.server.to(`user_${userId}`).emit('notification', payload);
  }
}
