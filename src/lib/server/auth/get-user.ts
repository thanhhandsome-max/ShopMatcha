import prisma from '@/lib/server/db/prisma';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/server/utils/tokenUtils';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type ApiUser = {
  MaTaiKhoan: string;
  TenDangNhap: string;
  MaVaiTro: string;
  role: string;
};

export async function getOptionalAuthUser(request: NextRequest): Promise<ApiUser | null> {
  const auth = request.headers.get('authorization');
  let token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;

  if (!token) {
    const jar = await cookies();
    token = jar.get('accessToken')?.value ?? null;
  }

  const jar = await cookies();
  const accessPayload = token ? verifyAccessToken(token) : null;
  const refreshToken = jar.get('refreshToken')?.value ?? null;
  const refreshPayload = !accessPayload && refreshToken ? verifyRefreshToken(refreshToken) : null;
  const payload = accessPayload || refreshPayload;

  if (!payload) {
    return null;
  }

  const user = await prisma.taikhoan.findUnique({
    where: { MaTaiKhoan: payload.MaTaiKhoan }
  });

  if (!user || user.TrangThai !== 1) {
    return null;
  }

  return {
    MaTaiKhoan: user.MaTaiKhoan,
    TenDangNhap: user.TenDangNhap,
    MaVaiTro: payload.MaVaiTro,
    role: payload.role || 'Khách hàng'
  };
}

export async function requireAuthUser(request: NextRequest): Promise<ApiUser | NextResponse> {
  const user = await getOptionalAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Không tìm thấy token xác thực' },
      { status: 401 }
    );
  }
  return user;
}
