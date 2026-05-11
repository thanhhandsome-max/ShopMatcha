import { getPaymentDetails } from '@/lib/server/controllers/paymentController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return runExpressHandler(request, { id }, getPaymentDetails);
}
