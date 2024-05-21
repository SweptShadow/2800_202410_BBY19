const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");

exports.createRoom = async (req, res) => {
  const { participants } = req.body;

  try {
    const newRoom = new ChatRoom({ participants, createdAt: new Date() });
    await newRoom.save();
    res.status(201).json({ chatRoomId: newRoom._id.toString() });
  } catch (error) {
    console.error("Error creating chat room:", error);
    res.status(500).json({ error: "Failed to create chat room" });
  }
};

exports.sendMessage = async (req, res) => {
  const { chatRoomId, message } = req.body;
  const senderId = req.session.userId;

  if (!senderId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const newMessage = new Message({
      chatRoomId,
      senderId,
      message,
      timestamp: new Date(),
    });
    await newMessage.save();

    await ChatRoom.findByIdAndUpdate(chatRoomId, {
      lastMessage: message,
      lastMessageTimestamp: new Date(),
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.getChatHistory = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.find({ chatRoomId: roomId }).sort({ timestamp: 1 }).populate('senderId', 'username');
    const messagesWithUsernames = messages.map(msg => ({
      chatRoomId: msg.chatRoomId,
      senderId: msg.senderId._id,
      username: msg.senderId.username,
      message: msg.message,
      timestamp: msg.timestamp,
    }));
    res.status(200).json(messagesWithUsernames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get chat history." });
  }
};

