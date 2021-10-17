import express from 'express';
import jwt from 'jsonwebtoken';

import Like from '../model/Like.js';
import Product from '../model/Product.js';
import User from '../model/User.js';
import isAuthorized from '../helper/Auth/isAuthorized.js';
import extractUserId from '../helper/Auth/extractUserId.js';


const router = express.Router();

router.get('/api/likes/:id', isAuthorized, async (req, res) => {
    
    const { id } = req.params;

    try {
        const like = await Like.findById(id).populate(['user', 'product']);
        return res.status(200).send(like);
    } catch (e) {
        console.log(e);
    } 
})

router.post('/api/likes', isAuthorized, async (req, res) => {
    
    const userId = await extractUserId(req);
    const { productId } = req.body;
    
    let like = null;

    try {

        const user = await User.findById(userId);
        const product = await Product.findById(productId);

        if ( !user || !product )
            return res.sendStatus(409);

        const tempLike = await Like.create({
            user: userId,
            product: productId,
        })

        like = await Like.findById(tempLike._id, { _id: 1 }).populate({
            path: 'product',
            select: ['name', 'price']
        })

    } catch (e) {
        // console.log(e);
    } finally {
        if ( !like )
            return res.sendStatus(409);

        return res.status(200).send(like);
    }    
})

router.delete('/api/likes/:id', isAuthorized, async (req, res) => {
    
    const { id: likeId } = req.params;
    const userId = await extractUserId(req);

    try {

        const user = await User.findById(userId);
        if ( !user || !likeId )
            return res.sendStatus(409);

        const like = await Like.findById(likeId);
        await Like.findByIdAndDelete(likeId);
        return res.status(200).send(like);
    } catch (e) {
        console.log(e);
        return res.sendStatus(409);
    }
})

export default router;