const express = require('express');
const router = express.Router();
const CallHistory = require('../../Models/callLogs'); 

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'loggedInUserId is required' });
    }

    const callHistories = await CallHistory.find({
      $or: [
        { "receiver.userId": userId, status: "missed",receiverDeleted: false }, 
        { "caller.userId": userId,callerDeleted: false } 
      ]
    }).sort({ startedAt: -1 });

    const formattedHistory = callHistories.map(call => ({
      _id: call._id,
      recipient: call.caller.userId === userId ? call.receiver : call.caller,
      timestamp: call.timestamp,
      status: call.status,
      callDirection : call.caller.userId === userId ? "outgoing" : "incoming",
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      callType:call.callType
    }));

    res.status(200).json(formattedHistory);
  } catch (err) {
    console.error('Error fetching call history:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
