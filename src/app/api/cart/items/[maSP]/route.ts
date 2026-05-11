import {
  deleteCartItem,
  putCartItem
} from '@/lib/server/controllers/cartController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ maSP: string }> }
) {
  const { maSP } = await params;
  return runExpressHandler(request, { maSP }, putCartItem);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ maSP: string }> }
) {
  const { maSP } = await params;
  return runExpressHandler(request, { maSP }, deleteCartItem);
}
