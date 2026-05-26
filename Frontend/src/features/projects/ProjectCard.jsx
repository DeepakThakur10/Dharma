import { FolderKanban, MoreHorizontal, Pencil, Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useDeleteProject } from './useProjects';
import InviteMemberModal from './InviteMemberModal';

export default function ProjectCard({ project }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const deleteMutation = useDeleteProject();

    const memberCount = project.members?.length || 1;

    // Fetch real task count from backend
    const { data: taskCount, isLoading: loadingTaskCount } = useQuery({
        queryKey: ['task-count', project.id],
        queryFn: async () => {
            const { data } = await api.get(`/api/workspaces/${project.id}/stats`);
            return data.taskCount;
        },
        initialData: null,
        enabled: !!project.id,
    });

    const navigate = useNavigate();

    const handleCardClick = (e) => {
        // Prevent navigation if text is selected
        if (window.getSelection().toString().length > 0) return;
        navigate(`/dashboard/projects/${project.id}`);
    };

    return (
        <>
            <Card
                className="relative group interactive"
                onClick={handleCardClick}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-light)' }}>
                            <FolderKanban className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>{project.name}</h3>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {project.createdAt ? formatDate(project.createdAt) : 'Just now'}
                            </p>
                        </div>
                    </div>

                    {/* Menu — always visible on mobile, hover on desktop */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 interactive"
                        >
                            <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        </button>
                        {menuOpen && (
                            <>
                                {/* Invisible overlay to catch outside clicks */}
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                                <div
                                    className="absolute right-0 top-8 w-44 rounded-lg border shadow-lg py-1 z-20"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => { setInviteOpen(true); setMenuOpen(false); }}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <UserPlus className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} /> Invite Member
                                    </button>
                                    <button
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <div className="border-t my-1" style={{ borderColor: 'var(--border-light)' }} />
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Delete this project and all its tasks?')) {
                                                deleteMutation.mutate(project.id);
                                            }
                                            setMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Project
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {project.description && (
                    <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
                )}

                <div className="flex items-center gap-2 mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <Badge variant="brand">{taskCount !== null ? taskCount : '…'} tasks</Badge>
                    <div className="flex items-center gap-1 ml-auto">
                        <Users className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                            {memberCount} member{memberCount !== 1 && 's'}
                        </span>
                    </div>
                </div>
            </Card>

            <InviteMemberModal
                isOpen={inviteOpen}
                onClose={() => setInviteOpen(false)}
                workspaceId={project.id}
                workspaceName={project.name}
            />
        </>
    );
}
