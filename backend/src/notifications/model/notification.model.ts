import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationModel {

  private notifications: any[] = [];

  create(notification: any) {

    this.notifications.unshift(notification);

    return notification;

  }

  getAll() {

    return this.notifications;

  }

  clear() {

    this.notifications = [];

    return true;

  }

}