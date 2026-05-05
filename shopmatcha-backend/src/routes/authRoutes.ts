import { Router } from 'express';
import {
    getCurrentUser,
    login,
    logout,
    refreshToken,
    register
} from '../controllers/authController';
import {
    authenticateToken
} from '../middleware/authMiddleware';
import {
    authRateLimit
} from '../middleware/rateLimitMiddleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new customer
 * @access  Public
 */
router.post('/register', authRateLimit, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (customer/staff/admin)
 * @access  Public
 */
router.post('/login', authRateLimit, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private (requires authentication)
 */
router.get('/me', authenticateToken, getCurrentUser);

export default router;
