import { postCartItem } from '@/lib/server/controllers/cartController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return runExpressHandler(request, {}, postCartItem);
}
