var Logger = require('./Logger')
var User = require('./models/User').User
var Validator = require('./Validator')
var md5 = require('md5')
class AuthManager{
    constructor(usermanager) {
      this.DB = null
      this.usermanager = usermanager
    }
    attachDB(DB){
      this.DB = DB
    }
    login (socket, payload) {
        // Logger("AuthManager.login", payload);
        payload = JSON.parse(payload)
        let response = "error";
        this.DB.db.collection('users').findOne({email:payload.email, password: payload.password}).then(result => {
            let newToken = this.createToken(payload)
            this.DB.db.collection('users').updateOne({'_id': result._id}, {$set:{
              token: newToken.token,
              tokenTimestamp: newToken.tokenTimestamp
            }})
            socket.user = new User(result)
            socket.user.token = newToken.token
            socket.user.tokenTimestamp = newToken.tokenTimestamp
            socket.emit('loginResponse', JSON.stringify(socket.user))
            this.usermanager.connect(socket)
            Logger("AuthManager.login", "connected " + socket.user.username)
        })
        .catch(err => {
            console.log(err);
            socket.emit('loginResponse', JSON.stringify({"error":"Identifiants non valides!"}))
            Logger("AuthManager.login", "Invalid credentials " + JSON.stringify(payload));
        });
      }

      loginToken (socket, payload) {
        // Logger("AuthManager.loginToken", payload);
        payload = JSON.parse(payload)
        if (payload.tokenTimestamp + 60 * 30 < (new Date() / 1000 | 0)) {
          socket.emit('loginResponse', JSON.stringify({error:"tokeninvalid"}));
          Logger("AuthManager.loginToken", "Outdated Token");
          return;
        }
        this.DB.db.collection('users').findOne(
            {
                email:payload.email, 
                token: this.createToken(payload).token, 
                tokenTimestamp:payload.tokenTimestamp
            }
        ).then(result => {
            socket.user = new User(result)
            socket.emit('loginResponse', JSON.stringify(socket.user))
            this.usermanager.connect(socket)
            Logger("AuthManager.loginToken", "connected by token " + socket.user.username)
        })
        .catch(err => {
            console.log({
                email:payload.email, 
                token: this.createToken(payload).token, 
                tokenTimestamp:payload.tokenTimestamp
            });
            socket.emit('loginResponse', JSON.stringify({error:"tokeninvalid"}));
            Logger("AuthManager.loginToken", "Invalid Token");
        });
      }

      createToken(payload) {
        let timestamp = payload.tokenTimestamp || (new Date() / 1000 | 0);
        return {
          token: md5(payload.email + payload.fingerprint + timestamp),
          tokenTimestamp: timestamp
        }
      }
      register (socket, payload) {
        payload = JSON.parse(payload)
        let user = {
          'username': payload.username,
          'email': payload.email,
          'password': payload.password,
          'token': null,
          'tokenTimestamp': 0
        };
        new Promise((resolve, reject) => {
          if(!Validator.username(payload.username)) reject('Username invalid')
          else if(!Validator.email(payload.email)) reject('Email invalid')
          else if(!Validator.password(payload.password)) reject('Password invalid')
          else resolve()
        }).then(() => {
          return this.isUnique('users', 'email', payload.email)
        }).then(() => {
          return this.isUnique('users', 'username', payload.username)
        }).then(() => {
          this.DB.db.collection('users').insertOne(user).then(() => {
            Logger("AuthManager.register", "Registering user " + user.username);
            socket.emit('registerResponse', JSON.stringify({"success":"OK"}));
          })
        }).catch((error) => {
          console.log(error);
          Logger("AuthManager.register", "Error registering");
          socket.emit('registerResponse', JSON.stringify({"error":error}))
        })
      }
      isUnique (collection, field, value) {
        return new Promise((resolve, reject) => {
          this.DB.db.collection(collection).findOne({[field] :value}).then(result => {
            if(result) {
              reject(field.capitalize() + ' already taken.')
            } else {
              resolve()
            }
            return result;
          })
          .catch(err => console.error(`Failed to find document: ${err}`));
        });
      }
}
module.exports = {AuthManager: AuthManager}