import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader2, Trash2, Maximize2, MessageSquarePlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAiChat } from './useAiChat';
import useWorkspaceStore from '../../store/workspaceStore';

function SimpleMarkdown({ text }) {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="space-y-0.5">
            {lines.map((line, i) => {
                let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                if (processed.startsWith('- ') || processed.startsWith('• ')) {
                    return <div key={i} className="flex gap-1.5"><span>•</span><span dangerouslySetInnerHTML={{ __html: processed.slice(2) }} /></div>;
                }
                if (processed.trim() === '') return <br key={i} />;
                return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />;
            })}
        </div>
    );
}

export default function AiChatWidget() {
    const location = useLocation();
    const { currentWorkspace } = useWorkspaceStore();
    const [open, setOpen] = useState(false);
    const { messages, loading, sending, clearing, send, clear } = useAiChat();
    const [input, setInput] = useState('');
    const endRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending, open]);

    // Hide widget when already on the AI chat page
    if (location.pathname === '/dashboard/ai') return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;
        const msg = input;
        setInput('');
        await send(msg, currentWorkspace?._id);
    };

    return (
        <>
            {/* Floating bubble */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
                        title="Dharma AI"
                    >
                        <Sparkles className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="fixed bottom-6 right-6 z-40 w-[380px] h-[520px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(236,72,153,0.08) 100%)' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}>
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Dharma AI</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sending ? 'Thinking…' : 'Online'}</p>
                            </div>
                            <button
                                onClick={() => { navigate('/dashboard/ai'); setOpen(false); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                                title="Open full page"
                            >
                                <Maximize2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            </button>
                            <button
                                onClick={() => clear()}
                                disabled={clearing || messages.length === 0}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-950/20 transition-colors disabled:opacity-30"
                                title="New chat"
                            >
                                <MessageSquarePlus className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                            >
                                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-3 py-3">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                                </div>
                            ) : messages.length === 0 && !sending ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <Sparkles className="w-10 h-10 mb-3" style={{ color: 'var(--brand)', opacity: 0.3 }} />
                                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Hi! I'm Dharma AI</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Ask me about your projects and tasks</p>
                                    <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                                        {['My projects', 'Overdue tasks?', 'Summarize workload'].map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => setInput(q)}
                                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all hover:shadow-sm"
                                                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg)' }}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {messages.map((msg) => {
                                        const isUser = msg.role === 'user';
                                        return (
                                            <div key={msg._id} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                                                    style={{
                                                        background: isUser
                                                            ? 'linear-gradient(135deg, #ff6b35 0%, #ffa07a 100%)'
                                                            : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                                    }}
                                                >
                                                    {isUser ? 'U' : '✦'}
                                                </div>
                                                <div
                                                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                                                    style={{
                                                        backgroundColor: isUser ? 'var(--brand)' : 'var(--bg)',
                                                        color: isUser ? 'white' : 'var(--text)',
                                                        border: isUser ? 'none' : '1px solid var(--border)',
                                                    }}
                                                >
                                                    {isUser ? msg.text : <SimpleMarkdown text={msg.text} />}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {sending && (
                                        <div className="flex gap-2">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}>✦</div>
                                            <div className="px-3 py-2 rounded-2xl rounded-tl-sm border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--brand)' }} />
                                            </div>
                                        </div>
                                    )}

                                    <div ref={endRef} />
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSend}
                            className="flex items-center gap-2 px-3 py-2.5 border-t"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything…"
                                className="flex-1 h-9 px-3 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-purple-300/30"
                                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg)' }}
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || sending}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
                            >
                                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
