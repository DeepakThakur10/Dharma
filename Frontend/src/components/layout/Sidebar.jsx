import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Bookmark,
    MessageSquare,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun,
    X,
    Sparkles,
    Hash,
    Layers,
    CreditCard,
    Key,
    Clock,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import useWorkspaceStore from '../../store/workspaceStore';
import { cn } from '../../lib/utils';
import DharmaLogo from '../DharmaLogo';
import WorkspaceSwitcher from './WorkspaceSwitcher';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/dashboard/tasks', icon: CheckSquare, label: 'My Tasks' },
    { to: '/dashboard/chat', icon: MessageSquare, label: 'Team Chat' },
    { to: '/dashboard/ai', icon: Sparkles, label: 'Dharma AI' },
    { to: '/dashboard/analytics', icon: Layers, label: 'Analytics' },
    { to: '/dashboard/time-report', icon: Clock, label: 'Time Report' },
    { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
    { to: '/dashboard/developers', icon: Key, label: 'API Keys' },
];

export default function Sidebar() {
    const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
    const { user, logout } = useAuthStore();
    const { hierarchy, currentSpace, setSpace, currentWorkspace } = useWorkspaceStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.[0]?.toUpperCase() || '?';

    const sidebarContent = (
        <div className="flex flex-col h-full relative">
            {/* Logo */}
            <Link to="/" className={cn('flex items-center px-4 h-14 border-b flex-shrink-0 hover:opacity-75 transition-opacity', sidebarCollapsed ? 'justify-center px-0' : 'gap-2')} style={{ borderColor: 'var(--border)' }}>
                <DharmaLogo size="sm" variant="light" showWordmark={false} />
                {!sidebarCollapsed && (
                    <span className="text-base font-display font-bold truncate hover:text-[#1e5631] transition-colors" style={{ color: 'var(--text)' }}>Dharma</span>
                )}
                {/* Collapse toggle — desktop only */}
                {!sidebarCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="ml-auto w-6 h-6 rounded flex items-center justify-center hover:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors hidden lg:flex interactive"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                )}
                {sidebarCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-4 w-6 h-6 rounded-full border bg-card flex items-center justify-center shadow-sm hover:text-brand transition-colors z-50 hidden lg:flex interactive"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </Link>

            {/* Workspace Switcher - Disabled per user request */}
            {/* <WorkspaceSwitcher collapsed={sidebarCollapsed} /> */}

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
                <div className="space-y-1 mb-6">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/dashboard'}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={({ isActive }) => cn(
                                'group flex items-center gap-3 rounded-lg font-medium interactive',
                                sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2',
                                isActive && 'text-white shadow-sm'
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? 'var(--brand)' : undefined,
                                color: isActive ? 'white' : 'var(--text-secondary)',
                            })}
                        >
                            <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', sidebarCollapsed && 'w-5 h-5')} />
                            {!sidebarCollapsed && <span className="text-sm truncate">{label}</span>}
                        </NavLink>
                    ))}
                </div>

                {/* Spaces Section */}
                {!sidebarCollapsed && hierarchy.spaces.length > 0 && (
                    <div className="mt-4 px-3 mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
                            Spaces
                        </p>
                        <div className="space-y-0.5">
                            {hierarchy.spaces.map(space => (
                                <button
                                    key={space._id}
                                    onClick={() => setSpace(space)}
                                    className={cn(
                                        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs interactive",
                                        currentSpace?._id === space._id ? "bg-brand/10 text-brand" : "text-secondary-foreground"
                                    )}
                                    style={{ color: currentSpace?._id === space._id ? 'var(--brand)' : 'var(--text-secondary)' }}
                                >
                                    <Hash className="w-3.5 h-3.5" />
                                    <span className="truncate">{space.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom section */}
            <div className="border-t px-2 py-3 space-y-1 flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    className={cn(
                        'group flex items-center gap-3 w-full rounded-lg font-medium interactive',
                        sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
                    )}
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {darkMode ? (
                        <Sun className={cn('w-[18px] h-[18px] flex-shrink-0', sidebarCollapsed && 'w-5 h-5')} />
                    ) : (
                        <Moon className={cn('w-[18px] h-[18px] flex-shrink-0', sidebarCollapsed && 'w-5 h-5')} />
                    )}
                    {!sidebarCollapsed && <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* Settings */}
                <NavLink
                    to={`/dashboard/settings/${currentWorkspace?._id || ''}`}
                    className={({ isActive }) => cn(
                        'group flex items-center gap-3 w-full rounded-lg font-medium interactive',
                        sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2',
                        isActive && 'text-white shadow-sm'
                    )}
                    style={({ isActive }) => ({
                        backgroundColor: isActive ? 'var(--brand)' : undefined,
                        color: isActive ? 'white' : 'var(--text-secondary)',
                    })}
                >
                    <Settings className={cn('w-[18px] h-[18px] flex-shrink-0', sidebarCollapsed && 'w-5 h-5')} />
                    {!sidebarCollapsed && <span className="text-sm">Settings</span>}
                </NavLink>

                {/* User */}
                <div className={cn('flex items-center gap-3 pt-2 border-t', sidebarCollapsed && 'justify-center')} style={{ borderColor: 'var(--border)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #ffa07a 100%)' }}>
                        {initials}
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{user?.name || 'User'}</p>
                            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>
                    )}
                    {!sidebarCollapsed && (
                        <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Sign out">
                            <LogOut className="w-4 h-4 text-red-500" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={cn('hidden lg:flex flex-col h-screen border-r flex-shrink-0 transition-all duration-300', sidebarCollapsed ? 'w-16' : 'w-60')}
                style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
            >
                {sidebarContent}
            </aside>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col lg:hidden"
                            style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
