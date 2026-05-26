import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Settings,
    Database,
    Zap,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Loader2,
    ChevronRight,
    Star
} from 'lucide-react';
import { useCustomFields, useCreateCustomField, useDeleteCustomField, useAutomationRules, useCreateAutomationRule, useUpdateAutomationRule, useDeleteAutomationRule } from './useSettings';
import { useProjectMembers } from '../projects/useInvite';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import useWorkspaceStore from '../../store/workspaceStore';
import Header from '../../components/layout/Header';

const ROLE_LEVELS = {
    guest: 1,
    member: 2,
    employee: 2,
    admin: 3,
    project_manager: 3,
    owner: 4,
    project_lead: 4
};

export default function SettingsPage() {
    const { workspaceId } = useParams();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('fields');

    const { workspaces } = useWorkspaceStore();
    const currentWorkspace = workspaces.find(w => w._id === workspaceId);
    const membership = currentWorkspace?.members?.find(m =>
        String(m.user?._id || m.user) === String(user?._id)
    );
    const isAdmin = membership && ROLE_LEVELS[membership.role] >= 3;
    const isOwner = membership && ROLE_LEVELS[membership.role] >= 4;

    const ownedWorkspaces = workspaces.filter(w =>
        String(w.owner) === String(user?._id) ||
        w.members?.some(m => String(m.user?._id || m.user) === String(user?._id) && ROLE_LEVELS[m.role] >= 4)
    );

    const tabs = [
        { id: 'fields', label: 'Data & Fields', icon: Database, description: 'Personalize task data schema' },
        { id: 'automation', label: 'Workflow Automation', icon: Zap, description: 'Trigger actions based on changes' },
    ];

    if (!workspaceId) return <div className="p-8 text-center text-muted">Please select a workspace</div>;

    const handleWorkspaceChange = (e) => {
        const id = e.target.value;
        if (id) {
            window.location.href = `/settings/${id}`;
        }
    };

    return (
        <div className="flex-1 flex flex-col md:flex-row bg-page overflow-hidden h-full">
            <div className="md:hidden">
                <Header title="Settings" />
            </div>
            {/* Optimized Sidebar - Horizontal on mobile */}
            <aside className="w-full md:w-80 bg-card border-b md:border-b-0 md:border-r border-default flex flex-col flex-shrink-0">
                <div className="p-4 md:p-8 border-b border-default">
                    <div className="flex items-center gap-3 mb-1 md:mb-2">
                        <div className="p-1.5 md:p-2 bg-brand/10 rounded-xl">
                            <Settings className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight text-primary">Workspace</h1>
                    </div>
                    <p className="text-xs md:text-sm text-muted font-medium">Fine-tune your environment</p>

                    {/* Project Selector for Owners */}
                    {ownedWorkspaces.length > 1 && (
                        <div className="mt-6 p-4 bg-brand/5 rounded-2xl border border-brand/10">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-brand mb-2">Switch Workspace</label>
                            <select
                                onChange={handleWorkspaceChange}
                                value={workspaceId}
                                className="w-full bg-white border border-default p-2.5 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-brand outline-none cursor-pointer"
                            >
                                {ownedWorkspaces.map(w => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <nav className="flex md:flex-col p-2 md:p-4 space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-y-auto custom-scrollbar no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-shrink-0 flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 group min-w-[140px] md:min-w-0",
                                activeTab === tab.id
                                    ? "bg-brand text-white shadow-lg md:shadow-xl shadow-brand/20 md:translate-x-1"
                                    : "hover:bg-brand/5 text-secondary hover:text-brand"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4 md:w-5 md:h-5 mt-0.5", activeTab === tab.id ? "text-white" : "text-muted group-hover:text-brand")} />
                            <div className="text-left">
                                <span className="block font-bold text-xs md:text-sm tracking-tight">{tab.label}</span>
                                <span className={cn("text-[8px] md:text-[10px] uppercase font-black tracking-widest opacity-60", activeTab === tab.id ? "text-white" : "text-muted")}>
                                    {tab.description.length > 20 && window.innerWidth < 768 ? tab.description.slice(0, 15) + '...' : tab.description}
                                </span>
                            </div>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto bg-page custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === 'fields' ? (
                            <CustomFieldsTab workspaceId={workspaceId} isAdmin={isAdmin} />
                        ) : (
                            <AutomationTab workspaceId={workspaceId} isOwner={isOwner} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div >
    );
}

function CustomFieldsTab({ workspaceId, isAdmin }) {
    const { data: fields, isLoading } = useCustomFields(workspaceId);
    const createMutation = useCreateCustomField();
    const deleteMutation = useDeleteCustomField();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-brand/40" />
        </div>
    );

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-default">
                <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Custom Fields</h2>
                    <p className="text-muted font-medium flex items-center gap-2">
                        <Database className="w-4 h-4" /> Define specialized data points for your tasks
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-full px-8 py-4 md:py-6 font-bold text-base md:text-lg shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 md:w-6 md:h-6 mr-2 stroke-[3]" /> Add Field
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields?.map((field) => (
                    <div key={field._id} className="bg-card border border-default p-6 rounded-3xl shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-brand/5 rounded-2xl group-hover:bg-brand text-brand group-hover:text-white transition-colors">
                                <Database className="w-6 h-6" />
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this custom field and all its data?'))
                                            deleteMutation.mutate({ id: field._id, workspaceId });
                                    }}
                                    className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <h3 className="font-bold text-xl text-primary mb-1">{field.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="brand" className="bg-brand/10 text-brand border-none uppercase text-[10px] font-black tracking-widest px-3">
                                {field.type}
                            </Badge>
                            {field.isRequired && (
                                <Badge className="bg-danger/10 text-danger border-none uppercase text-[10px] font-black tracking-widest px-3 text-white">
                                    Required
                                </Badge>
                            )}
                        </div>
                        {field.options?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-default">
                                {field.options.slice(0, 4).map((opt, i) => (
                                    <span key={i} className="text-[10px] px-2 py-1 bg-page border border-default rounded-lg font-bold text-muted uppercase">
                                        {opt}
                                    </span>
                                ))}
                                {field.options.length > 4 && <span className="text-[10px] px-2 py-1 font-bold text-muted">+{field.options.length - 4} more</span>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <FieldModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                workspaceId={workspaceId}
                onSave={(data) => {
                    createMutation.mutate({ workspaceId, fieldData: data });
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}

function AutomationTab({ workspaceId, isOwner }) {
    const { data: rules, isLoading } = useAutomationRules(workspaceId);
    const createMutation = useCreateAutomationRule();
    const updateMutation = useUpdateAutomationRule();
    const deleteMutation = useDeleteAutomationRule();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-brand/40" />
        </div>
    );

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-default">
                <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Workflow Automation</h2>
                    <p className="text-muted font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Automate repetitive tasks and status updates
                    </p>
                </div>
                {isOwner && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-full px-8 py-4 md:py-6 font-bold text-base md:text-lg shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 md:w-6 md:h-6 mr-2 stroke-[3]" /> Create Rule
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 gap-4">
                {rules?.map((rule) => (
                    <div key={rule._id} className={cn("bg-card border border-default p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-6", !rule.isActive && "opacity-60")}>
                        <div className={cn("p-4 rounded-2xl", rule.isActive ? "bg-brand/10 text-brand" : "bg-muted text-muted")}>
                            <Zap className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/5 px-2 py-0.5 rounded">Trigger</span>
                                <p className="font-bold text-lg text-primary">
                                    When <span className="text-brand">"{rule.trigger.field}"</span> is set to <span className="text-brand">"{rule.trigger.value}"</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted bg-page px-2 py-0.5 rounded">Action</span>
                                <p className="text-secondary font-medium italic">
                                    Then <span className="font-bold text-primary non-italic uppercase text-sm tracking-tight">{rule.action.type.replace('_', ' ')}</span> with value: <span className="font-bold text-primary non-italic">{rule.action.value}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => updateMutation.mutate({ id: rule._id, ruleData: { isActive: !rule.isActive } })}
                                        className={cn("p-2 rounded-xl transition-all", rule.isActive ? "text-success bg-success/10 hover:bg-success/20" : "text-muted bg-page hover:bg-muted")}
                                    >
                                        {rule.isActive ? <ToggleRight className="w-8 h-8 text-success" /> : <ToggleLeft className="w-8 h-8 text-muted" />}
                                    </button>
                                    <button
                                        onClick={() => { if (confirm('Remove this rule?')) deleteMutation.mutate({ id: rule._id, workspaceId }) }}
                                        className="p-3 text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                            <ChevronRight className="w-6 h-6 text-muted opacity-30 ml-4" />
                        </div>
                    </div>
                ))}
            </div>

            <RuleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                workspaceId={workspaceId}
                onSave={(data) => {
                    createMutation.mutate({ workspaceId, ruleData: data });
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}

function FieldModal({ isOpen, onClose, onSave, workspaceId }) {
    const [data, setData] = useState({ name: '', type: 'text', options: '', isRequired: false });
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Define Custom Field">
            <div className="space-y-4">
                <Input label="Name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="e.g. Estimated Cost" />
                <div>
                    <label className="block text-sm font-bold mb-1.5 text-primary">Field Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['text', 'number', 'select', 'date', 'boolean'].map(t => (
                            <button
                                key={t}
                                onClick={() => setData({ ...data, type: t })}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left uppercase tracking-tight",
                                    data.type === t ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" : "bg-page border-default text-muted hover:bg-brand/5 hover:text-brand"
                                )}
                            >
                                {t === 'boolean' ? 'Checkbox' : t === 'select' ? 'Dropdown' : t}
                            </button>
                        ))}
                    </div>
                </div>
                {data.type === 'select' && (
                    <Input label="Options (Split by comma)" value={data.options} onChange={e => setData({ ...data, options: e.target.value })} placeholder="UI, Backend, DevOps..." />
                )}
                <div className="flex items-center gap-3 p-3 bg-page rounded-xl border border-default">
                    <input type="checkbox" className="w-4 h-4 rounded text-brand focus:ring-brand" checked={data.isRequired} onChange={e => setData({ ...data, isRequired: e.target.checked })} id="req-sw" />
                    <label htmlFor="req-sw" className="text-sm font-bold text-muted">Make this field mandatory</label>
                </div>
                <div className="flex gap-3 pt-4">
                    <Button variant="secondary" className="flex-1 font-bold" onClick={onClose}>Discard</Button>
                    <Button className="flex-1 font-bold shadow-brand/20 shadow-lg" onClick={() => onSave({
                        ...data,
                        options: data.options ? data.options.split(',').map(o => o.trim()).filter(Boolean) : []
                    })}>Save Field</Button>
                </div>
            </div>
        </Modal>
    );
}

function RuleModal({ isOpen, onClose, onSave, workspaceId }) {
    const { data: fields } = useCustomFields(workspaceId);
    const { data: members } = useProjectMembers(workspaceId);
    const [data, setData] = useState({
        trigger: { field: 'status', operator: 'equals', value: 'done' },
        action: { type: 'notify', value: 'Task processed by automation' }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Workflow Rule" maxWidth="max-w-xl">
            <div className="space-y-6">
                <section>
                    <h4 className="text-[10px] font-black text-brand uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full" /> Trigger Condition
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-page rounded-2xl border border-default">
                        <div>
                            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase">When field</label>
                            <select
                                className="w-full text-sm font-bold bg-white border border-default p-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-brand outline-none"
                                value={data.trigger.field}
                                onChange={e => setData({ ...data, trigger: { ...data.trigger, field: e.target.value } })}
                            >
                                <optgroup label="Core Data">
                                    <option value="status">Status</option>
                                    <option value="priority">Priority</option>
                                    <option value="assignees">Assignees (contains user)</option>
                                </optgroup>
                                <optgroup label="Custom Fields">
                                    {fields?.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                </optgroup>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase">Equals value</label>
                            <Input
                                value={data.trigger.value}
                                onChange={e => setData({ ...data, trigger: { ...data.trigger, value: e.target.value } })}
                                placeholder="e.g. done, high, testing"
                                className="!py-2 !text-sm !font-bold"
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-center -my-3 relative z-10">
                    <div className="p-2 bg-white rounded-full border shadow-sm">
                        <Zap className="w-4 h-4 text-brand fill-brand" />
                    </div>
                </div>

                <section>
                    <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-muted rounded-full" /> Automated Action
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-card border border-brand/20 rounded-2xl shadow-lg shadow-brand/5">
                        <div>
                            <label className="block text-[11px] font-bold text-brand mb-1.5 uppercase">Perform Action</label>
                            <select
                                className="w-full text-sm font-bold bg-white border border-default p-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-brand outline-none"
                                value={data.action.type}
                                onChange={e => setData({ ...data, action: { ...data.action, type: e.target.value } })}
                            >
                                <option value="move_status">Move Status</option>
                                <option value="assign_user">Assign User</option>
                                <option value="notify">Notify (Global Log)</option>
                                <option value="notify_all">Notify All Members</option>
                                <option value="notify_admin">Notify Admins</option>
                                <option value="notify_creator">Notify Creator</option>
                                <option value="notify_assignee">Notify Assigned Users</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-brand mb-1.5 uppercase">Action Target</label>
                            {data.action.type === 'assign_user' ? (
                                <select
                                    className="w-full text-sm font-bold bg-white border border-default p-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-brand outline-none"
                                    value={data.action.value}
                                    onChange={e => setData({ ...data, action: { ...data.action, value: e.target.value } })}
                                >
                                    <option value="">Select User</option>
                                    {members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
                                </select>
                            ) : (
                                <Input
                                    value={data.action.value}
                                    onChange={e => setData({ ...data, action: { ...data.action, value: e.target.value } })}
                                    placeholder={
                                        data.action.type === 'move_status' ? 'e.g. testing, done' :
                                            data.action.type === 'notify_assignee' ? 'Personalize message...' :
                                                'Notification text...'
                                    }
                                    className="!py-2 !text-sm !font-bold"
                                />
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex gap-4 pt-4">
                    <Button variant="secondary" className="flex-1 font-bold" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1 font-bold shadow-brand/30 shadow-xl py-6" onClick={() => onSave(data)}>Activate Rule</Button>
                </div>
            </div>
        </Modal>
    );
}
