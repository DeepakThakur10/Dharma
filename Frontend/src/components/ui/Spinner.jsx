import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', className = '' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
    return <Loader2 className={`animate-spin ${sizes[size]} ${className}`} style={{ color: 'var(--brand)' }} />;
}

export function PageSpinner() {
    return (
        <div className="flex-1 flex items-center justify-center py-20">
            <Spinner size="lg" />
        </div>
    );
}
