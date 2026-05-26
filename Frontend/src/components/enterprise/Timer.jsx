import { useState } from 'react';
import { Play, Square, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import useWorkspaceStore from '../../store/workspaceStore';
import { useTimeTracking } from '../../features/tasks/useTimeTracking';

/**
 * Timer component — can be used standalone (floating) or inline (inside a modal).
 *
 * Props:
 *   taskId    {string}  - the task to track time against
 *   taskTitle {string}  - display name for the current task
 *   inline    {boolean} - if true, renders without fixed positioning
 */
export default function Timer({ taskId, taskTitle, inline = false }) {
    const { currentWorkspace } = useWorkspaceStore();
    const { isRunning, seconds, error, startTimer, stopTimer, formatTime } = useTimeTracking();
    const [isExpanded, setIsExpanded] = useState(false);
    const [note, setNote] = useState('');
    const [isBillable, setIsBillable] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');

    const handleStart = async () => {
        if (!currentWorkspace || !taskId) return;
        try {
            await startTimer(taskId, currentWorkspace._id, { note, isBillable });
        } catch (err) {
            // error shown via hook
        }
    };

    const handleStop = async () => {
        if (!isRunning) return;
        setSaving(true);
        try {
            await stopTimer();
            setSavedMsg('Time saved!');
            setNote('');
            setTimeout(() => setSavedMsg(''), 3000);
        } catch (err) {
            // error shown via hook
        } finally {
            setSaving(false);
            setIsExpanded(false);
        }
    };

    if (!currentWorkspace) return null;

    const wrapper = inline
        ? 'w-full'
        : 'fixed bottom-6 right-24 z-40';

    return (
        <div className={wrapper}>
            <motion.div
                layout
                className="bg-card border shadow-2xl rounded-2xl overflow-hidden"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', minWidth: inline ? undefined : 220 }}
            >
                {/* Timer bar */}
                <div className="flex items-center gap-3 p-3">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        isRunning ? "bg-brand/20 text-brand animate-pulse" : "bg-secondary text-secondary-foreground"
                    )}>
                        <Clock className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1 truncate">
                            {isRunning ? (taskTitle || 'Tracking…') : 'Timer Ready'}
                        </p>
                        <p className="text-lg font-mono font-bold leading-none tracking-tight">
                            {formatTime(seconds)}
                        </p>
                    </div>

                    <div className="flex items-center gap-1 border-l pl-3" style={{ borderColor: 'var(--border)' }}>
                        {isRunning ? (
                            <button
                                onClick={handleStop}
                                disabled={saving}
                                title="Stop & Save"
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50"
                            >
                                <Square className="w-4 h-4 fill-current" />
                            </button>
                        ) : (
                            <button
                                onClick={handleStart}
                                disabled={!taskId}
                                title={taskId ? 'Start timer' : 'Open a task to start tracking'}
                                className="p-2 rounded-lg hover:bg-brand/10 text-brand transition-colors disabled:opacity-40"
                            >
                                <Play className="w-4 h-4 fill-current" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Expandable options */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t p-3 space-y-3"
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary, var(--bg-card))' }}
                        >
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Note (optional)</p>
                                <input
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="What are you working on?"
                                    className="w-full text-xs bg-transparent border rounded px-2 py-1.5 outline-none focus:border-brand transition-colors"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={isBillable}
                                    onChange={(e) => setIsBillable(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded accent-brand"
                                />
                                <span className="text-xs text-muted-foreground">Billable time</span>
                            </label>

                            {error && <p className="text-[10px] text-red-500">{error}</p>}
                            {savedMsg && <p className="text-[10px] text-green-500 font-medium">{savedMsg}</p>}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
