class User {
  constructor (data) {
    this._id = data._id;
    this.username = data.username;
    this.email = data.email;
    this.token = data.token;
    this.roomId - null;
    this.tokenTimestamp = data.tokenTimestamp;
  }
}
module.exports = {User: User}