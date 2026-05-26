import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

/**
 * Messages fetcher for a project chat (replaces Firestore sync)
 */
export function useMessages(projectId, messageLimit = 100) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((s) => s.user);

    const fetchMessages = useCallback(async () => {
        if (!projectId || !user) return;
        try {
            const { data } = await api.get(`/api/chat/${projectId}`);
            // Map _id to id
            setMessages(data.map(m => ({ ...m, id: m._id })));
        } catch (err) {
            console.error('Messages fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId, user]);

    useEffect(() => {
        fetchMessages();
        // Optional: Polling for real-time-ish feel without socket.io
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    return { messages, loading, refresh: fetchMessages };
}

/**
 * Send a message to a project chat
 */
export function useSendMessage() {
    return {
        mutateAsync: async ({ projectId, text }) => {
            if (!text.trim()) return;
            try {
                const { data } = await api.post(`/api/chat/${projectId}`, { text: text.trim() });
                return { ...data, id: data._id };
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to send message');
                throw err;
            }
        }
    };
}
