import {
  deleteCart,
  getCart
} from '@/lib/server/controllers/cartController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return runExpressHandler(request, {}, getCart);
}

export async function DELETE(request: NextRequest) {
  return runExpressHandler(request, {}, deleteCart);
}
