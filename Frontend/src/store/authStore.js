import { create } from 'zustand';
import api from '../lib/axios';

// Add default axios base URL if not already set globally
// axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

export const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null,

    /** Initialize auth — check if cookie is valid by fetching profile */
    init: async () => {
        try {
            set({ loading: true });
            // Send request without explicit token — browser sends HttpOnly cookie
            const { data } = await api.get('/api/auth/profile');
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, loading: false });
        } catch (err) {
            localStorage.removeItem('user');
            set({ user: null, loading: false });
        }
    },

    /** Sign in with email + password */
    signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            // Sanitize: don't store token in localStorage even if backend sends it
            const { token, ...userData } = data;
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || err.message, loading: false });
            throw err;
        }
    },

    /** Register a new user */
    register: async (email, password, name) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/api/auth/register', { email, password, name });
            // Sanitize: don't store token in localStorage even if backend sends it
            const { token, ...userData } = data;
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || err.message, loading: false });
            throw err;
        }
    },

    /** Sign out */
    logout: async () => {
        try {
            await api.get('/api/auth/logout');
        } catch (err) {
            console.error('Logout failed:', err);
        }
        localStorage.removeItem('user');
        set({ user: null });
    },

    clearError: () => set({ error: null }),
}));
