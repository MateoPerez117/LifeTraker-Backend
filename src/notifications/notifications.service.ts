// src/notifications/notifications.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway:NotificationsGateway
  ) {}

  // Para usar desde otros módulos (Goals, Streaks, Rankings...)
  async createForUser(userId: string, dto: CreateNotificationDto) {
  const notification = await this.prisma.notification.create({ data: {
    userId,
    type: dto.type,
    payload: dto.payload ?? {},
  }});

  this.gateway?.emitNotification(userId, notification);

  return notification;
}


  // Endpoint de pruebas: crea noti para el user actual
  async createMine(userId: string, dto: CreateNotificationDto) {
    return this.createForUser(userId, dto);
  }

  async findMine(userId: string, q: ListNotificationsDto) {
    const onlyUnread =
      q.unread === undefined ? undefined : q.unread === 'true';

    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(onlyUnread !== undefined
          ? { readAt: onlyUnread ? null : { not: null } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: string, id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notificación no encontrada');
    if (notif.userId !== userId) throw new ForbiddenException();

    // si ya estaba leída, no pasa nada, solo actualizamos readAt
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: notif.readAt ?? new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    // marcamos todas las no leídas de ese user
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return {
      updatedCount: result.count,
    };
  }

  async remove(userId: string, id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notificación no encontrada');
    if (notif.userId !== userId) throw new ForbiddenException();
    return this.prisma.notification.delete({ where: { id } });
  }

  
}
