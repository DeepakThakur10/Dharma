import { Check, Trash2, Calendar, Flag } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { cn, formatDate, priorityConfig, statusConfig, isOverdue } from '../../lib/utils';
import { useUpdateTask, useDeleteTask } from './useTasks';
import { useUIStore } from '../../store/uiStore';

export default function TaskRow({ task }) {
    const updateMutation = useUpdateTask();
    const deleteMutation = useDeleteTask();
    const { openModal } = useUIStore();

    const isDone = task.status === 'done';
    const overdue = !isDone && isOverdue(task.deadline);
    const prio = priorityConfig[task.priority] || priorityConfig.medium;
    const status = statusConfig[task.status] || statusConfig.todo;

    const toggleStatus = (e) => {
        e.stopPropagation();
        updateMutation.mutate({
            projectId: task.projectId,
            taskId: task.id,
            data: { status: isDone ? 'todo' : 'done' },
        });
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure?')) {
            deleteMutation.mutate({ projectId: task.projectId, taskId: task.id });
        }
    };

    // Subtask calculations
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(st => st.completed).length;
    const progress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

    return (
        <div
            onClick={() => openModal('task-details', { task })}
            className={cn(
                'group flex items-center gap-3 px-4 py-3 rounded-xl border interactive',
                isDone && 'opacity-60'
            )}
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
            {/* Checkbox */}
            <button
                onClick={toggleStatus}
                className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all interactive',
                    isDone ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600'
                )}
            >
                {isDone && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium leading-snug', isDone && 'line-through')} style={{ color: 'var(--text)' }}>
                    {task.title}
                </p>

                {/* Progress Bar (if subtasks exist) */}
                {subtasks.length > 0 && !isDone && (
                    <div className="flex items-center gap-2 mt-1.5 w-32">
                        <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                            <div
                                className="h-full bg-brand-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-gray-500">{progress}%</span>
                    </div>
                )}

                <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {task.projectName && (
                        <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            {task.projectName}
                        </span>
                    )}
                    {task.deadline && (
                        <span
                            className={cn('text-[11px] flex items-center gap-1', overdue && 'text-red-500 font-medium')}
                            style={{ color: overdue ? undefined : 'var(--text-muted)' }}
                        >
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.deadline)}
                        </span>
                    )}
                </div>
            </div>

            {/* Priority */}
            <Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'danger' : task.priority === 'low' ? 'success' : 'warning'}>
                <Flag className="w-3 h-3 mr-1" />
                {prio.label}
            </Badge>

            {/* Status */}
            <Badge variant={status.color.includes('emerald') ? 'success' : status.color.includes('blue') ? 'info' : status.color.includes('amber') ? 'warning' : 'default'}>
                {status.label}
            </Badge>

            {/* Delete */}
            <button
                onClick={handleDelete}
                className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity interactive"
            >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
        </div>
    );
}
