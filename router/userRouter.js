import fs from 'fs';
import path from 'path';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';

import User from '../model/User.js';
import Product from '../model/Product.js';
import Like from '../model/Like.js';
import Activity from '../model/Activity.js';
import Transaction from '../model/Transaction.js';
import { getRandomId } from '../helper/User/randomId.js';
import isAuthorized from '../helper/Auth/isAuthorized.js';
import extractUserId from '../helper/Auth/extractUserId.js';
import updateUserProperty from '../helper/User/updateUserProperty.js';
import getUserProperties, { getUserPropertyLength } from '../helper/User/getUserProperties.js';
import getImageFile from '../helper/User/getImageFile.js';
import Review from '../model/Review.js';
import validateUserCredentials from '../helper/Auth/validateUserCredentials.js'

const router = express.Router();

/***
    Notes: 
    1.Every route that needs a special authentication permits the
    client for authentication with the 'isAuthorized' middleware. If the
    route needs to use the user credentials from the request, it extracts
    it with the 'extractUserId' function.
    2.There are checks for error that returns a response with error based
    on the case if the request does not fulfill the requirements.
    3.Try-Catch phrases are used differently based on the request nature.
***/

router.get('/api/user/login', isAuthorized, async (req, res) => {
    
    const { username, password } = await extractUserId(req);

    const foundUser = await User.findOne({ username });

    if ( !foundUser )
        return res.status(404).send('Account Not Found!');
        
    const match = await bcrypt.compare(password, foundUser.password);    

   if ( !match )
        return res.status(403).send('Not Authenticated!');

    const userInfo = {
        _id: foundUser._id,
        username: foundUser.username
    }
    const token = jwt.sign(
        { userInfo }, 
        process.env.SECRET_COOKIE_PASSWORD,
        {
            expiresIn: 3600
        }
    );
    
    return res.status(200).send({ token });
})

router.post('/api/user/signup', async (req, res) => {

    const SECRET = process.env.SECRET_COOKIE_PASSWORD;

    const { userToken } = req.body;

    if ( !userToken )
        return res.status(403).send('No User Credentials Were Provided!');

    const { username, password } = jwt.verify(userToken, SECRET);
    const usernameExists = await User.findOne({ username });

    if ( usernameExists )
        return res.status(406).send('Username Already Exists!');

    const credentialValidity = validateUserCredentials(username, password);
    if ( !credentialValidity.username )
        return res.status(400).send('Username must be longer and equal to 4 letters!');
    if ( !credentialValidity.password )
        return res.status(400).send('Password must be longer and equal to 4 letters!');

    await User.create({
        username,
        password
    })

    const foundUser = await User.findOne({ username: username });

    if ( !foundUser )
        return res.status(409).send('An Error Occured Finding Created User!');

    const userInfo = { 
        _id: foundUser._id,
        username: foundUser.username
    };
    const token = jwt.sign({ userInfo }, SECRET, { expiresIn: 3600 });

    return res.status(201).send({ token });
})

router.post('/api/user/logout', isAuthorized, async (req, res) => {

    let _id = null, 
        username = null;
        
    try {
        const { userInfo } = await extractUserId(req);
        _id = userInfo._id;
        username = userInfo.username;
    } catch (e) {
        console.log(e);
    } finally {
        if ( !_id || !username )
            return res.status(401).send('Cookie expired!');

        return res.status(200).send();
    }
})

router.get('/api/users', async (req, res) => {
    
    let userIds = null;

    try {
        userIds = (await User.find({})).map(
            ({ _id, username }) => ({ _id, username })
        );

    } catch (e) {
        console.log(e);
    } finally {
        if ( !userIds ) 
            return res.status(404).send('No Users Were Found!');

        return res.status(200).send(userIds);
    }
})

router.get('/api/users/:userId', isAuthorized, async (req, res) => {
    
    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);

    if ( String(userId) !== String(userProfileId) )
        return res.status(401).send();

    let userInfo = null;
    
    try {
        userInfo = await User.findById(userId, { password: 0 });
    } catch (e) {
        console.log('Here is at api/users/:userId\n\n', e);
    } finally {
        if ( !userInfo )
            return res.sendStatus(404);        

        return res.status(200).send(userInfo);        
    }
})

