document.addEventListener("DOMContentLoaded", function () {
  const socket = io();

  let chatRoomId;

  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");

  const loadChatRoom = async () => {
    const response = await fetch("/api/chat/create-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ participants: [] }),
    });

    const result = await response.json();
    chatRoomId = result.chatRoomId;

    socket.emit("joinRoom", chatRoomId);

    messages.innerHTML = "";

    loadChatHistory();
  };

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

  async function loadChatHistory() {
    if (!chatRoomId) return;
    const response = await fetch(`/api/chat/chat-history/${chatRoomId}`);
    const messages = await response.json();
    messages.forEach(appendMessage);
  }

  function appendMessage(message) {
    const item = document.createElement("li");
    item.textContent = message.message;
    messages.appendChild(item);
  }

  loadChatRoom();
});
