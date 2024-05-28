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

  async function fetchFriends() {
    try {
      const response = await fetch("/api/friends");
      const friends = await response.json();
      friendsList.innerHTML = "";
      let hasUnreadMessages = false;

      for (const friend of friends) {
        const listItem = document.createElement("li");

        try {
          const unreadCountResponse = await fetch(
            `/api/friends/unread-messages/${friend._id}`
          );
          const { unreadCount } = await unreadCountResponse.json();
          listItem.textContent = `${friend.username} (${friend.email}) ${
            unreadCount > 0 ? `(${unreadCount} unread)` : ""
          }`;

          if (unreadCount > 0) {
            const unreadDot = document.createElement("span");
            unreadDot.classList.add("unread-dot");
            listItem.appendChild(unreadDot);
            hasUnreadMessages = true;
          }
        } catch (error) {
          console.error("Error fetching unread messages count:", error);
          listItem.textContent = `${friend.username} (${friend.email})`;
        }

        listItem.addEventListener("click", () => openChat(friend._id));
        friendsList.appendChild(listItem);
      }

      const chatIcon = document.getElementById("toggle-chat-overlay");
      if (hasUnreadMessages) {
        const unreadDot = document.createElement("span");
        unreadDot.classList.add("unread-dot");
        chatIcon.appendChild(unreadDot);
      } else {
        const existingDot = chatIcon.querySelector(".unread-dot");
        if (existingDot) {
          chatIcon.removeChild(existingDot);
        }
      }
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
    socket.once("setChatRoomId", async (roomId) => {
      currentChatRoomId = roomId;
      try {
        const response = await fetch(`/api/chat/chat-history/${roomId}`);
        const messages = await response.json();
        chatRoomIdElement.innerHTML = messages
          .map(
            (msg) => `
          <li class="${msg.senderId === userId ? "sent" : "received"}">
            ${msg.username}: ${msg.message}
          </li>`
          )
          .join("");
        chatModal.style.display = "block";
        scrollToBottom();

        // Check if there are any unread messages in the current room
        const hasUnreadMessages = messages.some(msg => !msg.isRead && msg.senderId !== userId);

        // Remove red dot next to user's name in friends list if there are no unread messages
        if (!hasUnreadMessages) {
          const friendListItem = [...friendsList.children].find((li) =>
            li.textContent.includes(friendId)
          );
          if (friendListItem) {
            const unreadDot = friendListItem.querySelector(".unread-dot");
            if (unreadDot) {
              friendListItem.removeChild(unreadDot);
            }
          }

          // Remove red dot on chat icon if no other unread messages
          const chatIconDot = document
            .getElementById("toggle-chat-overlay")
            .querySelector(".unread-dot");
          if (chatIconDot) {
            chatIconDot.remove();
          }
        }

        // Emit event to notify that messages are read
        socket.emit('messages read', { roomId });
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    });
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (chatInput.value && currentChatRoomId) {
      const message = chatInput.value;
      socket.emit("chat message", { chatRoomId: currentChatRoomId, message });
      chatInput.value = "";
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
    newMessage.className = msg.senderId === userId ? "sent" : "received";
    newMessage.textContent = `${msg.username}: ${msg.message}`;
    chatRoomIdElement.appendChild(newMessage);
    scrollToBottom();

    // If the message is not in the current chat room, update the unread indicator
    if (msg.chatRoomId !== currentChatRoomId) {
      const friendListItem = [...friendsList.children].find((li) =>
        li.textContent.includes(msg.username)
      );
      if (friendListItem) {
        let unreadDot = friendListItem.querySelector(".unread-dot");
        if (!unreadDot) {
          unreadDot = document.createElement("span");
          unreadDot.classList.add("unread-dot");
          friendListItem.appendChild(unreadDot);
        }
      }

      // Update the chat icon with a red dot if there are unread messages
      const chatIcon = document.getElementById("toggle-chat-overlay");
      let chatIconDot = chatIcon.querySelector(".unread-dot");
      if (!chatIconDot) {
        chatIconDot = document.createElement("span");
        chatIconDot.classList.add("unread-dot");
        chatIcon.appendChild(chatIconDot);
      }
    }
  });

  socket.on("unread message", (msg) => {
    if (msg.senderId !== userId) {
      const friendListItem = [...friendsList.children].find((li) =>
        li.textContent.includes(msg.username)
      );
      if (friendListItem) {
        let unreadDot = friendListItem.querySelector(".unread-dot");
        if (!unreadDot) {
          unreadDot = document.createElement("span");
          unreadDot.classList.add("unread-dot");
          friendListItem.appendChild(unreadDot);
        }
      }

      const chatIcon = document.getElementById("toggle-chat-overlay");
      let chatIconDot = chatIcon.querySelector(".unread-dot");
      if (!chatIconDot) {
        chatIconDot = document.createElement("span");
        chatIconDot.classList.add("unread-dot");
        chatIcon.appendChild(chatIconDot);
      }
    }
  });

  socket.on("messages read", (data) => {
    console.log("messages read event received", data);
    const { roomId } = data;

    // Remove the red dot next to the friend's name in the friends list
    const friendListItem = [...friendsList.children].find((li) =>
      li.textContent.includes(roomId.split('_').find(id => id !== userId))
    );
    if (friendListItem) {
      const unreadDot = friendListItem.querySelector(".unread-dot");
      if (unreadDot) {
        console.log("Removing unread dot from friend's list item", friendListItem);
        friendListItem.removeChild(unreadDot);
      }
    }

    // Remove the red dot on the chat icon if no other unread messages
    const chatIcon = document.getElementById("toggle-chat-overlay");
    const unreadDots = chatIcon.querySelectorAll(".unread-dot");
    if (unreadDots.length === 0) {
      const chatIconDot = chatIcon.querySelector(".unread-dot");
      if (chatIconDot) {
        console.log("Removing unread dot from chat icon");
        chatIconDot.remove();
      }
    }
  });

  socket.on("typing", (username) => {
    typingIndicator.textContent = `${username} is typing...`;

    clearTimeout(typingIndicator.timer);
    typingIndicator.timer = setTimeout(() => {
      typingIndicator.textContent = "";
    }, 3000);
  });

  socket.on("stop typing", () => {
    typingIndicator.textContent = "";
  });

  function scrollToBottom() {
    chatRoomIdElement.scrollTop = chatRoomIdElement.scrollHeight;
  }

  fetchFriends();
});
