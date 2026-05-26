import asyncHandler from 'express-async-handler';
import Workspace from '../models/Workspace.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import User from '../models/User.js';
import razorpayService from '../services/razorpayService.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

// Helper function to generate unique order ID
const generateOrderId = (workspaceId) => {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `ORD-${workspaceId.substr(-6)}-${timestamp}-${random}`;
};

// @desc    Initiate Razorpay payment
// @route   POST /api/billing/razorpay/initiate
export const initiateRazorpayPayment = asyncHandler(async (req, res) => {
    const { workspaceId, plan, duration = 'monthly' } = req.body;
    const userId = req.user.id;

    // Validation
    if (!workspaceId || !plan) {
        res.status(400);
        throw new Error('Workspace ID and plan are required');
    }

    const validPlans = ['pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
        res.status(400);
        throw new Error('Invalid plan');
    }

    // Verify workspace ownership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    if (workspace.owner.toString() !== userId && !workspace.members.some(m => m.user.toString() === userId && m.role === 'admin')) {
        res.status(403);
        throw new Error('Not authorized to update billing for this workspace');
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Determine amount based on plan
    const planAmount = {
        pro: duration === 'annual' ? 4990 : 499,
        enterprise: duration === 'annual' ? 24990 : 2499
    }[plan];

    // Generate order ID
    const orderId = generateOrderId(workspaceId);

    try {
        // Create Razorpay order
        const razorpayOrder = await razorpayService.createOrder({
            amount: planAmount,
            orderId,
            receipt: orderId,
            description: `${plan.toUpperCase()} Plan - ${duration} subscription`,
            customerEmail: user.email,
            customerPhone: user.phone || '9999999999',
            metadata: {
                workspaceId,
                plan,
                duration,
                userName: user.name
            }
        });

        if (!razorpayOrder.success) {
            throw new Error(razorpayOrder.error || 'Failed to create order');
        }

        // Create payment transaction record
        const paymentTransaction = await PaymentTransaction.create({
            workspace: workspaceId,
            user: userId,
            orderId,
            amount: planAmount,
            currency: 'INR',
            plan,
            planDuration: duration,
            status: 'initiated',
            razorpayOrderId: razorpayOrder.orderId,
            paymentInitiatedAt: new Date(),
            metadata: new Map([
                ['orderId', orderId],
                ['keyId', process.env.RAZORPAY_KEY_ID]
            ])
        });

        res.json({
            success: true,
            message: 'Payment order created successfully',
            data: {
                transactionId: paymentTransaction._id,
                orderId: razorpayOrder.orderId,
                amount: planAmount,
                currency: 'INR',
                keyId: process.env.RAZORPAY_KEY_ID,
                userEmail: user.email,
                userName: user.name
            }
        });
    } catch (error) {
        logger.error('Error initiating Razorpay payment:', error);
        throw error;
    }
});

