// require('dotenv').config();
const express = require("express");//can create its own http instance
const app = express();
const bodyParser = require("body-parser");
const server = require("http").Server(app);//added this because socket.io expects access to http server
const io = require("socket.io")(server);
const formatMessage = require("./utils/messages");
const {userJoin,getCurrentUser} = require("./utils/users");
const { uuid } = require("uuidv4");//generate multiple room ids
const {ExpressPeerServer} = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use("/peerjs",peerServer);
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// meeting code

app.get("/" , function(req,res){
  res.render("home", {roomId : uuid()});
});

app.get("/:custom" , function(req,res){
  res.render("room",{roomId : req.params.custom});
});

app.get("/chat/:custom", function(req,res) {
  res.render("chatindex", {roomId : req.params.custom});
});

app.post("/chat/:custom",function(req,res) {
  const username = req.body.username;
  res.render("chatRoom", {roomId : req.params.custom, username: username});
});


const users = {};
io.on("connection", function(socket){

  //chatroom sockets

  socket.on("joinRoom",function(username,roomId){

    const user = userJoin(socket.id,username,roomId);
    console.log(username);
    socket.join(user.roomId);
    socket.emit("message", formatMessage("Bot", "Welcome to ChatRoom"));

    socket.broadcast.to(user.roomId).emit("message",formatMessage("Bot",`${user.username} has joined the chat`)); //broadcast when a user connects

    // io.to(user.roomId).emit("roomInfo", roomId);
  });

  socket.on("disconnect", function() {
    io.emit("message", formatMessage("Bot","A user has left the chat"));
  });

  socket.on("chatMessage",function(msg,username) {
    const user = getCurrentUser(socket.id);
    io.to(user.roomId).emit("message",formatMessage(username,msg)); //emit to everybody(back to client)
  });


  //meeting sockets
  socket.on("new-user",function(name) {
    users[socket.id] = name;
  });

  socket.on("join-room",function(roomId,userId) {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected",userId); //user with userId connected

    socket.on("message",function(message) { //listen or recieve message user typed
      io.to(roomId).emit("createMessage",{message : message,name : users[socket.id]}); //sends the message to be displayed on chat window
    });

    socket.on("disconnect",function(){
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });

    socket.on("leave-meeting-disconnect",function(){
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });

  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
server.listen(port,function(){
  console.log("Server is listening on port 3000");
  // console.log(uuid());
});
