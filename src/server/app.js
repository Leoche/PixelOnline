var Logger = require('./Logger')
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var Database = require('./Database').Database
var UserManager = require('./UserManager').UserManager
var AuthManager = require('./AuthManager').AuthManager
var RoomManager = require('./RoomManager').RoomManager
var MongoClient = require("mongodb").MongoClient;
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
app.listen(8080);// <---- change the port

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
var CHAT = [];
var usermanager = new UserManager();
var authmanager = new AuthManager(usermanager);
var roommanager = new RoomManager(io, usermanager);
var DB = new Database(MongoClient, usermanager, () => {
  authmanager.attachDB(DB)
  roommanager.attachDB(DB)
  io.on('connection', function (socket) {
    Logger("Socket.connection",socket.id)
    
    //AuthManager
    socket.on('login', (payload) => {authmanager.login(socket,payload)});
    socket.on('loginToken', (payload) => {authmanager.loginToken(socket,payload)});
    socket.on('register', (payload) => {authmanager.register(socket,payload)});
    
    //RoomManager
    socket.on('getRooms', (payload) => { roommanager.getRooms(socket) })
    socket.on('createRoom', (payload) => { roommanager.create(socket, payload) })
    socket.on('enterRooms', (payload) => { roommanager.enter(socket, payload) })
    socket.on('move', (payload) => { roommanager.move(socket, payload) })
    

    //DISCONNECT
    socket.on('manualdisconnect', function () {
      Logger("Socket.logout",socket.id)
      let user = usermanager.getUserById(socket.id)
      if (user && user.user.roomId) {
        console.log("[ROOMS] LEAVE " + user.user.roomId);
        roommanager.leave(socket, user.user)
      }
    })
    socket.on('message', function (msg) {
      if (socket.user) {
        console.log("[CHAT] Received :" + msg);
        let newmessage = {username: socket.user.username, message: msg};
        if (msg[0] == "/") {
          newmessage = {username: 'Console', message: eval(msg.substring(1))};
        }
        CHAT.push(newmessage)
        if (CHAT.length > 50) CHAT.splice(0,1)
        io.emit("chat", JSON.stringify(newmessage))
      }
    })
    socket.on('disconnect', function () {
      Logger("Socket.logout",socket.id)
      let user = usermanager.getUserById(socket.id)
      if (user && user.user.roomId) {
        console.log("[ROOMS] LEAVE " + user.user.roomId);
        roommanager.leave(socket, user.user)
      }
    })
  });

})