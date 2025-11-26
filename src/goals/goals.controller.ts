import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ListGoalsDto } from './dto/list-goals.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';


@Controller('goals')
@UseGuards(JwtAuthGuard) // 👈 todos los endpoints de aquí requieren estar logueado
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateGoalDto) {
    // 👇 ya NO usamos dto.userId ni headers
    return this.goalsService.create(userId, dto);
  }

  @Get()
  findMine(@CurrentUser('sub') userId: string, @Query() q: ListGoalsDto) {
    const archived =
      q.archived === undefined ? undefined : q.archived === 'true';
    return this.goalsService.findByUser(userId, {
      archived,
      param: q.q,
    });
  }

  @Get(':id')
  findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.goalsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.goalsService.remove(userId, id);
  }
}
