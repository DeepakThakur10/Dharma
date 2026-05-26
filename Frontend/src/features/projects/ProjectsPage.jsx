import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderKanban } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { useProjects } from './useProjects';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import { useUIStore } from '../../store/uiStore';

export default function ProjectsPage() {
    const { data: projects, isLoading } = useProjects();
    const { openModal } = useUIStore();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.openModal) {
            openModal('create-project');
            window.history.replaceState({}, '');
        }
    }, []);

    return (
        <>
            <Header title="Projects" subtitle={`${projects?.length || 0} projects`} />
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>All Projects</h2>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage and organize your work</p>
                    </div>
                    <Button onClick={() => openModal('create-project')}>
                        <Plus className="w-4 h-4" /> New Project
                    </Button>
                </div>

                {isLoading ? (
                    <PageSpinner />
                ) : !projects?.length ? (
                    <EmptyState
                        icon={FolderKanban}
                        title="No projects yet"
                        description="Create your first project to get started"
                        action={
                            <Button onClick={() => openModal('create-project')} size="sm">
                                <Plus className="w-4 h-4" /> Create Project
                            </Button>
                        }
                    />
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: {},
                            show: { transition: { staggerChildren: 0.05 } },
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    >
                        {projects.map((p) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0, y: 12 },
                                    show: { opacity: 1, y: 0 },
                                }}
                            >
                                <ProjectCard project={p} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            <CreateProjectModal />
        </>
    );
}
