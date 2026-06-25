import { Injectable } from '@nestjs/common';

import { NotificationModel } from '../model/notification.model';

@Injectable()
export class NotificationService {

  constructor(
    private readonly notificationModel: NotificationModel,
  ) {}

  createNotification(notification: any) {

    const result =
      this.notificationModel.create(notification);

    return {
      success: true,
      message: 'Notification dispatched successfully',
      notification: result,
    };

  }

  getNotifications() {

    const notifications =
      this.notificationModel.getAll();

    return {
      success: true,
      notifications,
    };

  }

  clearNotifications() {

    this.notificationModel.clear();

    return {
      success: true,
      message: 'All notifications cleared',
    };

  }

}