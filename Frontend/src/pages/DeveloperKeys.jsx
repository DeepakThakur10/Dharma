import { useState } from 'react';
import { Key, Copy, Trash2, ShieldAlert, Plus, ShieldCheck } from 'lucide-react';
import useWorkspaceStore from '../store/workspaceStore';
import { toast } from 'react-hot-toast';

import { useDeveloperKeys, useCreateKey } from '../features/developer-keys/useDeveloperKeys';
import Header from '../components/layout/Header';

export default function DeveloperKeys() {
    const { currentWorkspace } = useWorkspaceStore();
    const { data: keys = [], isLoading } = useDeveloperKeys(currentWorkspace?._id);
    const createKeyMutation = useCreateKey();
    const [isGenerating, setIsGenerating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [rawKey, setRawKey] = useState(null);

    const handleCreateKey = async () => {
        if (!newKeyName) return;
        setIsGenerating(true);
        try {
            const data = await createKeyMutation.mutateAsync({
                workspaceId: currentWorkspace._id,
                name: newKeyName
            });
            setRawKey(data.rawKey);
            setNewKeyName('');
        } catch (error) {
            // Error handled by mutation
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (isLoading) return <div className="p-6">Loading...</div>;

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-page">
            <Header title="Developer API Keys" subtitle="Securely access Dharma from your own applications" />

            <div className="p-6 space-y-8">

                {rawKey && (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-orange-500 text-sm font-bold">
                            <ShieldAlert className="w-5 h-5" />
                            <span>IMPORTANT: Copy your API key now</span>
                        </div>
                        <p className="text-xs text-orange-500/80">For security reasons, this key will not be shown again.</p>
                        <div className="flex items-center gap-2 bg-page p-3 rounded-lg border border-orange-500/20">
                            <code className="text-sm font-mono flex-1 truncate">{rawKey}</code>
                            <button onClick={() => copyToClipboard(rawKey)} className="p-2 hover:bg-orange-500/10 rounded-md">
                                <Copy className="w-4 h-4 text-orange-500" />
                            </button>
                        </div>
                        <button
                            onClick={() => setRawKey(null)}
                            className="text-xs font-bold uppercase text-orange-500 hover:underline"
                        >
                            I've stored it safely
                        </button>
                    </div>
                )}

                <div className="bg-card border rounded-2xl shadow-sm overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-brand" />
                            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Active API Keys</h3>
                        </div>
                    </div>

                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {keys.length === 0 ? (
                            <div className="p-12 text-center text-sm text-muted-foreground italic">
                                No API keys generated yet.
                            </div>
                        ) : (
                            keys.map((k) => (
                                <div key={k._id} className="p-4 flex items-center justify-between hover:bg-brand-500/5 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{k.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="text-[11px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">mh_xxxxxxxx...</code>
                                            <span className="text-[10px] text-muted-foreground">Created {new Date(k.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-secondary/20 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Key Name (e.g., CI/CD Pipeline)"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="flex-1 bg-transparent border rounded-lg px-3 py-2 text-sm"
                                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                            />
                            <button
                                disabled={!newKeyName || isGenerating}
                                onClick={handleCreateKey}
                                className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" /> Generate New Key
                            </button>
                        </div>
                    </div>
                </div>

                {/* Docs Card */}
                <div className="bg-brand/5 border border-brand/10 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center text-brand">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand mb-1">Public API Access</h3>
                        <p className="text-sm text-brand/80 leading-relaxed max-w-2xl">
                            Your API keys allow you to programmatically manage tasks, projects, and workstreams.
                            Make sure to treat them like passwords—never embed them in client-side code.
                            <br /><br />
                            <a href="#" className="font-bold underline" onClick={(e) => { e.preventDefault(); toast.success('API Documentation coming soon!'); }}>Read the API Reference &rarr;</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
