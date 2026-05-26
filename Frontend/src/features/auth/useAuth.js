import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

/** Hook to initialize Firebase auth listener on mount. Call once in App root. */
export function useAuth() {
    const init = useAuthStore((s) => s.init);
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);

    useEffect(() => {
        init();
    }, [init]);

    return { user, loading };
}
