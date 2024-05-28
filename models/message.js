const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  chatRoomId: { type: String, required: true }, 
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

// messageSchema.pre('save', function(next) {
//   console.log(`About to save message: ${this.message}`);
//   next();
// });

// messageSchema.post('save', function(doc) {
//   console.log(`Message saved: ${doc.message}`);
// });

/**
 * The message object contains a chatRoomId, a senderId, the message and a timestamp
 * of when it was created.
 */
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;


