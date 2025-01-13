const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
    caller: {
        userId: { type: String, required: true },
        name: String,
        profile: String,
    },
    receiver: {
        userId: { type: String, required: true },
        name: String,
        profile: String,
    },
    callType: {
        type: String,
        enum: ['audio', 'video'], 
        required: true,
    },
    status: {
        type: String,
        enum: ['missed', 'completed'],
        default: 'missed',
    },
    duration: {
        type: Number, // Duration in seconds
        default: 0,
    },
    startedAt: {
        type: Date, // Start time of the call
        default: Date.now,
    },
    endedAt: {
        type: Date, 
        default: Date.now,
    },
    callerDeleted: {
        type: Boolean,
        default: false,
    },
    receiverDeleted: {
        type: Boolean, 
        default: false,
    },
}, { timestamps: true });

const CallHistory = mongoose.model('CallHistory', callHistorySchema);
module.exports = CallHistory;
