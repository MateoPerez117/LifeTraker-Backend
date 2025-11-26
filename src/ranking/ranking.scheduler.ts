import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RankingsService } from './ranking.service';

@Injectable()
export class RankingScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RankingScheduler.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private readonly rankings: RankingsService) {}

  onModuleInit() {
    // Corre cada hora para mantener snapshots simples estilo "trabajo universitario"
    this.run();
    this.intervalId = setInterval(() => this.run(), 60 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private async run() {
    try {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

      const period = start.toISOString().slice(0, 10); // YYYY-MM-DD

      await this.rankings.compute({
        period,
        from: start.toISOString(),
        to: end.toISOString(),
        metadata: { label: 'auto-daily' },
      });

      this.logger.debug(`Ranking diario recalculado para ${period}`);
    } catch (error) {
      this.logger.warn(`Error en scheduler de rankings: ${error}`);
    }
  }
}
