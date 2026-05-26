import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * @typedef {Object} InputProps
 * @property {string} [label]
 * @property {string} [error]
 * @property {string} [className]
 */

/** @type {React.ForwardRefExoticComponent<InputProps & React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>} */
const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={cn(
                    'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2',
                    error ? 'border-red-400 focus:ring-red-200' : 'focus:ring-brand/20',
                    className
                )}
                style={{
                    borderColor: error ? 'var(--danger)' : 'var(--border)',
                    color: 'var(--text)',
                    backgroundColor: 'var(--bg-card)',
                }}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
