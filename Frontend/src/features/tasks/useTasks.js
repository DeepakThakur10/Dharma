import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios'; // Still needed for isAxiosError check

/** Fetch all tasks for a specific list */
export function useTasks(workspaceId) {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['tasks', workspaceId],
        queryFn: async () => {
            if (!workspaceId) return [];
            const { data } = await api.get(`/api/tasks/workspace/${workspaceId}`);
            const tasksArray = data.tasks || [];
            // Transform backend _id to id for frontend compatibility
            return tasksArray.map(t => ({ ...t, id: t._id }));
        },
        enabled: !!user && !!workspaceId,
    });
}

/** Fetch ALL tasks for the current user (placeholder for dashboard) */
export function useAllTasks() {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['all-tasks'],
        queryFn: async () => {
            const { data } = await api.get('/api/tasks/my-tasks').catch(() => ({ data: { tasks: [] } }));
            const tasksArray = data.tasks || [];
            return tasksArray.map(t => ({ ...t, id: t._id }));
        },
        enabled: !!user,
    });
}

/** Fetch ALL task stats for the current user (dashboard counts) */
export function useAllTaskStats() {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['all-task-stats'],
        queryFn: async () => {
            const { data } = await api.get('/api/tasks/my-stats');
            return data;
        },
        enabled: !!user,
    });
}

/** 
 * Create task 
 */
export function useCreateTask() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {{ workspaceId: string, spaceId: string, listId: string, folderId?: string, data: any }} variables */
        mutationFn: async ({ workspaceId, spaceId, listId, folderId, data }) => {
            const { data: newTask } = await api.post('/api/tasks', {
                ...data,
                workspaceId,
                spaceId,
                listId,
                folderId
            });
            return { ...newTask, id: newTask._id };
        },
        onSuccess: (newTask, { listId }) => {
            qc.invalidateQueries({ queryKey: ['tasks', listId] });
            qc.invalidateQueries({ queryKey: ['all-tasks'] });
            toast.success('Task created');
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to create task'),
    });
}

/** 
 * Update task 
 */
export function useUpdateTask() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {{ taskId: string, data: any, listId?: string }} variables */
        mutationFn: async ({ taskId, data, listId }) => {
            const { data: updatedTask } = await api.put(`/api/tasks/${taskId}`, data);
            return { ...updatedTask, id: updatedTask._id };
        },
        onSuccess: (updatedTask, { listId }) => {
            if (listId) qc.invalidateQueries({ queryKey: ['tasks', listId] });
            qc.invalidateQueries({ queryKey: ['all-tasks'] });
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to update task'),
    });
}

/** 
 * Delete task 
 */
export function useDeleteTask() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {{ taskId: string, listId?: string }} variables */
        mutationFn: async ({ taskId, listId }) => {
            await api.delete(`/api/tasks/${taskId}`);
        },
        onSuccess: (_, { listId }) => {
            if (listId) qc.invalidateQueries({ queryKey: ['tasks', listId] });
            qc.invalidateQueries({ queryKey: ['all-tasks'] });
            toast.success('Task deleted');
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to delete task'),
    });
}

/** 
 * Submit work for a task 
 */
export function useSubmitTask() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {{ taskId: string, submissionFile: string, submissionNote?: string, listId?: string }} variables */
        mutationFn: async ({ taskId, submissionFile, submissionNote, listId }) => {
            const { data } = await api.post(`/api/tasks/${taskId}/submit`, {
                submissionFile,
                submissionNote
            });
            return data;
        },
        onSuccess: (updatedTask, { listId }) => {
            if (listId) qc.invalidateQueries({ queryKey: ['tasks', listId] });
            qc.invalidateQueries({ queryKey: ['all-tasks'] });
            toast.success('Work submitted for review');
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to submit work'),
    });
}

/** 
 * Review (approve/reject) submitted work 
 */
export function useReviewTask() {
    const qc = useQueryClient();

    return useMutation({
        /** @param {{ taskId: string, action: string, feedback?: string, workspaceId: string, listId?: string }} variables */
        mutationFn: async ({ taskId, action, feedback, workspaceId, listId }) => {
            const { data } = await api.post(`/api/tasks/${taskId}/review`, {
                action,
                feedback,
                workspaceId
            });
            return data;
        },
        onSuccess: (updatedTask, { listId }) => {
            if (listId) qc.invalidateQueries({ queryKey: ['tasks', listId] });
            qc.invalidateQueries({ queryKey: ['all-tasks'] });
            toast.success(`Submission ${updatedTask.status === 'done' ? 'Approved' : 'Rejected'}`);
        },
        onError: (err) => toast.error(axios.isAxiosError(err) ? err.response?.data?.message : 'Review failed'),
    });
}
