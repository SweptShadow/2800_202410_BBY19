const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  chatRoomId: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;