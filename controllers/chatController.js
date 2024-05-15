const ChatRoom = require("../models/chatRoom");
const Message = require("../models/message");

exports.createRoom = async (req, res) => {
    const { type, participants } = req.body;
  
    console.log("Request Body:", req.body); 
  
    if (type === 'direct' && participants.length !== 2) {
      return res.status(400).json({ error: 'Direct chat must have exactly two participants' });
    }
    
    try {
      const newRoom = new ChatRoom({ type, participants, createdAt: new Date() });
      await newRoom.save();
      res.status(201).json(newRoom);
    } catch (error) {
      console.error("Error creating chat room:", error); 
      res.status(500).json({ error: 'Failed to create chat room' });
    }
  };

exports.sendMessage = async (req, res) => {
  const { chatRoomId, senderId, message } = req.body;

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
    console.error(error);
    res.status(500).json({ error: "Failed to send a message." });
  }
};

exports.getChatHistory = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.find({ chatRoomId: roomId }).sort({
      timestamp: 1,
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get chat histroy." });
  }
};
