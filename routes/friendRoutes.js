const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Friendship = require('../models/friendship');

router.post('/add', async (req, res) => {
  const { email } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const friend = await User.findOne({ email });
    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { user1: userId, user2: friend._id },
        { user1: friend._id, user2: userId },
      ],
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friendship already exists' });
    }

    const friendship = new Friendship({ user1: userId, user2: friend._id });
    await friendship.save();

    await User.findByIdAndUpdate(userId, { $push: { friends: friend._id } });
    await User.findByIdAndUpdate(friend._id, { $push: { friends: userId } });

    res.status(201).json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

router.get('/', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const user = await User.findById(userId).populate('friends', 'username email');
    res.status(200).json(user.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

module.exports = router;
