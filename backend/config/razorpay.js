// Razorpay Configuration
export const razorpayConfig = {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    
    // API base URL
    apiUrl: 'https://api.razorpay.com/v1',
    
    // Payment plans
    plans: {
        free: { amount: 0, duration: 'monthly' },
        pro: { 
            monthly: { amount: 499, duration: 'monthly', displayName: 'Pro (Monthly)' },
            annual: { amount: 4990, duration: 'annual', displayName: 'Pro (Annual)' }
        },
        enterprise: { 
            monthly: { amount: 2499, duration: 'monthly', displayName: 'Enterprise (Monthly)' },
            annual: { amount: 24990, duration: 'annual', displayName: 'Enterprise (Annual)' }
        }
    },
    
    // Currency
    currency: 'INR'
};

export default razorpayConfig;
