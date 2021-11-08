import express from 'express';

import userRouter from './userRouter.js';
import productRouter from './productRouter.js';
import reviewRouter from './reviewRouter.js';
import transactionRouter from './transactionRouter.js';
import storeRouter from './storeRouter.js';
import likeRouter from './likeRouter.js';
import activityRouter from './activityRouter.js';
import messageRouter from './messageRouter.js';


const router = express.Router();

router.use(userRouter);
router.use(productRouter);
router.use(reviewRouter);
router.use(transactionRouter);
router.use(storeRouter);
router.use(likeRouter);
router.use(activityRouter);
router.use(messageRouter);

export default router;