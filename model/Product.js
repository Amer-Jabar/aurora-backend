import mongo from 'mongoose';

const productSchema = new mongo.Schema({
    category: String,
    name: String,
    description: String,
    details: [String],
    price: {
        type: Number,
        default: 0   
    },
    entity: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    dimensions: [String],
    likesCount: {
        type: Number,
        default: 0
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongo.Schema.Types.ObjectId,
        ref: 'Like',
        default: []
    }],
    owner: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'User'
    },
    buyer: [{
        type: mongo.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reviews: [{
        type: mongo.Schema.Types.ObjectId,
        ref: 'Review',
        default: []
    }]
})

export default mongo.model('Product', productSchema);