// @desc    Handle Razorpay payment callback
// @route   POST /api/billing/razorpay/callback
export const handleRazorpayCallback = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
    } = req.body;

    logger.info('Received Razorpay callback:', { razorpayOrderId, razorpayPaymentId });

    // Verify signature
    const isValidSignature = razorpayService.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    );

    if (!isValidSignature) {
        logger.warn('Invalid signature for order:', razorpayOrderId);
        return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    try {
        // Find payment transaction
        const paymentTransaction = await PaymentTransaction.findOne({ razorpayOrderId });
        if (!paymentTransaction) {
            res.status(404);
            throw new Error('Payment transaction not found');
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);

        if (!paymentDetails.success) {
            throw new Error('Failed to fetch payment details');
        }

        const payment = paymentDetails.data;
        const isPaymentSuccessful = payment.status === 'captured' || payment.status === 'authorized';

        // Update payment transaction
        const updatedTransaction = await PaymentTransaction.findByIdAndUpdate(
            paymentTransaction._id,
            {
                status: isPaymentSuccessful ? 'success' : 'failed',
                razorpayPaymentId,
                razorpaySignature,
                transactionDetails: {
                    status: payment.status,
                    method: payment.method,
                    amount: payment.amount,
                    currency: payment.currency,
                    description: payment.description,
                    timestamp: new Date(payment.created_at * 1000)
                },
                paymentCompletedAt: isPaymentSuccessful ? new Date() : null
            },
            { new: true }
        );

        if (isPaymentSuccessful) {
            // Update workspace subscription
            await Workspace.findByIdAndUpdate(
                paymentTransaction.workspace,
                {
                    'subscription.razorpayCustomerId': razorpayPaymentId,
                    'subscription.status': 'active',
                    'subscription.currentPeriodEnd': calculatePeriodEnd(paymentTransaction.planDuration),
                    'settings.tier': paymentTransaction.plan
                }
            );

            logger.info(`Payment successful for order: ${razorpayOrderId}, workspace: ${paymentTransaction.workspace}`);
            return res.json({
                success: true,
                message: 'Payment successful',
                data: {
                    transactionId: updatedTransaction._id,
                    orderId: razorpayOrderId,
                    status: 'success'
                }
            });
        } else {
            logger.warn(`Payment failed for order: ${razorpayOrderId}, status: ${payment.status}`);
            return res.status(400).json({
                success: false,
                message: 'Payment failed',
                status: payment.status
            });
        }
    } catch (error) {
        logger.error('Error handling Razorpay callback:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Verify transaction status
// @route   GET /api/billing/razorpay/verify/:razorpayOrderId
export const verifyRazorpayTransaction = asyncHandler(async (req, res) => {
    const { razorpayOrderId } = req.params;

    const paymentTransaction = await PaymentTransaction.findOne({ razorpayOrderId });
    if (!paymentTransaction) {
        res.status(404);
        throw new Error('Payment transaction not found');
    }

    // Verify with Razorpay
    const orderDetails = await razorpayService.getOrderDetails(razorpayOrderId);

    if (!orderDetails.success) {
        throw new Error(orderDetails.error || 'Failed to verify transaction');
    }

    const order = orderDetails.data;
    const isPaymentCaptured = order.status === 'paid';

    if (isPaymentCaptured && paymentTransaction.status !== 'success') {
        // Update transaction status
        await PaymentTransaction.findByIdAndUpdate(paymentTransaction._id, {
            status: 'success',
            paymentCompletedAt: new Date()
        });

        // Update workspace subscription
        await Workspace.findByIdAndUpdate(paymentTransaction.workspace, {
            'subscription.status': 'active',
            'subscription.currentPeriodEnd': calculatePeriodEnd(paymentTransaction.planDuration),
            'settings.tier': paymentTransaction.plan
        });
    }

    res.json({
        success: true,
        status: isPaymentCaptured ? 'success' : order.status,
        data: {
            ...paymentTransaction.toObject(),
            razorpayStatus: order.status,
            razorpayData: order
        }
    });
});

// @desc    Get payment status
// @route   GET /api/billing/paytm/status/:transactionId
export const getPaymentStatus = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const paymentTransaction = await PaymentTransaction.findById(transactionId);
    if (!paymentTransaction) {
        res.status(404);
        throw new Error('Payment transaction not found');
    }

    res.json({
        success: true,
        data: paymentTransaction
    });
});

// @desc    Get subscription status
// @route   GET /api/billing/subscription/:workspaceId
export const getSubscriptionStatus = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
    }

    const transactions = await PaymentTransaction.find({
        workspace: workspace._id,
        status: 'success'
    }).sort({ paymentCompletedAt: -1 }).limit(5);

    res.json({
        success: true,
        data: {
            subscription: workspace.subscription,
            tier: workspace.settings.tier,
            recentTransactions: transactions
        }
    });
});

// @desc    Initiate refund
// @route   POST /api/billing/paytm/refund
export const initiateRefund = asyncHandler(async (req, res) => {
    const { transactionId, reason } = req.body;
    const userId = req.user.id;

    const paymentTransaction = await PaymentTransaction.findById(transactionId);
    if (!paymentTransaction) {
        res.status(404);
        throw new Error('Payment transaction not found');
    }

    // Verify authorization
    if (paymentTransaction.user.toString() !== userId) {
        res.status(403);
        throw new Error('Not authorized to refund this transaction');
    }

    if (paymentTransaction.status !== 'success') {
        res.status(400);
        throw new Error('Can only refund successful transactions');
    }

    try {
        const refundResult = await paytmService.initiateRefund(
            paymentTransaction.orderId,
            paymentTransaction.paytmTransactionId,
            paymentTransaction.amount
        );

        if (refundResult.success) {
            await PaymentTransaction.findByIdAndUpdate(transactionId, {
                status: 'cancelled',
                metadata: new Map([['refundReason', reason || 'User requested']])
            });

            res.json({
                success: true,
                message: 'Refund initiated successfully',
                data: refundResult.data
            });
        } else {
            throw new Error(refundResult.error || 'Refund initiation failed');
        }
    } catch (error) {
        logger.error('Error initiating refund:', error);
        throw error;
    }
});

// Helper function to calculate period end date
function calculatePeriodEnd(duration) {
    const now = new Date();
    if (duration === 'annual') {
        now.setFullYear(now.getFullYear() + 1);
    } else {
        now.setMonth(now.getMonth() + 1);
    }
    return now;
}

// Legacy Stripe methods (deprecated)
export const createCheckoutSession = asyncHandler(async (req, res) => {
    res.status(501).json({ 
        message: 'Stripe integration has been replaced with Razorpay. Use /razorpay/initiate endpoint instead.' 
    });
});

// Legacy Stripe webhook handler
export const handleStripeWebhook = asyncHandler(async (req, res) => {
    res.status(501).json({ 
        message: 'Stripe integration has been replaced with Razorpay.' 
    });
});
