import { create } from 'zustand';
import api from '../lib/axios';

const useWorkspaceStore = create((set, get) => ({
    workspaces: [],
    currentWorkspace: null,
    currentSpace: null,
    currentFolder: null,
    currentList: null,
    hierarchy: {
        spaces: [],
        folders: [],
        lists: []
    },
    loading: false,
    error: null,

    fetchWorkspaces: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/api/workspaces');
            set({ workspaces: data, loading: false });

            // Auto-select first workspace if none selected
            if (data.length > 0 && !get().currentWorkspace) {
                get().setWorkspace(data[0]);
            }
        } catch (error) {
            set({ error: error.response?.data?.message || error.message, loading: false });
        }
    },

    setWorkspace: (workspace) => {
        set({
            currentWorkspace: workspace,
            currentSpace: null,
            currentFolder: null,
            currentList: null
        });
        if (workspace) {
            get().fetchHierarchy(workspace._id);
        }
    },

    fetchHierarchy: async (workspaceId) => {
        set({ loading: true });
        try {
            const { data } = await api.get(`/api/workspaces/${workspaceId}/hierarchy`);
            set({ hierarchy: data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || error.message, loading: false });
        }
    },

    setSpace: (space) => set({ currentSpace: space, currentFolder: null, currentList: null }),
    setFolder: (folder) => set({ currentFolder: folder, currentList: null }),
    setList: (list) => set({ currentList: list }),

    reset: () => set({
        workspaces: [],
        currentWorkspace: null,
        currentSpace: null,
        hierarchy: { spaces: [], folders: [], lists: [] },
        loading: false,
        error: null
    })
}));

export default useWorkspaceStore;
