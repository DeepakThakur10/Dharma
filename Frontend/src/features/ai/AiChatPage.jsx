import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2, Trash2, MessageSquarePlus } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useAiChat } from './useAiChat';
import useWorkspaceStore from '../../store/workspaceStore';

function formatTime(ts) {
    if (!ts) return '';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Render markdown-like bold and lists simply */
function SimpleMarkdown({ text }) {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                // Bold
                let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Bullet points
                if (processed.startsWith('- ') || processed.startsWith('• ')) {
                    return (
                        <div key={i} className="flex gap-2">
                            <span>•</span>
                            <span dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
                        </div>
                    );
                }
                if (processed.trim() === '') return <br key={i} />;
                return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />;
            })}
        </div>
    );
}

export default function AiChatPage() {
    const { currentWorkspace } = useWorkspaceStore();
    const { messages, loading, sending, clearing, send, clear } = useAiChat();
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;
        const msg = input;
        setInput('');
        await send(msg, currentWorkspace?._id);
    };

    return (
        <>
            <Header title="AI Assistant" subtitle="Powered by Dharma AI" />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}>
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Dharma AI</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {sending ? 'Thinking…' : 'Online'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => clear()}
                            disabled={clearing || messages.length === 0}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30 interactive"
                            style={{ color: 'var(--text-muted)' }}
                            title="New chat"
                        >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">New Chat</span>
                        </button>
                        <button
                            onClick={() => { if (window.confirm('Clear all AI chat history?')) clear(); }}
                            disabled={clearing || messages.length === 0}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30 interactive"
                            style={{ color: 'var(--text-muted)' }}
                            title="Clear chat history"
                        >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
                        </div>
                    ) : messages.length === 0 && !sending ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}>
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-display font-bold mb-2" style={{ color: 'var(--text)' }}>
                                Hi! I'm Dharma AI
                            </h3>
                            <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
                                I know about your projects and tasks. Ask me anything — task summaries, overdue items, suggestions, or general help!
                            </p>
                            <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
                                {['What are my projects?', 'Any overdue tasks?', 'Summarize my workload'].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => { setInput(q); }}
                                        className="px-3 py-2 rounded-xl text-xs font-medium border interactive"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card)' }}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-2xl mx-auto">
                            {messages.map((msg) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <motion.div
                                        key={msg._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                                            style={{
                                                background: isUser
                                                    ? 'linear-gradient(135deg, #ff6b35 0%, #ffa07a 100%)'
                                                    : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            }}
                                        >
                                            {isUser ? 'U' : '✦'}
                                        </div>
                                        <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                                            <div
                                                className={`inline-block px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'}`}
                                                style={{
                                                    backgroundColor: isUser ? 'var(--brand)' : 'var(--bg-card)',
                                                    color: isUser ? 'white' : 'var(--text)',
                                                    border: isUser ? 'none' : '1px solid var(--border)',
                                                }}
                                            >
                                                {isUser ? msg.text : <SimpleMarkdown text={msg.text} />}
                                            </div>
                                            <p className="text-[10px] mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {sending && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}>
                                        ✦
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl rounded-tl-md border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--brand)' }} />
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Thinking…</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={endRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 px-4 py-3 border-t"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Dharma AI anything…"
                        className="flex-1 h-10 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-purple-300/30"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg)' }}
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </>
    );
}
