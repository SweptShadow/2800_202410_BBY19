const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const User = require('../models/user');

// Route to create a new event
router.post('/events', async (req, res) => {
  const { date, game, participants } = req.body;

  try {
    const event = new Event({ date, game, participants });
    await event.save();

    // Update each participant's event list
    await User.updateMany(
      { _id: { $in: participants } },
      { $push: { events: event._id } }
    );

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to fetch events for a user
router.get('/events/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('events');
    res.status(200).json(user.events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
