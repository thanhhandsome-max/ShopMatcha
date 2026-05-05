import { Router } from 'express';
import {
    getPaymentDetails,
    getPaymentHistory,
    initiatePayment,
    vnPayCallback
} from '../controllers/paymentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/payments/checkout
 * @desc    Initiate VNPay payment
 * @access  Public (can checkout without login)
 */
router.post('/checkout', initiatePayment);

/**
 * @route   GET /api/payments/callback
 * @desc    VNPay callback handler
 * @access  Public (VNPay will call this)
 */
router.get('/callback', vnPayCallback);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment details
 * @access  Public (but checks ownership if logged in)
 */
router.get('/:id', getPaymentDetails);

/**
 * @route   GET /api/payments
 * @desc    Get payment history for customer
 * @access  Private (requires authentication)
 */
router.get('/', authenticateToken, getPaymentHistory);

export default router;
