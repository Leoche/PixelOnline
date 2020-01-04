var Logger = require('./Logger')
var Validator = require('./Validator')
var md5 = require('md5')
var ObjectId = require('mongodb').ObjectID;
class Database {
  constructor(MongoClient, USERS) {
    this.usermanager = USERS
    this.USE_DB = true;
    this.users = [
      {
        username:"Leoche",
        email:"leodesigaux@gmail.com",
        password:"1234"
      }
    ]
    this.db = null;
    return new Promise((resolve, reject) =>{
      MongoClient.connect("mongodb://localhost/", { useNewUrlParser: true }, (error, db) => {
        if (error) reject(error)
        this.db = db.db("pixelonline")
        Logger("Database.connexion","Connecté à la base de données 'pixelonline'");
        this.db.createCollection('users')
        resolve()
      });
    });
  }

  getUser (collection, field, value) {
    if (!this.USE_DB) {
      let isUnique = true;
      this[collection].forEach(item => {
        if (item[field] === value) isUnique = false;
      })
      return isUnique;
    }
  }
  getRooms (socket, roommanager) {
    return new Promise((resolve, reject) => {
      this.db.collection('rooms').find().toArray((err, results) => {
        if (!err) {
          for (var i = 0; i < results.length; i++) {
            results[i].users = 0
            if(roommanager.getRoomById(results[i]._id.toString())) results[i].users = roommanager.getRoomById(results[i]._id.toString()).users.length
          }
          socket.emit('rooms', JSON.stringify({"rooms":results}))
        } else {
          reject()
        }
      })
    })
  }
  getRoom (id) {
    return new Promise((resolve, reject) => {
      let room = this.db.collection('rooms').find({_id:ObjectId(id)}).toArray((err, results) => {
        if (results.length > 0) {
          resolve(results[0])
        } else reject()
      })
    })
  }
}
module.exports = {Database: Database}
