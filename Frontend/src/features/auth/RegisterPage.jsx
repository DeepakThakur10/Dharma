import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader2, ArrowRight } from 'lucide-react';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export default function RegisterPage() {
    const { user, register: registerUser, error, clearError } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    if (user) return <Navigate to="/dashboard" replace />;

    const onSubmit = async (data) => {
        setSubmitting(true);
        clearError();
        try {
            await registerUser(data.email, data.password, data.name);
        } catch {
            // error set in store
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-brand/30 focus:border-brand";

    return (
        <div className="min-h-screen bg-page flex">
            {/* Left — branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #ffa07a 100%)' }}>
                <div className="max-w-md text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg">D</div>
                        <span className="text-2xl font-display font-bold">Dharma</span>
                    </div>
                    <h1 className="text-4xl font-display font-bold leading-tight mb-4">Start building something great.</h1>
                    <p className="text-white/70 text-lg leading-relaxed">Create your account and start managing projects in minutes.</p>
                </div>
            </div>

            {/* Right — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--brand)' }}>D</div>
                        <span className="text-xl font-display font-bold" style={{ color: 'var(--text)' }}>Dharma</span>
                    </div>

                    <h2 className="text-2xl font-display font-bold mb-1" style={{ color: 'var(--text)' }}>Create your account</h2>
                    <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Get started for free — no credit card required</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                            <input
                                type="text"
                                {...register('name')}
                                className={inputClass}
                                style={{ borderColor: errors.name ? 'var(--danger)' : 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                placeholder="Jane Doe"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                            <input
                                type="email"
                                {...register('email')}
                                className={inputClass}
                                style={{ borderColor: errors.email ? 'var(--danger)' : 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                            <input
                                type="password"
                                {...register('password')}
                                className={inputClass}
                                style={{ borderColor: errors.password ? 'var(--danger)' : 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                            <input
                                type="password"
                                {...register('confirmPassword')}
                                className={inputClass}
                                style={{ borderColor: errors.confirmPassword ? 'var(--danger)' : 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg-card)' }}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                            style={{ backgroundColor: 'var(--brand)' }}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--brand)' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
