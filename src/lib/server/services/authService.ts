import bcrypt from 'bcrypt';
import { AUTH_CONFIG } from '../config/auth.config';
import prisma from '../db/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      MaTaiKhoan: string;
      TenDangNhap: string;
      role: string;
      MaKH?: string;
      TenKH?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Hash password using bcrypt (stored in web_matcha.taikhoan.MatKhau)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS);
}

/**
 * Verify password against bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const BCRYPT_HASH_RE = /^\$2[aby]?\$/;

function looksLikeBcryptHash(stored: string): boolean {
  return BCRYPT_HASH_RE.test(stored);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ số' };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt' };
  }
  
  return { valid: true, message: 'Mật khẩu hợp lệ' };
}

/**
 * Check if email already exists in taikhoan or khachhang
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const existingAccount = await prisma.taikhoan.findFirst({
    where: { TenDangNhap: email }
  });
  
  if (existingAccount) return true;
  
  const existingCustomer = await prisma.khachhang.findUnique({
    where: { Email: email }
  });
  
  return !!existingCustomer;
}

/**
 * Generate unique MaTaiKhoan
 */
async function generateMaTaiKhoan(): Promise<string> {
  const allAccounts = await prisma.taikhoan.findMany({
    select: { MaTaiKhoan: true }
  });
  
  if (allAccounts.length === 0) return 'TK001';
  
  // Extract all numbers from MaTaiKhoan (format: TK001, TK002, TK01, TK02, etc.)
  const numbers = allAccounts.map(acc => {
    const match = acc.MaTaiKhoan.match(/TK(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }).filter(n => n > 0);
  
  const maxNumber = Math.max(...numbers);
  const nextNumber = maxNumber + 1;
  
  // Use 3-digit format (TK001, TK002, etc.)
  return `TK${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Generate unique MaKH
 */
async function generateMaKH(): Promise<string> {
  const allCustomers = await prisma.khachhang.findMany({
    select: { MaKH: true }
  });
  
  if (allCustomers.length === 0) return 'KH001';
  
  // Extract all numbers from MaKH (format: KH001, KH002, KH01, KH02, etc.)
  const numbers = allCustomers.map(cust => {
    const match = cust.MaKH.match(/KH(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }).filter(n => n > 0);
  
  const maxNumber = Math.max(...numbers);
  const nextNumber = maxNumber + 1;
  
  // Use 3-digit format (KH001, KH002, etc.)
  return `KH${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Register new customer
 */
export async function registerCustomer(data: RegisterRequest): Promise<AuthResponse> {
  try {
    // Validate email
    if (!validateEmail(data.email)) {
      return { success: false, message: 'Email không hợp lệ' };
    }
    
    // Check if email already exists
    const emailExists = await checkEmailExists(data.email);
    if (emailExists) {
      return { success: false, message: 'Email đã được đăng ký' };
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message };
    }
    
    // Check password confirmation
    if (data.password !== data.confirmPassword) {
      return { success: false, message: 'Mật khẩu xác nhận không khớp' };
    }
    
    // Hash password
    const hashedPassword = await hashPassword(data.password);
    
    // Generate IDs
    const maTaiKhoan = await generateMaTaiKhoan();
    const maKH = await generateMaKH();
    
    // Use transaction to create account and customer
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.taikhoan.create({
        data: {
          MaTaiKhoan: maTaiKhoan,
          TenDangNhap: data.email,
          MatKhau: hashedPassword,
          TrangThai: 1
        },
        include: { phanquyen: { include: { vaitro: true } } }
      });

      await tx.phanquyen.create({
        data: {
          MaTK: maTaiKhoan,
          MaVaiTro: 'VT004'
        }
      });

      const customer = await tx.khachhang.create({
        data: {
          MaKH: maKH,
          TenKH: data.fullName,
          SDT: data.phone?.trim() ? data.phone.trim() : null,
          Email: data.email,
          TrangThai: 1
        }
      });

      const role = await tx.vaitro.findUnique({
        where: { MaVaiTro: 'VT004' }
      });

      return { account, customer, role };
    });
    
    // Generate tokens
    const tokenPayload = {
      MaTaiKhoan: result.account.MaTaiKhoan,
      TenDangNhap: result.account.TenDangNhap,
      MaVaiTro: 'VT004',
      role: result.role?.TenVaiTro || 'Khách hàng'
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    return {
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          MaTaiKhoan: result.account.MaTaiKhoan,
          TenDangNhap: result.account.TenDangNhap,
          role: result.role?.TenVaiTro || 'Khách hàng',
          MaKH: result.customer.MaKH,
          TenKH: result.customer.TenKH
        },
        accessToken,
        refreshToken
      }
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Lỗi hệ thống khi đăng ký' };
  }
}

/**
 * Login customer/staff
 */
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  try {
    // Find account by TenDangNhap (email)
    const account = await prisma.taikhoan.findFirst({
      where: { 
        TenDangNhap: data.email,
        TrangThai: 1
      },
      include: {
        phanquyen: {
          include: {
            vaitro: true
          }
        }
      }
    });
    
    if (!account) {
      return { success: false, message: 'Tài khoản không tồn tại' };
    }
    
    let passwordValid = await verifyPassword(data.password, account.MatKhau);

    if (!passwordValid && !looksLikeBcryptHash(account.MatKhau) && data.password === account.MatKhau) {
      const newHash = await hashPassword(data.password);
      await prisma.taikhoan.update({
        where: { MaTaiKhoan: account.MaTaiKhoan },
        data: { MatKhau: newHash }
      });
      account.MatKhau = newHash;
      passwordValid = true;
    }

    if (!passwordValid) {
      return { success: false, message: 'Mật khẩu không đúng' };
    }
    
    const customerInfo = await prisma.khachhang.findFirst({
      where: { Email: account.TenDangNhap }
    });

    const primaryPermission = account.phanquyen[0] ?? null;
    const roleName = primaryPermission?.vaitro?.TenVaiTro || 'Khách hàng';
    const roleCode = primaryPermission?.MaVaiTro || 'VT03';
    
    // Generate tokens
    const tokenPayload = {
      MaTaiKhoan: account.MaTaiKhoan,
      TenDangNhap: account.TenDangNhap,
      MaVaiTro: roleCode,
      role: roleName
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          MaTaiKhoan: account.MaTaiKhoan,
          TenDangNhap: account.TenDangNhap,
          role: roleName,
          MaKH: customerInfo?.MaKH,
          TenKH: customerInfo?.TenKH
        },
        accessToken,
        refreshToken
      }
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Lỗi hệ thống khi đăng nhập' };
  }
}

/**
 * Logout user (invalidate refresh token)
 * In a production system, you'd want to blacklist the refresh token
 */
export async function logoutUser(refreshToken: string): Promise<{ success: boolean; message: string }> {
  try {
    // In a real implementation, you'd add the refresh token to a blacklist
    // For now, we'll just return success
    return { success: true, message: 'Đăng xuất thành công' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Lỗi khi đăng xuất' };
  }
}
