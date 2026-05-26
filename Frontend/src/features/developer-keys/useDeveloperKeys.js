import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

export function useDeveloperKeys(workspaceId) {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['developer-keys', workspaceId],
        queryFn: async () => {
            const { data } = await api.get(`/api/workspaces/${workspaceId}/api-keys`);
            return data;
        },
        enabled: !!user && !!workspaceId,
    });
}

export function useCreateKey() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {{ workspaceId: string, name: string }} variables */
        mutationFn: async ({ workspaceId, name }) => {
            const { data } = await api.post(`/api/workspaces/${workspaceId}/api-keys`, { name });
            return data;
        },
        onSuccess: (data, variables) => {
            const { workspaceId } = variables;
            qc.invalidateQueries({ queryKey: ['developer-keys', workspaceId] });
            toast.success('API Key generated');
        },
        onError: (err) => {
            const message = axios.isAxiosError(err) ? err.response?.data?.message : err.message;
            toast.error(message || 'Failed to generate key');
        },
    });
}
