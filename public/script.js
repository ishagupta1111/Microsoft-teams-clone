const socket = io("/");
const videoWrapper = document.getElementById("video-wrapper");
const myVideo = document.createElement("video");
myVideo.muted = true;

let peer = null;

let myStream;
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
}).then( function(stream){
  myStream = stream;

  // peer = new Peer(undefined,{
  //   path: "/peerjs",
  //   host: "/",
  //   port: "3000"
  // });
  peer = new Peer();
  addVideoStream(myVideo, stream);

  peer.on("open",function(id){// peer generates ids automatically
    socket.emit("join-room", room_id,id); //this person joined the room
  });

//answering the call by another user
  peer.on("call", function(call) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream",function(userVideoStream){
        addVideoStream(video,userVideoStream);
      });
  });

  socket.on('user-connected', userId => {
  console.log('New User Connected: ' + userId)
  const fc = () => connectToNewUser(userId, stream)
  timerid = setTimeout(fc, 2500)
  })

});


function connectToNewUser(userId,stream) {
  const call = peer.call(userId,stream);//calling another user and sending our stream
  const video = document.createElement("video");
  call.on("stream",function(userVideoStream){ //recieving that users stream
    addVideoStream(video,userVideoStream); // and adding that stream
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", function() {
    video.play();
  });

  videoWrapper.append(video);
}

//chat functionality
let mssg = $("input");
console.log(mssg);

$("html").keydown(function(key) {
  if(key.which == 13 && mssg.val().length !==0){ //13 -> code of enter (if we press enter then event will occur)
    console.log(mssg.val());
    socket.emit("message",mssg.val());
    mssg.val('');//after pressing enter we want message to be erased from input box
  }
});

socket.on("createMessage",function(newmessage) { //coming from server mssg
  console.log(newmessage);
  $('ul').append('<li class = "message"><b>user</b></br>' + newmessage + '</li>');
  scrollToBottom();
});

function scrollToBottom() {
  let e = $('.chat-window');
  e.scrollTop(e.prop("scrollHeight"));
}

//mute functionality
function muteUnmute() {
  const enabled = myStream.getAudioTracks()[0].enabled;
  if(enabled) { //unmute (set the mute to false)
    myStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  }else { //mute it (set mute to true)
    myStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
}

function setUnmuteButton() {
  const html = '<i class="fas fa-microphone"></i><span>Mute</span>'
  document.querySelector(".mute-button").innerHTML = html;
}

function setMuteButton() {
  const html = '<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>'
  document.querySelector(".mute-button").innerHTML = html;
}

//play or unplay video functionality
function playOrUnplayVideo() {
  const enabled = myStream.getVideoTracks()[0].enabled;
  if(enabled) { //play video
    myStream.getVideoTracks()[0].enabled = false;
    setPlayVideoButton();
  }else { //mute it (set mute to true)
    myStream.getVideoTracks()[0].enabled = true;
    setUnplayVideoButton();
  }
}

function setPlayVideoButton() {
  const html = '<i class="stop fas fa-video-slash"></i><span>Play Video</span>'
  document.querySelector(".video-button").innerHTML = html;
}

function setUnplayVideoButton() {
  const html = '<i class="fas fa-video"></i><span>Stop Video</span>'
  document.querySelector(".video-button").innerHTML = html;
}
