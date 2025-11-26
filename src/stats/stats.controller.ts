import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { GoalRangeDto } from './dto/goal-range.dto';
import { ActivityMetricsDto } from './dto/activity-metrics.dto';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('goals/:goalId/progress')
  goalProgress(
    @CurrentUser('sub') userId: string,
    @Param('goalId') goalId: string,
    @Query() q: GoalRangeDto,
  ) {
    return this.stats.goalProgress(userId, goalId, q);
  }

  @Get('goals/:goalId/heatmap')
  goalHeatmap(
    @CurrentUser('sub') userId: string,
    @Param('goalId') goalId: string,
    @Query() q: GoalRangeDto,
  ) {
    return this.stats.goalHeatmap(userId, goalId, q);
  }

  @Get('streaks/:streakId/heatmap')
  streakHeatmap(
    @CurrentUser('sub') userId: string,
    @Param('streakId') streakId: string,
    @Query() q: GoalRangeDto,
  ) {
    return this.stats.streakHeatmap(userId, streakId, q);
  }

  @Get('activity')
  activityMetrics(
    @CurrentUser('sub') userId: string,
    @Query() q: ActivityMetricsDto,
  ) {
    return this.stats.activityMetrics(userId, q);
  }
}
