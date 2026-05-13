import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { createHash } from 'crypto';
import { query } from '@/lib/db';

const ACCOUNT_TABLE_CANDIDATES = ['TaiKhoan', 'Tai_Khoan', 'taikhoan'];
const ROLE_TABLE_CANDIDATES = ['VaiTro', 'Vai_Tro', 'vaitro'];
const ACCOUNT_ROLE_TABLE_CANDIDATES = ['PhanQuyen', 'Phan_Quyen', 'phanquyen'];

async function resolveTable(candidates: string[]) {
    for (const table of candidates) {
        const result = await query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @table`, { table });
        if (result && result.length > 0) return table;
    }
    return null;
}

async function getColumns(table: string) {
    const result = await query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table`, { table });
    return (result || []).map((row: any) => row.COLUMN_NAME as string);
}

function firstExisting(columns: string[], candidates: string[]) {
    return candidates.find((column) => columns.includes(column)) || null;
}

function normalizeRole(role: unknown) {
    const raw = String(role || '').trim();
    const upper = raw.toUpperCase();

    if (upper === 'ADMIN' || upper === 'A') return 'Admin';
    if (upper === 'MGR' || upper.includes('QUAN LY')) return 'MGR';
    if (upper === 'STAFF' || upper.includes('NHAN VIEN')) return 'STAFF';
    if (upper === 'CUST' || upper.includes('CUSTOMER') || upper.includes('KHACH HANG')) return 'CUST';

    return raw || 'STAFF';
}

