import SearchController from '@/lib/server/controllers/searchController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return runExpressHandler(request, {}, (req, res) =>
    SearchController.search(req, res)
  );
}
