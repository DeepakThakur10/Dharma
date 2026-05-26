import { useState } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspaceSwitcher({ collapsed }) {
    const { workspaces, currentWorkspace, setWorkspace } = useWorkspaceStore();
    const [isOpen, setIsOpen] = useState(false);

    if (!currentWorkspace && workspaces.length === 0) return null;

    return (
        <div className="relative px-2 py-3 border-b mb-2" style={{ borderColor: 'var(--border)' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center w-full p-2 rounded-lg interactive",
                    collapsed ? "justify-center" : "gap-3"
                )}
            >
                <div className="w-8 h-8 rounded bg-brand flex items-center justify-center text-white font-bold flex-shrink-0">
                    {currentWorkspace?.name?.[0] || 'W'}
                </div>
                {!collapsed && (
                    <>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                                {currentWorkspace?.name || 'Select Workspace'}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground" style={{ color: 'var(--text-muted)' }}>
                                {currentWorkspace?.settings?.tier || 'Free'} Plan
                            </p>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} style={{ color: 'var(--text-muted)' }} />
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={collapsed ? { opacity: 0, x: -10 } : { opacity: 0, y: -10 }}
                            animate={collapsed ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
                            exit={collapsed ? { opacity: 0, x: -10 } : { opacity: 0, y: -10 }}
                            className={cn(
                                "absolute z-50 bg-card border rounded-xl shadow-xl overflow-hidden min-w-[220px]",
                                collapsed ? "left-full ml-2 top-0" : "left-2 right-2 top-full mt-1"
                            )}
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                        >
                            <div className="p-1 space-y-0.5">
                                {workspaces.map((ws) => (
                                    <button
                                        key={ws._id}
                                        onClick={() => {
                                            setWorkspace(ws);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 w-full p-2 rounded-lg text-sm interactive",
                                            currentWorkspace?._id === ws._id
                                                ? "bg-brand text-white no-interactive" // Skip hover if already active/primary
                                                : "text-foreground"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold",
                                            currentWorkspace?._id === ws._id ? "bg-white/20" : "bg-brand/20 text-brand"
                                        )}>
                                            {ws.name[0]}
                                        </div>
                                        <span className="flex-1 text-left truncate">{ws.name}</span>
                                        {currentWorkspace?._id === ws._id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                                <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--border)' }}>
                                    <button className="flex items-center gap-3 w-full p-2 rounded-lg text-sm text-brand interactive">
                                        <Plus className="w-4 h-4" />
                                        <span>New Workspace</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
