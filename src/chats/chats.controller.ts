import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import type { ListMessagesDto } from './dto/list-messages.dto';
import type { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { CreateDmRoomDto } from './dto/create-chat.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  // Crear u obtener un DM
  @Post('dm')
  createDm(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateDmRoomDto,
  ) {
    return this.chats.getOrCreateDmRoom(userId, dto);
  }

  // Crear u obtener room de chat para una racha
  @Post('streak/:streakId')
  createStreakRoom(
    @CurrentUser('sub') userId: string,
    @Param('streakId') streakId: string,
  ) {
    return this.chats.getOrCreateStreakRoom(userId, streakId);
  }

  // Listar mis chats
  @Get()
  listMyRooms(@CurrentUser('sub') userId: string) {
    return this.chats.listMyRooms(userId);
  }

  // Listar mensajes de una room
  @Get(':roomId/messages')
  listMessages(
    @CurrentUser('sub') userId: string,
    @Param('roomId') roomId: string,
    @Query() q: ListMessagesDto,
  ) {
    return this.chats.listMessages(userId, roomId, q);
  }

  // Enviar mensaje
  @Post(':roomId/messages')
  sendMessage(
    @CurrentUser('sub') userId: string,
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chats.sendMessage(userId, roomId, dto);
  }
}