router.get('/api/users/:userId/likes', isAuthorized, async (req, res) => {
    
    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);

    if ( String(userId) !== String(userProfileId) )
        return res.status(401).send();

    let userInfo = null;

    try {
        userInfo = await User.findById(userId, { password: 0 }).populate({
            path: 'likes',
            select: 'product',
            populate: {
                path: 'product',
                select: ['name', 'price']
            }
        });
    } catch (e) {
        console.log(e);
    } finally {
        if ( !userInfo )
            return res.status(404).send();        

        return res.status(200).send(userInfo);        
    }
})

router.delete('/api/users/:userId', isAuthorized, async (req, res) => {
    
    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);

    if ( String(userId) !== String(userProfileId) )
        return res.sendStatus(401);

    let response = null;

    try {
        response = await User.findByIdAndRemove(userId);
    } catch (e) {
        console.log(e);
    } finally {
        if ( !response )
            return res.status(404).send();        

        return res.status(200).send();        
    }
})

router.get('/api/users/:userId/image', async (req, res) => {

    const { userId } = req.params;
    let profileImage = null;

    try {
        const { image } = await User.findById(userId);
        profileImage = await getImageFile(image);
    } catch (e) {
        console.log('Image was not found!');
    } finally {
        if ( !profileImage )
            return res.status(404).send();

        return res.status(200).end(profileImage ? profileImage : null);
    }
})

router.post('/api/users/:userId/image', isAuthorized, async (req, res) => {

    const { userId } = req.params;

    let uploadsFolderExists = null;

    try {
        uploadsFolderExists = fs.readdirSync(`${path.resolve()}/uploads`);
        console.log(uploadsFolderExists);
    } catch (e) {
        uploadsFolderExists = null;
    }
    if ( !uploadsFolderExists ) {
        try {
            fs.mkdirSync(`${path.resolve()}/uploads`);
            fs.mkdirSync(`${path.resolve()}/uploads/images`);
            fs.mkdirSync(`${path.resolve()}/uploads/images/profile`);
            fs.mkdirSync(`${path.resolve()}/uploads/images/product`);    
        } catch (e) {
            console.log('Were not able to create uploads folder!');
        }
    }

    const relativePath = `${path.resolve()}/uploads/images/profile`;
    console.log(uploadsFolderExists);

    const form = new formidable({ multiples: true });
    form.parse(req, async (error, fields, files) => {
        const { image } = files;
        const filePath = image.path;
        
        const existingImage = (await User.findById(userId)).image;
        try {
            if ( existingImage )
                fs.rmSync(`${relativePath}/${existingImage}`);
        } catch (e) {
            console.log('File Is Already Deleted!')
        }

        const imageId = await getRandomId();

        try {
            fs.copyFileSync(
                filePath, 
                `${relativePath}/${imageId}`
            );    
        } catch (e) {
            console.log('Cannot Be Coppied!');
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { image: imageId })

        if ( !updatedUser )
            return res.status(403).send('Was Not Able To Upload Photo!');
        
        res.status(200).send('Profile Photo Was Uploaded!');
    })
})

router.delete('/api/users/:userId/image', isAuthorized, async (req, res) => {
    
    const relativePath = path.resolve();

    const token = req.headers.authorization.split(' ')[1];
    const SECRET = process.env.SECRET_COOKIE_PASSWORD;
    let _id = null;

    try {
        _id = jwt.verify(token, SECRET)
    } catch (e) {
        return res.status(403).send('Cookie Invalid');
    }

    const { image } = await User.findById(_id);

    const imagePath = `${relativePath}/uploads/images/profile/${image}`;

    fs.rm(imagePath, () => {});
    const imageDeleted = await User.findByIdAndUpdate(_id, { image: null });

    if ( !imageDeleted )
        return res.status(403).send('Was Not Able To Delete Photo!');

    res.status(200).send('Profile Photo Removed!');

})

