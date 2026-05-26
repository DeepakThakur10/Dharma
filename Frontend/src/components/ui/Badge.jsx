import { cn } from '../../lib/utils';

/**
 * Badge component for tags and status
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {'default'|'success'|'warning'|'danger'|'info'|'brand'} [props.variant]
 * @param {'sm'|'md'} [props.size]
 * @param {string} [props.className]
 */
export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
    const variants = {
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
        warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
        danger: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
        info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
        brand: 'bg-brand-light text-brand',
    };

    const sizes = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-0.5 text-xs',
    };

    return (
        <span className={cn('inline-flex items-center rounded-md font-medium', variants[variant], sizes[size], className)}>
            {children}
        </span>
    );
}
