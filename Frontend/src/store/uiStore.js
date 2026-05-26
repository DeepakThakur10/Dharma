import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
    persist(
        (set) => ({
            // Sidebar
            sidebarCollapsed: false,
            toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
            setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

            // Dark mode
            darkMode: false,
            toggleDarkMode: () => set((s) => {
                const next = !s.darkMode;
                document.documentElement.classList.toggle('dark', next);
                return { darkMode: next };
            }),
            initDarkMode: () => set((s) => {
                document.documentElement.classList.toggle('dark', s.darkMode);
                return {};
            }),

            // Active modal
            activeModal: null,
            modalData: null,
            openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
            closeModal: () => set({ activeModal: null, modalData: null }),

            // Mobile sidebar
            mobileSidebarOpen: false,
            setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
        }),
        {
            name: 'dharma-ui',
            partialize: (state) => ({ darkMode: state.darkMode, sidebarCollapsed: state.sidebarCollapsed }),
        }
    )
);
