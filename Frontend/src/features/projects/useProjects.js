import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

/** Fetch all projects (Workspaces in the new architecture) */
export function useProjects() {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await api.get('/api/workspaces');
            // Map _id to id for compatibility with legacy UI components
            return data.map(w => ({ ...w, id: w._id }));
        },
        enabled: !!user,
    });
}

/** Create a new project (Workspace) */
export function useCreateProject() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {any} data */
        mutationFn: async (data) => {
            const { data: newWorkspace } = await api.post('/api/workspaces', data);
            return { ...newWorkspace, id: newWorkspace._id };
        },
        onSuccess: (newProject) => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Workspace created');
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to create workspace'),
    });
}

/** Update project (Workspace) */
export function useUpdateProject() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {{ projectId: string, data: any }} variables */
        mutationFn: async ({ projectId, data }) => {
            const { data: updatedWorkspace } = await api.put(`/api/workspaces/${projectId}`, data);
            return { ...updatedWorkspace, id: updatedWorkspace._id };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Workspace updated');
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to update workspace'),
    });
}

/** Delete project (Workspace) */
export function useDeleteProject() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {string} projectId */
        mutationFn: async (projectId) => {
            await api.delete(`/api/workspaces/${projectId}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Workspace deleted');
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to delete workspace'),
    });
}
