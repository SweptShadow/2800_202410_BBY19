const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  type: { type: String, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  lastMessage: String,
  lastMessageTimestamp: Date,
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;

// {
//     _id: ObjectId,
//     type: String, // "direct" type for DMs, "group" type for group chat
//     participants: [ObjectId], 
//     createdAt: Date,
//     lastMessage: String,
//     lastMessageTimestamp: Date,
// }