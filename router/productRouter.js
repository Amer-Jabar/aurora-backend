import express from 'express';
import jwt from 'jsonwebtoken'
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

import User from '../model/User.js';
import Product from '../model/Product.js';
import Review from '../model/Review.js';
import Like from '../model/Like.js';
import isAuthorized from '../helper/Auth/isAuthorized.js';
import isOwner from '../helper/Auth/isOwner.js';
import extractUserId from '../helper/Auth/extractUserId.js';
import getProductsByLength from '../helper/Product/getProductsByLength.js';
import getCategoryProductsByLength from '../helper/Product/getCategoryProductsByLength.js';

const router = express.Router();

router.get('/api/products/', async (req, res) => {
    try {
        const productList = await Product.find({});
        res.status(200).send(productList);
    } catch (e) {
        res.status(404).send('Items Not Found!');
    }
});

router.post('/api/products', isAuthorized, async (req, res) => {

    const { products } = req.body;
    const userId = await extractUserId(req);
    
    const user = await User.findById(userId);
    if ( !products || !products.length > 0 || !userId || !user )
        return res.sendStatus(409);

    let createdProducts = null;

    try {
        createdProducts = await Promise.all(products.map( async (product) => (
            await Product.create({
                ...product,
                createdAt: new Date().toISOString()
            })
        )))
    } catch (e) {
        console.log(e);
    }

    createdProducts = createdProducts.map(product => product._id);

    return res.status(200).send(createdProducts);
})

router.get('/api/products/category/:category', async (req, res) => {

    const { category } = req.params;

    let products = null;
    try {
        products = await Product.find({ category });
    } catch (e) {
        console.log(e);
    } 
    finally {
        if ( !products )
            return res.sendStatus(404);

        return res.status(200).send(products);
    }
});

router.get('/api/products/category/:category/length', async (req, res) => {

    const { category } = req.params;

    let productsLength = null;
    try {
        if ( !category )
            return res.sendStatus(409);

        productsLength = (await Product.find({ category })).length;
    } catch (e) {
        console.log(e);
    } finally {
        if ( !productsLength )
            return res.sendStatus(404);

        return res.status(200).send({ productsLength });
    }
});

router.get('/api/products/category/:category/:sortBy/:length', async (req, res) => {

    const { category, sortBy, length } = req.params;

    let products = null;
    try {
        products = await getCategoryProductsByLength(category, sortBy, length);
    } catch (e) {
        console.log(e);
    } 
    finally {
        if ( !products )
            return res.sendStatus(404);

        return res.status(200).send(products);
    }
});

router.get('/api/products/:productId/image', async (req, res) => {

    const { productId } = req.params;
    const relativePath = path.resolve();

    const imagePath = `${relativePath}/uploads/images/product/${productId}`;
    const fallbackImagePath = `${relativePath}/uploads/images/product/fallbackImage.png`;

    fs.readFile(imagePath, 
        (err, data) => {
            let responseImage = data;
            if ( err )
                responseImage = fs.readFileSync(fallbackImagePath);

            res.status(200).end(responseImage);
        }
    );
})

router.post('/api/products/:productId/image', isAuthorized, async (req, res) => {

    const { productId } = req.params;

    const relativePath = `${path.resolve()}/uploads/images/product`;
    let error = null;

    const userId = await extractUserId(req);

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if ( !productId )
        return res.sendStatus(400);
    if ( !product || !user )
        return res.sendStatus(404);
    if ( 
        !userId || 
        String(userId) !== String(user._id) || 
        String(userId) !== String(product.owner) 
    )
        return res.sendStatus(401);

    const form = formidable({
        maxFileSize: 10000000,
        multiples: true
    });

    form.parse(req, (err, fields, files) => {
        if ( err ) {
            error = err;
            return;
        }

        const { image } = files;
        const imageId = image?.name;
        const filePath = image.path;

        if ( productId !== imageId )
            return res.sendStatus(409);

        fs.copyFile(
            filePath, 
            `${relativePath}/${imageId}`, 
            (err) => console.log(err ? err : '')
        );

        if ( error )
            return res.sendStatus(403);

        return res.status(200).send();
    })
})

router.get('/api/products/:sortBy/:length', async (req, res) => {

    const { sortBy, length } = req.params;

    let products = null;
    try {
        products = await getProductsByLength(sortBy, length);
    } catch (e) {
        console.log(e);
    } 
    finally {
        if ( !products )
            return res.sendStatus(404);

        return res.status(200).send(products);
    }
});

router.get('/api/products/:id', async (req, res) => {

    const { id } = req.params;

    if ( !id )
        return res.sendStatus(400);
    
    try {
        let product = await Product
                            .findById(id)
                            .populate(['owner', 'likes'])
        
        return res.status(200).send(product);
    } catch (e) {
        console.log(e);
        return res.status(404).send('Item Not Found!');
    }
})

router.post('/api/products/:productId/like', isAuthorized, async (req, res) => {

    const { productId } = req.params;
    const { likeId } = req.body;

    try {

        const like = await Like.findById(likeId);
        if ( !like )
            return res.sendStatus(404);

        const product = await Product.findById(productId);

        await Product.findByIdAndUpdate(productId, {
            likesCount: product.likesCount + 1,
            likes: [...product.likes, like._id]
        })

        return res.status(200).send();
    } catch (e) {
        console.log(e);
    }
})

