import { Request, Response } from 'express';
import { getAddressesForCustomerEmail } from '../services/addressService';

export class AddressController {
  async getMyAddresses(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Chưa xác thực',
          code: 401
        });
      }

      const data = await getAddressesForCustomerEmail(req.user.TenDangNhap);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('AddressController.getMyAddresses error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch customer addresses',
        code: 500
      });
    }
  }
}

export default new AddressController();