import { Sliders, Settings, Zap } from 'lucide-react';
import CustomFieldsManager from '../components/enterprise/CustomFieldsManager';
import AutomationBuilder from '../components/enterprise/AutomationBuilder';
import useWorkspaceStore from '../store/workspaceStore';

export default function WorkspaceSettings() {
    const { currentWorkspace } = useWorkspaceStore();

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-page">
            <header>
                <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-5 h-5 text-brand" />
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Workspace Settings</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Configure {currentWorkspace?.name} for your team's unique workflows</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Sliders className="w-4 h-4 text-brand" />
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Data & Fields</h2>
                    </div>
                    <CustomFieldsManager />
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Zap className="w-4 h-4 text-brand" />
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Workflow Automation</h2>
                    </div>
                    <AutomationBuilder />
                </section>
            </div>
        </div>
    );
}
