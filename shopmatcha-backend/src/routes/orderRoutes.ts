import { Router } from 'express';
import {
    createOrderHandler,
    getCustomerOrdersHandler,
    getOrderHandler
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create new order from cart
 * @access  Public (can create order without login)
 */
router.post('/', createOrderHandler);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Public (but checks ownership if logged in)
 */
router.get('/:id', getOrderHandler);

/**
 * @route   GET /api/orders
 * @desc    Get customer's orders (requires authentication)
 * @access  Private
 */
router.get('/', authenticateToken, getCustomerOrdersHandler);

export default router;
