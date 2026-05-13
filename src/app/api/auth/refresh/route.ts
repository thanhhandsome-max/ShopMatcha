import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

async function reissueToken(token: string, rememberMe = false) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Missing JWT_SECRET');
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    return new SignJWT({
        MaTK: payload.MaTK,
        TenDN: payload.TenDN,
        MaVaiTro: payload.MaVaiTro,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(rememberMe ? '30d' : '1d')
        .sign(new TextEncoder().encode(secret));
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const token = String(body?.token || '');
        const rememberMe = Boolean(body?.rememberMe);

        if (!token) {
            return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
        }

        const newToken = await reissueToken(token, rememberMe);
        const response = NextResponse.json({ ok: true, token: newToken });
        response.cookies.set('auth_token', newToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error('POST /api/auth/refresh error', error);
        return NextResponse.json({ ok: false, error: 'Refresh failed' }, { status: 401 });
    }
}