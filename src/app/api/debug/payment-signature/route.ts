import { getPaymentSignature } from '@/lib/server/controllers/debugController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return runExpressHandler(request, {}, getPaymentSignature);
}
