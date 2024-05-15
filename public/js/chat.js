document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
  
    socket.emit('joinRoom', chatRoomId);
  
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (input.value) {
        const message = input.value;
        console.log("Sending message:", message); 
        const response = await fetch('/api/chat/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chatRoomId,
            message
          })
        });
        const newMessage = await response.json();
        socket.emit('chat message', newMessage);
        input.value = ''; 
      }
    });
  
    socket.on('chat message', (msg) => {
      appendMessage(msg);
    });
  
    async function loadChatHistory() {
      const response = await fetch(`/api/chat/chat-history/${chatRoomId}`);
      const messages = await response.json();
      messages.forEach(appendMessage);
    }
  
    function appendMessage(message) {
      const item = document.createElement('li');
      item.textContent = message.message;
      messages.appendChild(item);
    }
  
    loadChatHistory();
  });
  
  