import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AiTextarea from '../../components/ui/AiTextarea';
import { useUpdateTask, useDeleteTask, useSubmitTask, useReviewTask } from './useTasks';
import { useUIStore } from '../../store/uiStore';
import { Check, Trash2, X, Plus, Sparkles, Loader2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { statusConfig, priorityConfig, cn } from '../../lib/utils';
import { fetchAiSubtasks } from '../ai/useAiChat';
import { useProjectMembers } from '../projects/useInvite';
import { useAuthStore } from '../../store/authStore';
import { useCustomFields } from '../settings/useSettings';
import Timer from '../../components/enterprise/Timer';

const ROLE_LEVELS = {
    guest: 1,
    member: 2,
    employee: 2,
    admin: 3,
    project_manager: 3,
    owner: 4,
    project_lead: 4
};

const schema = z.object({
    title: z.string().min(1, 'Task title is required').max(200),
    description: z.string().max(500).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['backlog', 'todo', 'in-progress', 'testing', 'done']),
    deadline: z.string().optional(),
    assignedTo: z.string().optional(),
});

export default function TaskDetailsModal() {
    const { closeModal, modalData } = useUIStore();
    const updateMutation = useUpdateTask();
    const deleteMutation = useDeleteTask();
    const submitMutation = useSubmitTask();
    const reviewMutation = useReviewTask();

    const task = modalData?.task;
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // Fetch members for assignment
    const { data: members } = useProjectMembers(task?.workspace || task?.projectId);
    const currentUser = useAuthStore((s) => s.user);

    const userMembership = members?.find(m => m.user?._id === currentUser?._id);
    const userRole = userMembership?.role || 'member';
    const userLevel = ROLE_LEVELS[userRole] || 2;

    const { data: workspaceFields } = useCustomFields(task?.workspace);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            deadline: '',
            assignedTo: '',
        },
    });

    // Load task data when modal opens
    useEffect(() => {
        if (task) {
            reset({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                status: task.status || 'todo',
                deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
                assignedTo: task.assignees?.[0] || '',
                ...task.customFieldValues // Spread custom field values into form state
            });
            setSubtasks(task.subtasks || []);
        }
    }, [task, reset]);

    const watchedTitle = watch('title');

    const onSubmit = async (data) => {
        if (!task) return;

        // Separate custom field values from standard fields
        const standardFields = ['title', 'description', 'priority', 'status', 'deadline', 'assignedTo'];
        const customFieldValues = {};
        const cleanData = {};

        Object.keys(data).forEach(key => {
            if (standardFields.includes(key)) {
                cleanData[key] = data[key];
            } else if (workspaceFields?.some(f => f.name === key || f._id === key)) {
                customFieldValues[key] = data[key];
            }
        });

        const updateData = {
            ...cleanData,
            subtasks,
            customFieldValues,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            assignedTo: data.assignedTo || undefined
        };

        await updateMutation.mutateAsync({
            taskId: task.id || task._id,
            data: updateData,
            listId: task.listId || task.list // Pass listId for immediate query invalidation
        });
        closeModal();
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteMutation.mutateAsync({ taskId: task.id || task._id });
            closeModal();
        }
    };

    // Subtask handlers
    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const newItem = {
            _id: crypto.randomUUID(),
            title: newSubtask.trim(),
            completed: false,
            assignedTo: ''
        };
        setSubtasks([...subtasks, newItem]);
        setNewSubtask('');
    };

    const handleSuggestSubtasks = async () => {
        if (aiLoading) return;
        setAiLoading(true);
        try {
            const suggestions = await fetchAiSubtasks({
                title: watchedTitle || task.title,
                description: watch('description') || task.description,
                taskId: task.id || task._id,
                workspaceId: task.workspace
            });
            if (suggestions.length > 0) {
                const newItems = suggestions.map(s => ({
                    id: crypto.randomUUID(),
                    title: s,
                    completed: false
                }));
                setSubtasks([...subtasks, ...newItems]);
            }
        } catch (error) {
            console.error('Failed to get suggestions:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const toggleSubtask = (id) => {
        setSubtasks(subtasks.map(st =>
            (st._id || st.id) === id ? { ...st, completed: !st.completed } : st
        ));
    };

    const updateSubtaskAssignment = (id, userId) => {
        setSubtasks(subtasks.map(st =>
            (st._id || st.id) === id ? { ...st, assignedTo: userId } : st
        ));
    };

    const removeSubtask = (id) => {
        setSubtasks(subtasks.filter(st => (st._id || st.id) !== id));
    };

    const completedSubtasks = subtasks.filter(st => st.completed).length;
    const progress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

    const selectClass = "w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2";

    if (!task) return null;

    const isOpen = modalData?.name === 'task-details';

    return (
        <Modal name="task-details" title="Task Details" isOpen={isOpen} onClose={closeModal}>
            <div className="space-y-6">
                <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Header Inputs */}
                    <div className="space-y-4">
                        <Input
                            label="Title"
                            error={errors.title?.message}
                            {...register('title')}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                                <select
                                    {...register('status')}
                                    className={selectClass}
                                    style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                >
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                                <select
                                    {...register('priority')}
                                    className={selectClass}
                                    style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                >
                                    {Object.entries(priorityConfig).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                            <AiTextarea
                                {...register('description')}
                                rows={3}
                                className={selectClass + ' resize-none'}
                                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                placeholder="Description..."
                                fieldType="task"
                                title={watchedTitle || ''}
                            />
                        </div>

                        {/* Custom Fields Rendering */}
                        {workspaceFields?.length > 0 && (
                            <div className="pt-4 grid grid-cols-2 gap-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                {workspaceFields.map(field => (
                                    <div key={field._id} className={cn(field.type === 'text' && "col-span-2")}>
                                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                            {field.name} {field.isRequired && <span className="text-red-500">*</span>}
                                        </label>

                                        {field.type === 'text' && (
                                            <input
                                                className={selectClass}
                                                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                                {...register(field._id)}
                                            />
                                        )}

                                        {field.type === 'number' && (
                                            <input
                                                type="number"
                                                className={selectClass}
                                                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                                {...register(field._id, { valueAsNumber: true })}
                                            />
                                        )}

                                        {field.type === 'select' && (
                                            <select
                                                className={selectClass}
                                                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                                {...register(field._id)}
                                            >
                                                <option value="">Select option</option>
                                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        )}

                                        {field.type === 'date' && (
                                            <input
                                                type="date"
                                                className={selectClass}
                                                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                                {...register(field._id)}
                                            />
                                        )}

                                        {field.type === 'boolean' && (
                                            <div className="flex items-center h-10 gap-2">
                                                <input
                                                    type="checkbox"
                                                    {...register(field._id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                                                />
                                                <span className="text-sm text-slate-500">Enable / Yes</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Subtasks Section */}
                    <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm">Subtasks</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleSuggestSubtasks}
                                    disabled={aiLoading}
                                    className="text-[11px] font-medium text-brand hover:text-brand-600 flex items-center gap-1 disabled:opacity-50 transition-colors"
                                >
                                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    Suggest with AI
                                </button>
                                <span className="text-xs text-gray-500">{completedSubtasks}/{subtasks.length}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-gray-100 rounded-full mb-4 overflow-hidden dark:bg-gray-800">
                            <div
                                className="h-full bg-brand-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="space-y-2 mb-3">
                            {subtasks.map(st => (
                                <div key={st._id || st.id} className="space-y-2">
                                    <div className="flex items-center gap-2 group">
                                        <button
                                            type="button"
                                            onClick={() => toggleSubtask(st._id || st.id)}
                                            className={cn(
                                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                st.completed ? "bg-brand-500 border-brand-500" : "border-gray-300 hover:border-brand-500"
                                            )}
                                        >
                                            {st.completed && <Check className="w-3 h-3 text-white" />}
                                        </button>
                                        <span className={cn("text-sm flex-1", st.completed && "line-through text-gray-400")}>{st.title}</span>

                                        {/* Subtask Assignee Selection */}
                                        <select
                                            value={st.assignedTo || ''}
                                            onChange={(e) => updateSubtaskAssignment(st._id || st.id, e.target.value)}
                                            className="text-[10px] bg-transparent border-none focus:ring-0 p-0 text-gray-400 hover:text-brand cursor-pointer focus:text-brand"
                                        >
                                            <option value="">Unassigned</option>
                                            {members?.filter(m => {
                                                if (userLevel === 2) return ROLE_LEVELS[m.role] === 2;
                                                return true;
                                            }).map(m => (
                                                <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => removeSubtask(st._id || st.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-500 transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSubtask();
                                    }
                                }}
                                placeholder="Add a subtask..."
                                className="flex-1 text-sm bg-transparent outline-none py-1.5 border-b focus:border-brand-500 transition-colors"
                                style={{ borderColor: 'var(--border)' }}
                            />
                            <Button type="button" size="sm" variant="secondary" onClick={addSubtask} disabled={!newSubtask.trim()}>
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Meta Section */}
                    <div className="mt-6 border-t pt-4 grid grid-cols-2 gap-4" style={{ borderColor: 'var(--border)' }}>
                        <Input
                            label="Deadline"
                            type="date"
                            {...register('deadline')}
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assign To</label>
                            <select
                                {...register('assignedTo')}
                                className={selectClass}
                                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                disabled={userLevel < 3}
                            >
                                <option value="">Unassigned</option>
                                {members?.map((m) => (
                                    <option key={m.user?._id} value={m.user?._id}>{m.user?.name} ({m.user?.email})</option>
                                ))}
                            </select>
                            {userLevel < 3 && <p className="text-[10px] text-gray-400 mt-1 italic">Only Managers/Leads can reassign main tasks.</p>}
                        </div>
                    </div>
                </form>

                {/* Time Tracker Section */}
                <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Time Tracker</p>
                    <Timer
                        taskId={task._id || task.id}
                        taskTitle={task.title}
                        inline
                    />
                </div>

                <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex gap-2">
                        {userLevel >= 3 && (
                            <Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleDelete} disabled={deleteMutation.isPending}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Task
                            </Button>
                        )}

                        {/* Submission Flow for Members */}
                        {task.status !== 'done' && task.status !== 'testing' && (
                            <Button
                                type="button"
                                variant="secondary"
                                className="bg-brand/10 text-brand border-brand/20 hover:bg-brand/20"
                                onClick={() => {
                                    const file = prompt('Please enter the URL or Path for your submission:');
                                    if (file) {
                                        const note = prompt('Add a submission note (optional):');
                                        submitMutation.mutate({
                                            taskId: task.id || task._id,
                                            submissionFile: file,
                                            submissionNote: note
                                        });
                                        closeModal();
                                    }
                                }}
                            >
                                <Check className="w-4 h-4 mr-2" /> Submit for Review
                            </Button>
                        )}

                        {/* Approval Flow for Leads/Managers */}
                        {task.status === 'testing' && (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => {
                                        reviewMutation.mutate({
                                            taskId: task.id || task._id,
                                            action: 'approve',
                                            workspaceId: task.workspace
                                        });
                                        closeModal();
                                    }}
                                    disabled={reviewMutation.isPending}
                                >
                                    Approve Work
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                    disabled={reviewMutation.isPending}
                                    onClick={() => {
                                        const feedback = prompt('Please provide feedback for rejection:');
                                        if (feedback) {
                                            reviewMutation.mutate({
                                                taskId: task.id || task._id,
                                                action: 'reject',
                                                feedback,
                                                workspaceId: task.workspace
                                            });
                                            closeModal();
                                        }
                                    }}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={closeModal} disabled={updateMutation.isPending}>Cancel</Button>
                        <Button type="submit" form="task-form" loading={updateMutation.isPending} disabled={updateMutation.isPending}>Save Changes</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
