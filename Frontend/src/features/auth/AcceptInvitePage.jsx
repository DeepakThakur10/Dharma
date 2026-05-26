import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAcceptInvite } from '../projects/useInvite';
import { useAuthStore } from '../../store/authStore';
import { PageSpinner } from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { CheckCircle2, XCircle, LogIn } from 'lucide-react';

export default function AcceptInvitePage() {
    const [searchParams] = useSearchParams();
    const invitationId = searchParams.get('id');
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const navigate = useNavigate();
    const acceptMutation = useAcceptInvite();
    const [status, setStatus] = useState('idle'); // idle | accepting | success | error

    useEffect(() => {
        if (!invitationId || !user || status !== 'idle') return;

        setStatus('accepting');
        acceptMutation.mutateAsync(invitationId)
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [invitationId, user, status]);

    if (loading) return <PageSpinner />;

    // Not logged in — prompt to login
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #ff6b35, #ffa07a)' }}>
                        M
                    </div>
                    <h2 className="text-xl font-display font-bold mb-2" style={{ color: 'var(--text)' }}>You've Been Invited!</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                        Sign in or create an account to accept this invitation.
                    </p>
                    <Link to={`/login?redirect=/invite/accept?id=${invitationId}`}>
                        <Button>
                            <LogIn className="w-4 h-4" /> Sign In to Accept
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="text-center max-w-sm">
                {status === 'accepting' && <PageSpinner />}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-display font-bold mb-2" style={{ color: 'var(--text)' }}>You're In!</h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            You've been added to the project. Head to the dashboard to get started.
                        </p>
                        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-display font-bold mb-2" style={{ color: 'var(--text)' }}>Something Went Wrong</h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            The invitation may have expired, already been accepted, or is for a different email.
                        </p>
                        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                    </>
                )}
            </div>
        </div>
    );
}
