import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Flag, Check } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { cn, formatDate, priorityConfig, statusConfig, isOverdue } from '../../lib/utils';
import { useUIStore } from '../../store/uiStore';

export default function KanbanCard({ task }) {
    const { openModal } = useUIStore();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const isDone = task.status === 'done';
    const overdue = !isDone && isOverdue(task.deadline);
    const prio = priorityConfig[task.priority] || priorityConfig.medium;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => openModal('task-details', { task })}
            className={cn(
                "group p-3 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
                isDone && "opacity-60"
            )}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium leading-tight", isDone && "line-through")}>
                        {task.title}
                    </p>
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", prio.dot)} />
                </div>

                <div className="flex items-center gap-2 flex-wrap min-h-[1.5rem]">
                    <Badge size="sm" variant={task.priority === 'critical' || task.priority === 'high' ? 'danger' : 'default'}>
                        {prio.label}
                    </Badge>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                        {task.deadline && (
                            <span className={cn("text-[10px] flex items-center gap-1", overdue ? "text-red-500 font-medium" : "text-muted")}>
                                <Calendar className="w-2.5 h-2.5" />
                                {formatDate(task.deadline)}
                            </span>
                        )}
                    </div>
                    {task.subtasks?.length > 0 && (
                        <span className="text-[10px] text-muted flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
