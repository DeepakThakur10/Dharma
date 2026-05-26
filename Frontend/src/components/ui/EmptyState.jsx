import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description = '', action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--brand-light)' }}>
                <Icon className="w-7 h-7" style={{ color: 'var(--brand)' }} />
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
            {description && <p className="text-sm max-w-xs mb-4" style={{ color: 'var(--text-muted)' }}>{description}</p>}
            {action}
        </div>
    );
}
