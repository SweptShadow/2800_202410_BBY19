const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");

exports.createRoom = async (req, res) => {
  const { name, participants } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "Room name is required" });
  }

  try {
    let room = await ChatRoom.findOne({ name });
    if (!room) {
      room = new ChatRoom({ name, participants, createdAt: new Date() });
      await room.save();
    }
    res.status(201).json({ chatRoomId: room._id.toString(), name: room.name });
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

  console.log(`Entering sendMessage: ${message} to room: ${chatRoomId} by user: ${senderId}`);

  try {
    const newMessage = new Message({
      chatRoomId,
      senderId,
      message,
      timestamp: new Date(),
    });

    await newMessage.save();

    console.log(`Exiting sendMessage: ${message} saved with ID: ${newMessage._id}`);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};


exports.getChatHistory = async (req, res) => {
  
  const { roomId } = req.params;

  try {
    console.log(`Fetching chat history for roomId: ${roomId}`);
    const messages = await Message.find({ chatRoomId: roomId }).sort({ timestamp: 1 }).populate('senderId', 'username');
    console.log(`Fetched messages: ${messages.length}`, messages);
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
