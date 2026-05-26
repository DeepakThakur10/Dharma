import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export function useWorkspaceAnalytics(workspaceId) {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['analytics', workspaceId],
        queryFn: async () => {
            const { data } = await api.get(`/api/analytics/${workspaceId}/dashboard`);
            return data;
        },
        enabled: !!user && !!workspaceId
    });
}

export function useWorkspaceActivity(workspaceId, filters = {}) {
    const user = useAuthStore((s) => s.user);
    const { page = 1, limit = 10 } = filters;

    return useQuery({
        queryKey: ['activity', workspaceId, page, limit],
        queryFn: async () => {
            const { data } = await api.get(`/api/analytics/${workspaceId}/activity`, {
                params: filters
            });
            return data;
        },
        enabled: !!user && !!workspaceId
    });
}
