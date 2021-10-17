import mongo from 'mongoose';

const messageSchema = new mongo.Schema({
    createdAt: {
        type: Date,
        default: Date.now()
    },
    username: String,
    email: String,
    message: String
})

export default mongo.model('Message', messageSchema);