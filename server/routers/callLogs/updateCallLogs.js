const express = require('express');
const router = express.Router();
const CallHistory = require('../../Models/callLogs'); 

router.patch('/', async (req, res) => {
    const {id, status, endedAt } = req.body;

    try {
        if (!['missed', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Only "missed" or "completed" are allowed.' });
        }

        const updateData = { status };
        if (endedAt) updateData.endedAt = new Date(endedAt);

        // Update the call record
        const updatedCall = await CallHistory.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedCall) {
            return res.status(404).json({ error: 'Call record not found' });
        }

        res.status(200).json({ message: 'Call record updated', call: updatedCall });
    } catch (err) {
        console.error('Error updating call record:', err);
        res.status(500).json({ error: 'Failed to update call record' });
    }
});

module.exports = router;
