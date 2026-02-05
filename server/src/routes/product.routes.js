import express from 'express';
import { productController } from '../controllers/product.controller.js';
import { validate } from '../middleware/validate.middleware.js';

export const productRouter = express.Router();

productRouter.post('/product', validate('createProduct'), productController.create);
productRouter.put('/product/meta-data', validate('updateMetadata'), productController.updateMetadata);
productRouter.get('/search/product', productController.search);
