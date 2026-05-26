import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from './useProjects';
import { useTasks } from '../tasks/useTasks';
import { useProjectMembers } from './useInvite';
import { useUIStore } from '../../store/uiStore';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import TaskRow from '../tasks/TaskRow';
import { Plus, Users, FolderKanban, ArrowLeft, UserPlus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '../../components/ui/EmptyState';
import InviteMemberModal from './InviteMemberModal';
import CreateTaskModal from '../tasks/CreateTaskModal';
import TaskDetailsModal from '../tasks/TaskDetailsModal';
import ActivityTimeline from '../../components/enterprise/ActivityTimeline';
import { useWorkspaceActivity } from '../../hooks/useAnalytics';

export default function ProjectDetailsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { data: projects, isLoading: projectsLoading } = useProjects();
    const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
    const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
    const { data: activityData, isLoading: activityLoading } = useWorkspaceActivity(projectId);
    const { openModal } = useUIStore();

    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'activity'
    const [inviteOpen, setInviteOpen] = useState(false);

    const project = projects?.find(p => p.id === projectId);

    if (projectsLoading) return <PageSpinner />;

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <h2 className="text-xl font-bold mb-2">Project not found</h2>
                <p className="text-gray-500 mb-4">The project you're looking for doesn't exist or you don't have access.</p>
                <Button onClick={() => navigate('/dashboard/projects')} variant="secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
                </Button>
            </div>
        );
    }

    return (
        <>
            <Header
                title={project.name}
                subtitle={`${tasks?.length || 0} tasks • ${members?.length || 0} members`}
            />

            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Back button & Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
                    <Button onClick={() => navigate('/dashboard/projects')} variant="ghost" size="sm" className="pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
                    </Button>

                    <div className="flex gap-2">
                        <Button onClick={() => setInviteOpen(true)} variant="secondary" size="sm">
                            <UserPlus className="w-4 h-4 mr-1.5" /> Invite
                        </Button>
                        <Button onClick={() => openModal('create-task', { projectId })} size="sm">
                            <Plus className="w-4 h-4 mr-1.5" /> Add Task
                        </Button>
                    </div>
                </div>

                {/* Project Description & Members */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left col: Description */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-card border rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-brand-500" />
                                About Project
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {project.description || "No description provided."}
                            </p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-4 border-b border-[var(--border)] mb-6">
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`pb-2 px-1 text-sm font-bold transition-colors relative ${activeTab === 'tasks' ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}`}
                            >
                                Tasks
                                {activeTab === 'tasks' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand)]" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`pb-2 px-1 text-sm font-bold transition-colors relative ${activeTab === 'activity' ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}`}
                            >
                                Activity
                                {activeTab === 'activity' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand)]" />}
                            </button>
                        </div>

                        {activeTab === 'tasks' ? (
                            <div>
                                <h3 className="font-semibold mb-4 text-lg">Tasks</h3>
                                {tasksLoading ? (
                                    <div className="py-8"><PageSpinner /></div>
                                ) : !tasks?.length ? (
                                    <EmptyState
                                        icon={FolderKanban}
                                        title="No tasks yet"
                                        description="Create tasks to track progress."
                                        action={
                                            <Button onClick={() => openModal('create-task', { projectId })} size="sm" variant="secondary">
                                                Create First Task
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <motion.div
                                        className="space-y-2"
                                        layout
                                    >
                                        {tasks.map(task => (
                                            <motion.div
                                                key={task.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <TaskRow task={{ ...task, projectName: project.name }} />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="py-4">
                                <ActivityTimeline logs={activityData?.logs} />
                            </div>
                        )}
                    </div>

                    {/* Right col: Members */}
                    <div className="space-y-4">
                        <div className="bg-card border rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand-500" />
                                Team Members
                            </h3>
                            {membersLoading ? (
                                <div className="text-sm text-gray-500">Loading members...</div>
                            ) : (
                                <ul className="space-y-3">
                                    {members?.map(m => {
                                        const mUser = m.user || {};
                                        return (
                                            <li key={mUser._id} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-gray-800">
                                                    {mUser.avatar ? (
                                                        <img src={mUser.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                    ) : (mUser.name?.charAt(0) || mUser.email?.charAt(0) || '?')}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{mUser.name || 'Unnamed User'}</div>
                                                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{mUser.email}</div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {(!members || members.length === 0) && (
                                        <li className="text-sm text-gray-500 italic">No members found.</li>
                                    )}
                                </ul>
                            )}
                            <Button onClick={() => setInviteOpen(true)} variant="outline" className="w-full mt-4 text-xs">
                                Manage Team
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <InviteMemberModal
                isOpen={inviteOpen}
                onClose={() => setInviteOpen(false)}
                workspaceId={projectId}
                workspaceName={project.name}
            />
            <CreateTaskModal />
            <TaskDetailsModal />
        </>
    );
}
