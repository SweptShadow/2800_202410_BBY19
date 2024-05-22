const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

/**
 * POST /create-room
 * 
 * Route to create a new chat room.
 * 
 * This route handler delegates the creation of a new chat room to the `createRoom`
 * method in `chatController`. It expects the necessary data to create the room in
 * the request body.
 * 
 * @name createRoom
 * @function
 * @memberof module:router
 * @inner
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @returns {void}
 */
router.post("/create-room", chatController.createRoom);
router.post("/send-message", chatController.sendMessage);
router.get("/chat-history/:roomId", chatController.getChatHistory);

module.exports = router;
