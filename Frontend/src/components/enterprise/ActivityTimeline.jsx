import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PlusCircle,
    RefreshCw,
    Trash2,
    CheckCircle2,
    UserPlus,
    Settings
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

const ICONS = {
    TASK_CREATED: { icon: PlusCircle, color: '#40c057' },
    TASK_UPDATED: { icon: RefreshCw, color: '#339af0' },
    TASK_DELETED: { icon: Trash2, color: '#fa5252' },
    STATUS_CHANGED: { icon: CheckCircle2, color: '#40c057' },
    MEMBER_ADDED: { icon: UserPlus, color: '#ff6b35' },
    WORKSPACE_UPDATED: { icon: Settings, color: '#ff6b35' },
};

export default function ActivityTimeline({ logs }) {
    const [filter, setFilter] = useState('ALL');

    const filteredLogs = logs?.filter(log => filter === 'ALL' || log.actionType === filter) || [];

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--text-muted)] text-sm">No activity recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['ALL', ...Object.keys(ICONS)].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`text-[10px] px-3 py-1 rounded-full border transition-all flex-shrink-0 font-bold ${filter === type
                            ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                            : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--brand)]'
                            }`}
                    >
                        {type === 'ALL' ? 'All Activity' : type.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            <div className="relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-[var(--border)] before:h-full pt-2">
                {filteredLogs.map((log, index) => {
                    const config = ICONS[log.actionType] || { icon: Settings, color: '#888' };
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={log._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex gap-4 items-start pl-12"
                        >
                            <div
                                className="absolute left-0 w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center z-10"
                                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                            >
                                <Icon className="w-5 h-5" style={{ color: config.color }} />
                            </div>
                            <div className="flex-1">
                                <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] hover:border-[var(--brand)] transition-colors">
                                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                                        <span className="font-bold">{log.userId?.name || 'Unknown User'}</span>
                                        {' '}
                                        <span className="text-[var(--text-muted)]">
                                            {log.actionType.toLowerCase().replace(/_/g, ' ')}
                                        </span>
                                        {' '}
                                        <span className="font-bold">{log.metadata?.title || ''}</span>
                                    </p>
                                    {log.metadata?.from && log.metadata?.to && (
                                        <p className="text-xs mt-1 text-[var(--text-muted)]">
                                            Changed from <span className="text-[var(--brand)]">{log.metadata.from}</span> to <span className="text-[var(--brand)]">{log.metadata.to}</span>
                                        </p>
                                    )}
                                    <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                                        {formatDate(log.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
