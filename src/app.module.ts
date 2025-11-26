import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { GoalsModule } from './goals/goals.module';
import { CheckinsModule } from './checkins/checkins.module';
import { StreaksModule } from './streaks/streaks.module';
import { ActivityCategoryModule } from './activity-category/activity-category.module';
import { RankingsModule } from './ranking/ranking.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { FriendsModule } from './friends/friends.module';
import { StatsModule } from './stats/stats.module';



@Module({
  imports: [UsersModule, PrismaModule, GoalsModule, CheckinsModule, StreaksModule, ActivityCategoryModule, RankingsModule, NotificationsModule, AuthModule, ChatsModule, FriendsModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
