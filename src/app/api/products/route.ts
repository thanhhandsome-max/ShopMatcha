import ProductController from '@/lib/server/controllers/productController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return runExpressHandler(request, {}, (req, res) =>
    ProductController.getAll(req, res)
  );
}
