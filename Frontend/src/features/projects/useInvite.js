import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

/**
 * Send an invitation to collaborate on a workspace
 */
export function useSendInvite() {
    return useMutation({
        /** @param {{ email: string, workspaceId: string, workspaceName: string, role?: string }} variables */
        mutationFn: async ({ email, workspaceId, workspaceName, role }) => {
            const { data } = await api.post('/api/invite', {
                email,
                workspaceId,
                workspaceName,
                role
            });
            return data;
        },
        onSuccess: () => toast.success('Invitation sent!'),
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to send invitation'),
    });
}

/**
 * Accept an invitation
 */
export function useAcceptInvite() {
    return useMutation({
        /** @param {string} invitationId */
        mutationFn: async (invitationId) => {
            const { data } = await api.post('/api/invite/accept', { invitationId });
            return data;
        },
        onSuccess: () => toast.success('Invitation accepted!'),
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to accept invitation'),
    });
}

/**
 * Fetch workspace members from backend
 */
export function useProjectMembers(workspaceId) {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['members', workspaceId],
        queryFn: async () => {
            const { data } = await api.get(`/api/workspaces/${workspaceId}/members`);
            return data;
        },
        enabled: !!workspaceId && !!user,
        retry: 1,
    });
}

/**
 * Remove a member from a workspace (owner only)
 */
export function useRemoveMember() {
    const queryClient = useQueryClient();
    return useMutation({
        /** @param {{ workspaceId: string, userId: string }} variables */
        mutationFn: async ({ workspaceId, userId }) => {
            await api.delete(`/api/workspaces/${workspaceId}/members/${userId}`);
        },
        onSuccess: (_, { workspaceId }) => {
            queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Member removed');
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to remove member'),
    });
}
