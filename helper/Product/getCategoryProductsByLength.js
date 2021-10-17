import Product from '../../model/Product.js';


const getCategoryProductsByLength = async (category, sortBy, length) => {

    let products = null;

    switch ( sortBy ) {
        case 'like':
            products = await Product.find({ category })
                                    .populate({
                                        path: 'likes'
                                    })
                                    .sort({ likesCount: -1 })
                                    .limit(Number(length))
            break;
        case 'price':
            products = await Product.find({ category })
                                    .sort({ price: -1 })
                                    .limit(Number(length));

            break;
        case 'entity':
            products = await Product.find({ category })
                                    .sort({ entity: -1 })
                                    .limit(Number(length))
            break;
        case 'view':
            products = await Product.find({ category })
                                    .sort({ views: -1 })
                                    .limit(Number(length));
            break;
        case 'review':
            products = await Product.find({ category })
                                    .populate({
                                        path: 'reviews'
                                    })
                                    .sort({ reviewsCount: -1 })
                                    .limit(Number(length));
            break;
        default:
            products = await Product.find({ category })
                                    .sort({ createdAt: -1 })
                                    .limit(Number(length))
                                    .populate({
                                        path: 'likes'
                                    })
    }
    
    return !products ? [] : products;
}

export default getCategoryProductsByLength;