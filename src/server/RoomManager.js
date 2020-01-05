var Logger = require('./Logger')
var Room = require('./models/Room').Room
var ObjectId = require('mongodb').ObjectID;
var JSON = require('circular-json');
class RoomManager {
  constructor(io, usermanager) {
    this.rooms = []
    this.DB = null
    this.io = io
    this.usermanager = usermanager
  }
  attachDB(DB){
    this.DB = DB
  }
  enter (socket, payload) {
    payload = JSON.parse(payload)
    let user = this.usermanager.getUserById(socket.id).user
    let roomFound = this.getRoomById(payload.roomId)
    Logger("RoomManager.enter", user.username + " in " + payload.roomId);
    if (user.roomId) this.leave(socket, user)
    if (roomFound !== null) {
      user.roomId = roomFound.id
      this.usermanager.updateRoom(socket.id, roomFound._id)
      if (this.hasUserInRoom(user, roomFound) === -1) {
        user.x = roomFound.spawnX
        user.y = roomFound.spawnY
        roomFound.users.push(user)
        socket.join(roomFound._id.toString())
        console.log("[ROOM] added user " + user.username + " in " + roomFound.name);
        this.io.to(roomFound._id.toString()).emit('usersUpdate', JSON.stringify({"users":roomFound.users}));
      }
      socket.emit('enteredRoom', JSON.stringify({"room":roomFound}))
    }
  }
  leave (socket, user) {
    let roomFound = this.getRoomById(user.roomId)
    if (!roomFound) return;
    this.removeUserInRoom(socket, user, roomFound)
    if (roomFound.users.length === 0)
    this.rooms.forEach((room, i) => {
      if (room._id === roomFound.id) this.rooms.splice(i, 1)
    })
  }
  move (socket, payload) {
    payload = JSON.parse(payload)
    if(payload.x + payload.y > -1) {
      let user = this.usermanager.getUserById(socket.id).user
      if (user) {
        let roomFound = this.getRoomById(user.roomId)
        if (roomFound != null) {
          let userId = this.hasUserInRoom(user, roomFound)
          if (userId != -1) {
            roomFound.users[userId].x = payload.x
            roomFound.users[userId].y = payload.y
            this.io.to(roomFound._id.toString()).emit('usersUpdate', JSON.stringify({"users":roomFound.users}));
          }
        }
      }
    }
  }
  getRoomById (id) {
    let roomFound = null;
    console.log("[ROOM] try to find room " + id);
    this.rooms.forEach((room, i) => {
      if (room._id.toString() == id) {
        roomFound = room
      }
    })
    return roomFound;
  }
  hasUserInRoom (usermy, room) {
    let userFound = -1;
    console.log(usermy);
    room.users.forEach((user, i) => {
      if (user._id == usermy._id) {
        userFound = i
      }
    })
    return userFound;
  }
  removeUserInRoom (socket, usermy, room) {
    let userIndex = this.hasUserInRoom(usermy, room)
    if (userIndex !== -1) {
      console.log("[ROOM] " + usermy.username + " leaved " + room.name);
      room.users.splice(userIndex, 1)
      socket.leave(room._id.toString())
      this.io.to(room._id.toString()).emit('userLeave', JSON.stringify({"id":usermy._id}));
    }
  }
  toString () {
    let result = []
    this.rooms.forEach(room => {
      let room2 = Object.assign({}, room)
      room2.users = room2.users.length
      result.push(room2)
    })
    return JSON.stringify(result);
  }
  create (socket, payload) {
    payload = JSON.parse(payload)
    let room = new Room({
      name: payload.name,
      owner: socket.id,
      users: []
    })
    this.rooms.push(room);
    this.DB.db.collection('rooms').insertOne(room).then(() => {
      socket.emit('createroomResponse', JSON.stringify({"success":"OK"}));
    })
  }
  getRooms (socket) {
    if(this.rooms.length > 0) {
      Logger("AuthManager.getRooms", "returned " + this.rooms.length + " rooms");
      socket.emit('rooms', JSON.stringify({"rooms":this.rooms}))
    } else {
      return new Promise((resolve, reject) => {
        this.DB.db.collection('rooms').find().toArray((err, results) => {
          if (!err) {
            Logger("AuthManager.getRooms", "returned " + results.length + " DB rooms");
            socket.emit('rooms', JSON.stringify({"rooms":results}))
            this.rooms = results
          } else {
            reject()
          }
        })
      })
    }
  }
}
module.exports = {RoomManager: RoomManager}
