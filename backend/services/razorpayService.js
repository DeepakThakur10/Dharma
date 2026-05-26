import crypto from 'crypto';
import axios from 'axios';
import logger from '../utils/logger.js';

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

// Basic auth header for Razorpay API
const getAuthHeader = () => {
    const credentials = `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`;
    return {
        'Authorization': `Basic ${Buffer.from(credentials).toString('base64')}`,
        'Content-Type': 'application/json'
    };
};

// Create Razorpay Order
export const createOrder = async (orderData) => {
    try {
        const {
            amount,
            orderId,
            receipt,
            description,
            customerEmail,
            customerPhone,
            metadata = {}
        } = orderData;

        const payload = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: receipt || orderId,
            description: description || 'Premium Plan Subscription',
            customer_notify: 1,
            notes: {
                ...metadata,
                orderId
            }
        };

        logger.info(`Creating Razorpay order for: ${orderId}`);

        const response = await axios.post(
            `${RAZORPAY_API_URL}/orders`,
            payload,
            { headers: getAuthHeader() }
        );

        return {
            success: true,
            orderId: response.data.id,
            amount: response.data.amount,
            currency: response.data.currency,
            createdAt: response.data.created_at,
            data: response.data
        };
    } catch (error) {
        logger.error('Error creating Razorpay order:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.description || error.message
        };
    }
};

// Verify Razorpay Payment Signature
export const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpaySignature;
        logger.info(`Payment signature verification: ${isValid ? 'valid' : 'invalid'}`);

        return isValid;
    } catch (error) {
        logger.error('Error verifying payment signature:', error);
        return false;
    }
};

// Fetch Payment Details
export const getPaymentDetails = async (paymentId) => {
    try {
        const response = await axios.get(
            `${RAZORPAY_API_URL}/payments/${paymentId}`,
            { headers: getAuthHeader() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        logger.error('Error fetching payment details:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.description || error.message
        };
    }
};

// Fetch Order Details
export const getOrderDetails = async (orderId) => {
    try {
        const response = await axios.get(
            `${RAZORPAY_API_URL}/orders/${orderId}`,
            { headers: getAuthHeader() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        logger.error('Error fetching order details:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.description || error.message
        };
    }
};

// Initiate Refund
export const initiateRefund = async (paymentId, amount = null, notes = {}) => {
    try {
        const payload = {
            amount: amount ? Math.round(amount * 100) : undefined,
            notes
        };

        // Remove undefined fields
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        logger.info(`Initiating refund for payment: ${paymentId}`);

        const response = await axios.post(
            `${RAZORPAY_API_URL}/payments/${paymentId}/refund`,
            payload,
            { headers: getAuthHeader() }
        );

        return {
            success: true,
            refundId: response.data.id,
            data: response.data
        };
    } catch (error) {
        logger.error('Error initiating refund:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.description || error.message
        };
    }
};

// Capture Payment (for authorized payments)
export const capturePayment = async (paymentId, amount) => {
    try {
        logger.info(`Capturing payment: ${paymentId}`);

        const response = await axios.post(
            `${RAZORPAY_API_URL}/payments/${paymentId}/capture`,
            { amount: Math.round(amount * 100) },
            { headers: getAuthHeader() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        logger.error('Error capturing payment:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.description || error.message
        };
    }
};

// Create Customer
export const createCustomer = async (customerData) => {
    try {
        const {
            email,
            phone,
            name,
            gstin = null,
            notes = {}
        } = customerData;

        const payload = {
            email,
            phone,
            name,
            gstin,
            notes
        };

        logger.info(`Creating Razorpay customer: ${email}`);

        const response = await axios.post(
            `${RAZORPAY_API_URL}/customers`,
            payload,
            { headers: getAuthHeader() }
        );

        return {
            success: true,
            customerId: response.data.id,
            data: response.data
        };
    } catch (error) {
        logger.error('Error creating customer:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.description || error.message
        };
    }
};

// Fetch Refunds for Payment
export const getRefundsForPayment = async (paymentId) => {
    try {
        const response = await axios.get(
            `${RAZORPAY_API_URL}/payments/${paymentId}/refunds`,
            { headers: getAuthHeader() }
        );

        return {
            success: true,
            refunds: response.data.items || [],
            data: response.data
        };
    } catch (error) {
        logger.error('Error fetching refunds:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.description || error.message
        };
    }
};

// Webhook Verification (verify webhook signature from Razorpay)
export const verifyWebhookSignature = (body, signature, webhookSecret) => {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === signature;
        logger.info(`Webhook signature verification: ${isValid ? 'valid' : 'invalid'}`);

        return isValid;
    } catch (error) {
        logger.error('Error verifying webhook signature:', error);
        return false;
    }
};

export default {
    createOrder,
    verifyPaymentSignature,
    getPaymentDetails,
    getOrderDetails,
    initiateRefund,
    capturePayment,
    createCustomer,
    getRefundsForPayment,
    verifyWebhookSignature
};
