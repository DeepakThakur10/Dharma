import { useState, useEffect } from 'react';
import { Clock, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import useWorkspaceStore from '../store/workspaceStore';
import { useTimeTracking } from '../features/tasks/useTimeTracking';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatSeconds(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

export default function TimeReportPage() {
    const { currentWorkspace } = useWorkspaceStore();
    const { fetchReport } = useTimeTracking();
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentWorkspace?._id) return;
        setLoading(true);
        fetchReport(currentWorkspace._id)
            .then(setReport)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [currentWorkspace?._id]);

    // Build a per-day summary for the bar chart
    // report entries: { _id: { day: 1-7, isBillable: bool }, totalDuration: secs }
    const dayMap = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, billable: 0, nonBillable: 0 }));
    report.forEach(({ _id, totalDuration }) => {
        const idx = (_id.day || 1) - 1;
        if (_id.isBillable) dayMap[idx].billable += totalDuration;
        else dayMap[idx].nonBillable += totalDuration;
    });

    const totalBillable = dayMap.reduce((s, d) => s + d.billable, 0);
    const totalNonBillable = dayMap.reduce((s, d) => s + d.nonBillable, 0);
    const totalTime = totalBillable + totalNonBillable;
    const maxDuration = Math.max(...dayMap.map((d) => d.billable + d.nonBillable), 1);

    const statCards = [
        { label: 'Total This Week', value: formatSeconds(totalTime), icon: Clock, color: 'from-brand/20 to-brand/5', iconColor: 'text-brand' },
        { label: 'Billable Hours', value: formatSeconds(totalBillable), icon: DollarSign, color: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-500' },
        { label: 'Non-Billable', value: formatSeconds(totalNonBillable), icon: TrendingUp, color: 'from-orange-500/20 to-orange-500/5', iconColor: 'text-orange-500' },
        { label: 'Days Tracked', value: dayMap.filter((d) => d.billable + d.nonBillable > 0).length, icon: Calendar, color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-500' },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Time Report</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Weekly summary for <strong>{currentWorkspace?.name || '…'}</strong>
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className={`rounded-2xl p-4 border bg-gradient-to-br ${card.color}`}
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white/10 ${card.iconColor}`}>
                            <card.icon className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold font-mono">{card.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Bar Chart */}
            <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <h2 className="font-semibold mb-6">Hours per Day</h2>

                {loading && (
                    <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                        Loading report…
                    </div>
                )}
                {error && (
                    <div className="h-40 flex items-center justify-center text-sm text-red-500">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="flex items-end gap-3 h-40">
                        {dayMap.map((d, i) => {
                            const total = d.billable + d.nonBillable;
                            const heightPct = total > 0 ? (total / maxDuration) * 100 : 0;
                            const billablePct = total > 0 ? (d.billable / total) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <p className="text-[10px] font-mono text-muted-foreground">{total > 0 ? formatSeconds(total) : ''}</p>
                                    <div className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse" style={{ height: `${Math.max(heightPct, 2)}%`, minHeight: total > 0 ? 8 : 2, maxHeight: '100%', backgroundColor: 'var(--border)' }}>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${billablePct}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.05 }}
                                            className="w-full bg-brand"
                                        />
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${100 - billablePct}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.05 }}
                                            className="w-full bg-orange-400/60"
                                        />
                                    </div>
                                    <p className="text-[11px] font-medium text-muted-foreground">{DAY_NAMES[i]}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-brand" />
                        <span className="text-xs text-muted-foreground">Billable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-orange-400/60" />
                        <span className="text-xs text-muted-foreground">Non-billable</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
