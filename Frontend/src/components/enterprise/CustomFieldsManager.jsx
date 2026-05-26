import { useState } from 'react';
import { Plus, Trash2, Settings2, Type, List, Hash as HashIcon, Square } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { useCustomFields, useCreateCustomField, useDeleteCustomField } from '../../features/settings/useSettings';

export default function CustomFieldsManager() {
    const { currentWorkspace } = useWorkspaceStore();
    const { data: fields = [], isLoading } = useCustomFields(currentWorkspace?._id);
    const createFieldMutation = useCreateCustomField();
    const deleteFieldMutation = useDeleteCustomField();

    const [isAdding, setIsAdding] = useState(false);
    const [newField, setNewField] = useState({ name: '', type: 'text', options: [] });

    const fieldTypes = [
        { id: 'text', label: 'Text', icon: Type },
        { id: 'number', label: 'Number', icon: HashIcon },
        { id: 'dropdown', label: 'Dropdown', icon: List },
        { id: 'checkbox', label: 'Checkbox', icon: Square },
    ];

    const handleCreateField = async () => {
        if (!newField.name) return;
        try {
            await createFieldMutation.mutateAsync({
                workspaceId: currentWorkspace._id,
                fieldData: newField
            });
            setNewField({ name: '', type: 'text', options: [] });
            setIsAdding(false);
        } catch (error) {
            // Handled
        }
    };

    const handleDeleteField = async (id) => {
        try {
            await deleteFieldMutation.mutateAsync({ id, workspaceId: currentWorkspace._id });
        } catch (error) {
            // Handled
        }
    };

    if (isLoading) return <div className="p-4 text-center">Loading fields...</div>;

    return (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-brand" />
                    <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Custom Fields</h3>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="p-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="p-4 space-y-3">
                {isAdding && (
                    <div className="p-3 border rounded-lg bg-secondary/20 space-y-3" style={{ borderColor: 'var(--border)' }}>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Field Name"
                                value={newField.name}
                                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                className="flex-1 bg-transparent border rounded px-3 py-1.5 text-sm"
                                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                            />
                            <select
                                value={newField.type}
                                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                                className="bg-transparent border rounded px-3 py-1.5 text-sm"
                                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                            >
                                {fieldTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs font-medium hover:underline text-muted-foreground">Cancel</button>
                            <button
                                onClick={handleCreateField}
                                disabled={createFieldMutation.isPending}
                                className="px-3 py-1 rounded-md bg-brand text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {createFieldMutation.isPending ? 'Creating...' : 'Create Field'}
                            </button>
                        </div>
                    </div>
                )}

                {fields.length === 0 && !isAdding && (
                    <div className="text-center py-6 text-sm text-muted-foreground italic">
                        No custom fields defined yet.
                    </div>
                )}

                <div className="space-y-2">
                    {fields.map((field) => (
                        <div
                            key={field._id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-brand-500/5 transition-colors group"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-secondary-foreground">
                                {fieldTypes.find(t => t.id === field.type)?.icon({ className: "w-4 h-4" })}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{field.name}</p>
                                <p className="text-[10px] uppercase text-muted-foreground tracking-widest">{field.type}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteField(field._id)}
                                className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