router.get('/api/users/:userId/deposit', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);

    const user = await User.findById(userId);

    if ( userId !== userProfileId || !user )
        return res.sendStatus(401);

    return res.status(200).send({ deposit: user.deposit });
});

router.put('/api/users/:userId/deposit', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    const { deposit } = req.body;

    const user = await User.findById(userId);

    if ( userId !== userProfileId || !user )
        return res.sendStatus(401);
        
    try {
        await User.findByIdAndUpdate(userId, { deposit });
        return res.status(200).send();
    } catch (e) {
        return res.sendStatus(409);
    }
});

router.get('/api/users/:userId/purchases', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    
    if ( userId !== userProfileId )
        return res.sendStatus(401);

    const user = await User.findById(userId);
    if ( !user )
        return res.sendStatus(409);

    try {
        const userPurchases = (await User.findById(userId).sort({ createdAt: 0 }).populate({
            path: 'transactions',
            populate: [{
                path: 'buyer',
                select: 'username'
            }, {
                path: 'product',
                select: ['name', 'category', 'price']
            }, {
                path: 'seller',
                select: 'username'
            }]
        }))
        .transactions.filter(
            purchase => purchase.buyer && purchase.buyer.username === user.username 
            ? purchase
            : null
        );
        return res.status(200).send(userPurchases);
    } catch (e) {
        console.log(e);
        return res.sendStatus(409);
    }
})

router.get('/api/users/:userId/:property', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const { property } = req.params;
    let userId = await extractUserId(req);

    if ( String(userId) !== String(userProfileId) )
        return res.status(401).send();

    let userProperties = null;

    try {
        userProperties = await getUserProperties(userId, property);
    } catch (e) {
        console.log(e);
    } finally {
        if ( !userProperties )
            return res.status(404).send();        

        return res.status(200).send(userProperties);
    }
})

router.get('/api/users/:userId/:property/length', async (req, res) => {

    const { userId: userProfileId } = req.params;
    const { property } = req.params;
    let userId = await extractUserId(req);

    if ( String(userId) !== String(userProfileId) )
        return res.status(401).send();

    let userPropertiesLength = null;

    try {
        userPropertiesLength = await getUserPropertyLength(userId, property);
    } catch (e) {
        console.log(e);
    } finally {
        if ( 
            userPropertiesLength === null ||
            userPropertiesLength === undefined
        )
            return res.sendStatus(404);        

        return res.status(200).send({ userPropertiesLength });        
    }
})

router.get('/api/users/:userId/:property/:range', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const { property } = req.params;

    const [_, upperBound] = req.params.range.split('-');

    let userId = await extractUserId(req);

    if ( String(userId) !== String(userProfileId) )
        return res.status(401).send();

    let userProperties = null;

    try {
        userProperties = await getUserProperties(userId, property, upperBound);
    } catch (e) {
        console.log(e);
    } finally {
        if ( !userProperties )
            return res.statusStatus(404);        

        return res.status(200).send(userProperties);        
    }
})

router.patch('/api/users/:userId', isAuthorized, async (req , res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    const { title, value } = req.body;

    if ( title === null || title === undefined || value === null || value === undefined )
        return res.status(400).send();
    if ( String(userProfileId) !== String(userId) )
        return res.status(401).send();    

    let user = null;
    try {
        user = await User.findById(userId);
        const userUpdateObject = await updateUserProperty(title, value);
        await User.findByIdAndUpdate(userId, userUpdateObject);
    } catch (e) {
        console.log(e);
    } finally {
        if ( !user )
            return res.status(404).send();
            
        return res.status(200).send();
    }
})

router.post('/api/users/:userId/like', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    const { likeId } = req.body;

    const user = await User.findById(userId);
    const like = await Like.findById(likeId);

    if ( String(userProfileId) !== String(userId) || String(likeId) !== String(like.id) )
        return res.sendStatus(401);    

    if ( !userProfileId || !likeId || !user || !like )
        return res.sendStatus(404);

    try {

        const activity = await Activity.findOne({
            originalActivity: like._id,
            activityName: 'Like'
        })

        await User.findByIdAndUpdate(userId, {
            likesCount: user.likesCount + 1,
            likes: [...user.likes, like._id],
            activities: [...user.activities, activity._id]
        })

    } catch (e) {
        console.log(e);
    } finally {
        if ( !user )
            return res.sendStatus(404);

        return res.status(200).send();
    }
})

