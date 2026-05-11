import jwt, { SignOptions } from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth.config';

export interface TokenPayload {
  MaTaiKhoan: string;
  TenDangNhap: string;
  MaVaiTro: string;
  role: string;
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: AUTH_CONFIG.JWT_EXPIRE as any
  };
  return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, options);
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: AUTH_CONFIG.JWT_REFRESH_EXPIRE as any
  };
  return jwt.sign(payload, AUTH_CONFIG.JWT_REFRESH_SECRET, options);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, AUTH_CONFIG.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
