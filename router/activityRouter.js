import express from 'express';

import Activity from '../model/Activity.js';
import User from '../model/User.js';
import Product from '../model/Product.js';
import isAuthorized from '../helper/Auth/isAuthorized.js';
import extractUserId from '../helper/Auth/extractUserId.js';


const router = express.Router();

router.get('/api/activities', async (req, res) => {
    try {
        const activity = await Activity.find();
        return res.status(200).send(activity);
    } catch (e) {
        console.log(e);
    } 
})

router.get('/api/activities/:id', isAuthorized, async (req, res) => {
    
    const { id } = req.params;
    const userId = await extractUserId(req);

    const user = await User.findById(userId);
    const userHasActivity = user.activities.includes(id);
    if ( !userId || !user )
        return res.sendStatus(403)
    if ( !userHasActivity )
        return res.sendStatus(404)

    try {
        const activity = await Activity.findById(id)
                                       .populate({ 
                                           path: 'originalActivity',
                                           populate: [
                                                { 
                                                   path: 'product',
                                                   select: ['_id', 'name', 'category', 'price'],
                                                   populate: {
                                                       path: 'owner',
                                                       select: ['_id', 'username']
                                                   }
                                                },
                                                { 
                                                   path: 'seller', 
                                                   select: ['_id', 'username'] 
                                                },
                                                { 
                                                   path: 'buyer', 
                                                   select: ['_id', 'username'] 
                                                }
                                           ]
                                        });
        return res.status(200).send(activity);
    } catch (e) {
        console.log(e);
    }
})

router.get('/api/activities/:id/user', async (req, res) => {
    
    const { id } = req.params;
    const userId = await extractUserId(req);

    const user = await User.findById(userId);
    const userHasActivity = user.activities.includes(id);
    if ( !userId || !user )
        return res.sendStatus(403)
    if ( !userHasActivity )
        return res.sendStatus(404)

    try {
        const activity = await Activity.findById(id)
                                       .populate({ 
                                           path: 'originalActivity',
                                           populate: 'user'
                                        });
        return res.status(200).send(activity);
    } catch (e) {
        console.log(e);
    }
})

router.get('/api/activities/:id/product', async (req, res) => {
    
    const { id } = req.params;
    const userId = await extractUserId(req);

    const user = await User.findById(userId);
    const userHasActivity = user.activities.includes(id);
    if ( !userId || !user )
        return res.sendStatus(403)
    if ( !userHasActivity )
        return res.sendStatus(404)

    try {
        const activity = await Activity.findById(id)
                                       .populate({ 
                                           path: 'originalActivity',
                                           populate: 'product'
                                        });
        return res.status(200).send(activity);
    } catch (e) {
        console.log(e);
    }
})

router.post('/api/activities', isAuthorized, async (req, res) => {
    
    const userId = await extractUserId(req);
    const { productId, activityId, activityName } = req.body;
    
    let activity = null;

    try {

        const user = await User.findById(userId);
        const product = await Product.findById(productId);

        if ( !user || !product )
            return res.sendStatus(401);
        
        activity = await Activity.create({
            activityName,
            originalActivity: activityId,
            createdAt: new Date().toISOString()
        })

    } catch (e) {
        console.log(e);
    } finally {
        if ( !activity )
            return res.sendStatus(409);

        return res.status(200).send(activity);
    }    
})

router.delete('/api/activities/:activityId', isAuthorized, async (req, res) => {

    const userId = await extractUserId(req);
    const { activityId } = req.params;
    const user = await User.findById(userId);
    const activity = await Activity.findOne({ originalActivity: activityId });

    if ( !activityId || !user || !activity )
        return res.sendStatus(403);

    try {
        await Activity.findByIdAndDelete(activityId);
        return res.status(200).send();
    } catch (e) {
        console.log(e);
        return res.sendStatus(409);
    }

})


export default router;