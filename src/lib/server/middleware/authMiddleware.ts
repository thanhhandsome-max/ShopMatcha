import { NextFunction, Request, Response } from 'express';
import prisma from '../db/prisma';
import { verifyAccessToken } from '../utils/tokenUtils';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        MaTaiKhoan: string;
        TenDangNhap: string;
        MaVaiTro: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Get token from Authorization header or cookies
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  
  // If no token in header, check cookies
  const cookieToken = req.cookies?.accessToken;
  const finalToken = token || cookieToken;

  if (!finalToken) {
    res.status(401).json({ 
      success: false, 
      message: 'Không tìm thấy token xác thực' 
    });
    return;
  }

  try {
    const payload = verifyAccessToken(finalToken);
    
    if (!payload) {
      res.status(403).json({ 
        success: false, 
        message: 'Token không hợp lệ hoặc đã hết hạn' 
      });
      return;
    }

    // Verify user still exists and is active
    const user = await prisma.taikhoan.findUnique({
      where: { MaTaiKhoan: payload.MaTaiKhoan }
    });

    if (!user || user.TrangThai !== 1) {
      res.status(403).json({ 
        success: false, 
        message: 'Tài khoản không tồn tại hoặc đã bị khóa' 
      });
      return;
    }

    // Attach user info to request
    req.user = {
      MaTaiKhoan: user.MaTaiKhoan,
      TenDangNhap: user.TenDangNhap,
      MaVaiTro: payload.MaVaiTro,
      role: payload.role || 'Khách hàng'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực' 
    });
  }
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'Chưa xác thực' 
    });
    return;
  }

  if (req.user.role !== 'Admin') {
    res.status(403).json({ 
      success: false, 
      message: 'Không có quyền truy cập' 
    });
    return;
  }

  next();
}

/**
 * Middleware to check if user is staff or admin
 */
export function requireStaffOrAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'Chưa xác thực' 
    });
    return;
  }

  if (req.user.role !== 'Admin' && req.user.role !== 'Nhân viên') {
    res.status(403).json({ 
      success: false, 
      message: 'Không có quyền truy cập' 
    });
    return;
  }

  next();
}
