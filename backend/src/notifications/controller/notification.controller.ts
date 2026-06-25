import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
} from '@nestjs/common';

import { NotificationService } from '../service/notification.service';

import { CreateNotificationDto } from '../dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Post('notify')
  createNotification(
    @Body() dto: CreateNotificationDto,
  ) {

    return this.notificationService.createNotification(
      dto,
    );

  }

  @Get()
  getNotifications() {

    return this.notificationService.getNotifications();

  }

  @Delete()
  clearNotifications() {

    return this.notificationService.clearNotifications();

  }

}