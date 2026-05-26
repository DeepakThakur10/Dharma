import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }) {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);

    if (loading) {
        return (
            <div className="min-h-screen bg-page flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand" style={{ color: 'var(--brand)' }} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
