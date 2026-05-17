import { updateOrderStatusHandler } from '@/lib/server/controllers/orderController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return runExpressHandler(request, { id }, updateOrderStatusHandler);
}
