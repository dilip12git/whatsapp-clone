const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../../Models/user');

const router = express.Router();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/profiles';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../Users-files/profiles');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    cb(null, Date.now()+`_profile${fileExt}`);
  }
});

const upload = multer({ storage: storage });


router.patch('/update-user', upload.single('profileImage'), async (req, res) => {
  const { userId, name, email } = req.body;

  try {
    if(!userId){
      return res.status(404).json({ message: 'UserId not found' });

    }
    // console.log(userId)
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) {
      user.email = email;
    }
    if (name) {
      user.name = name;
    }

    if (req.file) {
      const oldImagePath = path.join(__dirname, `../../Users-files/profiles/${path.basename(user.profile || '')}`);
      if (user.profile && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); 
      }

      user.profile = `${BASE_URL}/${req.file.filename}`;
    }

    await user.save();
    const { password, ...userDataWithoutPassword } = user.toObject();

    res.json({
      message: 'User updated successfully',
      user: userDataWithoutPassword,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

module.exports = router;
