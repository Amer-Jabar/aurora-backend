import express from 'express';
import Message from '../model/Message.js';


const router = express.Router();

router.post('/api/messages', async (req, res) => {

    const {
        username,
        email,
        message
    } = req.body;

    if ( !username || !email || !message )
        return res.sendStatus(401);

    try {
        await Message.create({
            username,
            email,
            message
        })
        return res.status(200).send();
    } catch (e) {
        console.log(e);
        return res.sendStatus(409);
    } 
})

export default router;