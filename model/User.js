import mongo from "mongoose";
import bcrypt from 'bcrypt';

const user = new mongo.Schema({
    username: String,
    password: String,
    email: String,
    image: String,
    address: String,
    phone: String,
    deposit: {
        type: Number,
        default: 1000
    },
    ZIP: String,
    likesCount: {
        type: Number,
        default: 0
    },
    reviewsCount: Number,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    totalMoneyExchange: {
        type: Number,
        default: 0
    },
    spentMoney: {
        type: Number,
        default: 0
    },
    earnedMoney: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: mongo.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: []
    }],
    products: [{
        type: mongo.Schema.Types.ObjectId,
        ref: 'Product',
        default: []
    }],
    likes: [{
        type: mongo.Schema.Types.ObjectId,
        ref: 'Like',
        default: []
    }],
    reviews: [{
        type: mongo.Schema.Types.ObjectId,
        ref: 'Review',
        default: []
    }],
    activities: [{
        type: mongo.Schema.Types.ObjectId,
        ref: 'Activity',
        default: []
    }]
})

user.pre('save', async function(next) {

    if ( !this ) {
        return next();    
    }

    this.password = bcrypt.hashSync(this.password, 8)
    next();
})

export default mongo.model('User', user);