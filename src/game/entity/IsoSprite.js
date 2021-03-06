import {Sprite} from '../'

export class IsoSprite extends Sprite {
  constructor(img, x, y, room) {
    super(img, x, y)
    this.room = room
    this.setIsoXY(x, y)
  }
  setIsoXY(x, y) {
    this.isoX = x
    this.isoY = y
  }
  update () {
      this.x = this.room.x + (this.room.heightTile * this.room.floor.width / 2 - this.room.floor.width / 2) + ((this.isoX + 1) - (this.isoY + 1)) * this.room.floor.width / 2
      this.y = this.room.y + ((this.isoX + 1) + (this.isoY + 1)) * this.room.floor.height / 2 - this.img.height
  }
}
