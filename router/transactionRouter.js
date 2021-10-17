import express from 'express';
import Transaction from '../model/Transaction.js';

import User from '../model/User.js';
import Product from '../model/Product.js';
import extractUserId from '../helper/Auth/extractUserId.js';
import isAuthorized from '../helper/Auth/isAuthorized.js';


const router = express.Router();

/***
    Notes: 
    1.Transaction actions are not integrated with stripe.
    2.Any time specific information about transactions are required, data must be fetched
    from here. Otherwise, basic info is fetched from a normal route.
    3.The process is done without any real-life simulation. It is mostly
        dependent on the properties of the User.
***/

router.get('/api/transactions', isAuthorized, async (req, res) => {

    let transactions = null;

    try {
        transactions = await Transaction.find({});
    } catch (e) {
        return res.status(409).send('An Error Occured Fetching Transactions!');
    } finally {
        if ( transactions )
            return res.status(200).send(transactions);
    }
})

router.get('/api/transactions/:id', isAuthorized, async (req, res) => {

    const userId  = await extractUserId(req);
    const { id } = req.params;

    let transaction = null;

    const user = await User.findById(userId);
    const userDidTransaction = user.transactions.includes(id);

    if ( !userId || !id )
        return res.sendStatus(403);
    if ( !user || String(userId) !== String(user._id) || !userDidTransaction )
        return res.sendStatus(401);

    try {
        transaction = await Transaction
                            .findById(id)
                            .populate(['seller', 'buyer', 'product']);
    } catch (e) {
        console.log(e);
        return res.status(409).send('An Error Occured Fetching Transactions!');
    } finally {
        if ( transaction )
            return res.status(200).send(transaction);
    }
})

router.post('/api/transactions', isAuthorized, async (req, res) => {

    const userId  = await extractUserId(req);
    const { productId, ownerId, productEntity, productPrice } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    const owner = await User.findById(ownerId);

    if ( !userId || !user )
        return res.sendStatus(401);

    if ( !product || !productId )
        return res.sendStatus(409);

    if ( !owner || !ownerId )
        return res.sendStatus(409);

    try {
        const transaction = await Transaction.create({
            productEntity,
            productPrice,
            payment: productEntity * productPrice,
            seller: ownerId,
            buyer: userId,
            product: productId,
            createdAt: new Date().toISOString()
        })
        return res.status(200).send({ transaction });
    } catch (e) {
        return res.sendStatus(409);
    }
})


export default router;