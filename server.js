const express = require("express");//can create its own http instance
const app = express();
const bodyParser = require("body-parser");
const server = require("http").Server(app);//added this because socket.io expects access to http server
const io = require("socket.io")(server);
const { uuid } = require("uuidv4");//generate multiple room ids
const {ExpressPeerServer} = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use("/peerjs",peerServer);
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/" , function(req,res){
  res.redirect("/" + uuid());
});

app.get("/:custom" , function(req,res){
  res.render("room",{roomId : req.params.custom});
});

io.on("connection", function(socket){
  socket.on("join-room",function(roomId,userId) {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected",userId); //user with userId connected

    socket.on("message",function(message) { //listen or recieve message user typed
      io.to(roomId).emit("createMessage",message); //sends the message to be displayed on chat window
    })
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
