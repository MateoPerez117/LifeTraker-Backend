// src/streaks/streaks.module.ts
import { Module } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports:[NotificationsModule],
  controllers: [StreaksController],
  providers: [StreaksService],
})
export class StreaksModule {}
