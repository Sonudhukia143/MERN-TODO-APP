import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    actionType: {
        type: String,
        enum: ['created', 'edited', 'deleted', 'assigned', 'status_changed', 'priority_changed'],
        required: true
    },
    details: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Action', actionSchema);