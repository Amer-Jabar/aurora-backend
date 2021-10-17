import mongo from 'mongoose';


const activitySchema = new mongo.Schema({
    createdAt: {
        type: Date,
        default: Date.now()
    },
    originalActivity: {
        type: mongo.Schema.Types.ObjectId,
        refPath: 'activityName'
    },
    activityName: {
        type: String,
        required: true,
        enum: ['Transaction', 'Product', 'Like', 'Review']
    }
})

export default mongo.model('Activity', activitySchema);