router.post('/api/products/:productId/dislike', isAuthorized, async (req, res) => {

    const { productId } = req.params;
    const { likeId } = req.body;

    try {

        const like = await Like.findById(likeId);
        if ( !like )
            return res.sendStatus(404);

        const product = await Product.findById(productId);

        await Product.findByIdAndUpdate(productId, {
            likesCount: product.likesCount - 1,
            likes: product.likes.filter(eachLike => {
                if ( eachLike._id !== like._id )
                    return eachLike;
            })
        })

        return res.status(200).send();
    } catch (e) {
        console.log(e);
        return res.sendStatus(409);
    }
})


router.post('/api/products/:productId/view', async (req, res) => {

    const { product } = req.body;
    const SECRET = process.env.SECRET_COOKIE_PASSWORD;

    let verifiedToken = null;

    try {
        verifiedToken = jwt.verify(product, SECRET);
    
        const { productId } = verifiedToken;
        const { views: previousViews } = await Product.findById(productId);

        await Product.findByIdAndUpdate(productId, {
            views: Number(previousViews) + 1
        })

        return res.status(200).send('');

    } catch (e) {
        return res.sendStatus(403);
    }
})

router.put('/api/products/:productId', isAuthorized, isOwner, async (req, res) => {
    
    const { productId } = req.params;
    const { detailForms, dimensionForms } = req.body;

    let err = null;

    const { details, dimensions } = await Product.findById(productId);

    try {
        await Product.findByIdAndUpdate(productId, {
            details: [...detailForms, ...details],
            dimensions: [...dimensionForms, ...dimensions]
        })    
    } catch (e) {
        err = e;
    } finally {
        if ( err )
            return res.status(409).send('An Error Updating Product!');
        
        return res.status(200).send('Product Updated!');
    }

})

router.post('/api/products/item/:productId/review', isAuthorized, async (req, res) => {

    const { productId } = req.params;
    const userId = await extractUserId(req);
    const { reviewId } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    const review = await Review.findById(reviewId);

    if ( !user || !product || !review )
        return res.sendStatus(401);

    try {
        await Product.findByIdAndUpdate(productId, {
            reviews: [...product.reviews, review._id],
            reviewsCount: product.reviewsCount + 1
        })

        return res.status(200).send(true);
    } catch (e) {
        return res.sendStatus(409);
    }
})

router.delete('/api/products/item/:productId', isAuthorized, isOwner, async (req, res) => {

    const { productId } = req.params;
    const { ownerId } = await extractUserId(req);

    let err = null;

    try {
        await Product.findByIdAndDelete(productId);
    
        const foundUser = await User.findById(ownerId);
        foundUser.sales = foundUser.sales.filter(sale => String(sale) === productId );
    
        await User.findByIdAndUpdate(ownerId, foundUser);
    } catch (e) {
        err = e;
    } finally {
        if ( err )
            return res.status(409).send('Error Deleting Item!');

        return res.status(200).send('Item Was Deleted!');
    }
})

router.post('/api/products/:category', isAuthorized, async (req, res) => {

    const { body: { name, price, description } } = req;
    const { category } = req.params;
    const { userId } = await extractUserId(req);

    let numericalPrice = Number(price);

    const { _id, owner } = await Product.create({
        name, price: numericalPrice, description, category, 
        owner: userId
    })

    const { products } = await User.findById(owner);
    await User.findByIdAndUpdate(owner, {
        products: [...products, _id]
    })

    if ( !_id )
        return res.status(403).send('Product Could Not Be Added!');

    return res.status(201).send({ _id });
})

router.put('/api/products/:category', isAuthorized, async (req, res) => {

    const relativePath = `${path.resolve()}/uploads/images/product`;
    let error = null;

    const form = new formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {

        if ( err ) {
            error = err;
            return;
        }
        const { image } = files;
        const imageId = image.name;
        const filePath = image.path;

        fs.copyFile(
            filePath, 
            `${relativePath}/${imageId}`, 
            (err) => console.log(err ? err : '')
        );
    })

    if ( error )
        return res.status(403).send('Unable To Upload Image!');

    return res.status(200).send('Hi');
})

router.get('/api/products/:productId/entity', isAuthorized, async (req, res) => {

    const { productId } = req.params;
    const product = await Product.findById(productId);

    if ( !productId || !product )
        return res.sendStatus(409);

    return res.status(200).send({ entity: product.entity });
})

router.put('/api/products/:productId/entity', isAuthorized, async (req, res) => {

    const { productId } = req.params;
    const userId = await extractUserId(req);
    const { entity } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if ( !productId || !product )
        return res.sendStatus(404);

    if ( !userId || !user )
        return res.sendStatus(401);
    
    try {
        await Product.findByIdAndUpdate(productId, { entity: product.entity - entity });
        return res.status(200).send();
    } catch (e) {
        return res.sendStatus(409);
    }
})


export default router;