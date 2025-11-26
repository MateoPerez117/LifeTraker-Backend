import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatsService } from './chats.service';
import type { SendMessageDto } from './dto/send-message.dto';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';


@WebSocketGateway({
  namespace: 'chat', // => ws en /chat
  cors: {
    origin: '*',      // en prod restringes
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatsService: ChatsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // 1) Obtener token del handshake
      const authHeader = client.handshake.headers['authorization'];
      const tokenFromHeader =
        typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : undefined;

      let token: string | undefined;

    // 1. Check auth property
    token = client.handshake.auth?.token;
    
    // 2. Check header
    if (!token) {
        token = tokenFromHeader;
    }

    // 3. Check query parameter
    if (!token) {
        const queryToken = client.handshake.query['token'];
        // Narrow the type to ensure it's a single string and not an array.
        if (typeof queryToken === 'string') {
            token = queryToken;
        }
    }

    if (!token) {
        this.logger.warn(`Socket ${client.id} sin token, desconectando...`);
        client.disconnect();
        return;
    }

      // 2) Verificar JWT
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET!,
      });

      // 3) Guardar info del user en el socket
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      };

      // 4) Room personal por si quieres notis dirigidas
      await client.join(`user:${payload.sub}`);

      this.logger.log(
        `Cliente conectado: socketId=${client.id} userId=${payload.sub}`,
      );
    } catch (err) {
      this.logger.warn(`Error autenticando socket ${client.id}: ${err}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Cliente pide unirse a un room de chat
  @SubscribeMessage('joinRoom')
  async onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = client.data.user as { id: string } | undefined;
    if (!user) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    await this.chatsService.ensureMembership(user.id, data.roomId);
    await client.join(data.roomId);

    client.emit('joinedRoom', { roomId: data.roomId });
  }

  // Cliente envía un mensaje a un room
  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const user = client.data.user as { id: string } | undefined;
    if (!user) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    const dto: SendMessageDto = {
      content: data.content,
    };

    const message = await this.chatsService.sendMessage(
      user.id,
      data.roomId,
      dto,
    );

    // Emitimos el mensaje a TODOS los que están en la room
    this.server.to(data.roomId).emit('newMessage', message);
  }
}
