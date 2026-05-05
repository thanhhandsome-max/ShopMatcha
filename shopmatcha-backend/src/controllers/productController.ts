import { Request, Response } from 'express';
import ProductService from '../services/productService';

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const category = req.query.category as string | undefined;
      const sort = req.query.sort as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      if (limit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit. Maximum is 100',
          code: 400
        });
      }

      const data = await ProductService.getProducts({
        category,
        sort: sort as any,
        page,
        limit
      });

      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('ProductController.getAll error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        code: 500
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await ProductService.getProductById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          code: 404
        });
      }

      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('ProductController.getById error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        code: 500
      });
    }
  }

  async getRelated(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const data = await ProductService.getRelatedProducts(id, limit);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('ProductController.getRelated error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch related products',
        code: 500
      });
    }
  }
}

export default new ProductController();
