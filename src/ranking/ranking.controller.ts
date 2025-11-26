import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ComputeRankingDto } from './dto/compute-ranking.dto';
import { ListRankingsDto } from './dto/list-rankings.dto';
import { RankingsService } from './ranking.service';

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankings: RankingsService) {}

  // Recalcular ranking de un periodo
  @Post('compute')
  compute(@Body() dto: ComputeRankingDto) {
    return this.rankings.compute(dto);
  }

  // Listar ranking ya calculado para un periodo
  @Get()
  list(@Query() q: ListRankingsDto) {
    return this.rankings.list(q);
  }
}
