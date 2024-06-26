console.log("video script loaded");

// socket port and mypeer Host/port
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '9002',  
});

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

// if the user has a media device with a mic and video, send the stream
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      addVideoStream(myVideo, stream);

      myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream);
        });
      });
      // connnect a new user to the session
      socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
      });
    })
    .catch(error => {
      console.error('Error accessing media devices:', error);
    });
} else {
  console.error('getUserMedia is not supported on this browser');
}

// send a message to socket when a user disconnects
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
  socket.emit('joinVideoCallRoom', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
