import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AiTextarea from '../../components/ui/AiTextarea';
import { useCreateTask } from './useTasks';
import { useProjects } from '../projects/useProjects';
import { useProjectMembers } from '../projects/useInvite';
import { useUIStore } from '../../store/uiStore';
import { useState, useEffect } from 'react';

const schema = z.object({
    title: z.string().min(1, 'Task title is required').max(200),
    description: z.string().max(500).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    deadline: z.string().optional(),
    workspaceId: z.string().min(1, 'Select a workspace'),
    assignedTo: z.string().optional(),
});

export default function CreateTaskModal() {
    const { closeModal, modalData } = useUIStore();
    const { data: projects } = useProjects();
    const createMutation = useCreateTask();
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(modalData?.workspaceId || modalData?.projectId || '');

    // Fetch members when a workspace is selected
    const { data: members } = useProjectMembers(selectedWorkspaceId || null);

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
            deadline: '',
            workspaceId: modalData?.workspaceId || modalData?.projectId || '',
            assignedTo: '',
        },
    });

    // Track workspace selection changes
    const watchedWorkspaceId = watch('workspaceId');
    const watchedTitle = watch('title');
    useEffect(() => {
        setSelectedWorkspaceId(watchedWorkspaceId);
    }, [watchedWorkspaceId]);

    const onSubmit = async (data) => {
        const { workspaceId, ...taskData } = data;
        if (taskData.deadline) {
            taskData.deadline = new Date(taskData.deadline);
        } else {
            delete taskData.deadline;
        }
        if (taskData.assignedTo) {
            taskData.assignees = [taskData.assignedTo];
            delete taskData.assignedTo;
        }
        await createMutation.mutateAsync({ workspaceId, data: taskData });
        reset();
        closeModal();
    };

    const selectClass = "w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2";

    return (
        <Modal name="create-task" title="New Task">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Task Title"
                    placeholder="e.g. Design landing page hero"
                    error={errors.title?.message}
                    {...register('title')}
                />

                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                    <AiTextarea
                        {...register('description')}
                        rows={2}
                        className={selectClass + ' resize-none'}
                        style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                        placeholder="Optional description (AI will suggest as you type)"
                        fieldType="task"
                        title={watchedTitle || ''}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Workspace</label>
                        <select
                            {...register('workspaceId')}
                            className={selectClass}
                            style={{ borderColor: errors.workspaceId ? 'var(--danger)' : 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                        >
                            <option value="">Select workspace</option>
                            {projects?.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {errors.workspaceId && <p className="mt-1 text-xs text-red-500">{errors.workspaceId.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                        <select
                            {...register('priority')}
                            className={selectClass}
                            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Deadline"
                        type="date"
                        error={errors.deadline?.message}
                        {...register('deadline')}
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assign To</label>
                        <select
                            {...register('assignedTo')}
                            className={selectClass}
                            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                        >
                            <option value="">Unassigned</option>
                            {members?.map((m) => (
                                <option key={m.user?._id} value={m.user?._id}>{m.user?.name} ({m.user?.email})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
                    <Button type="submit" loading={createMutation.isPending}>Create Task</Button>
                </div>
            </form>
        </Modal>
    );
}
