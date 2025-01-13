const express = require('express');
const router = express.Router();
const ChatList = require('../../Models/chatList'); 
const User = require('../../Models/user'); 

router.post('/add-chatlist', async (req, res) => {
  const { userId, chatPartnerEmail, lastMessage } = req.body;

  if (!userId || !chatPartnerEmail) {
    return res.status(400).json({ error: 'Both email and chatPartnerEmail are required.' });
  }

  try {
    const chatPartner = await User.findOne({ email: chatPartnerEmail });

    if (!chatPartner) {
      return res.status(404).json({ error: 'User or chat partner not found.' });
    }

    const peerId = chatPartner.userId;
    let chatList = await ChatList.findOne({ userId });

    if (chatList) {
      const existingPartner = chatList.chatPartners.find(partner => partner.peerId === peerId.toString());
      if (!existingPartner) {
        chatList.chatPartners.push({ peerId, lastMessage });
        await chatList.save();
      }
    } else {
      chatList = new ChatList({
        userId,
        chatPartners: [{ peerId, lastMessage }],
      });
      await chatList.save();
    }

    res.status(200).json({ success: true, chatList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
