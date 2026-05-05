import express from 'express';
import ProductController from '../controllers/productController';
import SearchController from '../controllers/searchController';

const router = express.Router();

router.get('/', ProductController.getAll);
router.get('/search', SearchController.search);
router.get('/:id/related', ProductController.getRelated);
router.get('/:id', ProductController.getById);

export default router;
