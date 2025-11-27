import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { ListCheckinsDto } from './dto/list-checkins.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@Controller('checkins')
@UseGuards(JwtAuthGuard)
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateCheckinDto) {
    return this.checkinsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string, @Query() q: ListCheckinsDto) {
    return this.checkinsService.findAll(userId, q);
  }

  @Get('today')
  findToday(
  @CurrentUser('sub') userId: string,
  @Query('date') date?: string, // opcional, por si algún día quieres pasar fecha manual
  ) {
    return this.checkinsService.findToday(userId, date);
  }

  @Get(':id')
  findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.checkinsService.findOne(userId, id);
  }

  @Patch(':id')
  update(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: UpdateCheckinDto) {
    return this.checkinsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.checkinsService.remove(userId, id);
  }

}
