import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
    initiateRazorpayPayment,
    handleRazorpayCallback,
    verifyRazorpayTransaction,
    getPaymentStatus,
    getSubscriptionStatus,
    initiateRefund,
    createCheckoutSession,
    handleStripeWebhook
} from '../controllers/billingController.js';
import { publicApiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Razorpay Payment Routes
router.post('/razorpay/initiate', protect, initiateRazorpayPayment);
router.post('/razorpay/callback', handleRazorpayCallback);
router.get('/razorpay/verify/:razorpayOrderId', protect, verifyRazorpayTransaction);
router.get('/payment/:transactionId', protect, getPaymentStatus);
router.post('/refund', protect, initiateRefund);

// Subscription Routes
router.get('/subscription/:workspaceId', protect, getSubscriptionStatus);

// Legacy Stripe routes (deprecated)
router.post('/checkout', protect, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Public API Example with Rate Limiting
router.get('/public/data', publicApiLimiter, (req, res) => {
    res.json({ message: 'Secure public data accessed' });
});

export default router;
