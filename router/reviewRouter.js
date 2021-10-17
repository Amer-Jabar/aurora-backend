import express from 'express';

import Review from '../model/Review.js';
import User from '../model/User.js';
import Product from '../model/Product.js';
import isAuthorized from '../helper/Auth/isAuthorized.js';
import extractUserId from '../helper/Auth/extractUserId.js';

const router = express.Router();

router.get('/api/reviews', async (req, res) => {

    const reviews = await Review.find({});
    
    if ( !reviews )
        return res.status(404).send("Reviews Don't Exist!")

    return res.status(200).send(reviews);
})

router.post('/api/reviews', isAuthorized, async (req, res) => {

    const userId = await extractUserId(req);
    const { ownerId, productId, reviewContent, reviewRating } = req.body;

    const user = await User.findById(userId)
    const owner = await User.findById(ownerId);
    const product = await Product.findById(productId);

    if ( 
        !ownerId || !productId || !userId || !reviewContent 
        || !reviewRating || !user || !owner || !product 
    )
        return res.sendStatus(401);

    try {
        const createdReview = await Review.create({
            content: reviewContent,
            rating: reviewRating,
            owner: userId,
            product: productId,
            createdAt: new Date().toISOString()
        });

        const review = await Review.findById(createdReview._id)
                                   .populate(['owner', 'product']);

        return res.status(200).send(review);
    } catch (e) {
        return res.sendStatus(409);
    }
})

router.get('/api/reviews/:id', async (req, res) => {

    const { id } = req.params;
    const reviews = await Review.findById(id).populate(['owner', 'product']);
    
    if ( !reviews )
        return res.status(404).send("Reviews Don't Exist!")

    return res.status(200).send(reviews);
})

router.get('/api/reviews/:id/:by', async (req, res) => {

    const { by } = req.params;
    const { id } = req.params;

    let reviewData;

    try {
        if ( by === 'review' ) {

            reviewData = await Review.findById(id).populate('owner').exec();
            const { owner: { _id, username, image } } = reviewData;
            reviewData.owner = {
                _id, username, image
            }
    
        } else if ( by === 'product' ) {
            const { reviews } = await Product.findById(id);
            reviewData = await Review.find({ _id: reviews })
                               .populate('owner').exec();

            reviewData = reviewData.map((review) => {
                const { owner: { _id, username, image } } = review;
                let adjustedReview = review;
                adjustedReview.owner = {
                    _id, username, image
                }
                return adjustedReview;
            })

        } else
            return res.status(409).send('By Category Params Is Unkown!')

    } catch (e) {
        console.log(e)

        return res.status(404).send(`Review Doesn't Exist!`)
    } finally {

        return res.status(200).send(reviewData);
    }

})

router.delete('/api/review/:id', isAuthorized, async (req, res) => {
    
    const { userId } = await extractUserId(req);
    const { id: reviewId } = req.params;

    try {

        const { reviews } = await User.findById(userId);
        let adjustedUserReviews = reviews.filter(id => id !== String(reviewId));
        await User.findByIdAndUpdate(userId, {
            reviews: adjustedUserReviews
        })

        const { product: productWithReview } = await Review.findById(reviewId);
        const { reviews: productReviews } = await Product.findById(productWithReview);
        let adjustedProductReviews = productReviews.filter(id => id !== String(reviewId));
        await Product.findByIdAndUpdate(productWithReview, {
            reviews: adjustedProductReviews
        })

        await Review.findByIdAndRemove(reviewId);
        
        return res.status(200).send('');
    } catch (e) {
        return res.status(409).send('An Error Happened Deleting The Review!');
    }

})

export default router;