import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Moon, Sun, Layout, CheckSquare, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAllTasks } from '../../features/tasks/useTasks';
import { useProjects } from '../../features/projects/useProjects';
import { cn } from '../../lib/utils';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { openModal, darkMode, setDarkMode } = useUIStore();
    const { data: tasks } = useAllTasks();
    const { data: projects } = useProjects();

    const toggle = useCallback(() => setOpen((prev) => !prev), []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle]);

    const items = useMemo(() => {
        const results = [];

        // Actions
        results.push({ id: 'new-task', title: 'Create New Task', icon: Plus, category: 'Actions', action: () => openModal('create-task') });
        results.push({ id: 'new-project', title: 'Create New Project', icon: Layout, category: 'Actions', action: () => openModal('create-project') });
        results.push({ id: 'toggle-dark', title: `Switch to ${darkMode ? 'Light' : 'Dark'} Mode`, icon: darkMode ? Sun : Moon, category: 'Actions', action: () => setDarkMode(!darkMode) });

        // Projects
        if (projects) {
            projects.forEach(p => {
                results.push({
                    id: `proj-${p.id}`,
                    title: p.name,
                    icon: Layout,
                    category: 'Projects',
                    action: () => navigate(`/dashboard/projects/${p.id}`)
                });
            });
        }

        // Tasks
        if (tasks) {
            tasks.slice(0, 50).forEach(t => {
                results.push({
                    id: `task-${t.id}`,
                    title: t.title,
                    icon: CheckSquare,
                    category: 'Tasks',
                    action: () => openModal('task-details', { task: t })
                });
            });
        }

        if (!query) return results;
        const q = query.toLowerCase();
        return results.filter(i => i.title.toLowerCase().includes(q));
    }, [query, projects, tasks, darkMode, navigate, openModal, setDarkMode]);

    const categories = useMemo(() => {
        const cats = {};
        items.forEach(item => {
            if (!cats[item.category]) cats[item.category] = [];
            cats[item.category].push(item);
        });
        return cats;
    }, [items]);

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                        <Search className="w-5 h-5 text-slate-400 mr-3" />
                        <input
                            autoFocus
                            placeholder="Type a command or search..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 text-base"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Esc</span>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
                        {items.length === 0 ? (
                            <div className="p-8 text-center">
                                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No results found for "{query}"</p>
                            </div>
                        ) : (
                            Object.entries(categories).map(([cat, catItems]) => (
                                <div key={cat} className="mb-4 last:mb-0">
                                    <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat}</h3>
                                    <div className="space-y-1">
                                        {catItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    item.action();
                                                    setOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group text-left"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                                                    <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-brand" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                    {item.title}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Layout className="w-3 h-3" /> Navigation</span>
                            <span className="flex items-center gap-1.5"><Command className="w-3 h-3" /> Actions</span>
                        </div>
                        <div>
                            Press <span className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">Enter</span> to select
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
