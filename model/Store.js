import mongo from 'mongoose';

const store = new mongo.Schema({
    name: String,
    lat: Number,
    lng: Number,
    description: String,
    city: String,
    images: [{
        type: String
    }]
})

export default mongo.model('Store', store);