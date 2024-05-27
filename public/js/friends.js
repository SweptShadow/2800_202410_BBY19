document.addEventListener("DOMContentLoaded", function () {
  const socket = io();

  const toggleChatOverlayButton = document.getElementById("toggle-chat-overlay");
  const friendsChatOverlay = document.getElementById("friends-chat-overlay");
  const addFriendForm = document.getElementById("add-friend-form");
  const friendsList = document.getElementById("friends-list");
  const chatModal = document.getElementById("chat-modal");
  const chatRoomIdElement = document.getElementById("chat-room-id");
  const typingIndicator = document.getElementById("typing-indicator");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  let currentChatRoomId = null;

  /**
   * Toggles the chat overlay by setting the display element.
   */
toggleChatOverlayButton.addEventListener("click", () => {
  if (friendsChatOverlay.classList.contains("show")) {
    friendsChatOverlay.classList.remove("show");
  } else {
    friendsChatOverlay.classList.add("show");
  }
});

const closeChatModalButton = document.querySelector("#chat-modal button");
closeChatModalButton.addEventListener("click", () => {
  chatModal.classList.remove("show");
});

  /**
   * GETs the friends list from the server and loads it into the UI.
   * Each friend that gets loaded is displayed as a clickable list item
   * that opens a chat with that friends when clicked.
   */
  async function fetchFriends() {
    try {
      const response = await fetch("/api/friends");
      const text = await response.text();
      console.log("Raw response text:", text);
      const friends = JSON.parse(text);
      friendsList.innerHTML = '';
      friends.forEach(friend => {
        const listItem = document.createElement("li");
        listItem.textContent = `${friend.username} (${friend.email})`;
        listItem.addEventListener("click", () => openChat(friend._id));
        friendsList.appendChild(listItem);
      });
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }

  addFriendForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = addFriendForm.elements["friend-email"].value;
    const response = await fetch("/api/friends/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (result.message) {
      alert(result.message);
      fetchFriends();
    } else {
      alert(result.error);
    }
  });

  async function openChat(friendId) {
    socket.emit("joinChatRoom", friendId);
    socket.on("setChatRoomId", (roomId) => {
      currentChatRoomId = roomId;
    });
    socket.on("chatHistory", (messages) => {
      chatRoomIdElement.innerHTML = messages.map(msg => `
        <li class="${msg.senderId === userId ? 'sent' : 'received'}">
          ${msg.username}: ${msg.message}
        </li>`).join('');
      chatModal.style.display = "block";
      scrollToBottom();
    });
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (chatInput.value && currentChatRoomId) {
      const message = chatInput.value;
      socket.emit("chat message", { chatRoomId: currentChatRoomId, message });
      chatInput.value = '';
      socket.emit("stop typing", currentChatRoomId); 
      scrollToBottom();
    }
  });

  chatInput.addEventListener("keypress", () => {
    if (chatInput.value && currentChatRoomId) {
      socket.emit("typing", currentChatRoomId);
    }
  });

  socket.on("chat message", (msg) => {
    const newMessage = document.createElement("li");
    newMessage.className = msg.senderId === userId ? 'sent' : 'received';
    newMessage.textContent = `${msg.username}: ${msg.message}`;
    chatRoomIdElement.appendChild(newMessage);
    scrollToBottom();
  });

  socket.on("typing", (username) => {
    typingIndicator.textContent = `${username} is typing...`;

    clearTimeout(typingIndicator.timer);
    typingIndicator.timer = setTimeout(() => {
      typingIndicator.textContent = '';
    }, 3000);
  });

  socket.on("stop typing", () => {
    typingIndicator.textContent = '';
  });

  /**
   * Scrolls the chat window to the bottom.
   */
  function scrollToBottom() {
    chatRoomIdElement.scrollTop = chatRoomIdElement.scrollHeight;
  }

  fetchFriends();
});
