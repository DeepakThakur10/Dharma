import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'text-white hover:opacity-90',
    secondary: 'border hover:opacity-80',
    ghost: 'hover:opacity-80',
    danger: 'text-white bg-red-500 hover:bg-red-600',
};

/**
 * @typedef {Object} ButtonProps
 * @property {React.ReactNode} children
 * @property {'primary' | 'secondary' | 'ghost' | 'danger'} [variant]
 * @property {'sm' | 'md' | 'lg'} [size]
 * @property {boolean} [loading]
 * @property {string} [className]
 * @property {boolean} [disabled]
 */

/** @type {React.FC<ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>} */
export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    className = '',
    disabled = false,
    ...props
}) {
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-sm',
    };

    return (
        <button
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] interactive',
                sizes[size],
                variants[variant],
                variant === 'primary' && 'shadow-sm',
                className
            )}
            style={{
                backgroundColor: variant === 'primary' ? 'var(--brand)' : variant === 'secondary' ? 'var(--bg-card)' : variant === 'danger' ? undefined : 'transparent',
                borderColor: variant === 'secondary' ? 'var(--border)' : undefined,
                color: variant === 'secondary' ? 'var(--text)' : variant === 'ghost' ? 'var(--text-secondary)' : undefined,
            }}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
