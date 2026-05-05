import express from 'express';
import PromotionController from '../controllers/promotionController';

const router = express.Router();

router.get('/', PromotionController.getActive);

export default router;
