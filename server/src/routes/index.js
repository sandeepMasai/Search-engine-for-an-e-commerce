import express from 'express';
import { productRouter } from './product.routes.js';

export const apiRouter = express.Router();

apiRouter.use('/', productRouter);
