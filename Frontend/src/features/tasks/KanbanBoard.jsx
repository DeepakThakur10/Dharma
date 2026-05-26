import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { useUpdateTask } from './useTasks';
import { statusConfig } from '../../lib/utils';

export default function KanbanBoard({ tasks, onAddTask }) {
    const updateMutation = useUpdateTask();
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group tasks by status
    const columns = useMemo(() => {
        const groups = {
            backlog: [],
            todo: [],
            'in-progress': [],
            testing: [],
            done: []
        };
        tasks.forEach(t => {
            if (groups[t.status]) groups[t.status].push(t);
            else groups.todo.push(t); // Fallback
        });
        return groups;
    }, [tasks]);

    const handleDragStart = ({ active }) => {
        setActiveTask(tasks.find(t => t.id === active.id));
    };

    const handleDragEnd = async ({ active, over }) => {
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id;
        const overId = over.id;

        // Find which column we dropped into
        let newStatus = overId;

        // If we dropped over another card, get its column (status)
        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
            newStatus = overTask.status;
        }

        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === newStatus) return;

        // Trigger update
        updateMutation.mutate({
            listId: task.projectId || task.listId,
            taskId: task.id,
            data: { status: newStatus }
        });
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {Object.entries(statusConfig).map(([status, config]) => (
                    <KanbanColumn
                        key={status}
                        id={status}
                        title={config.label}
                        tasks={columns[status] || []}
                        onAddTask={onAddTask}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? <KanbanCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
