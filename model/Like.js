import mongo from 'mongoose';

const likeSchema = new mongo.Schema({
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'User',
    },
    product: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'Product',
    }
})

export default mongo.model('Like', likeSchema);