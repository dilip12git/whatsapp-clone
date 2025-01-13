const express = require('express');
const router = express.Router();
const UserList = require('../../Models/chatList');
const User = require('../../Models/user'); 
const Chat = require('../../Models/chat'); 

router.get('/chat-list/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userList = await UserList.findOne({ userId });
    if (userList && userList.chatPartners.length > 0) {
      const chatPartners = userList.chatPartners.sort((a, b) => b.timestamp - a.timestamp);

      let totalUnseenCount = 0;
      const userDetailsPromises = chatPartners.map(async (partner) => {
        const userDetail = await User.findOne({ userId: partner.peerId }).select('-password');

        if (userDetail) {
          const unseenMessagesCount = await Chat.aggregate([
            { $match: { participants: { $all: [userId, partner.peerId] } } },
            { $unwind: '$messages' },
            { $match: { 'messages.receiverId': userId, 'messages.seen': false } },
            { $count: 'unseenCount' }
          ]);

          const count = unseenMessagesCount.length > 0 ? unseenMessagesCount[0].unseenCount : 0;
          totalUnseenCount += count;

          return {
            chatPartner: partner,
            userDetail,
            unseenMessagesCount: count,
          };

        } else {
          return {
            chatPartner: partner,
            userDetail: null,
            unseenMessagesCount: 0,
          };
        }
      });

      const userDetails = await Promise.all(userDetailsPromises);
      return res.json({ userDetails, totalUnseenCount });
    }
    
    res.json({ userDetails: [], totalUnseenCount: 0 });
  } catch (error) {
    console.error('Error fetching chat partners:', error);
    res.status(500).json({ error: 'An error occurred while fetching chat partners.' });
  }
});

module.exports = router;