async function signToken(payload: Record<string, unknown>, rememberMe: boolean) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Missing JWT_SECRET');
    }

    const expiresIn = rememberMe ? '30d' : '1d';

    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(new TextEncoder().encode(secret));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const identifier = String(body?.identifier || body?.username || body?.email || body?.TenDangNhap || '').trim();
        const password = String(body?.password || body?.MatKhau || '');
        const rememberMe = Boolean(body?.rememberMe);

        if (!identifier || !password) {
            return NextResponse.json({ ok: false, error: 'Missing identifier or password' }, { status: 400 });
        }

        const accountTable = await resolveTable(ACCOUNT_TABLE_CANDIDATES);
        const roleTable = await resolveTable(ROLE_TABLE_CANDIDATES);
        const accountRoleTable = await resolveTable(ACCOUNT_ROLE_TABLE_CANDIDATES);

        if (!accountTable) {
            return NextResponse.json({ ok: false, error: 'TaiKhoan table not found' }, { status: 500 });
        }

        const accountCols = await getColumns(accountTable);
        const roleCols = roleTable ? await getColumns(roleTable) : [];
        const accountRoleCols = accountRoleTable ? await getColumns(accountRoleTable) : [];

        const accountIdCol = firstExisting(accountCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
        const usernameCol = firstExisting(accountCols, ['TenDangNhap', 'Username', 'TaiKhoan']);
        const passwordCol = firstExisting(accountCols, ['MatKhau', 'Password', 'Matkhau']);
        const statusCol = firstExisting(accountCols, ['TrangThai', 'Status', 'KichHoat']);

        if (!accountIdCol || !usernameCol || !passwordCol) {
            return NextResponse.json({ ok: false, error: 'Required account columns not found' }, { status: 500 });
        }

        const roleIdCol = firstExisting(roleCols, ['MaVaiTro', 'RoleId']);
        const roleNameCol = firstExisting(roleCols, ['TenVaiTro', 'RoleName']);
        const accountRoleAccountCol = firstExisting(accountRoleCols, ['MaTK', 'MaTaiKhoan', 'AccountId']);
        const accountRoleRoleCol = firstExisting(accountRoleCols, ['MaVaiTro', 'RoleId', 'VaiTro']);

        const selectCols: string[] = [
            `a.${accountIdCol} as MaTK`,
            `a.${usernameCol} as TenDangNhap`,
            `a.${passwordCol} as MatKhau`,
            statusCol ? `a.${statusCol} as TrangThai` : 'CAST(1 as int) as TrangThai',
        ];

        if (roleTable && accountRoleTable && accountRoleAccountCol && accountRoleRoleCol && roleIdCol) {
            selectCols.push(`ar.${accountRoleRoleCol} as MaVaiTro`);
            selectCols.push(roleNameCol ? `r.${roleNameCol} as TenVaiTro` : `ar.${accountRoleRoleCol} as TenVaiTro`);
        } else {
            selectCols.push('NULL as MaVaiTro', 'NULL as TenVaiTro');
        }

        let sql = `SELECT TOP 1 ${selectCols.join(', ')} FROM ${accountTable} a`;
        if (roleTable && accountRoleTable && accountRoleAccountCol && accountRoleRoleCol && roleIdCol) {
            sql += ` LEFT JOIN ${accountRoleTable} ar ON a.${accountIdCol} = ar.${accountRoleAccountCol}`;
            sql += ` LEFT JOIN ${roleTable} r ON ar.${accountRoleRoleCol} = r.${roleIdCol}`;
        }
        sql += ` WHERE a.${usernameCol} = @identifier`;
        sql += ` ORDER BY a.${accountIdCol} DESC`;

        let rows = await query<any>(sql, { identifier });

        if (!rows || rows.length === 0) {
            const hasEmailColumn = accountCols.some((column) => ['Email', 'EmailAddress', 'ThuDienTu'].includes(column));
            if (hasEmailColumn) {
                const emailCol = firstExisting(accountCols, ['Email', 'EmailAddress', 'ThuDienTu']);
                if (emailCol) {
                    let emailSql = `SELECT TOP 1 ${selectCols.join(', ')} FROM ${accountTable} a`;
                    if (roleTable && accountRoleTable && accountRoleAccountCol && accountRoleRoleCol && roleIdCol) {
                        emailSql += ` LEFT JOIN ${accountRoleTable} ar ON a.${accountIdCol} = ar.${accountRoleAccountCol}`;
                        emailSql += ` LEFT JOIN ${roleTable} r ON ar.${accountRoleRoleCol} = r.${roleIdCol}`;
                    }
                    emailSql += ` WHERE a.${emailCol} = @identifier`;
                    emailSql += ` ORDER BY a.${accountIdCol} DESC`;
                    rows = await query<any>(emailSql, { identifier });
                }
            }
        }

        if (!rows || rows.length === 0) {
            return NextResponse.json({ ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu.' }, { status: 401 });
        }

        const user = rows[0];
        const storedPassword = String(user.MatKhau || '');

        // Check password: support plaintext, MD5, bcrypt, and SHA-256
        let passwordMatches = false;
        const isBcrypt = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
        const isMD5 = /^[a-f0-9]{32}$/.test(storedPassword);
        const isSHA256 = /^[a-f0-9]{64}$/.test(storedPassword);

        if (isBcrypt) {
            // Bcrypt hash
            passwordMatches = await bcrypt.compare(password, storedPassword);
        } else if (isMD5) {
            // MD5 hash
            const md5Hash = createHash('md5').update(password).digest('hex');
            passwordMatches = md5Hash === storedPassword;
        } else if (isSHA256) {
            // SHA-256 hash
            const sha256Hash = createHash('sha256').update(password).digest('hex');
            passwordMatches = sha256Hash === storedPassword;
        } else {
            // Plaintext (fallback)
            passwordMatches = storedPassword === password;
        }

        if (!passwordMatches) {
            return NextResponse.json({ ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu.' }, { status: 401 });
        }

        if (Number(user.TrangThai ?? 1) === 0) {
            return NextResponse.json({ ok: false, error: 'Tài khoản đã bị khóa hoặc ngưng hoạt động.' }, { status: 403 });
        }

        const role = normalizeRole(user.MaVaiTro || user.TenVaiTro);
        const token = await signToken(
            {
                MaTK: user.MaTK,
                TenDN: user.TenDangNhap,
                MaVaiTro: role,
            },
            rememberMe,
        );

        const response = NextResponse.json({
            ok: true,
            token,
            user: {
                MaTK: String(user.MaTK),
                TenDN: String(user.TenDangNhap),
                Role: role,
            },
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error('POST /api/auth/login error', error);
        return NextResponse.json({ ok: false, error: 'Login failed' }, { status: 500 });
    }
}