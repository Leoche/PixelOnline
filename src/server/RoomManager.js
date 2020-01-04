var Logger = require('./Logger')
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
  enter (socket, user, id) {
    let roomFound = this.getRoomById(id)
    Logger("RoomManager.enter", user.username + " in " + id);
    if (user.roomId) this.leave(socket, user)
    if (roomFound !== null) {
      user.roomId = id
      this.usermanager.updateRoom(socket.id, id)
      if (this.hasUserInRoom(user, roomFound) === -1) {
        user.x = roomFound.spawnX
        user.y = roomFound.spawnY
        roomFound.users.push(user)
        socket.join(roomFound._id.toString())
        console.log("[ROOM] added user " + user.username + " in " + roomFound.name);
        this.io.to(roomFound._id.toString()).emit('usersUpdate', JSON.stringify({"users":roomFound.users}));
      }
      socket.emit('enteredRoom', JSON.stringify({"room":roomFound}))
    } else {
      this.DB.getRoom(id).then(room => {
        user.roomId = id
        this.usermanager.updateRoom(socket.id, id)
        user.x = room.spawnX
        user.y = room.spawnY
        room.users = [user]
        this.rooms.push(room)
        socket.join(room._id.toString())
        console.log("[ROOM] added room " + room.name);
        console.log("[ROOM] added user " + user.username + " in " + room.name);
        socket.emit('enteredRoom', JSON.stringify({"room":room}))
      }).catch(err => console.log(err));
    }
  }
  leave (socket, user) {
    let roomFound = this.getRoomById(user.roomId)
    if (!roomFound) return;
    this.removeUserInRoom(socket, user, roomFound)
    if (roomFound.users.length === 0)
    this.rooms.forEach((room, i) => {
      if (room._id === roomFound.id) this.rooms.splice(i, 1)
      console.log("[ROOM] removed room " + roomFound.name);
    })
  }
  move (socket, user, newPos) {
    if (user) {
      console.log(newPos);
      let roomFound = this.getRoomById(user.roomId)
      console.log(roomFound.name);
      if (roomFound != null) {
        let userId = this.hasUserInRoom(user, roomFound)
        if (userId != -1) {
          roomFound.users[userId].x = newPos.x
          roomFound.users[userId].y = newPos.y
          this.io.to(roomFound._id.toString()).emit('usersUpdate', JSON.stringify({"users":roomFound.users}));
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
        console.log("[ROOM] found room " + roomFound.name);
      }
    })
    return roomFound;
  }
  hasUserInRoom (usermy, room) {
    let userFound = -1;
    console.log("[ROOM] try to find " + usermy.username + " in " + room.name);
    console.log(usermy);
    room.users.forEach((user, i) => {
      if (user._id == usermy._id) {
        userFound = i
        console.log("[ROOM] found " + usermy.username + " in " + room.name);
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
}
module.exports = {RoomManager: RoomManager}
