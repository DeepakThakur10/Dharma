import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

/** Fetch all user bookmarks */
export function useBookmarks() {
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['bookmarks'],
        queryFn: async () => {
            const { data } = await api.get('/api/bookmarks');
            // Transform backend _id to id for frontend compatibility
            return data.map(b => ({ ...b, id: b._id }));
        },
        enabled: !!user,
    });
}

/** Create bookmark */
export function useCreateBookmark() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const { data: newBookmark } = await api.post('/api/bookmarks', data);
            return { ...newBookmark, id: newBookmark._id };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['bookmarks'] });
            toast.success('Bookmark saved');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to save bookmark'),
    });
}

/** Delete bookmark */
export function useDeleteBookmark() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (bookmarkId) => {
            await api.delete(`/api/bookmarks/${bookmarkId}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['bookmarks'] });
            toast.success('Bookmark deleted');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete bookmark'),
    });
}
