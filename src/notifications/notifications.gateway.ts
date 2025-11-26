import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import type { Notification } from '@prisma/client';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';

@WebSocketGateway({
  namespace: 'notifications', // ws en /notifications
  cors: {
    origin: '*', // en prod restringes
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
  
  
  let token: string | undefined;

// 1) Extract from Auth property
  token = client.handshake.auth?.token;

// 2) Extract from Authorization Header
  if (!token) {
  const authHeader = client.handshake.headers['authorization'];
  token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
  ? authHeader.slice(7)
  : undefined;
  }

  // 3) Extract and Narrow type from Query Parameter (Fixes 'any' error)
  if (!token) {
  const queryToken = client.handshake.query['token'];
   
 // Socket.io query values can be string or string[]. We only want string.
  if (typeof queryToken === 'string') {
  token = queryToken;
   }
  }

  if (!token) {
  this.logger.warn(`Socket ${client.id} sin token, bye`);
  client.disconnect();
  return;
  }

      // 2) Verificar JWT
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET!,
      });

      // 3) Guardar user en el socket y unirlo a su room
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      };

      await client.join(`user:${payload.sub}`);

      this.logger.log(
        `Notif socket conectado: socket=${client.id} userId=${payload.sub}`,
      );
    } catch (err) {
      this.logger.warn(`Error auth socket notif ${client.id}: ${err}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Notif socket desconectado: ${client.id}`);
  }

  // 👇 Método que llamará el servicio para enviar notis en tiempo real
  emitNotification(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
