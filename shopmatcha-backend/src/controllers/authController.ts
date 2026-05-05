import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
    LoginRequest,
    loginUser,
    logoutUser,
    registerCustomer,
    RegisterRequest
} from '../services/authService';

/**
 * Register new customer
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, confirmPassword, fullName, phone } = req.body;
    
    // Validate required fields
    if (!email || !password || !confirmPassword || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }
    
    const registerData: RegisterRequest = {
      email,
      password,
      confirmPassword,
      fullName,
      phone: phone || ''
    };
    
    const result = await registerCustomer(registerData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Register controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
      return;
    }
    
    const loginData: LoginRequest = {
      email,
      password
    };
    
    const result = await loginUser(loginData);
    
    if (result.success) {
      // Set cookies for web clients
      res.cookie('accessToken', result.data?.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie('refreshToken', result.data?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    const result = await logoutUser(refreshToken);
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Logout controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Chưa xác thực'
      });
      return;
    }
    
    const { MaTaiKhoan } = req.user;
    
    // Get full user info from DB
    const user = await prisma.taikhoan.findUnique({
      where: { MaTaiKhoan },
      include: {
        vaitro: true,
        khachhang: true,
        nhanvien: true
      }
    });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
      return;
    }
    
    // Get customer info if exists
    let customerInfo = null;
    if (user.khachhang.length > 0) {
      customerInfo = {
        MaKH: user.khachhang[0].MaKH,
        TenKH: user.khachhang[0].TenKH,
        Email: user.khachhang[0].Email,
        SDT: user.khachhang[0].SDT
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          MaTaiKhoan: user.MaTaiKhoan,
          TenDangNhap: user.TenDangNhap,
          role: user.vaitro?.TenVaiTro || 'Khách hàng',
          TrangThai: user.TrangThai,
          customer: customerInfo
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Không tìm thấy refresh token'
      });
      return;
    }
    
    const jwt = require('jsonwebtoken');
    const { AUTH_CONFIG } = require('../config/auth.config');
    
    try {
      const payload = jwt.verify(refreshToken, AUTH_CONFIG.JWT_REFRESH_SECRET);
      
      // Generate new access token
      const { generateAccessToken } = require('../utils/tokenUtils');
      const newAccessToken = generateAccessToken(payload);
      
      // Set new access token cookie
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });
      
      res.status(200).json({
        success: true,
        message: 'Làm mới token thành công',
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      res.status(403).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn'
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}
