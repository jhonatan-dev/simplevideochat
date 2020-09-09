const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: "peerjsservidor.herokuapp.com",
    port: 443,
    secure: true,
    debug: 3,
    config: {
      iceServers: [
        {
          urls: "stun:3.15.4.15?transport=udp",
          username: "ruedaapp",
          credential: "ruedaapp"
        },
        {
          urls: "stun:3.15.4.15?transport=tcp",
          username: "ruedaapp",
          credential: "ruedaapp"
        },
        {
          urls: "turn:3.15.4.15?transport=udp",
          username: "ruedaapp",
          credential: "ruedaapp"
        },
        {
          urls: "stun:3.15.4.15?transport=tcp",
          username: "ruedaapp",
          credential: "ruedaapp"
        }

        /*
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        {
          urls: "turn:numb.viagenie.ca?transport=tcp",
          username: "datay32672@acetesz.com",
          credential: "123456"
        },
        {
          urls: "turn:numb.viagenie.ca?transport=udp",
          username: "datay32672@acetesz.com",
          credential: "123456"
        },
        {
          urls: [ "stun:us-turn9.xirsys.com" ]
       },
        {
          username: "DVg5ibvyLXZ_vgYfwrr9g9z1Q3iDCcxLO--eYA7caTvOQCxK2gY6EXWfxEpghr8CAAAAAF9X9uJydWVkYWFwcA==",
          credential: "e0b6fc8c-f219-11ea-8e84-0242ac140004",
          urls: [
              "turn:us-turn9.xirsys.com:80?transport=udp",
              "turn:us-turn9.xirsys.com:3478?transport=udp",
              "turn:us-turn9.xirsys.com:80?transport=tcp",
              "turn:us-turn9.xirsys.com:3478?transport=tcp",
              "turns:us-turn9.xirsys.com:443?transport=tcp",
              "turns:us-turn9.xirsys.com:5349?transport=tcp"
          ]
       }*/
      ]
    }
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}