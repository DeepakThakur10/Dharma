import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        required: true
    },
    planDuration: {
        type: String,
        enum: ['monthly', 'annual'],
        default: 'monthly'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
        type: String,
        enum: ['pending', 'initiated', 'success', 'failed', 'cancelled', 'processing'],
        default: 'pending'
    },
    transactionDetails: {
        status: String,
        method: String,
        amount: Number,
        currency: String,
        description: String,
        timestamp: Date
    },
    metadata: {
        type: Map,
        of: String
    },
    failureReason: String,
    retryCount: {
        type: Number,
        default: 0
    },
    paymentInitiatedAt: Date,
    paymentCompletedAt: Date
}, { timestamps: true });

// Index for faster queries
paymentTransactionSchema.index({ workspace: 1, status: 1 });
paymentTransactionSchema.index({ user: 1, createdAt: -1 });

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

export default PaymentTransaction;
