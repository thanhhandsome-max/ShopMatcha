import AddressController from '@/lib/server/controllers/addressController';
import { runExpressHandler } from '@/lib/server/http/express-bridge';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return runExpressHandler(request, {}, (req, res) => AddressController.getMyAddresses(req, res));
}