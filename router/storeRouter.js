import express from 'express';

import Store from '../model/Store.js';

const router = express.Router();

/***
    Notes: 
    1.This router should only be used to make modifications or additions by the admin.
***/

router.get('/api/stores', async (req, res) => {

    const stores = await Store.find({});
    
    if ( !stores )
        return res.sendStatus(404);

    return res.status(200).send(stores);
})

router.post('/api/stores', async (req, res) => {

    const { stores } = req.body;

    let err = null;

    try {
        await Store.create(stores);
    } catch (e) {
        console.log(e);
        err = e;
    } finally {
        if ( err )
            return res.sendStatus(409);
        
        return res.status(200).send();
    }
})

export default router;