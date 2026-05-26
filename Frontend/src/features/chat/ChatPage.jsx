import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Hash, Loader2, Users, Crown, Trash2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useProjects } from '../projects/useProjects';
import { useProjectMembers, useRemoveMember } from '../projects/useInvite';
import { useMessages, useSendMessage } from './useChat';
import { useAuthStore } from '../../store/authStore';

function formatTime(timestamp) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChatPage() {
    const { data: workspaces, isLoading: workspacesLoading } = useProjects();
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [showProjectList, setShowProjectList] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const user = useAuthStore((s) => s.user);
    const messagesEndRef = useRef(null);

    const selectedWorkspace = workspaces?.find(w => w.id === selectedWorkspaceId);
    const { messages, loading: messagesLoading } = useMessages(selectedWorkspaceId);
    const { data: members, isLoading: membersLoading } = useProjectMembers(selectedWorkspaceId);
    const sendMessage = useSendMessage();

    // Check if current user is the project owner
    const isAdmin = selectedWorkspace?.owner === user?._id;

    // Auto-select first project if none selected
    useEffect(() => {
        if (!selectedWorkspaceId && workspaces?.length) {
            setSelectedWorkspaceId(workspaces[0].id);
        }
    }, [workspaces, selectedWorkspaceId]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedWorkspaceId) return;

        try {
            await sendMessage.mutateAsync({ projectId: selectedWorkspaceId, text: messageText });
            setMessageText('');
        } catch (err) {
            // Error toast handled in hook
        }
    };

    // Group messages by date
    const groupedMessages = [];
    let lastDateLabel = '';
    messages.forEach((msg) => {
        const dateLabel = formatDate(msg.createdAt);
        if (dateLabel !== lastDateLabel) {
            groupedMessages.push({ type: 'divider', date: dateLabel });
            lastDateLabel = dateLabel;
        }
        groupedMessages.push({ type: 'message', ...msg });
    });

    return (
        <>
            <Header title="Chat" subtitle={selectedWorkspace ? `# ${selectedWorkspace.name}` : 'Select a project'} />
            <div className="flex-1 flex overflow-hidden">
                {/* Project list sidebar */}
                <aside
                    className={`${showProjectList ? 'flex' : 'hidden'} lg:flex flex-col w-64 border-r flex-shrink-0`}
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                    <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Project Channels
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto py-1">
                        {workspacesLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                            </div>
                        ) : !workspaces?.length ? (
                            <div className="text-center py-8 px-3">
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No projects yet</p>
                            </div>
                        ) : (
                            workspaces.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { setSelectedWorkspaceId(p.id); setShowProjectList(false); }}
                                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors rounded-lg mx-1 interactive ${selectedWorkspaceId === p.id ? 'font-semibold' : ''
                                        }`}
                                    style={{
                                        color: selectedWorkspaceId === p.id ? 'var(--brand)' : 'var(--text-secondary)',
                                        backgroundColor: selectedWorkspaceId === p.id ? 'var(--brand-light)' : undefined,
                                        maxWidth: 'calc(100% - 8px)',
                                    }}
                                >
                                    <Hash className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm truncate">{p.name}</span>
                                    <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                        <Users className="w-3 h-3" />
                                        {p.members?.length || 1}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* Chat area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {!selectedWorkspaceId ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Select a project to start chatting</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Channel header */}
                            <div
                                className="flex items-center gap-3 px-4 py-2.5 border-b"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                {/* Mobile: back button */}
                                <button
                                    onClick={() => setShowProjectList(true)}
                                    className="lg:hidden text-xs font-medium px-2 py-1 rounded-md"
                                    style={{ color: 'var(--brand)', backgroundColor: 'var(--brand-light)' }}
                                >
                                    ← Channels
                                </button>
                                <Hash className="w-4 h-4 hidden lg:block" style={{ color: 'var(--text-muted)' }} />
                                <span className="text-sm font-semibold truncate hidden lg:block" style={{ color: 'var(--text)' }}>{selectedWorkspace?.name}</span>

                                {/* Spacer */}
                                <div className="flex-1" />

                                {/* Members toggle */}
                                <button
                                    onClick={() => setShowMembers(!showMembers)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all interactive ${showMembers ? 'ring-1' : ''
                                        }`}
                                    style={{
                                        color: showMembers ? 'var(--brand)' : 'var(--text-muted)',
                                        backgroundColor: showMembers ? 'var(--brand-light)' : undefined,
                                        ringColor: showMembers ? 'var(--brand)' : undefined,
                                    }}
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Members</span>
                                    <span className="text-[10px] px-1 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--border)' }}>
                                        {members?.length || selectedWorkspace?.members?.length || '…'}
                                    </span>
                                </button>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Messages area */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="flex-1 overflow-y-auto px-4 py-3">
                                        {messagesLoading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <div
                                                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                                        style={{ backgroundColor: 'var(--brand-light)' }}
                                                    >
                                                        <Hash className="w-7 h-7" style={{ color: 'var(--brand)' }} />
                                                    </div>
                                                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                                                        Welcome to #{selectedWorkspace?.name}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                        This is the start of this project's chat. Say hello! 👋
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            groupedMessages.map((item, i) => {
                                                if (item.type === 'divider') {
                                                    return (
                                                        <div key={`d-${i}`} className="flex items-center gap-3 my-4">
                                                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2" style={{ color: 'var(--text-muted)' }}>
                                                                {item.date}
                                                            </span>
                                                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                                                        </div>
                                                    );
                                                }

                                                const isOwn = item.sender === user?._id;
                                                const initial = item.senderName?.[0]?.toUpperCase() || '?';

                                                return (
                                                    <div key={item.id} className={`flex gap-3 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                            style={{
                                                                background: isOwn
                                                                    ? 'linear-gradient(135deg, #ff6b35 0%, #ffa07a 100%)'
                                                                    : 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
                                                            }}
                                                        >
                                                            {initial}
                                                        </div>
                                                        <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
                                                            <div className={`flex items-baseline gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                                                                    {isOwn ? 'You' : item.senderName}
                                                                </span>
                                                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                                    {formatTime(item.createdAt)}
                                                                </span>
                                                            </div>
                                                            <div
                                                                className={`inline-block px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isOwn ? 'rounded-tr-md' : 'rounded-tl-md'
                                                                    }`}
                                                                style={{
                                                                    backgroundColor: isOwn ? 'var(--brand)' : 'var(--bg-card)',
                                                                    color: isOwn ? 'white' : 'var(--text)',
                                                                    border: isOwn ? 'none' : `1px solid var(--border)`,
                                                                }}
                                                            >
                                                                {item.text}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message input */}
                                    <form
                                        onSubmit={handleSend}
                                        className="flex items-center gap-2 px-4 py-3 border-t"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                                    >
                                        <input
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder={`Message #${selectedWorkspace?.name || 'channel'}…`}
                                            className="flex-1 h-10 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-brand/30 focus:border-brand"
                                            style={{
                                                borderColor: 'var(--border)',
                                                color: 'var(--text)',
                                                backgroundColor: 'var(--bg)',
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!messageText.trim() || sendMessage.isPending}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                                            style={{ backgroundColor: 'var(--brand)' }}
                                        >
                                            {sendMessage.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* Members sidebar */}
                                {showMembers && (
                                    <aside
                                        className="w-60 border-l flex-shrink-0 overflow-y-auto"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                                    >
                                        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                                Members — {members?.length || '…'}
                                            </h4>
                                        </div>

                                        {membersLoading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        ) : !members?.length ? (
                                            <div className="text-center py-6 px-3">
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    Could not load members.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="py-2">
                                                {/* Owners first, then regular members */}
                                                {members
                                                    .sort((a, b) => (b.isOwner ? 1 : 0) - (a.isOwner ? 1 : 0))
                                                    .map((m) => {
                                                        const mUser = m.user || {};
                                                        const initial = (mUser.name || '?')[0].toUpperCase();
                                                        const isSelf = mUser._id === user?._id;
                                                        const isOwner = selectedWorkspace?.owner === mUser._id;

                                                        return (
                                                            <div
                                                                key={mUser._id}
                                                                className="flex items-center gap-2.5 px-3 py-2 transition-colors interactive"
                                                            >
                                                                {/* Avatar */}
                                                                <div
                                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative"
                                                                    style={{
                                                                        background: isOwner
                                                                            ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                                                                            : 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
                                                                    }}
                                                                >
                                                                    {mUser.avatar ? (
                                                                        <img src={mUser.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                                    ) : initial}
                                                                    {isOwner && (
                                                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 flex items-center justify-center" style={{ borderColor: 'var(--bg)' }}>
                                                                            <Crown className="w-2.5 h-2.5 text-white" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                                                                            {mUser.name}
                                                                            {isSelf && <span className="font-normal" style={{ color: 'var(--text-muted)' }}> (you)</span>}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span
                                                                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                                                            style={{
                                                                                backgroundColor: isOwner ? 'rgba(245, 158, 11, 0.15)' : 'var(--brand-light)',
                                                                                color: isOwner ? '#d97706' : 'var(--brand)',
                                                                            }}
                                                                        >
                                                                            {isOwner ? 'Admin' : 'Member'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Remove button (admin only, not for self/owner) */}
                                                                {isAdmin && !isOwner && !isSelf && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm(`Remove ${mUser.name} from this project?`)) {
                                                                                removeMember.mutate({ workspaceId: selectedWorkspaceId, userId: mUser._id });
                                                                            }
                                                                        }}
                                                                        disabled={removeMember.isPending}
                                                                        className="w-6 h-6 rounded flex items-center justify-center transition-colors flex-shrink-0 interactive"
                                                                        title="Remove member"
                                                                    >
                                                                        <Trash2 className="w-3 h-3 text-red-400" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </aside>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
