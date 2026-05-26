import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

/**
 * AI chat hook for synchronized state management
 */
export function useAiChat() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [clearing, setClearing] = useState(false);
    const user = useAuthStore((s) => s.user);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data } = await api.get('/api/ai/history');
            setMessages(data);
        } catch (err) {
            console.error('AI history fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const send = useCallback(async (text, workspaceId) => {
        if (!text?.trim()) return;

        // Optimistic update for user message
        const userMsg = { _id: Date.now().toString(), role: 'user', text: text.trim(), createdAt: new Date() };
        setMessages(prev => [...prev, userMsg]);

        setSending(true);
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text.trim(), workspaceId }),
                credentials: 'include', // Important for HttpOnly cookies
            });

            if (!response.ok) throw new Error('Failed to start AI stream');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMsgId = Date.now() + 1;
            let fullText = '';

            // Add an initial empty assistant message to grow
            setMessages(prev => [...prev, { _id: assistantMsgId.toString(), role: 'assistant', text: '', createdAt: new Date() }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.text) {
                                fullText += data.text;
                                // Update the last message (the assistant's) with partial text
                                setMessages(prev => {
                                    const next = [...prev];
                                    const lastIndex = next.length - 1;
                                    if (next[lastIndex] && next[lastIndex].role === 'assistant') {
                                        next[lastIndex] = { ...next[lastIndex], text: fullText };
                                    }
                                    return next;
                                });
                            }
                            if (data.done) {
                                // Final update with actual DB ID and complete text
                                setMessages(prev => {
                                    const next = [...prev];
                                    next[next.length - 1] = data.message;
                                    return next;
                                });
                            }
                        } catch (e) {
                            // Ignore malformed JSON chunks that might happen during stream splits
                        }
                    }
                }
            }
        } catch (err) {
            console.error('AI streaming error:', err);
        } finally {
            setSending(false);
        }
    }, []);

    const clear = useCallback(async () => {
        setClearing(true);
        try {
            await api.delete('/api/ai/history');
            setMessages([]); // Clear local state immediately
        } catch (err) {
            console.error('AI clear error:', err);
        } finally {
            setClearing(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        messages,
        loading,
        sending,
        clearing,
        send,
        clear,
        refresh: fetchHistory
    };
}

/**
 * Get AI suggestion for autocomplete
 */
export async function fetchAiSuggestion({ text, fieldType, title }) {
    try {
        const { data } = await api.post('/api/ai/suggest', { text, fieldType, title });
        return data.suggestion || '';
    } catch {
        return '';
    }
}

/**
 * Get AI-generated subtask breakdown
 */
export async function fetchAiSubtasks({ title, description, taskId, workspaceId }) {
    try {
        const { data } = await api.post('/api/ai/breakdown', { title, description, taskId, workspaceId });
        return data || [];
    } catch (err) {
        console.error('Fetch subtasks error:', err);
        throw err;
    }
}
