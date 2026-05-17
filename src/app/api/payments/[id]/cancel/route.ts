import { cancelPayment } from '@/lib/server/controllers/paymentController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return runExpressHandler(request, { id }, cancelPayment);
}