import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

export function useAnalytics(workspaceId) {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['analytics', workspaceId],
        queryFn: async () => {
            const { data } = await api.get(`/api/analytics/${workspaceId}/dashboard`);

            // Map the new format to the old one for component compatibility
            return {
                overview: {
                    totalTasks: data.statusStats?.reduce((acc, curr) => acc + curr.value, 0) || 0,
                    completed: data.statusStats?.find(s => s.name === 'done')?.value || 0,
                    critical: 0, // Not directly in dashboard stats yet, default to 0
                    openTasks: data.statusStats?.filter(s => s.name !== 'done').reduce((acc, curr) => acc + curr.value, 0) || 0
                },
                velocity: [], // Velocity not in current dashboard endpoint
                timeStats: [], // Time stats not in current dashboard endpoint
                memberStats: data.memberStats || [],
                activityStats: data.activityStats || []
            };
        },
        enabled: !!user && !!workspaceId,
    });
}
