import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Get()
  listFriends(@CurrentUser('sub') userId: string) {
    return this.friends.listFriends(userId);
  }

  @Get('requests')
  listRequests(@CurrentUser('sub') userId: string) {
    return this.friends.listRequests(userId);
  }

  @Post('requests')
  sendRequest(
    @CurrentUser('sub') userId: string,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.friends.sendRequest(userId, dto);
  }

  @Post('requests/:id/accept')
  accept(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.friends.accept(userId, id);
  }

  @Post('requests/:id/reject')
  reject(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.friends.reject(userId, id);
  }

  @Post(':userId/block')
  block(
    @CurrentUser('sub') userId: string,
    @Param('userId') targetId: string,
  ) {
    return this.friends.block(userId, targetId);
  }

  @Post(':userId/unblock')
  unblock(
    @CurrentUser('sub') userId: string,
    @Param('userId') targetId: string,
  ) {
    return this.friends.unblock(userId, targetId);
  }

  @Post(':userId/unfriend')
  unfriend(
    @CurrentUser('sub') userId: string,
    @Param('userId') targetId: string,
  ) {
    return this.friends.unfriend(userId, targetId);
  }
}
