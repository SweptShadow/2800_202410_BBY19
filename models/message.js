const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  chatRoomId: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

messageSchema.pre('save', function(next) {
  console.log(`About to save message: ${this.message}`);
  next();
});

messageSchema.post('save', function(doc) {
  console.log(`Message saved: ${doc.message}`);
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;


