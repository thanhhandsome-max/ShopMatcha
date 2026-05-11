import { initiatePayment } from '@/lib/server/controllers/paymentController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return runExpressHandler(request, {}, initiatePayment);
}
