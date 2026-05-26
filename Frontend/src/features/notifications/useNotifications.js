import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

export function useNotifications() {
    const user = useAuthStore((s) => s.user);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/api/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Notifications fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Mark as read error:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Mark all read error:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return { notifications, loading, refresh: fetchNotifications, markAsRead, markAllRead };
}
