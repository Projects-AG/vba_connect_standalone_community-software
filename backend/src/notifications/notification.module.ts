import { Module } from '@nestjs/common';

import { NotificationController } from './controller/notification.controller';
import { NotificationService } from './service/notification.service';
import { NotificationModel } from './model/notification.model';

@Module({
  controllers: [
    NotificationController,
  ],
  providers: [
    NotificationService,
    NotificationModel,
  ],
})
export class NotificationModule {}