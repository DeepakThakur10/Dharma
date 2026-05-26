import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

/**
 * Fetch pending invitations for the current user
 */
export function usePendingInvitations() {
    const user = useAuthStore((s) => s.user);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInvitations = useCallback(async () => {
        if (!user?.email) return;
        try {
            const { data } = await api.get('/api/invite/pending');
            setInvitations(data.map(i => ({ ...i, id: i._id })));
        } catch (err) {
            console.error('Invitations fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchInvitations();
        // Optional: Polling for real-time-ish feel
        const interval = setInterval(fetchInvitations, 10000);
        return () => clearInterval(interval);
    }, [fetchInvitations]);

    return { invitations, loading, refresh: fetchInvitations };
}

/**
 * Accept an invitation via backend
 */
export async function acceptInvitation(invitationId) {
    try {
        const { data } = await api.post('/api/invite/accept', { invitationId });
        return data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to accept invitation');
    }
}

/**
 * Decline an invitation via backend
 */
export async function declineInvitation(invitationId) {
    try {
        const { data } = await api.post('/api/invite/decline', { invitationId });
        return data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to decline invitation');
    }
}
