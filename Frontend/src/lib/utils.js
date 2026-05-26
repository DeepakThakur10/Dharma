import { clsx } from 'clsx';
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';

/** Merge class names — shorthand for clsx */
export function cn(...inputs) {
    return clsx(inputs);
}

/** Format Firestore timestamp or Date to readable string */
export function formatDate(date) {
    if (!date) return '';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return format(d, 'MMM d, yyyy');
}

/** Relative time (e.g., "2 hours ago") */
export function timeAgo(date) {
    if (!date) return '';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(d, { addSuffix: true });
}

/** Check if a deadline is overdue */
export function isOverdue(deadline) {
    if (!deadline) return false;
    const d = deadline?.toDate ? deadline.toDate() : new Date(deadline);
    return isBefore(d, new Date());
}

/** Check if deadline is within next N days */
export function isDueWithin(deadline, days = 7) {
    if (!deadline) return false;
    const d = deadline?.toDate ? deadline.toDate() : new Date(deadline);
    const now = new Date();
    return isAfter(d, now) && isBefore(d, addDays(now, days));
}

/** Priority color map */
export const priorityConfig = {
    critical: { label: 'Critical', color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30', dot: 'bg-rose-500' },
    high: { label: 'High', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30', dot: 'bg-red-500' },
    medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30', dot: 'bg-amber-500' },
    low: { label: 'Low', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30', dot: 'bg-emerald-500' },
};

/** Status color map */
export const statusConfig = {
    'backlog': { label: 'Backlog', color: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800' },
    'todo': { label: 'To Do', color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30' },
    'in-progress': { label: 'In Progress', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
    'testing': { label: 'Testing', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
    'done': { label: 'Done', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' },
};
