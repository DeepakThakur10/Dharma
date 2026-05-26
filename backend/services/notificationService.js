import Notification from '../models/Notification.js';

export const createNotification = async (notifData) => {
    return await Notification.create(notifData);
};

export const getMyNotifications = async (userId) => {
    return await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(50);
};

export const markAsRead = async (notificationId, userId) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
    );
};
