const express = require("express");
const router = express.Router();
const CallHistory = require("../../Models/callLogs");
const User = require("../../Models/user");

// Create a new call record
router.post("/call-logs", async (req, res) => {
  const { callerId, receiverId, callType } = req.body;

  try {
    // Fetch caller and receiver details from User collection
    const caller = await User.findOne({ userId: callerId }).select(
      "userId name profile"
    );
    const receiver = await User.findOne({ userId: receiverId }).select(
      "userId name profile"
    );

    if (!caller || !receiver) {
      return res.status(404).json({ error: "Caller or receiver not found" });
    }

    // Create a new call record
    const newCall = new CallHistory({
      caller: {
        userId: caller.userId,
        name: caller.name,
        profile: caller.profile,
      },
      receiver: {
        userId: receiver.userId,
        name: receiver.name,
        profile: receiver.profile,
      },
      callType,
    });
    const savedCall = await newCall.save();
    res.status(201).json({ message: "Call record created", call: savedCall });
  } catch (err) {
    console.error("Error creating call record:", err);
    res.status(500).json({ error: "Failed to create call record" });
  }
});

module.exports = router;
