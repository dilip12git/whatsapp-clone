const express = require('express');
const router = express.Router();
const User = require('../../Models/user'); 

// Route to update email
router.patch('/update-email', async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ message: 'UserId and email are required.' });
    }
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.email = email;
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Email updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'An error occurred.', error });
  }
});

module.exports = router;
