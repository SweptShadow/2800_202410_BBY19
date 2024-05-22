document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  const socket = io();

  let chatRoomId;
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");

  const roomPrompt = prompt("Enter a room name:");
  const roomName = roomPrompt ? roomPrompt.trim() : "default";

  if (!roomName) {
    alert("Room name is required!");
    return;
  }

  socket.emit("joinChatRoom", roomName);

  socket.on("setChatRoomId", (id) => {
    chatRoomId = id;
    loadChatHistory();
  });

  /**
   * Loads the chat history for the current room.
   * 
   * GETs the chat history from the server with fetch and loads it into a data variable.
   * Then appends each message into the window.
   * @returns promise that resolves to an array of messages
   */
  async function loadChatHistory() {
    if (!chatRoomId) {
      return;
    }
    messages.innerHTML = ''; 
    const response = await fetch(`/api/chat/chat-history/${chatRoomId}`);
    const data = await response.json();
    // console.log("Fetched messages: ", data); 
    data.forEach(appendMessage);
  }

  /**
   * When a message gets submitted as form input, this POSTs it to the server
   * with a chatRoomId and the message body, unless the field is empty. Then it
   * emits the message to the current chatroom with socket.
   */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (input.value) {
      const message = input.value;
      // console.log("Submitting message: ", message);
      const response = await fetch("/api/chat/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatRoomId,
          message,
        }),
      });
      const newMessage = await response.json();
      // console.log("Message saved: ", newMessage);
      socket.emit("chat message", newMessage);
      input.value = "";
    }
  });

  socket.on("chat message", (msg) => {
    // console.log("Received chat message: ", msg);
    appendMessage(msg);
    scrollToBottom();
  });

  /**
   * Appends the message to the chat window.
   * @param {String} message 
   */
  function appendMessage(message) {
    const item = document.createElement("li");
    item.textContent = `${message.username}: ${message.message}`;
    messages.appendChild(item);
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }
});
