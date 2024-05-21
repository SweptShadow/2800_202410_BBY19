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

  async function loadChatHistory() {
    if (!chatRoomId) {
      return;
    }
    const response = await fetch(`/api/chat/chat-history/${chatRoomId}`);
    const messages = await response.json();
    messages.forEach(appendMessage);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
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
    appendMessage(msg);
  });

  socket.on('chatHistory', (msgs) => {
    messages.innerHTML = '';
    msgs.forEach(appendMessage);
  });

  function appendMessage(message) {
    const item = document.createElement("li");
    item.textContent = `${message.username}: ${message.message}`;
    messages.appendChild(item);
  }
});
