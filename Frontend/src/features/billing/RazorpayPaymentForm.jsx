import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import toast from 'react-hot-toast';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const PaymentPlans = [
    {
        name: 'Pro',
        value: 'pro',
        monthlyPrice: 499,
        annualPrice: 4990,
        features: [
            'Up to 50 projects',
            '10 team members',
            'AI-powered subtask generation',
            'Advanced analytics',
            'Custom fields',
            'Email support'
        ]
    },
    {
        name: 'Enterprise',
        value: 'enterprise',
        monthlyPrice: 2499,
        annualPrice: 24990,
        features: [
            'Unlimited projects',
            'Unlimited team members',
            'AI-powered workflows',
            'Advanced analytics',
            'Custom integrations',
            'Priority support',
            'SSO & advanced security'
        ]
    }
];

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

export const RazorpayPaymentForm = ({ workspaceId, currentPlan, onSuccess }) => {
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [duration, setDuration] = useState('monthly');
    const [formSubmitted, setFormSubmitted] = useState(false);

    const initiatePaymentMutation = useMutation({
        mutationFn: async (paymentData) => {
            const response = await axiosInstance.post('/billing/razorpay/initiate', paymentData);
            return response.data;
        },
        onSuccess: async (data) => {
            if (data.success) {
                // Load Razorpay script
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    toast.error('Failed to load Razorpay. Please try again.');
                    return;
                }

                // Open Razorpay checkout
                const options = {
                    key: data.data.keyId,
                    amount: data.data.amount * 100, // Amount in paise
                    currency: data.data.currency,
                    name: 'Dharma',
                    description: `${selectedPlan.toUpperCase()} Plan - ${duration}`,
                    order_id: data.data.orderId,
                    prefill: {
                        name: data.data.userName,
                        email: data.data.userEmail
                    },
                    handler: async (response) => {
                        try {
                            // Verify payment on backend
                            const verifyResponse = await axiosInstance.post('/billing/razorpay/callback', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyResponse.data.success) {
                                toast.success('Payment successful! Your plan has been upgraded.');
                                onSuccess?.(verifyResponse.data.data);
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
                        }
                    },
                    theme: {
                        color: '#3b82f6'
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        }
    });

    const handlePaymentInitiate = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        const paymentData = {
            workspaceId,
            plan: selectedPlan,
            duration
        };

        initiatePaymentMutation.mutate(paymentData);
    };

    const selectedPlanDetails = PaymentPlans.find(p => p.value === selectedPlan);
    const amount = duration === 'monthly' ? selectedPlanDetails?.monthlyPrice : selectedPlanDetails?.annualPrice;
    const savings = duration === 'annual' ? ((selectedPlanDetails?.monthlyPrice * 12) - selectedPlanDetails?.annualPrice) : 0;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Upgrade Your Plan</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Choose the perfect plan for your team</p>

                {/* Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {PaymentPlans.map(plan => (
                        <div
                            key={plan.value}
                            onClick={() => setSelectedPlan(plan.value)}
                            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedPlan === plan.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                }`}
                        >
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                            <div className="mt-2">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                    ₹{duration === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                                </span>
                                <span className="text-slate-600 dark:text-slate-400">
                                    {duration === 'monthly' ? '/month' : '/year'}
                                </span>
                            </div>
                            {currentPlan === plan.value && (
                                <div className="flex items-center gap-2 mt-3 text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Current Plan</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Duration Toggle */}
                <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Billing Duration</p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setDuration('monthly')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                duration === 'monthly'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            onClick={() => setDuration('annual')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors relative ${
                                duration === 'annual'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                            }`}
                        >
                            Annual
                            {savings > 0 && (
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    Save ₹{savings}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Plan Features */}
                {selectedPlanDetails && (
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Plan Features</p>
                        <ul className="space-y-2">
                            {selectedPlanDetails.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Payment Form */}
                <form onSubmit={handlePaymentInitiate} className="space-y-4">
                    {/* Amount Display */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">Total Amount</span>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{amount}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                            You will be redirected to Razorpay secure payment gateway
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={initiatePaymentMutation.isPending || currentPlan === selectedPlan}
                        className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                            initiatePaymentMutation.isPending || currentPlan === selectedPlan
                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {initiatePaymentMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : currentPlan === selectedPlan ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Current Plan
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" />
                                Proceed to Razorpay Payment
                            </>
                        )}
                    </button>

                    {initiatePaymentMutation.isError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-900 dark:text-red-200">Payment Error</p>
                                <p className="text-xs text-red-700 dark:text-red-300">{initiatePaymentMutation.error?.response?.data?.message}</p>
                            </div>
                        </div>
                    )}
                </form>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-300">
                        ✓ Secure payment processing by Razorpay | All transactions are encrypted and safe | Money-back guarantee if not satisfied
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RazorpayPaymentForm;
