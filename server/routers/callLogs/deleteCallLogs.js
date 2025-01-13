const express = require('express');
const CallHistory = require('../../Models/callLogs');
const router = express.Router();

/**
 * Delete a single call log for the user.
 */
router.delete('/delete/:callId', async (req, res) => {
    const { userId } = req.body; 
    const { callId } = req.params;

    try {
        const call = await CallHistory.findById(callId);

        if (!call) {
            return res.status(404).json({ success: false, message: 'Call history not found' });
        }

        if (call.caller.userId === userId) {
            call.callerDeleted = true;
        } else if (call.receiver.userId === userId) {
            call.receiverDeleted = true;
        } else {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this call history' });
        }

        await call.save();

        // Delete the call if both users have marked it as deleted
        if (call.callerDeleted && call.receiverDeleted) {
            await CallHistory.findByIdAndDelete(callId);
        }

        res.json({ success: true, message: 'Call log deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Delete all call logs for the user.
 */
router.delete('/delete-all', async (req, res) => {
    const { userId } = req.body; 

    try {
        await CallHistory.updateMany(
            { $or: [{ 'caller.userId': userId }, { 'receiver.userId': userId }] },
            [
                {
                    $set: {
                        callerDeleted: { $cond: [{ $eq: ['$caller.userId', userId] }, true, '$callerDeleted'] },
                        receiverDeleted: { $cond: [{ $eq: ['$receiver.userId', userId] }, true, '$receiverDeleted'] },
                    },
                },
            ]
        );

        // Cleanup: Delete calls marked deleted by both users
        await CallHistory.deleteMany({ callerDeleted: true, receiverDeleted: true });

        res.json({ success: true, message: 'All call logs deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// /**
//  * Get all call logs visible to the user.
//  */
// router.get('/', async (req, res) => {
//     const { userId } = req.query; // The user's ID making the request

//     try {
//         const history = await CallHistory.find({
//             $or: [
//                 { 'caller.userId': userId, callerDeleted: false },
//                 { 'receiver.userId': userId, receiverDeleted: false },
//             ],
//         });

//         res.json({ success: true, data: history });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// });

module.exports = router;
