import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import AiChatWidget from '../features/ai/AiChatWidget';
import CommandPalette from '../components/ui/CommandPalette';
import Timer from '../components/enterprise/Timer';
import useWorkspaceStore from '../store/workspaceStore';
import { useUIStore } from '../store/uiStore';

export default function DashboardLayout() {
    const location = useLocation();
    const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    return (
        <div className="flex h-screen overflow-hidden bg-page">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <Outlet />
                </motion.div>
            </main>
            <AiChatWidget />
            <CommandPalette />
        </div>
    );
}
