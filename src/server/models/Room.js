class Room {
  constructor (data) {
    this._id = data._id;
    this.name = data.name;
    this.type = 1;
    this.owner = data.owner;
    this.users = data.users;
  }
}
module.exports = {Room: Room}