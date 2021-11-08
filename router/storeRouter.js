import express from 'express';

import Store from '../model/Store.js';

const router = express.Router();

/***
    Notes: 
    1.This router should only be used to make modifications or additions by the admin.
***/

const createStoresIfNotThere = async () => {
    const existingStores = await Store.find({});
    if ( !existingStores || existingStores?.length === 0 ) {

        const storesToCreate = [
            {
                name: 'Shop 1',
                lat: 36.2,
                lng: 44.01,
                description: 'This is shop 1.',
                city: 'Erbil'
            },
            {
                name: 'Shop 2',
                lat: 37.2,
                lng: 44.08,
                description: 'This is shop 2.',
                city: 'Erbil'
            },
            {
                name: 'Shop 3',
                lat: 35.5,
                lng: 45.4,
                description: 'This is shop 3.',
                city: 'Sulaymaniah'
            },
            {
                name: 'Shop 4',
                lat: 35.7,
                lng: 45.1,
                description: 'This is shop 4.',
                city: 'Sulaymaniah'
            }
        ];

        await Store.create(storesToCreate);
    }
}
createStoresIfNotThere();

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