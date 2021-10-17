import User from '../../model/User.js';
import Transaction from '../../model/Transaction.js';
import Product from '../../model/Product.js';
import Like from '../../model/Like.js';
import Review from '../../model/Review.js';
import Activity from '../../model/Activity.js';


export const getUserPropertyLength = async (userId, property) => {
    let userPropertiesLength = null;

    switch ( property ) {
        case 'transactions':
            userPropertiesLength = (await User.findById(userId)).transactions.length;
            break;
        case 'products':
            userPropertiesLength = (await User.findById(userId)).products.length;
            break;
        case 'likes':
            userPropertiesLength = (await User.findById(userId)).likes.length;
            break;
        case 'reviews':
            userPropertiesLength = (await User.findById(userId)).reviews.length;
            break;
        case 'activities':
            userPropertiesLength = (await User.findById(userId)).activities.length;
            break;
        default:
            userPropertiesLength = {};
    }

    return userPropertiesLength;
}

const getUserProperties = async (userId, property, upperBound) => {
    let userProperties = null;
    let maxLength = null;

    switch ( property ) {
        case 'transactions':
            const userTransactions = (await User.findById(userId)).transactions;
            maxLength = userTransactions.length;
            userProperties = (await Transaction.find({ '_id': { $in: userTransactions } }, { _id: 1 })
                                        .sort({ createdAt: 1 })
                                        .limit(Number(upperBound) || maxLength))
                                        .map(element => element._id);
            break;
            
        case 'products':
            const userProducts = (await User.findById(userId)).products;
            maxLength = userProducts.length;
            userProperties = (await Product.find({ '_id': { $in: userProducts } }, { _id: 1 })
                                        .sort({ createdAt: 1 })
                                        .limit(Number(upperBound) || maxLength))
                                        .map(element => element._id);
            break;

        case 'likes':
            const userLikes = (await User.findById(userId)).likes;
            maxLength = userLikes.length;
            userProperties = (await Like.find({ '_id': { $in: userLikes } }, { _id: 1 })
                                        .sort({ createdAt: 1 })
                                        .limit(Number(upperBound) || maxLength))
                                        .map(element => element._id);
            break;

        case 'reviews':
            const userReviews = (await User.findById(userId)).reviews;
            maxLength = userReviews.length;
            userProperties = (await Review.find({ '_id': { $in: userReviews } }, { _id: 1 })
                                        .sort({ createdAt: 1 })
                                        .limit(Number(upperBound) || maxLength))
                                        .map(element => element._id);
            break;

        case 'activities':
            const userActivities = (await User.findById(userId)).activities;
            maxLength = userActivities.length;
            userProperties = (await Activity.find({ '_id': { $in: userActivities } }, { _id: 1 })
                                            .sort({ createdAt: -1 })
                                            .limit(Number(upperBound) || maxLength))
                                            .map(element => element._id);

            break;

        default:
            userProperties = {};
    }

    return userProperties;
}

export default getUserProperties;