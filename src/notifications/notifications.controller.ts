// src/notifications/notifications.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  // Crear noti para mí 
  @Post()
  createMine(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notifications.createMine(userId, dto);
  }

  // Listar mis notificaciones (todas o solo no leídas)
  @Get()
  findMine(
    @CurrentUser('sub') userId: string,
    @Query() q: ListNotificationsDto,
  ) {
    return this.notifications.findMine(userId, q);
  }

  // Marcar UNA como leída
  @Patch(':id/read')
  markAsRead(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.notifications.markAsRead(userId, id);
  }

  // Marcar TODAS como leídas
  @Patch('read-all')
  markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notifications.markAllAsRead(userId);
  }

  // Borrar notificación
  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.notifications.remove(userId, id);
  }
}
