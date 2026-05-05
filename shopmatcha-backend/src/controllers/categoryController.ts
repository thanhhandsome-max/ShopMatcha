import { Request, Response } from 'express';
import CategoryService from '../services/categoryService';

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await CategoryService.getAllCategories();
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('CategoryController.getAll error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        code: 500
      });
    }
  }
}

export default new CategoryController();
