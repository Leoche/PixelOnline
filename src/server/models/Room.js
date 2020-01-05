class Room {
  constructor (data) {
    this.name = data.name;
    this.type = 1;
    this.owner = data.owner;
    this.users = data.users;
    this.map = "12x1.10x3.1.10x3.1.10x3.1.10x3.1.10x3.1.10x3.1.10x3.1.10x3.1.10x3.1.10x3";
    this.height = 11;
    this.width = 11;
    this.spawnX = 0;
    this.spawnY = 5;
  }
}
module.exports = {Room: Room}