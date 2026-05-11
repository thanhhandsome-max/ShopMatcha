import {
  createOrderHandler,
  getCustomerOrdersHandler
} from '@/lib/server/controllers/orderController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return runExpressHandler(request, {}, getCustomerOrdersHandler);
}

export async function POST(request: NextRequest) {
  return runExpressHandler(request, {}, createOrderHandler);
}
