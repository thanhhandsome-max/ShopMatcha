import CategoryController from '@/lib/server/controllers/categoryController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return runExpressHandler(request, {}, (req, res) =>
    CategoryController.getAll(req, res)
  );
}
