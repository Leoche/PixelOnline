var Logger = require('./Logger')
var Validator = require('./Validator')
var md5 = require('md5')
var ObjectId = require('mongodb').ObjectID;
class Database {
  constructor(MongoClient, USERS, cb) {
    this.usermanager = USERS
    this.USE_DB = true;
    this.users = [
      {
        username:"Leoche",
        email:"leodesigaux@gmail.com",
        password:"1234"
      }
    ]
    this.db = MongoClient.connect("mongodb://localhost/", { useNewUrlParser: true }, (error, db) => {
        if (error) return false
        this.db = db.db("pixelonline")
        Logger("Database.connexion","Connecté à la base de données 'pixelonline'");
        this.db.createCollection('users')
        cb();
      });
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
