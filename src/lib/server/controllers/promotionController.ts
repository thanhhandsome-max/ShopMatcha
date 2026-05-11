import { Request, Response } from 'express';
import PromotionService from '../services/promotionService';

export class PromotionController {
  async getActive(req: Request, res: Response) {
    try {
      const data = await PromotionService.getActivePromotions();
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('PromotionController.getActive error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch promotions',
        code: 500
      });
    }
  }

  async getCustomerPromotions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Chưa xác thực',
          code: 401
        });
      }

      const data = await PromotionService.getPromotionsForCustomer(req.user.TenDangNhap);

      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('PromotionController.getCustomerPromotions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch customer promotions',
        code: 500
      });
    }
  }
}

export default new PromotionController();
