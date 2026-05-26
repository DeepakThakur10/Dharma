import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import RazorpayPaymentForm from './RazorpayPaymentForm';
import { Loader2, AlertCircle } from 'lucide-react';

export const BillingPage = ({ workspaceId }) => {
    const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId);

    const { data: subscriptionData, isLoading, isError } = useQuery({
        queryKey: ['subscription', selectedWorkspace],
        queryFn: async () => {
            const response = await axiosInstance.get(`/billing/subscription/${selectedWorkspace}`);
            return response.data.data;
        },
        enabled: !!selectedWorkspace
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-red-900 dark:text-red-200">Error loading billing information</p>
                    <p className="text-sm text-red-700 dark:text-red-300">Please try again later</p>
                </div>
            </div>
        );
    }

    const currentTier = subscriptionData?.tier || 'free';
    const isSubscriptionActive = subscriptionData?.subscription?.status === 'active';

    return (
        <div className="space-y-8">
            {/* Current Subscription Status */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Current Subscription</h2>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Plan</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">{currentTier}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${isSubscriptionActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                                {subscriptionData?.subscription?.status || 'Inactive'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Renews On</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {subscriptionData?.subscription?.currentPeriodEnd
                                ? new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString()
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            {subscriptionData?.recentTransactions?.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                        {subscriptionData.recentTransactions.map(transaction => (
                            <div key={transaction._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white capitalize">{transaction.plan} Plan</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{transaction.orderId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900 dark:text-white">₹{transaction.amount}</p>
                                    <p className={`text-sm font-medium ${transaction.status === 'success'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-slate-600 dark:text-slate-400'
                                        }`}>
                                        {new Date(transaction.paymentCompletedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upgrade Section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Upgrade Your Plan</h2>
                <RazorpayPaymentForm
                    workspaceId={selectedWorkspace}
                    currentPlan={currentTier}
                    onSuccess={() => { }}
                />
            </div>
        </div>
    );
};

export default BillingPage;
