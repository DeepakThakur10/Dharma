import { useState } from 'react';
import { Zap, ArrowRight, Save, Plus, Trash2, Settings } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { useAutomationRules, useCreateAutomationRule, useDeleteAutomationRule } from '../../features/settings/useSettings';

const TRIGGERS = [
    { id: 'task_created', label: 'When a Task is Created', icon: Plus },
    { id: 'status_changed', label: 'When Status Changes', icon: Settings },
    { id: 'deadline_approaching', label: 'When Deadline is Near', icon: Zap },
];

const ACTIONS = [
    { id: 'send_email', label: 'Send Email Notification', icon: ArrowRight },
    { id: 'assign_user', label: 'Auto-Assign User', icon: ArrowRight },
    { id: 'change_status', label: 'Move to Status', icon: ArrowRight },
];

export default function AutomationBuilder() {
    const { currentWorkspace } = useWorkspaceStore();
    const { data: rules = [], isLoading } = useAutomationRules(currentWorkspace?._id);
    const createRuleMutation = useCreateAutomationRule();
    const deleteRuleMutation = useDeleteAutomationRule();

    const [isCreating, setIsCreating] = useState(false);
    const [newRule, setNewRule] = useState({ name: '', trigger: 'task_created', action: 'send_email', projectId: '' });
    const { hierarchy } = useWorkspaceStore();
    const spaces = hierarchy.spaces || [];

    const handleCreateRule = async () => {
        if (!newRule.name) return;
        try {
            await createRuleMutation.mutateAsync({
                workspaceId: currentWorkspace._id,
                ruleData: {
                    ...newRule,
                    projectId: newRule.projectId || undefined // Send undefined if "Workspace-wide"
                }
            });
            setIsCreating(false);
            setNewRule({ name: '', trigger: 'task_created', action: 'send_email', projectId: '' });
        } catch (error) {
            // Error handled by mutation toast if implemented, or console
        }
    };

    const handleDeleteRule = async (id) => {
        try {
            await deleteRuleMutation.mutateAsync({ id, workspaceId: currentWorkspace._id });
        } catch (error) {
            // Error handled
        }
    };

    return (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand" />
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Automation Rules</h3>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> New Rule
                    </button>
                )}
            </div>

            <div className="p-4 space-y-4">
                {isLoading ? (
                    <div className="text-center py-6 text-sm text-muted">Loading rules...</div>
                ) : (
                    <>
                        {isCreating && (
                            <div className="p-4 border rounded-xl bg-brand/5 space-y-4" style={{ borderColor: 'var(--brand)/20' }}>
                                <input
                                    type="text"
                                    placeholder="Rule Name (e.g., Auto-Notify on Critical)"
                                    value={newRule.name}
                                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                    className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Apply To...</label>
                                    <select
                                        value={newRule.projectId}
                                        onChange={(e) => setNewRule({ ...newRule, projectId: e.target.value })}
                                        className="w-full bg-page border rounded-lg px-2 py-2 text-sm"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                    >
                                        <option value="">Workspace-wide (Admin Only)</option>
                                        {spaces.map(s => (
                                            <option key={s._id} value={s._id}>Project: {s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground">When this happens...</label>
                                        <select
                                            value={newRule.trigger}
                                            onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })}
                                            className="w-full bg-page border rounded-lg px-2 py-2 text-sm"
                                            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                        >
                                            {TRIGGERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Do this instead...</label>
                                        <select
                                            value={newRule.action}
                                            onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                                            className="w-full bg-page border rounded-lg px-2 py-2 text-sm"
                                            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                        >
                                            {ACTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => setIsCreating(false)} className="text-xs font-medium text-muted-foreground hover:underline px-3">Cancel</button>
                                    <button
                                        onClick={handleCreateRule}
                                        disabled={createRuleMutation.isPending}
                                        className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save className="w-3.5 h-3.5" /> {createRuleMutation.isPending ? 'Saving...' : 'Save Automation'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {rules.map((rule) => (
                                <div
                                    key={rule._id}
                                    className="flex items-center gap-4 p-4 border rounded-xl bg-card hover:border-brand/30 transition-all group"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{rule.name}</p>
                                            {rule.projectId && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/50 text-muted-foreground border">
                                                    {hierarchy.spaces?.find(s => s._id === rule.projectId)?.name ||
                                                        hierarchy.lists?.find(l => l._id === rule.projectId)?.name ||
                                                        'Specific Project'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                            <span className="bg-secondary px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">{rule.trigger}</span>
                                            <ArrowRight className="w-3 h-3" />
                                            <span className="bg-brand/10 text-brand px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">{rule.action}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteRule(rule._id)}
                                        className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {rules.length === 0 && !isCreating && (
                                <div className="text-center py-12 bg-secondary/5 rounded-xl border border-dashed text-sm text-muted-foreground" style={{ borderColor: 'var(--border)' }}>
                                    No automation rules configured. Speed up your workflow by creating one.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
