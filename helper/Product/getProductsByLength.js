import Product from '../../model/Product.js';


const getProductsByLength = async (sortBy, length) => {

    let products = null;

    switch ( sortBy ) {
        case 'like':
            products = await Product.find({}).sort({ likesCount: 1 }).limit(length);
            break;

        case 'price':
            break;

        case 'entity':
            break;

        case 'view':
            products = await Product.find({})
                                    .sort({ views: -1 })
                                    .limit(Number(length));
            break;

        case 'review':
            break;

        default:
            products = await Product.find({}, { _id: 1, category: 1 })
                                    .sort({ createdAt: 1 })
                                    .limit(Number(length));
    }
    
    return !products ? [] : products;
}

export default getProductsByLength;