import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, Bell, X, Check, XCircle, FolderKanban, CheckSquare, Loader2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { usePendingInvitations, acceptInvitation, declineInvitation } from '../../features/notifications/useInvitations';
import { useNotifications } from '../../features/notifications/useNotifications';
import { useProjects } from '../../features/projects/useProjects';
import { useAllTasks } from '../../features/tasks/useTasks';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

export default function Header({ title = 'Dashboard', subtitle = null }) {
    const { setMobileSidebarOpen } = useUIStore();
    const user = useAuthStore((s) => s.user);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const notifRef = useRef(null);
    const searchInputRef = useRef(null);

    const { invitations, loading: invitesLoading } = usePendingInvitations();
    const { notifications, markAsRead, markAllRead } = useNotifications();

    const unreadCount = invitations.length + notifications.filter(n => !n.isRead).length;

    const { data: projects } = useProjects();
    const { data: tasks } = useAllTasks();

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.[0]?.toUpperCase() || '?';

    // Search results — client-side filtering
    const searchResults = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return { projects: [], tasks: [] };

        const matchedProjects = (projects || [])
            .filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
            .slice(0, 5);

        const matchedTasks = (tasks || [])
            .filter((t) => t.title?.toLowerCase().includes(q) || t.projectName?.toLowerCase().includes(q))
            .slice(0, 8);

        return { projects: matchedProjects, tasks: matchedTasks };
    }, [searchQuery, projects, tasks]);

    const hasResults = searchResults.projects.length > 0 || searchResults.tasks.length > 0;
    const hasQuery = searchQuery.trim().length > 0;

    // Close search and reset query
    const closeSearch = () => {
        setSearchOpen(false);
        setSearchQuery('');
    };

    // Keyboard shortcut: Ctrl+K / ⌘K
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
            if (e.key === 'Escape' && searchOpen) {
                closeSearch();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [searchOpen]);

    // Click outside to close notification panel
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAccept = async (inv) => {
        setProcessingId(inv.id);
        try {
            await acceptInvitation(inv.id);
            toast.success(`Joined "${inv.projectName || 'project'}"!`);
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (inv) => {
        setProcessingId(inv.id);
        try {
            await declineInvitation(inv.id);
            toast.success('Invitation declined');
        } catch (err) {
            toast.error('Failed to decline');
        } finally {
            setProcessingId(null);
        }
    };

    const handleProjectClick = (project) => {
        closeSearch();
        navigate('/dashboard/projects');
    };

    const handleTaskClick = (task) => {
        closeSearch();
        navigate('/dashboard/tasks');
    };

    return (
        <>
            <header
                className="flex items-center gap-4 h-14 px-4 lg:px-6 border-b flex-shrink-0 sticky top-0 z-20 backdrop-blur-sm"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', opacity: 0.98 }}
            >
                {/* Mobile menu */}
                <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center interactive"
                >
                    <Menu className="w-5 h-5" style={{ color: 'var(--text)' }} />
                </button>

                {/* Page title */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-display font-bold leading-none truncate" style={{ color: 'var(--text)' }}>{title}</h1>
                    {subtitle && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
                </div>

                {/* Search trigger */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-lg border text-sm transition-all hover:border-slate-300 dark:hover:border-slate-600 w-56"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
                >
                    <Search className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="flex-1 text-left">Search…</span>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>⌘K</kbd>
                </button>

                {/* Mobile search button */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center interactive"
                >
                    <Search className="w-[18px] h-[18px]" style={{ color: 'var(--text-muted)' }} />
                </button>

                {/* Right controls */}
                <div className="flex items-center gap-2">

                    {/* Notification bell */}
                    <div ref={notifRef} className="relative">
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center relative interactive"
                        >
                            <Bell className="w-[18px] h-[18px]" style={{ color: notifOpen ? 'var(--brand)' : 'var(--text-muted)' }} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1" style={{ backgroundColor: 'var(--brand)' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification panel */}
                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -5, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-11 w-80 sm:w-96 rounded-xl border shadow-modal overflow-hidden z-50"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                    {/* Panel header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                                            <h3 className="text-sm font-display font-bold" style={{ color: 'var(--text)' }}>Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--brand)' }}>
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        {notifications.some(n => !n.isRead) && (
                                            <button
                                                onClick={markAllRead}
                                                className="text-[10px] font-black uppercase tracking-widest text-brand hover:opacity-80 transition-opacity"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    {/* Notifications List */}
                                    <div className="max-h-80 overflow-y-auto">
                                        {invitesLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        ) : (invitations.length === 0 && notifications.length === 0) ? (
                                            <div className="text-center py-8 px-4">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-muted)' }} />
                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No new notifications</p>
                                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                                                    You're all caught up!
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Project Invitations */}
                                                {invitations.map((inv) => (
                                                    <div key={inv.id} className="px-4 py-3 border-b bg-brand/5" style={{ borderColor: 'var(--border)' }}>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-brand/10">
                                                                <FolderKanban className="w-4 h-4 text-brand" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>Project Invite</p>
                                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                                    Join <strong style={{ color: 'var(--text)' }}>{inv.projectName}</strong>
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <button onClick={() => handleAccept(inv)} className="px-3 py-1 bg-brand text-white text-[10px] font-bold rounded-md hover:opacity-90">Accept</button>
                                                                    <button onClick={() => handleDecline(inv)} className="px-3 py-1 border border-default text-[10px] font-bold rounded-md hover:bg-page">Decline</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* General Notifications */}
                                                {notifications.map((n) => (
                                                    <div
                                                        key={n._id}
                                                        onClick={() => !n.isRead && markAsRead(n._id)}
                                                        className={cn(
                                                            "px-4 py-3 border-b transition-colors cursor-pointer",
                                                            !n.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-page"
                                                        )}
                                                        style={{ borderColor: 'var(--border)' }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={cn(
                                                                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                                                                n.type === 'task_assigned' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                                            )}>
                                                                {n.type === 'task_assigned' ? <CheckSquare className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className={cn("text-sm truncate", !n.isRead ? "font-bold" : "font-medium")} style={{ color: 'var(--text)' }}>
                                                                        {n.title}
                                                                    </p>
                                                                    {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                                                                </div>
                                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                                                                <p className="text-[10px] mt-1 opacity-60" style={{ color: 'var(--text-muted)' }}>
                                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #ffa07a 100%)' }}>
                        {initials}
                    </div>
                </div>
            </header>

            {/* Search overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-[12vh]"
                        onClick={closeSearch}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-lg rounded-xl border shadow-modal overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                                <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    ref={searchInputRef}
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search projects, tasks…"
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: 'var(--text)' }}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                                        className="p-1 rounded interactive"
                                    >
                                        <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                    </button>
                                )}
                                <kbd className="text-[10px] px-1.5 py-0.5 rounded border font-mono hidden sm:inline" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>ESC</kbd>
                            </div>

                            {/* Search results */}
                            <div className="max-h-80 overflow-y-auto">
                                {!hasQuery ? (
                                    <div className="py-8 px-4 text-center" style={{ color: 'var(--text-muted)' }}>
                                        <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">Type to search across your workspace</p>
                                        <p className="text-xs mt-1 opacity-60">Search projects and tasks by name</p>
                                    </div>
                                ) : !hasResults ? (
                                    <div className="py-8 px-4 text-center" style={{ color: 'var(--text-muted)' }}>
                                        <p className="text-sm">No results for "<span style={{ color: 'var(--text)' }}>{searchQuery.trim()}</span>"</p>
                                        <p className="text-xs mt-1 opacity-60">Try a different search term</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Project results */}
                                        {searchResults.projects.length > 0 && (
                                            <div>
                                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                                    Projects
                                                </div>
                                                {searchResults.projects.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => handleProjectClick(p)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left interactive"
                                                    >
                                                        <div
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                            style={{ backgroundColor: 'var(--brand-light)' }}
                                                        >
                                                            <FolderKanban className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{p.name}</p>
                                                            {p.description && (
                                                                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Task results */}
                                        {searchResults.tasks.length > 0 && (
                                            <div className={searchResults.projects.length > 0 ? 'border-t' : ''} style={{ borderColor: 'var(--border)' }}>
                                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                                    Tasks
                                                </div>
                                                {searchResults.tasks.map((t) => (
                                                    <button
                                                        key={`${t.projectId}-${t.id}`}
                                                        onClick={() => handleTaskClick(t)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left interactive"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50 dark:bg-blue-950/20">
                                                            <CheckSquare className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{t.title}</p>
                                                            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{t.projectName}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
