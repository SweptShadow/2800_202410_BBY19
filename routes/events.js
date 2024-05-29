const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const User = require('../models/user');

// Route to create a new event
router.post('/', async (req, res) => {
  const { date, game, participants } = req.body;
  console.log('Incoming request body:', req.body);

  try {
    // Find users by their emails
    const users = await User.find({ email: { $in: participants } });

    // Extract ObjectIds of the found users
    const participantIds = users.map(user => user._id);

    const event = new Event({ date, game, participants: participantIds });
    await event.save();

    // Update each participant's event list
    await User.updateMany(
      { _id: { $in: participantIds } },
      { $push: { events: event._id } }
    );

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route to fetch events for a user
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('events');
    res.status(200).json(user.events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
