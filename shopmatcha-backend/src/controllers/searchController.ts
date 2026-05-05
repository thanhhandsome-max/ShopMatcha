import { Request, Response } from 'express';
import SearchService from '../services/searchService';

export class SearchController {
  async search(req: Request, res: Response) {
    try {
      const q = (req.query.q ?? req.query.query) as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
          code: 400
        });
      }

      const data = await SearchService.searchProducts(q, limit);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('SearchController.search error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to search products',
        code: 500
      });
    }
  }
}

export default new SearchController();
