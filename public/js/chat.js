console.log("chat.js script loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed"); 

  const socket = io();

  let chatRoomId;

  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");

  const loadChatRoom = async () => {
    console.log("Loading chat room"); 
    const response = await fetch("/api/chat/create-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ participants: [] }),
    });

    const result = await response.json();
    chatRoomId = result.chatRoomId;

    socket.emit("joinChatRoom", chatRoomId);

    messages.innerHTML = "";

    loadChatHistory();
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted"); 
    if (input.value) {
      const message = input.value;
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
      socket.emit("chat message", newMessage);
      input.value = "";
    }
  });

  socket.on("chat message", (msg) => {
    console.log("Received message:", msg); 
    appendMessage(msg);
  });

  async function loadChatHistory() {
    if (!chatRoomId) return;
    const response = await fetch(`/api/chat/chat-history/${chatRoomId}`);
    const messages = await response.json();
    messages.forEach(appendMessage);
  }

  function appendMessage(message) {
    console.log("Appending message:", message);
    const item = document.createElement("li");
    item.textContent = `${message.username}: ${message.message}`;
    messages.appendChild(item);
  }

  loadChatRoom();
});
