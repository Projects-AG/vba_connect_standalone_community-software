import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CallsService } from '../service/calls.service';
import { StartCallDto } from '../dto/start-call.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

type AuthUser = { id: string; name: string; email: string };

@ApiTags('Call logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('call-logs')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get('history')
  history(@CurrentUser() user: AuthUser) {
    return this.callsService.getHistory(user);
  }

  @Get('incoming')
  incoming(@CurrentUser() user: AuthUser) {
    return this.callsService.getIncoming(user);
  }

  @Post('start')
  start(@CurrentUser() user: AuthUser, @Body() dto: StartCallDto) {
    return this.callsService.startCall(user, dto.peerUserId);
  }

  @Post(':id/answer')
  answer(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.callsService.answerCall(user, id);
  }

  @Post(':id/end')
  end(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.callsService.endCall(user, id);
  }
}
