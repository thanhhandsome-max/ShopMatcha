import PromotionController from '@/lib/server/controllers/promotionController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return runExpressHandler(request, {}, (req, res) =>
    PromotionController.getActive(req, res)
  );
}
