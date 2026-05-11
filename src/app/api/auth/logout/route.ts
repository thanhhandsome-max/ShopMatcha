import { logout } from '@/lib/server/controllers/authController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return runExpressHandler(request, {}, logout);
}
