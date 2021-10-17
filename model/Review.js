import mongo from "mongoose";

const review = new mongo.Schema({
    createdAt: {
        type: Date,
        default: Date.now()
    },
    content: String,
    rating: Number,
    owner: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

export default mongo.model('Review', review);