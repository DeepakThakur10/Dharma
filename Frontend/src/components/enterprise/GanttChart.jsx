import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function GanttChart({ tasks }) {
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(addDays(today, 30));

    const days = useMemo(() => eachDayOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);

    const calculatePosition = (date) => {
        if (!date) return 0;
        const d = new Date(date);
        const diff = Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff * 40); // 40px per day
    };

    return (
        <div className="flex-1 overflow-hidden flex flex-col bg-card border rounded-xl shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Project Timeline</h3>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded hover:bg-brand-500/10"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm font-medium">{format(startDate, 'MMMM yyyy')}</span>
                    <button className="p-1.5 rounded hover:bg-brand-500/10"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="relative inline-block min-w-full">
                    {/* Header: Days */}
                    <div className="flex sticky top-0 z-10 bg-card border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="w-48 flex-shrink-0 border-r p-2 font-medium text-xs uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Tasks</div>
                        {days.map((day) => (
                            <div key={day.toString()} className={cn(
                                "w-10 h-10 flex-shrink-0 flex flex-col items-center justify-center border-r text-[10px]",
                                isSameDay(day, today) && "bg-brand/5 text-brand"
                            )} style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                <span>{format(day, 'EEE')}</span>
                                <span className="font-bold">{format(day, 'd')}</span>
                            </div>
                        ))}
                    </div>

                    {/* Task Rows */}
                    <div className="relative">
                        {tasks.map((task) => {
                            const start = calculatePosition(task.createdAt);
                            const width = task.deadline ? calculatePosition(task.deadline) - start : 120;

                            return (
                                <div key={task._id} className="flex border-b group hover:bg-brand-500/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                                    <div className="w-48 flex-shrink-0 border-r p-3 text-sm truncate" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                                        {task.title}
                                    </div>
                                    <div className="relative flex-1 h-12">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="absolute top-2 h-7 rounded-md flex items-center px-2 text-[10px] text-white font-medium shadow-sm cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                                            style={{
                                                left: `${start + 8}px`,
                                                width: `${Math.max(80, width)}px`,
                                                backgroundColor: 'var(--brand)'
                                            }}
                                        >
                                            {task.dependencies?.length > 0 && <AlertCircle className="w-3 h-3 mr-1" />}
                                            <span className="truncate">{task.status}</span>
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
