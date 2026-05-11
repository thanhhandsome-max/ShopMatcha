import { getOptionalAuthUser } from '@/lib/server/auth/get-user';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type CookieOp = { name: string; value?: string; options?: Record<string, unknown>; clear?: boolean };

/**
 * Chạy handler kiểu Express (req, res) trong Route Handler Next.js — giữ nguyên controllers cũ.
 */
export async function runExpressHandler(
  nextReq: NextRequest,
  params: Record<string, string>,
  handler: (req: any, res: any) => void | Promise<unknown>
): Promise<NextResponse> {
  const method = nextReq.method;
  const body =
    method === 'GET' || method === 'HEAD' || method === 'DELETE'
      ? {}
      : await nextReq.json().catch(() => ({}));

  const url = new URL(nextReq.url);
  const jar = await cookies();

  const reqLike: any = {
    body,
    query: Object.fromEntries(url.searchParams),
    params,
    headers: Object.fromEntries(nextReq.headers),
    user: (await getOptionalAuthUser(nextReq)) || undefined,
    ip:
      nextReq.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      nextReq.headers.get('x-real-ip') ||
      '127.0.0.1',
    cookies: {
      accessToken: jar.get('accessToken')?.value,
      refreshToken: jar.get('refreshToken')?.value
    },
    cookie: (name: string) => jar.get(name)?.value
  };

  let status = 200;
  let jsonPayload: unknown = { success: false, message: 'Handler did not send response' };
  let redirectUrl: string | null = null;
  const cookieOps: CookieOp[] = [];

  const resLike: any = {
    status(n: number) {
      status = n;
      return resLike;
    },
    json(data: unknown) {
      jsonPayload = data;
    },
    redirect(url: string) {
      redirectUrl = url;
    },
    cookie(name: string, value: string, options?: Record<string, unknown>) {
      cookieOps.push({ name, value, options });
      return resLike;
    },
    clearCookie(name: string) {
      cookieOps.push({ name, clear: true });
      return resLike;
    }
  };

  await handler(reqLike, resLike);

  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl);
  }

  const out = NextResponse.json(jsonPayload, { status });
  for (const op of cookieOps) {
    if (op.clear) {
      out.cookies.delete(op.name);
    } else if (op.value !== undefined) {
      out.cookies.set(op.name, op.value, (op.options || {}) as Parameters<typeof out.cookies.set>[2]);
    }
  }
  return out;
}
