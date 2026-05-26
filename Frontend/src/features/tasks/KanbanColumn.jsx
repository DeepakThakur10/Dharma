import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { cn } from '../../lib/utils';
import { Plus } from 'lucide-react';

export default function KanbanColumn({ id, title, tasks, onAddTask }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex flex-col w-72 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-3">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{title}</h3>
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-500">
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => onAddTask && onAddTask(id)}
                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-brand"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 flex flex-col gap-3 min-h-[200px] transition-colors rounded-xl",
                    isOver && "bg-brand/5 ring-2 ring-brand/20 ring-inset"
                )}
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <KanbanCard key={task.id} task={task} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && !isOver && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-xl py-8">
                        <span className="text-[11px] text-slate-400">No tasks here</span>
                    </div>
                )}
            </div>
        </div>
    );
}