router.post('/api/users/:userId/dislike', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    const { likeId, productId } = req.body;

    if ( String(userProfileId) !== String(userId) )
        return res.status(401).send();    

    try {

        const user = await User.findById(userId);
        const like = await Like.findById(likeId);
        const product = await Product.findById(productId);
        const activity = await Activity.findOne({
            originalActivity: likeId,
            activityName: 'Like'
        })
        if ( !like || !activity || !product || !user )
            return res.sendStatus(404);
        
        const updatedUserLikes = user.likes.filter(likeId => String(likeId) !== String(like._id))
        const updatedUserActivities = user.activities.filter(activityId => (
            String(activityId) !== String(activity._id)
        ))

        await User.findByIdAndUpdate(userId, {
            likesCount: user.likesCount - 1,
            likes: updatedUserLikes,
            activities: updatedUserActivities
        })

        return res.status(200).send();
    } catch (e) {
        console.log(e);
        return res.sendStatus(409);
    }
})

router.post('/api/users/:userId/review', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    const { productId, reviewId } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    const review = await Review.findById(reviewId);
    const activity = await Activity.find({ originalActivity: reviewId });

    if ( String(userProfileId) !== String(userId) || !user || !product || !review || !activity )
        return res.sendStatus(401);

    if ( !product.reviews.includes(reviewId) )
        return res.sendStatus(409);

    try {

        await User.findByIdAndUpdate(userId, {
            reviews: [...user.reviews, reviewId],
            reviewsCount: (user.reviewsCount || 0) + 1
        });

        return res.status(200).send(true);
    } catch (e) {
        console.log(e);
        return res.sendStatus(409);
    }
})

router.put('/api/users/:userId/product', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    const { productId } = req.body;

    if ( userId !== userProfileId )
        return res.sendStatus(401);

    const user = await User.findById(userId);
    if ( !user )
        return res.sendStatus(409);

    try {
        await User.findByIdAndUpdate(userId, {
            products: [...(user.products), productId]
        })

        return res.status(200).send('');
    } catch (e) {
        return res.sendStatus(409);
    }
})

router.put('/api/users/:userId/activity', isAuthorized, async (req, res) => {

    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    const { activityId } = req.body;

    if ( userId !== userProfileId )
        return res.sendStatus(401);

        
    const user = await User.findById(userId);
    if ( !user )
        return res.sendStatus(409);

    try {
        await User.findByIdAndUpdate(userId, {
            activities: [...(user.activities), activityId]
        })

        return res.status(200).send('');
    } catch (e) {
        return res.sendStatus(409);
    }
})

router.post('/api/users/:userId/transaction', isAuthorized, async (req, res) => {
    
    const { userId: userProfileId } = req.params;
    const userId = await extractUserId(req);
    const { transactionId, userRole } = req.body;

    const user = await User.findById(userId);
    const transaction = await Transaction.findById(transactionId);

    if ( userId !== userProfileId || !user )
        return res.sendStatus(401);
    
    if ( !transaction || !transactionId )
        return res.sendStatus(409);

    try {
        if ( userRole === 'Seller' )
            await User.findByIdAndUpdate(userId, {
                transactions: [...user.transactions, transaction._id],
                totalMoneyExchange: Number(user.totalMoneyExchange) + Number(transaction.payment),
                earnedMoney: Number(user.earnedMoney) + Number(transaction.payment)
            });            
        else
            await User.findByIdAndUpdate(userId, {
                transactions: [...user.transactions, transaction._id],
                totalMoneyExchange: Number(user.totalMoneyExchange) + Number(transaction.payment),
                spentMoney: Number(user.spentMoney) + Number(transaction.payment)
            });
        return res.status(200).send();
    } catch (e) {
        return res.sendStatus(409);
    }

})


export default router;