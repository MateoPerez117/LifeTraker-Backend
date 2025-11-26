import { Body, Controller, Get, Param, Post, Delete, Query, UseGuards } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { CreateStreakDto } from './dto/create-streak.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ListStreakCheckinsDto } from './dto/list-streak-checkins.dto';
import { RecordStreakCheckinDto } from './dto/record-streak-checkin.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@Controller('streaks')
@UseGuards(JwtAuthGuard)
export class StreaksController {
  constructor(
    private readonly svc: StreaksService, 
  ) {}

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateStreakDto) {
    return this.svc.create(userId, dto);
  }

  @Get()
  listMine(@CurrentUser('sub') userId: string) {
    return this.svc.listMine(userId);
  }

  @Post(':streakId/members')
  addMember(@CurrentUser('sub') userId: string, @Param('streakId') streakId: string, @Body() dto: AddMemberDto) {
    return this.svc.addMember(userId, streakId, dto);
  }

  @Post(':streakId/invite')
  inviteMember(
    @CurrentUser('sub') userId: string,
    @Param('streakId') streakId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.svc.inviteUserToStreak(streakId, userId, dto.userId);
  }

  @Post(':streakId/invitations/accept')
  acceptInvite(
    @CurrentUser('sub') userId: string,
    @Param('streakId') streakId: string,
  ) {
    return this.svc.acceptInvite(userId, streakId);
  }

  @Post(':streakId/invitations/reject')
  rejectInvite(
    @CurrentUser('sub') userId: string,
    @Param('streakId') streakId: string,
  ) {
    return this.svc.rejectInvite(userId, streakId);
  }

  @Delete(':streakId/members/:memberUserId')
  removeMember(@CurrentUser('sub') userId: string, @Param('streakId') streakId: string, @Param('memberUserId') memberUserId: string) {
    return this.svc.removeMember(userId, streakId, memberUserId);
  }

  @Post(':streakId/checkins')
  recordCheckin(@CurrentUser('sub') userId: string, @Param('streakId') streakId: string, @Body() dto: RecordStreakCheckinDto) {
    return this.svc.recordCheckin(userId, streakId, dto);
  }

  @Get(':streakId/checkins')
  listCheckins(@CurrentUser('sub') userId: string, @Param('streakId') streakId: string, @Query() q: ListStreakCheckinsDto) {
    return this.svc.listCheckins(userId, streakId, q);
  }

  @Get(':streakId/stats')
  statsMine(@CurrentUser('sub') userId: string, @Param('streakId') streakId: string, @Query('memberId') memberId?: string) {
    return this.svc.statsForMember(userId, streakId, memberId);
  }
}
