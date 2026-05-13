import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PAGE_PATHS = ['/signin', '/signup', '/error-404'];
const PUBLIC_API_PREFIXES = ['/api/auth/login', '/api/auth/logout', '/api/auth/refresh'];

const ADMIN_ONLY_PAGE_PREFIXES = ['/tai-khoan', '/vai-tro'];
const MANAGER_OR_ADMIN_PAGE_PREFIXES = ['/cua-hang', '/nhan-vien', '/nhan-vien-cua-hang', '/doanh-thu-cua-hang'];

const ADMIN_ONLY_API_PREFIXES = ['/api/tai-khoan', '/api/tai-khoan/vai-tro'];
const MANAGER_OR_ADMIN_API_PREFIXES = ['/api/nhan-vien', '/api/cua-hang/nhan-vien', '/api/cua-hang'];

function startsWithAny(pathname: string, prefixes: string[]) {
    return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isPublicPage(pathname: string) {
    return PUBLIC_PAGE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function normalizeRole(role: unknown) {
    const raw = String(role || '').trim();
    const upper = raw.toUpperCase();

    if (upper === 'ADMIN') return 'Admin';
    if (upper === 'MGR' || upper.includes('QUAN LY')) return 'MGR';
    if (upper === 'STAFF' || upper.includes('NHAN VIEN')) return 'STAFF';
    if (upper === 'CUST' || upper.includes('CUSTOMER') || upper.includes('KHACH HANG')) return 'CUST';

    return raw || 'STAFF';
}

function hasAnyRole(role: string, allowedRoles: string[]) {
    return allowedRoles.includes(role);
}

function unauthorizedApiResponse(status = 401) {
    return NextResponse.json({ ok: false, error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status });
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isApi = pathname.startsWith('/api');
    const isPublicApi = startsWithAny(pathname, PUBLIC_API_PREFIXES);
    const isPublic = isPublicPage(pathname) || isPublicApi;

    const authToken = req.cookies.get('auth_token')?.value;

    if (!authToken) {
        if (isPublic) return NextResponse.next();
        if (isApi) return unauthorizedApiResponse(401);

        const redirectUrl = new URL('/signin', req.url);
        redirectUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    let role = 'STAFF';
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('Missing JWT_SECRET');

        const { payload } = await jwtVerify(authToken, new TextEncoder().encode(secret));
        role = normalizeRole(payload?.MaVaiTro);
    } catch {
        if (isPublic) return NextResponse.next();
        if (isApi) return unauthorizedApiResponse(401);
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    if (pathname === '/signin') {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (isApi) {
        if (startsWithAny(pathname, ADMIN_ONLY_API_PREFIXES) && !hasAnyRole(role, ['Admin'])) {
            return unauthorizedApiResponse(403);
        }

        if (startsWithAny(pathname, MANAGER_OR_ADMIN_API_PREFIXES) && !hasAnyRole(role, ['Admin', 'MGR'])) {
            return unauthorizedApiResponse(403);
        }

        return NextResponse.next();
    }

    if (startsWithAny(pathname, ADMIN_ONLY_PAGE_PREFIXES) && !hasAnyRole(role, ['Admin'])) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (startsWithAny(pathname, MANAGER_OR_ADMIN_PAGE_PREFIXES) && !hasAnyRole(role, ['Admin', 'MGR'])) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};