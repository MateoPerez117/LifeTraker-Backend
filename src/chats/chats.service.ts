import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

import type { ListMessagesDto } from './dto/list-messages.dto';
import type { SendMessageDto } from './dto/send-message.dto';
import { CreateDmRoomDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear u obtener un DM entre currentUser y otro usuario
  async getOrCreateDmRoom(currentUserId: string, dto: CreateDmRoomDto) {
    if (dto.otherUserId === currentUserId) {
      throw new BadRequestException('No puedes crear un DM contigo mismo');
    }

    const otherUser = await this.prisma.user.findUnique({
      where: { id: dto.otherUserId },
      select: { id: true, username: true },
    });

    if (!otherUser) {
      throw new NotFoundException('Usuario destino no encontrado');
    }

    // ¿Ya existe un DM entre estos dos?
    const existing = await this.prisma.chatRoom.findFirst({
      where: {
        isDirect: true,
        members: {
          some: { userId: currentUserId },
        },
        AND: {
          members: {
            some: { userId: dto.otherUserId },
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existing) return existing;

    // Si no existe, lo creamos
    const room = await this.prisma.chatRoom.create({
      data: {
        isDirect: true,
        members: {
          create: [
            { userId: currentUserId },
            { userId: dto.otherUserId },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return room;
  }

  // Crear u obtener el chat asociado a una racha (incluye a todos los miembros)
  async getOrCreateStreakRoom(userId: string, streakId: string) {
    const streak = await this.prisma.streak.findUnique({
      where: { id: streakId },
      include: { members: { select: { userId: true } } },
    });
    if (!streak) throw new NotFoundException('Streak no encontrada');

    const isMember = streak.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('No eres miembro de esta racha');

    const include = {
      members: {
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    } as const;

    const existing = await this.prisma.chatRoom.findFirst({
      where: { streakId },
      include,
    });
    if (existing) return existing;

    const room = await this.prisma.chatRoom.create({
      data: {
        streakId,
        isDirect: false,
        members: {
          create: streak.members.map((m) => ({ userId: m.userId })),
        },
      },
      include,
    });

    return room;
  }

  // Listar todos los chats donde soy miembro
  async listMyRooms(userId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // último mensaje
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rooms;
  }

   // Verificar que el usuario pertenece a la room
  async ensureMembership(userId: string, roomId: string) {
    const member = await this.prisma.chatMember.findFirst({
      where: { userId, roomId },
    });
    if (!member) {
      throw new ForbiddenException('No perteneces a este chat');
    }
  }


  // Listar mensajes de una room (con paginación básica)
  async listMessages(
    userId: string,
    roomId: string,
    q: ListMessagesDto,
  ) {
    await this.ensureMembership(userId, roomId);

    const take = q.limit ?? 50;

    const baseQuery = {
      where: { roomId },
      orderBy: { createdAt: 'desc' as const },
      take,
    };

    const messages = q.cursor
      ? await this.prisma.message.findMany({
          ...baseQuery,
          skip: 1,
          cursor: { id: q.cursor },
        })
      : await this.prisma.message.findMany(baseQuery);

    const nextCursor =
      messages.length === take ? messages[messages.length - 1].id : null;

    return {
      items: messages,
      nextCursor,
    };
  }

  // Enviar un mensaje a una room
  async sendMessage(
    userId: string,
    roomId: string,
    dto: SendMessageDto,
  ) {
    await this.ensureMembership(userId, roomId);

    const message = await this.prisma.message.create({
      data: {
        roomId,
        userId,
        content: dto.content,
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });

    // Aquí en el futuro podrías emitir un evento de WebSocket

    return message;
  }
}
