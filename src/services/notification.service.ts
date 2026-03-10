import { CreateNotificationDTO } from "../dtos/notification.dto";
import { NotificationRepository } from "../repositories/notification.repository";
import { HttpError } from "../errors/http-error";
import { emitToUser } from "../utils/socket";

const notificationRepo = new NotificationRepository();

export class NotificationService {
    async createNotification(data: CreateNotificationDTO) {
        const notification = await notificationRepo.createNotification(data);
        emitToUser(String(notification.userId), "notification_created", notification);
        emitToUser(String(notification.userId), "notification:new", notification);
        return notification;
    }

    async listByUser(userId: string, params: { page: number; limit: number }) {
        return notificationRepo.getNotificationsByUser(userId, params);
    }

    async markAsRead(id: string) {
        const notification = await notificationRepo.markAsRead(id);
        if (!notification) throw new HttpError(404, "Notification not found");
        return notification;
    }
}
