import { useState, useMemo, useEffect } from 'react';
import { Plus, CheckSquare, Search, Filter, LayoutList, LayoutGrid } from 'lucide-react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import TaskRow from './TaskRow';
import KanbanBoard from './KanbanBoard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import { useAllTasks } from './useTasks';
import { useUIStore } from '../../store/uiStore';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function TasksPage() {
    const { data: tasks, isLoading } = useAllTasks();
    const { openModal } = useUIStore();
    const location = useLocation();
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [sortBy, setSortBy] = useState('created');

    useEffect(() => {
        if (location.state?.openModal) {
            openModal('create-task');
            // Clear the state so refreshing doesn't re-open the modal
            window.history.replaceState({}, '');
        }
    }, []);

    const filtered = useMemo(() => {
        if (!tasks) return [];
        let list = [...tasks];

        // Search
        if (search) {
            const q = search.toLowerCase();
            list = list.filter((t) => t.title.toLowerCase().includes(q) || t.projectName?.toLowerCase().includes(q));
        }

        // Status filter
        if (filterStatus !== 'all') {
            list = list.filter((t) => t.status === filterStatus);
        }

        // Priority filter
        if (filterPriority !== 'all') {
            list = list.filter((t) => t.priority === filterPriority);
        }

        // Sort
        if (sortBy === 'deadline') {
            list.sort((a, b) => {
                const da = a.deadline?.toDate?.() || a.deadline ? new Date(a.deadline) : new Date('9999');
                const db_ = b.deadline?.toDate?.() || b.deadline ? new Date(b.deadline) : new Date('9999');
                return da - db_;
            });
        }

        return list;
    }, [tasks, search, filterStatus, filterPriority, sortBy]);

    const selectClass = "px-3 py-1.5 rounded-lg border text-xs outline-none transition-all";

    return (
        <>
            <Header title="Tasks" subtitle={`${tasks?.length || 0} total tasks`} />
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tasks…"
                                className="pl-9 pr-3 py-1.5 rounded-lg border text-xs outline-none w-48 transition-all focus:ring-2"
                                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className={selectClass}
                            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                        >
                            <option value="all">All Status</option>
                            <option value="backlog">Backlog</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="testing">Testing</option>
                            <option value="done">Done</option>
                        </select>

                        {/* Priority filter */}
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className={selectClass}
                            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                        >
                            <option value="all">All Priority</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={selectClass}
                            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                        >
                            <option value="created">Newest First</option>
                            <option value="deadline">By Deadline</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    viewMode === 'list'
                                        ? "bg-white dark:bg-slate-700 shadow-sm text-brand"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                <LayoutList className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    viewMode === 'kanban'
                                        ? "bg-white dark:bg-slate-700 shadow-sm text-brand"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                        <Button onClick={() => openModal('create-task')}>
                            <Plus className="w-4 h-4" /> Add Task
                        </Button>
                    </div>
                </div>

                {/* Task list */}
                {isLoading ? (
                    <PageSpinner />
                ) : !filtered.length ? (
                    <EmptyState
                        icon={CheckSquare}
                        title={search || filterStatus !== 'all' ? 'No matching tasks' : 'No tasks yet'}
                        description={search ? 'Try a different search term' : 'Create your first task to get started'}
                        action={
                            !search && (
                                <Button onClick={() => openModal('create-task')} size="sm">
                                    <Plus className="w-4 h-4" /> Add Task
                                </Button>
                            )
                        }
                    />
                ) : viewMode === 'list' ? (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
                        className="space-y-2"
                    >
                        {filtered.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial="hidden"
                                animate="show"
                                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                            >
                                <TaskRow task={task} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <KanbanBoard tasks={filtered} onAddTask={(status) => openModal('create-task', { initialStatus: status })} />
                )}
            </div>

            <CreateTaskModal />
            <TaskDetailsModal />
        </>
    );
}
