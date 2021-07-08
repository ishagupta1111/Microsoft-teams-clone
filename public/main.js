const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const socket = io();

console.log(username);

socket.emit("joinRoom",username,roomId);
//message given by server
socket.on("message" ,function(message) {
  console.log(message);
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit (adding event listener to chat form)

chatForm.addEventListener("submit", function(e) {
  e.preventDefault(); //we dont want to submit the form so added event listener

  const msg = e.target.elements.msg.value; //get message text

  socket.emit("chatMessage",msg,username,roomId); //emit mssg to server

  e.target.elements.msg.value = ""; //after emitting clear the input box
  e.target.elements.msg.focus();
});

function outputMessage(message) { //displaying message onscreen(DOM)
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`

  document.querySelector(".chat-messages").appendChild(div);
}

socket.on("roomInfo",function(room) {
  outputMessage(room);
});

function outputRoom(room) {
  document.getElementById("room-name").innerText = room;
}
