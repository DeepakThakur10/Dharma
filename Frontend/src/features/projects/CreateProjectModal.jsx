import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AiTextarea from '../../components/ui/AiTextarea';
import { useCreateProject } from './useProjects';
import { useUIStore } from '../../store/uiStore';

const schema = z.object({
    name: z.string().min(1, 'Project name is required').max(80),
    description: z.string().max(300).optional(),
});

export default function CreateProjectModal() {
    const { closeModal } = useUIStore();
    const createMutation = useCreateProject();

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: '', description: '' },
    });

    const watchedName = watch('name');

    const onSubmit = async (data) => {
        await createMutation.mutateAsync(data);
        reset();
        closeModal();
    };

    return (
        <Modal name="create-project" title="New Project">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Project Name"
                    placeholder="e.g. Website Redesign"
                    error={errors.name?.message}
                    {...register('name')}
                />
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                    <AiTextarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 resize-none"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                        placeholder="Optional project description (AI will suggest as you type)"
                        fieldType="project"
                        title={watchedName || ''}
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
                    <Button type="submit" loading={createMutation.isPending}>Create Project</Button>
                </div>
            </form>
        </Modal>
    );
}
