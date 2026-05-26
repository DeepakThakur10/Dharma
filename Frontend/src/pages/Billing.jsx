import { useState } from 'react';
import { CreditCard, Check, Zap, Rocket, Building, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useWorkspaceStore from '../store/workspaceStore';
import { cn } from '../lib/utils';
import api from '../lib/axios';
import Header from '../components/layout/Header';

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '0',
        monthlyAmount: 0,
        annualAmount: 0,
        features: ['Up to 5 projects', 'Basic AI features', '3 team members', 'Community support'],
        icon: Zap,
        color: 'gray'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '499',
        monthlyAmount: 499,
        annualAmount: 4990,
        features: ['Up to 50 projects', 'Advanced AI features', '10 team members', 'Custom fields', 'Email support'],
        icon: Rocket,
        color: 'brand',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '2499',
        monthlyAmount: 2499,
        annualAmount: 24990,
        features: ['Unlimited projects', 'Advanced AI workflows', 'Unlimited team members', 'Custom integrations', 'Priority support', 'SSO & advanced security'],
        icon: Building,
        color: 'purple'
    }
];

export default function Billing() {
    const { currentWorkspace } = useWorkspaceStore();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async (planId) => {
        if (planId === 'free') {
            toast.success('You are on the free plan');
            return;
        }

        setLoading(true);
        try {
            // Initiate Razorpay payment
            const { data } = await api.post('/api/billing/razorpay/initiate', {
                workspaceId: currentWorkspace._id,
                plan: planId,
                duration: 'monthly'
            });

            if (data.success) {
                // Load Razorpay script
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    toast.error('Failed to load Razorpay. Please try again.');
                    setLoading(false);
                    return;
                }

                // Open Razorpay checkout
                const options = {
                    key: data.data.keyId,
                    amount: data.data.amount * 100, // Amount in paise
                    currency: data.data.currency,
                    name: 'Dharma',
                    description: `${planId.toUpperCase()} Plan - Monthly`,
                    order_id: data.data.orderId,
                    prefill: {
                        name: data.data.userName,
                        email: data.data.userEmail
                    },
                    handler: async (response) => {
                        try {
                            // Verify payment on backend
                            const verifyResponse = await api.post('/api/billing/razorpay/callback', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyResponse.data.success) {
                                toast.success('Payment successful! Your plan has been upgraded.');
                                // Refresh the page to update the subscription status
                                window.location.reload();
                            } else {
                                toast.error('Payment verification failed.');
                            }
                        } catch (error) {
                            toast.error('Payment verification failed. Please contact support.');
                            console.error('Verification error:', error);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            toast.info('Payment cancelled');
                            setLoading(false);
                        }
                    },
                    theme: {
                        color: '#3b82f6'
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            }
        } catch (error) {
            console.error('Billing error:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-page">
            <Header
                title="Plans & Billing"
                subtitle={`Manage subscription for ${currentWorkspace?.name}`}
            />

            <div className="p-6 space-y-8">
                {/* Current Plan Card */}
                <div className="bg-card border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Plan</p>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                                {currentWorkspace?.settings?.tier?.toUpperCase() || 'FREE'}
                            </h2>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">
                            View Invoices
                        </button>
                        <button className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-brand/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                            Manage Payment Method
                        </button>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                "relative flex flex-col bg-card border rounded-2xl p-6 transition-all duration-300",
                                plan.popular ? "shadow-2xl scale-105 z-10" : "shadow-sm"
                            )}
                            style={{
                                borderColor: plan.popular ? 'var(--brand)' : 'var(--border)',
                                backgroundColor: 'var(--bg-card)'
                            }}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-brand text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <plan.icon className={cn("w-8 h-8 mb-4", plan.popular ? "text-brand" : "text-muted-foreground")} />
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>₹{plan.price}</span>
                                    <span className="text-sm text-muted-foreground">{plan.id === 'free' ? '' : '/month'}</span>
                                </div>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        <Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={currentWorkspace?.settings?.tier === plan.id || loading}
                                onClick={() => handleUpgrade(plan.id)}
                                className={cn(
                                    "w-full py-3 rounded-xl text-sm font-bold transition-all",
                                    plan.popular
                                        ? "bg-brand text-white shadow-lg shadow-brand/20 hover:opacity-90"
                                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                                    currentWorkspace?.settings?.tier === plan.id && "bg-green-500 text-white cursor-default hover:opacity-100",
                                    loading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {currentWorkspace?.settings?.tier === plan.id ? 'Active Plan' : loading ? 'Processing...' : `Get ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
