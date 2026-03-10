import { NotificationModel, INotification } from "../models/notification.model";

export interface INotificationRepository {
    createNotification(data: Partial<INotification>): Promise<INotification>;
    getNotificationsByUser(userId: string, params?: { page: number; limit: number }): Promise<{ data: INotification[]; total: number }>;
    markAsRead(id: string): Promise<INotification | null>;
}

export class NotificationRepository implements INotificationRepository {
    async createNotification(data: Partial<INotification>): Promise<INotification> {
        const notification = new NotificationModel(data);
        return notification.save();
    }

    async getNotificationsByUser(
        userId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: INotification[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            NotificationModel.find({ userId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            NotificationModel.countDocuments({ userId }),
        ]);
        return { data, total };
    }

    async markAsRead(id: string): Promise<INotification | null> {
        return NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }
}
