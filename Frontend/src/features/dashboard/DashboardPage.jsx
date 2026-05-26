import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FolderKanban,
    CheckSquare,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Plus,
    ArrowUpRight,
    ListTodo,
    FlaskConical,
    Flame,
    LayoutList
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { useProjects } from '../projects/useProjects';
import { useAllTasks, useAllTaskStats } from '../tasks/useTasks';
import { isOverdue, isDueWithin, formatDate, statusConfig, priorityConfig } from '../../lib/utils';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import TaskDetailsModal from '../tasks/TaskDetailsModal';
import DonutChart from '../../components/enterprise/DonutChart';
import { useWorkspaceAnalytics } from '../../hooks/useAnalytics';

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
        >
            <Card className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '15' }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                    <p className="text-2xl font-display font-bold leading-none" style={{ color: 'var(--text)' }}>{value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
            </Card>
        </motion.div>
    );
}

export default function DashboardPage() {
    const { data: projects, isLoading: loadingProjects } = useProjects();
    const { data: tasks, isLoading: loadingTasks } = useAllTasks();
    const { data: globalStats, isLoading: loadingGlobalStats } = useAllTaskStats();

    // For now, we take the first project as context for charts if available
    const activeWorkspaceId = projects?.[0]?._id;
    const { data: analytics, isLoading: loadingAnalytics } = useWorkspaceAnalytics(activeWorkspaceId);

    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { openModal } = useUIStore();

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    const stats = useMemo(() => {
        if (globalStats) return globalStats;
        if (!tasks) return { total: 0, done: 0, overdue: 0, upcoming: 0, backlog: 0, testing: 0, critical: 0 };
        return {
            total: tasks.length,
            done: tasks.filter((t) => t.status === 'done').length,
            overdue: tasks.filter((t) => t.status !== 'done' && isOverdue(t.deadline)).length,
            upcoming: tasks.filter((t) => t.status !== 'done' && isDueWithin(t.deadline, 7)).length,
            backlog: tasks.filter((t) => t.status === 'backlog').length,
            testing: tasks.filter((t) => t.status === 'testing').length,
            critical: tasks.filter((t) => t.priority === 'critical' && t.status !== 'done').length,
        };
    }, [tasks, globalStats]);

    const recentTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter((t) => t.status !== 'done').slice(0, 5);
    }, [tasks]);

    return (
        <>
            <Header title="Dashboard" />
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Welcome */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--text)' }}>
                        {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Here&apos;s an overview of your workspace
                    </p>
                </motion.div>

                {/* Main Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <StatCard icon={FolderKanban} label="Total Projects" value={projects?.length || 0} color="#ff6b35" delay={0} />
                    <StatCard icon={CheckSquare} label="Total Tasks" value={stats.total} color="#339af0" delay={0.05} />
                    <StatCard icon={CheckCircle2} label="Completed" value={stats.done} color="#40c057" delay={0.1} />
                    <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="#fa5252" delay={0.15} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <DonutChart title="Task Status Distribution" data={analytics?.statusStats} />
                    <DonutChart title="Tasks per Member" data={analytics?.memberStats} />
                </div>

                {/* Analytics Row (Optional if charts replace these) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={LayoutList} label="Backlog" value={stats.backlog} color="#64748b" delay={0.2} />
                    <StatCard icon={FlaskConical} label="In Testing" value={stats.testing} color="#f59f00" delay={0.25} />
                    <StatCard icon={Flame} label="Critical Issues" value={stats.critical} color="#e03131" delay={0.3} />
                    <StatCard icon={Clock} label="Upcoming" value={stats.upcoming} color="#fcc419" delay={0.35} />
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent tasks */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-display font-bold" style={{ color: 'var(--text)' }}>Recent Tasks</h3>
                            <button
                                onClick={() => navigate('/dashboard/tasks')}
                                className="text-xs font-medium flex items-center gap-1 hover:underline"
                                style={{ color: 'var(--brand)' }}
                            >
                                View all <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>

                        {recentTasks.length === 0 ? (
                            <Card className="text-center py-8">
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pending tasks</p>
                                <Button size="sm" className="mt-3" onClick={() => navigate('/dashboard/tasks', { state: { openModal: true } })}>
                                    <Plus className="w-3.5 h-3.5" /> Add Task
                                </Button>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {recentTasks.map((t) => (
                                    <Card
                                        key={t.id}
                                        className="flex items-center gap-3 !p-3 cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => openModal('task-details', { task: t })}
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[t.priority]?.dot || 'bg-slate-400'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{t.title}</p>
                                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.projectName}</p>
                                        </div>
                                        <Badge variant={statusConfig[t.status]?.color?.includes('blue') ? 'info' : 'default'}>
                                            {statusConfig[t.status]?.label || 'To Do'}
                                        </Badge>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div>
                        <h3 className="text-base font-display font-bold mb-4" style={{ color: 'var(--text)' }}>Quick Actions</h3>
                        <div className="space-y-2">
                            <Card hover className="flex items-center gap-3 !p-4" onClick={() => navigate('/dashboard/projects', { state: { openModal: true } })}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-light)' }}>
                                    <FolderKanban className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>New Project</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Start something new</p>
                                </div>
                            </Card>
                            <Card hover className="flex items-center gap-3 !p-4" onClick={() => navigate('/dashboard/tasks', { state: { openModal: true } })}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20">
                                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>New Task</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Add to any project</p>
                                </div>
                            </Card>
                            <Card hover className="flex items-center gap-3 !p-4" onClick={() => navigate('/dashboard/bookmarks')}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 dark:bg-amber-950/20">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Bookmarks</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Save links for later</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <TaskDetailsModal />
        </>
    );
}
