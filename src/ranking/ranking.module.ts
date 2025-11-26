import { Module } from '@nestjs/common';
import { RankingsController } from './ranking.controller';
import { RankingsService } from './ranking.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { RankingScheduler } from './ranking.scheduler';


@Module({
  imports: [NotificationsModule],  
  controllers: [RankingsController],
  providers: [RankingsService, RankingScheduler],
})
export class RankingsModule {}
