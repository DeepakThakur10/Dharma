import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
import { Sparkles } from 'lucide-react';
import { fetchAiSuggestion } from '../../features/ai/useAiChat';

/**
 * AI-powered textarea with ghost-text autocomplete.
 * Press Tab to accept suggestion, Escape to dismiss.
 * Drop-in replacement for <textarea> — works with react-hook-form via forwardRef.
 */
/**
 * @typedef {Object} AiTextareaProps
 * @property {'task' | 'project'} [fieldType]
 * @property {string} [title]
 * @property {string} [className]
 * @property {Object} [style]
 */

/** @type {React.ForwardRefExoticComponent<AiTextareaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>>} */
const AiTextarea = forwardRef(function AiTextarea(
    { fieldType = 'task', title = '', onChange, onBlur, name, className = '', style = {}, ...props },
    ref
) {
    const [value, setValue] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    // Sync external value (from react-hook-form)
    const handleChange = useCallback(
        (e) => {
            const val = e.target.value;
            setValue(val);
            setSuggestion('');

            // Call parent onChange (react-hook-form)
            if (onChange) onChange(e);

            // Debounced suggestion fetch
            clearTimeout(debounceRef.current);
            if (val.trim().length >= 8) {
                debounceRef.current = setTimeout(async () => {
                    setLoading(true);
                    const s = await fetchAiSuggestion({ text: val, fieldType, title });
                    // Only show if value hasn't changed
                    setSuggestion((prev) => s || '');
                    setLoading(false);
                }, 1000);
            }
        },
        [onChange, fieldType, title]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Tab' && suggestion) {
                e.preventDefault();
                const newVal = value + suggestion;
                setValue(newVal);
                setSuggestion('');

                // Trigger react-hook-form update
                const nativeEvent = new Event('input', { bubbles: true });
                const textarea = e.target;
                const nativeSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype,
                    'value'
                ).set;
                nativeSetter.call(textarea, newVal);
                textarea.dispatchEvent(nativeEvent);
            } else if (e.key === 'Escape' && suggestion) {
                e.preventDefault();
                setSuggestion('');
            }
        },
        [suggestion, value]
    );

    // Clean up debounce
    useEffect(() => {
        return () => clearTimeout(debounceRef.current);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            {/* Actual textarea */}
            <textarea
                ref={ref}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={(e) => {
                    setSuggestion('');
                    if (onBlur) onBlur(e);
                }}
                onKeyDown={handleKeyDown}
                className={className}
                style={{
                    ...style,
                    position: 'relative',
                    zIndex: 2,
                    background: 'transparent',
                }}
                {...props}
            />

            {/* Ghost text overlay — shows suggestion */}
            <div
                className="pointer-events-none absolute inset-0 px-3.5 py-2.5 text-sm whitespace-pre-wrap overflow-hidden"
                style={{
                    color: 'transparent',
                    zIndex: 1,
                }}
                aria-hidden="true"
            >
                {/* Invisible real text to position ghost */}
                <span style={{ visibility: 'hidden' }}>{value}</span>
                {/* Ghost suggestion */}
                {suggestion && (
                    <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                        {suggestion}
                    </span>
                )}
            </div>

            {/* Suggestion hint */}
            {(suggestion || loading) && (
                <div className="absolute bottom-1 right-2 flex items-center gap-1.5 z-10">
                    {loading ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg)', opacity: 0.8 }}>
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                            AI thinking…
                        </span>
                    ) : suggestion ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg)', opacity: 0.8 }}>
                            Tab ↹ to accept
                        </span>
                    ) : null}
                </div>
            )}
        </div>
    );
});

export default AiTextarea;
