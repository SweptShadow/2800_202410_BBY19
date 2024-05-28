const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  game: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;