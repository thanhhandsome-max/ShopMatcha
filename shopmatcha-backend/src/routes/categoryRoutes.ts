import express from 'express';
import CategoryController from '../controllers/categoryController';

const router = express.Router();

router.get('/', CategoryController.getAll);

export default router;
