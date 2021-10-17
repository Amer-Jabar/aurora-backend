import mongo from 'mongoose';

const transactionSchema = new mongo.Schema({
    productEntity: Number,
    productPrice: Number,
    payment: Number,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    seller: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'User'
    },
    buyer: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

export default mongo.model('Transaction', transactionSchema);